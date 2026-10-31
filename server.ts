/**
 * Express Server with Vite middlewares in development,
 * PostgreSQL Cloud SQL database endpoints, and Gemini AI endpoints for FarmaciaDB.
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import { createRequire } from 'module';
import jwt from 'jsonwebtoken';

import { generateExpertPharmacyReply } from './src/lib/pharmacy-ai-engine.ts';
import { seedDatabaseIfEmpty } from './src/db/seed.ts';
import {
  getMedicamentos,
  upsertMedicamento,
  deleteMedicamento,
  getClientes,
  upsertCliente,
  getProveedores,
  upsertProveedor,
  deleteProveedor,
  getCompras,
  createCompra,
  updateCompraEstado,
  getVentas,
  createVentaTransaccional,
  getUsers,
  getUserByEmail,
  createUser,
  deleteUser,
} from './src/db/helpers.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'farmacia-db-jwt-secret-key-2026';
const ADMIN_MASTER_PASSWORD = 'farmaciadbadmin123';

const require = createRequire(import.meta.url);
const execAsync = util.promisify(exec);

// Lazy singleton for Whisper model fallback (offline, local)
let whisperPromise: Promise<any> | null = null;
async function getWhisperPipeline() {
  if (!whisperPromise) {
    whisperPromise = (async () => {
      try {
        const { pipeline } = await import('@xenova/transformers' as any);
        return await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
      } catch (e) {
        console.warn('Whisper pipeline not installed or failed to load:', e);
        return null;
      }
    })();
  }
  return whisperPromise;
}

app.use(express.json({ limit: '20mb' }));

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Middleware de autenticación JWT
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number | string;
    email: string;
    nombre: string;
    role: string;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (!err && decoded) {
      req.user = decoded;
    }
    next();
  });
}

app.use(authenticateToken);

// ==========================================
// 1. ENDPOINTS DE AUTENTICACIÓN (LOGIN / REGISTRO)
// ==========================================

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    const user = await getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _p, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (err: any) {
    console.error('Error en /api/auth/login:', err);
    return res.status(500).json({ error: err.message || 'Error al iniciar sesión' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, nombre, role, adminAuthKey } = req.body;
    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (role === 'admin' && adminAuthKey !== ADMIN_MASTER_PASSWORD) {
      return res.status(403).json({ error: 'Clave maestra de administrador incorrecta' });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un usuario con este correo electrónico' });
    }

    const newUser = await createUser({
      email,
      password,
      nombre,
      role: role === 'admin' ? 'admin' : 'empleado',
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, nombre: newUser.nombre, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ user: newUser, token });
  } catch (err: any) {
    console.error('Error en /api/auth/register:', err);
    return res.status(500).json({ error: err.message || 'Error al registrar usuario' });
  }
});

app.get('/api/auth/users', async (_req: Request, res: Response) => {
  try {
    const list = await getUsers();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/auth/users/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteUser(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. ENDPOINTS DE MEDICAMENTOS (INVENTARIO)
// ==========================================

app.get('/api/medicamentos', async (_req: Request, res: Response) => {
  try {
    const meds = await getMedicamentos();
    const formatted = meds.map((m) => ({
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      principio: m.principio,
      categoria: m.categoria,
      caducidad: m.caducidad,
      precioCompra: Number(m.precioCompra ?? m.precio_compra ?? 0),
      precioVenta: Number(m.precioVenta ?? m.precio_venta ?? 0),
      precio_compra: Number(m.precioCompra ?? m.precio_compra ?? 0),
      precio_venta: Number(m.precioVenta ?? m.precio_venta ?? 0),
      stock: Number(m.stock ?? 0),
    }));
    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/medicamentos', async (req: Request, res: Response) => {
  try {
    const result = await upsertMedicamento(req.body);
    return res.json(result[0] || result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/medicamentos/:id', async (req: Request, res: Response) => {
  try {
    await deleteMedicamento(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ENDPOINTS DE CLIENTES
// ==========================================

app.get('/api/clientes', async (_req: Request, res: Response) => {
  try {
    const clients = await getClientes();
    return res.json(clients);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/clientes', async (req: Request, res: Response) => {
  try {
    const result = await upsertCliente(req.body);
    return res.json(result[0] || result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. ENDPOINTS DE PROVEEDORES
// ==========================================

app.get('/api/proveedores', async (_req: Request, res: Response) => {
  try {
    const provs = await getProveedores();
    return res.json(provs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/proveedores', async (req: Request, res: Response) => {
  try {
    const result = await upsertProveedor(req.body);
    return res.json(result[0] || result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/proveedores/:id', async (req: Request, res: Response) => {
  try {
    await deleteProveedor(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. ENDPOINTS DE COMPRAS
// ==========================================

app.get('/api/compras', async (_req: Request, res: Response) => {
  try {
    const list = await getCompras();
    const formatted = list.map((c) => ({
      id: c.id,
      codigo: c.codigo,
      fecha: c.fecha instanceof Date ? c.fecha.toISOString() : String(c.fecha || new Date().toISOString()),
      proveedor_id: c.proveedorId,
      med_id: c.medId,
      cantidad: c.cantidad,
      costo: Number(c.costo),
      estado: c.estado,
      nota: c.nota,
    }));
    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/compras', async (req: Request, res: Response) => {
  try {
    const result: any = await createCompra(req.body);
    return res.status(201).json(Array.isArray(result) ? result[0] : result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/compras/:id/estado', async (req: Request, res: Response) => {
  try {
    const { estado } = req.body;
    const result = await updateCompraEstado(req.params.id, estado);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. ENDPOINTS DE VENTAS (POS TRANSACCIONAL)
// ==========================================

app.get('/api/ventas', async (_req: Request, res: Response) => {
  try {
    const list = await getVentas();
    const formatted = list.map((v: any) => {
      const items = (v.items || []).map((i: any) => ({
        med_id: i.medId,
        medId: i.medId,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precio: Number(i.precio),
      }));
      return {
        uuid: v.id,
        id: v.codigo,
        codigo: v.codigo,
        fecha: v.fecha instanceof Date ? v.fecha.toISOString() : String(v.fecha || new Date().toISOString()),
        subtotal: Number(v.subtotal),
        descuento: Number(v.descuento),
        descPct: Number(v.descPct),
        desc_pct: Number(v.descPct),
        iva: Number(v.iva),
        total: Number(v.total),
        vendedor: v.vendedorNombre,
        vendedor_nombre: v.vendedorNombre,
        vendedorId: v.vendedorId,
        vendedor_id: v.vendedorId,
        clienteId: v.clienteId,
        cliente_id: v.clienteId,
        puntos: v.puntos,
        items,
        venta_detalle: items,
      };
    });
    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/ventas', async (req: Request, res: Response) => {
  try {
    const { ventaData, items } = req.body;
    if (!ventaData || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Datos de venta inválidos' });
    }

    const nuevaVenta = await createVentaTransaccional(ventaData, items);
    return res.status(201).json(nuevaVenta);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. ENDPOINTS DE IA (TRANSCRIPCIÓN Y CHAT)
// ==========================================

app.post('/api/ai/voice-transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio no proporcionado' });
    }

    // 1. Try Gemini transcription first (fastest and most accurate for medical names)
    if (apiKey) {
      try {
        const audioMime = mimeType && mimeType.includes('audio') ? mimeType.split(';')[0] : 'audio/webm';
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: audioMime,
                    data: audioBase64,
                  },
                },
                {
                  text: 'Transcribe este audio en español. El usuario busca un medicamento o síntoma en una farmacia en Guatemala. Devuelve ÚNICAMENTE el texto reconocido sin comentarios.',
                },
              ],
            },
          ],
        });

        const text = (response.text || '')
          .replace(/\[.*?\]/g, '')
          .replace(/\(.*?\)/g, '')
          .replace(/^[.,;:!?¿¡"'\s]+|[.,;:!?¿¡"'\s]+$/g, '')
          .trim();

        if (text) {
          console.log(`[Gemini Audio Transcribe] Recognized: "${text}"`);
          return res.json({ text });
        }
      } catch (geminiError: any) {
        console.warn('Gemini audio transcription fallback to Whisper:', geminiError?.message);
      }
    }

    // 2. Fallback to local Whisper pipeline
    const buffer = Buffer.from(audioBase64, 'base64');
    const timestamp = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const inPath = `/tmp/voice_${timestamp}.raw`;
    const outPath = `/tmp/voice_${timestamp}.wav`;

    await fs.promises.writeFile(inPath, buffer);

    try {
      await execAsync(`ffmpeg -i "${inPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outPath}" -y 2>/dev/null`);

      let WaveFileClass: any = null;
      try {
        const req = createRequire(import.meta.url);
        WaveFileClass = req('wavefile')?.WaveFile;
      } catch {
        // optional fallback
      }

      if (!WaveFileClass) {
        return res.json({ text: '' });
      }

      const wavBuffer = await fs.promises.readFile(outPath);
      const wav = new WaveFileClass(wavBuffer);
      wav.toBitDepth('32f');
      wav.toSampleRate(16000);
      let audioData = wav.getSamples();
      if (Array.isArray(audioData)) {
        if (audioData.length > 1) {
          const SCALING_FACTOR = Math.sqrt(2);
          for (let i = 0; i < audioData[0].length; ++i) {
            audioData[0][i] = (audioData[0][i] + audioData[1][i]) / SCALING_FACTOR;
          }
        }
        audioData = audioData[0];
      }

      const asr = await getWhisperPipeline();
      if (!asr) {
        return res.json({ text: '' });
      }
      const output = await asr(audioData, { language: 'spanish', task: 'transcribe' });

      let recognizedText = (output.text || '').trim();
      recognizedText = recognizedText
        .replace(/\[.*?\]/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/^[.,;:!?¿¡"'\s]+|[.,;:!?¿¡"'\s]+$/g, '')
        .trim();

      console.log(`[Whisper Audio Transcribe] Recognized text: "${recognizedText}"`);
      return res.json({ text: recognizedText });
    } finally {
      fs.promises.unlink(inPath).catch(() => {});
      fs.promises.unlink(outPath).catch(() => {});
    }
  } catch (error: any) {
    console.error('Error en /api/ai/voice-transcribe:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const reply = generateExpertPharmacyReply(message, context);
    return res.json({ reply });
  } catch (err: any) {
    console.error('Error en /api/ai/chat:', err);
    return res.status(500).json({
      error: err.message || 'Error al procesar la solicitud con el asistente de IA',
    });
  }
});

// Setup Vite development server or static serving in production
async function startServer() {
  // Inicialización y siembra de base de datos PostgreSQL
  await seedDatabaseIfEmpty();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FarmaciaDB Server activo con PostgreSQL en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
