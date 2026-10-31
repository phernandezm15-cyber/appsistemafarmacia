/**
 * Intelligent Pharmaceutical Voice Search Button.
 * 
 * Works across Chrome, Edge, Opera GX, Safari, and Firefox.
 * Specifically designed for pharmacy environments:
 * - Solves speech-to-text misrecognitions of medical brand names and drug formulas
 *   (e.g., "la mochila" -> "Amoxil", "van a dar" -> "Panadol Extra", "hombre parasol" -> "Omeprazol").
 * - Supports symptom-based voice searches (e.g. "pastillas para dolor de cabeza" -> "Panadol Extra").
 * - Does not clobber the search bar with premature partial syllables while the user is still speaking.
 * - Displays live visual feedback, soundwave animation, and alternative suggestion chips.
 */

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playBeep, playSuccess } from "@/lib/sound";
import { useData } from "@/lib/db";
import {
  resolvePharmaceuticalVoiceQuery,
  type VoiceMatchResult,
} from "@/lib/pharmacy-voice-matcher";
import type { Medicamento } from "@/lib/store";

interface VoiceButtonProps {
  onText: (text: string) => void;
  className?: string;
  meds?: Medicamento[];
}

export function VoiceButton({ onText, className, meds: propMeds }: VoiceButtonProps) {
  const { meds: dbMeds } = useData();
  const catalogMeds = propMeds || dbMeds || [];

  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [audioBars, setAudioBars] = useState<number[]>(new Array(12).fill(15));
  const [interimText, setInterimText] = useState("");
  const [statusMsg, setStatusMsg] = useState("Escuchando...");
  const [lastMatch, setLastMatch] = useState<VoiceMatchResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setListening(false);
    setAudioBars(new Array(12).fill(15));
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Process and apply final speech through the pharmacy matcher
  const handleFinalSpeech = (rawText: string) => {
    cleanup();
    const trimmed = rawText.trim();
    if (!trimmed) {
      toast.info("No se detectó ninguna palabra", {
        description: "Intenta hablar más cerca del micrófono y menciona el medicamento.",
      });
      return;
    }

    const resolved = resolvePharmaceuticalVoiceQuery(trimmed, catalogMeds);
    setLastMatch(resolved);

    if (resolved.searchTerm) {
      onText(resolved.searchTerm);
      try {
        playSuccess();
      } catch {
        playBeep(880, 0.1);
      }

      if (resolved.reason) {
        toast.success("Medicamento identificado", {
          description: `"${resolved.originalSpoken}" → ${resolved.searchTerm} (${resolved.reason})`,
        });
      } else {
        toast.success(`Buscando: ${resolved.searchTerm}`);
      }
    } else {
      onText(trimmed);
      toast.info(`Buscando: "${trimmed}"`);
    }

    // Auto-hide suggestion chip banner after 8 seconds
    setTimeout(() => {
      setLastMatch((prev) => (prev === resolved ? null : prev));
    }, 8000);
  };

  // Stop recording and process captured audio
  const stopAndTranscribe = () => {
    if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    // If native speech already gathered text, use it immediately
    if (finalTranscriptRef.current && finalTranscriptRef.current.trim()) {
      handleFinalSpeech(finalTranscriptRef.current);
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      setStatusMsg("Analizando voz con IA...");
      mediaRecorderRef.current.stop();
    } else {
      cleanup();
    }
  };

  // Start microphone capture
  const startRecording = async () => {
    cleanup();
    audioChunksRef.current = [];
    finalTranscriptRef.current = "";
    setInterimText("");
    setLastMatch(null);
    setStatusMsg("Escuchando... Di el medicamento");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
    } catch (err: any) {
      console.warn("Microphone access denied:", err);
      toast.error("Permiso de micrófono requerido", {
        description: "Por favor permite el acceso al micrófono en tu navegador.",
      });
      return;
    }

    try {
      playBeep(650, 0.08);
    } catch {}

    setListening(true);

    // 1. Audio Visualizer & Voice Activity Detection (Web Audio API)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      let hadSpeech = false;

      const analyzeAudio = () => {
        if (!audioCtxRef.current) return;
        analyser.getByteFrequencyData(buffer);

        let sum = 0;
        const bars: number[] = [];
        for (let i = 0; i < 12; i++) {
          const val = buffer[i * 2] || 0;
          sum += val;
          const pct = Math.max(15, Math.min(100, Math.round((val / 255) * 100)));
          bars.push(pct);
        }
        setAudioBars(bars);

        const avgVolume = sum / 12;
        if (avgVolume > 16) {
          hadSpeech = true;
          setStatusMsg("Detectando tu voz...");

          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (hadSpeech && !silenceTimerRef.current) {
          // Finished speaking -> stop after 1.2s silence
          silenceTimerRef.current = setTimeout(() => {
            stopAndTranscribe();
          }, 1200);
        }

        animFrameRef.current = requestAnimationFrame(analyzeAudio);
      };

      analyzeAudio();
    } catch (e) {
      console.warn("Web Audio meter notice:", e);
    }

    // 2. Native Web Speech Recognition (Chrome, Edge, Android)
    const W = window as any;
    const SpeechRec = W.SpeechRecognition || W.webkitSpeechRecognition;
    let nativeStarted = false;

    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.lang = navigator.language?.startsWith("es") ? navigator.language : "es-GT";
        rec.continuous = false;
        rec.interimResults = true;

        rec.onresult = (e: any) => {
          let transcript = "";
          for (let i = 0; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript + " ";
          }
          const text = transcript.trim();
          if (text) {
            finalTranscriptRef.current = text;
            setInterimText(text);
            setStatusMsg(`"${text}"`);
          }
        };

        rec.onerror = (e: any) => {
          console.log("SpeechRecognition notice:", e.error);
        };

        rec.onend = () => {
          if (finalTranscriptRef.current && finalTranscriptRef.current.trim()) {
            handleFinalSpeech(finalTranscriptRef.current);
          }
        };

        recognitionRef.current = rec;
        rec.start();
        nativeStarted = true;
      } catch (recErr) {
        console.warn("SpeechRec start error:", recErr);
      }
    }

    // 3. MediaRecorder Fallback (Opera GX, Safari, Firefox, or when native speech fails)
    try {
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else {
          mimeType = "";
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        cleanup();

        // If native speech already gave us a clean result, skip network transcription
        if (finalTranscriptRef.current && finalTranscriptRef.current.trim()) {
          handleFinalSpeech(finalTranscriptRef.current);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (audioBlob.size < 400) {
          toast.info("Audio muy corto", { description: "Habla cerca del micrófono diciendo, por ejemplo: 'Amoxil' o 'Panadol'." });
          return;
        }

        setProcessing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64Data = (reader.result as string).split(",")[1];
              const res = await fetch("/api/ai/voice-transcribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  audioBase64: base64Data,
                  mimeType: recorder.mimeType || "audio/webm",
                }),
              });

              if (!res.ok) {
                throw new Error(`Servidor ${res.status}`);
              }

              const data = await res.json();
              const serverText = (data.text || "").trim();

              if (serverText) {
                handleFinalSpeech(serverText);
              } else {
                toast.info("No se reconoció ninguna medicina", {
                  description: "Intenta hablar más claro o nombra el síntoma (ej. dolor de cabeza).",
                });
              }
            } catch (err: any) {
              console.error("Transcribe API error:", err);
              toast.error("Audio no reconocido", {
                description: "Habla más cerca de tu micrófono o escribe el nombre del medicamento.",
              });
            } finally {
              setProcessing(false);
            }
          };
        } catch (e: any) {
          console.error("FileReader error:", e);
          setProcessing(false);
        }
      };

      recorder.start(250);

      // Max safety timeout of 7 seconds
      maxTimeoutRef.current = setTimeout(() => {
        stopAndTranscribe();
      }, 7000);
    } catch (recorderErr) {
      console.error("MediaRecorder creation error:", recorderErr);
    }
  };

  const handleToggle = () => {
    if (listening) {
      stopAndTranscribe();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <Button
        type="button"
        variant={listening ? "destructive" : "hero"}
        size="icon"
        onClick={handleToggle}
        disabled={processing}
        aria-label={listening ? "Detener grabación de voz" : "Buscar con micrófono"}
        title={listening ? "Detener y buscar ahora" : "Buscar medicina por voz (con autocorrección médica)"}
        className={`glow transition-all cursor-pointer relative ${
          listening
            ? "ring-4 ring-destructive/40 animate-pulse scale-105"
            : "hover:scale-105"
        } ${className || ""}`}
      >
        {processing ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
        ) : listening ? (
          <Square className="h-4 w-4 fill-current text-white animate-pulse" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Floating Real-time Status and Audio Waveform */}
      {(listening || processing) && (
        <div className="absolute left-1/2 -bottom-14 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full border border-primary/40 bg-card/95 px-4 py-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 whitespace-nowrap">
          {processing ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Identificando medicamento con IA...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
              </span>

              {/* Real-time sound wave bars */}
              <div className="flex items-end gap-0.5 h-4 w-16">
                {audioBars.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-full bg-gradient-to-t from-primary to-emerald-400 transition-all duration-75"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <span className="text-xs font-medium text-foreground max-w-[200px] truncate">
                {interimText ? `"${interimText}"` : statusMsg}
              </span>

              <button
                type="button"
                onClick={stopAndTranscribe}
                className="ml-1 rounded-full bg-primary/20 hover:bg-primary/30 px-2 py-0.5 text-[10px] font-bold text-primary cursor-pointer transition-colors"
              >
                Buscar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Smart Pharmaceutical Correction Badge & Alternative Chips */}
      {lastMatch && lastMatch.reason && !listening && (
        <div className="absolute left-0 -bottom-12 z-40 flex items-center gap-1.5 bg-slate-900/95 border border-primary/40 shadow-xl rounded-xl px-3 py-1.5 text-xs animate-in fade-in slide-in-from-top-1">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-muted-foreground">
            Escuché: <span className="line-through text-slate-400">"{lastMatch.originalSpoken}"</span> →
          </span>
          <span className="font-bold text-primary">
            {lastMatch.searchTerm}
          </span>

          {lastMatch.alternatives.length > 0 && (
            <div className="flex items-center gap-1 ml-2 border-l border-slate-700 pl-2">
              <span className="text-[10px] text-muted-foreground">O también:</span>
              {lastMatch.alternatives.map((alt) => (
                <button
                  key={alt.name}
                  type="button"
                  onClick={() => {
                    onText(alt.name);
                    toast.success(`Cambiado a: ${alt.name}`);
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-primary/20 hover:text-primary text-[10px] font-medium transition-colors cursor-pointer"
                >
                  {alt.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
