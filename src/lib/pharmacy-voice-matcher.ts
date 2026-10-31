/**
 * Intelligent Pharmaceutical Voice Recognition & Phonetic Matching Engine.
 * 
 * Bridges the gap between colloquial speech-to-text transcriptions (which frequently
 * mishear pharmaceutical drug names and medical terms into common everyday Spanish words)
 * and the actual pharmacy database catalog.
 */

import type { Medicamento } from "./store";

// Normalization helper: strips accents, symbols, extra spaces
export function normalizeText(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Convert Spanish text into a phonetic key (approximate sound-match)
export function phoneticKeySpanish(text: string): string {
  let s = normalizeText(text);

  // Strip silent 'h'
  s = s.replace(/h/g, "");

  // Phonetic unifications in Latin American Spanish
  s = s.replace(/v/g, "b");
  s = s.replace(/ce|ci/g, "se");
  s = s.replace(/z/g, "s");
  s = s.replace(/ca|co|cu|k|qu/g, "k");
  s = s.replace(/ge|gi|j/g, "j");
  s = s.replace(/ll|y/g, "y");
  s = s.replace(/ph/g, "f");
  s = s.replace(/x/g, "ks");
  s = s.replace(/w/g, "u");

  // Remove duplicate adjacent characters (e.g., 'mm' -> 'm', 'ss' -> 's')
  s = s.replace(/(.)\1+/g, "$1");

  return s.trim();
}

// Levenshtein distance for fuzzy matching
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return d[m][n];
}

// String similarity score between 0.0 and 1.0
export function similarityScore(a: string, b: string): number {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;
  if (normA.includes(normB) || normB.includes(normA)) return 0.92;

  const maxLen = Math.max(normA.length, normB.length);
  const dist = levenshteinDistance(normA, normB);
  const rawScore = 1 - dist / maxLen;

  // Also check phonetic distance
  const pA = phoneticKeySpanish(normA);
  const pB = phoneticKeySpanish(normB);
  const pMaxLen = Math.max(pA.length, pB.length);
  const pDist = levenshteinDistance(pA, pB);
  const phoneticScore = 1 - pDist / pMaxLen;

  return Math.max(rawScore, phoneticScore);
}

// Common phonetic speech-to-text corruptions for pharmacy products in Spanish
export const PHONETIC_CORRECTIONS: Record<string, string> = {
  // Panadol / Paracetamol
  "van a dar": "Panadol Extra",
  "pan a dol": "Panadol Extra",
  "para dolor": "Panadol Extra",
  "panadoll": "Panadol Extra",
  "panadol": "Panadol Extra",
  "parador": "Panadol Extra",
  "pan al sol": "Panadol Extra",
  "pan a dor": "Panadol Extra",
  "panal dol": "Panadol Extra",
  "pan del sol": "Panadol Extra",
  "para ese tamol": "Panadol Extra",
  "para se tamol": "Panadol Extra",
  "parasetamol": "Panadol Extra",
  "paracetamol": "Panadol Extra",
  "acetaminofen": "Panadol Extra",
  "acetaminofeno": "Panadol Extra",

  // Amoxil / Amoxicilina
  "a mocil": "Amoxil",
  "la mochila": "Amoxil",
  "amorcito": "Amoxil",
  "a movil": "Amoxil",
  "amoxil": "Amoxil",
  "a moxil": "Amoxil",
  "amocil": "Amoxil",
  "amoxilina": "Amoxil",
  "la mocilina": "Amoxil",
  "amoxisilina": "Amoxil",
  "amoxicilina": "Amoxil",
  "amoxicilina 500": "Amoxil",
  "la mochila 500": "Amoxil",

  // Advil / Ibuprofeno
  "arbil": "Advil",
  "abril": "Advil",
  "al vil": "Advil",
  "alvil": "Advil",
  "habil": "Advil",
  "adbil": "Advil",
  "advil": "Advil",
  "alvi": "Advil",
  "albil": "Advil",
  "y hubo profeno": "Advil",
  "ibu profeno": "Advil",
  "hijo profero": "Advil",
  "ibuprofeno": "Advil",
  "ibuprofeno 400": "Advil",

  // Omeprazol
  "hombre parasol": "Omeprazol MK",
  "hombre prazol": "Omeprazol MK",
  "homeoprazol": "Omeprazol MK",
  "ome prasol": "Omeprazol MK",
  "omeprazol": "Omeprazol MK",
  "omeprasol": "Omeprazol MK",
  "omeprazol mk": "Omeprazol MK",
  "hombre para el sol": "Omeprazol MK",

  // Losartán
  "los estan": "Losartán Denk",
  "lo saltan": "Losartán Denk",
  "los sarten": "Losartán Denk",
  "losartan": "Losartán Denk",
  "lo sartan": "Losartán Denk",
  "losartan denk": "Losartán Denk",
  "los saltan de": "Losartán Denk",

  // Ventolin / Salbutamol
  "bento link": "Ventolin",
  "viento link": "Ventolin",
  "ventolin": "Ventolin",
  "20 link": "Ventolin",
  "bento lin": "Ventolin",
  "sal botamol": "Ventolin",
  "sal del arbol": "Ventolin",
  "salbutamol": "Ventolin",
  "inhalador": "Ventolin",

  // Voltaren / Diclofenaco
  "por la tarde": "Voltaren",
  "voltar en": "Voltaren",
  "volta red": "Voltaren",
  "voltaren": "Voltaren",
  "boltaren": "Voltaren",
  "de clon fenaco": "Voltaren",
  "di clofenaco": "Voltaren",
  "diclofenaco": "Voltaren",
  "diclofenac": "Voltaren",

  // Clarityne / Loratadina
  "claritin": "Clarityne",
  "clarity": "Clarityne",
  "clara tienen": "Clarityne",
  "clarityne": "Clarityne",
  "claritina": "Clarityne",
  "la hora tardina": "Clarityne",
  "lora tadina": "Clarityne",
  "loratadina": "Clarityne",

  // Aspirina
  "a spirina": "Aspirina Bayer",
  "las piscinas": "Aspirina Bayer",
  "aspirina": "Aspirina Bayer",
  "aspirinas": "Aspirina Bayer",
  "aspirina bayer": "Aspirina Bayer",
  "acido acetil": "Aspirina Bayer",
  "acido acetilsalicilico": "Aspirina Bayer",

  // Cipro / Ciprofloxacino
  "si pero": "Cipro",
  "si pro": "Cipro",
  "zippo": "Cipro",
  "cipro": "Cipro",
  "ciprofloxacina": "Cipro",
  "ciprofloxacino": "Cipro",

  // Allegra / Fexofenadina
  "alegra": "Allegra",
  "alegria": "Allegra",
  "a negra": "Allegra",
  "allegra": "Allegra",
  "sexofenadina": "Allegra",
  "fexofenadina": "Allegra",

  // Gaviscon
  "gabi con": "Gaviscon",
  "gaby con": "Gaviscon",
  "gabi son": "Gaviscon",
  "gaviscon": "Gaviscon",
  "gabiscon": "Gaviscon",
  "alginato": "Gaviscon",

  // Redoxon / Vitamina C
  "reduc son": "Redoxon",
  "redbox son": "Redoxon",
  "redox son": "Redoxon",
  "redoxon": "Redoxon",
  "redoxon efervescente": "Redoxon",
  "vitamina c": "Redoxon",

  // Atorvastatina
  "a todas las tina": "Atorvastatina MK",
  "atorva statina": "Atorvastatina MK",
  "atorvastatina": "Atorvastatina MK",
  "atorvastatina mk": "Atorvastatina MK",

  // Glucophage / Metformina
  "gluco fay": "Glucophage",
  "gluco fage": "Glucophage",
  "gluco facil": "Glucophage",
  "glucofago": "Glucophage",
  "glucophage": "Glucophage",
  "med formina": "Glucophage",
  "me conformo": "Glucophage",
  "metformina": "Glucophage",

  // Mucosolvan / Ambroxol
  "muco sol van": "Mucosolvan",
  "mucho solvan": "Mucosolvan",
  "mucosolvan": "Mucosolvan",
  "ambroxol": "Mucosolvan",
  "jarabe para la tos": "Mucosolvan",

  // Fucidin
  "fusil in": "Fucidin",
  "fusi din": "Fucidin",
  "fucidina": "Fucidin",
  "fucidin": "Fucidin",
  "acido fusidico": "Fucidin",

  // Januvia
  "ya no via": "Januvia",
  "la lluvia": "Januvia",
  "llanuvi": "Januvia",
  "janubia": "Januvia",
  "januvia": "Januvia",
  "sitagliptina": "Januvia",

  // Centrum
  "centro": "Centrum",
  "centro comercial": "Centrum",
  "centrom": "Centrum",
  "centrum": "Centrum",
  "multivitaminico": "Centrum",

  // Bepanthen
  "ve para ten": "Bepanthen",
  "bepanten": "Bepanthen",
  "ve panteon": "Bepanthen",
  "bepanthen": "Bepanthen",
  "dexpantenol": "Bepanthen",
};

// Symptom to medicine resolver (when user asks by medical complaint)
export const SYMPTOM_TO_MED: Record<string, string[]> = {
  "dolor de cabeza": ["Panadol Extra", "Aspirina Bayer", "Advil"],
  "jaqueca": ["Panadol Extra", "Aspirina Bayer"],
  "migrana": ["Panadol Extra", "Advil"],
  "fiebre": ["Panadol Extra", "Advil"],
  "calentura": ["Panadol Extra"],
  "dolor muscular": ["Voltaren", "Advil"],
  "inflamacion": ["Voltaren", "Advil"],
  "golpe": ["Voltaren", "Advil"],
  "dolor de espalda": ["Voltaren", "Advil"],
  "gripe": ["Mucosolvan", "Redoxon", "Panadol Extra"],
  "resfriado": ["Mucosolvan", "Redoxon", "Panadol Extra"],
  "catarro": ["Mucosolvan", "Redoxon"],
  "tos": ["Mucosolvan", "Ventolin"],
  "tos seca": ["Mucosolvan"],
  "flema": ["Mucosolvan"],
  "asma": ["Ventolin"],
  "dificultad para respirar": ["Ventolin"],
  "acidez": ["Omeprazol MK", "Gaviscon"],
  "gastritis": ["Omeprazol MK", "Gaviscon"],
  "reflujo": ["Omeprazol MK", "Gaviscon"],
  "ardor de estomago": ["Omeprazol MK", "Gaviscon"],
  "dolor de estomago": ["Omeprazol MK", "Gaviscon"],
  "alergia": ["Clarityne", "Allegra"],
  "picazon": ["Clarityne", "Allegra", "Bepanthen"],
  "rinitis": ["Clarityne", "Allegra"],
  "estornudos": ["Clarityne", "Allegra"],
  "infeccion": ["Amoxil", "Cipro", "Fucidin"],
  "dolor de garganta": ["Amoxil", "Panadol Extra"],
  "amigdalas": ["Amoxil"],
  "antibiotico": ["Amoxil", "Cipro"],
  "presion": ["Losartán Denk"],
  "presion alta": ["Losartán Denk"],
  "hipertension": ["Losartán Denk"],
  "colesterol": ["Atorvastatina MK"],
  "trigliceridos": ["Atorvastatina MK"],
  "diabetes": ["Glucophage", "Januvia"],
  "azucar": ["Glucophage", "Januvia"],
  "glucosa": ["Glucophage", "Januvia"],
  "vitaminas": ["Centrum", "Redoxon"],
  "defensas": ["Redoxon", "Centrum"],
  "cansancio": ["Centrum"],
  "energia": ["Centrum"],
  "quemadura": ["Bepanthen"],
  "rozadura": ["Bepanthen"],
  "herida": ["Fucidin", "Bepanthen"],
};

// Indications and clinical tags for search expansion in POS and Inventario
export const MED_INDICATIONS_TAGS: Record<string, string[]> = {
  "MED-001": ["fiebre", "calentura", "dolor", "dolor de cabeza", "paracetamol", "acetaminofen", "analgesico"],
  "MED-002": ["inflamacion", "dolor muscular", "ibuprofeno", "golpe", "dolor dental", "espalda"],
  "MED-003": ["amoxicilina", "infeccion", "garganta", "amigdalas", "antibiotico", "bacterias"],
  "MED-004": ["loratadina", "alergia", "rinitis", "estornudos", "picazon", "antihistaminico"],
  "MED-005": ["gastritis", "acidez", "reflujo", "estomago", "ardor", "ulcera", "omeprazol"],
  "MED-006": ["presion", "presion alta", "hipertension", "corazon", "losartan"],
  "MED-007": ["vitaminas", "multivitaminico", "cansancio", "energia", "defensas", "complejo"],
  "MED-008": ["asma", "bronquios", "respirar", "salbutamol", "inhalador", "sibilancias"],
  "MED-009": ["aspirina", "dolor de cabeza", "anticoagulante", "corazon", "fiebre"],
  "MED-010": ["ciprofloxacino", "infeccion urinaria", "antibiotico", "infeccion"],
  "MED-011": ["diclofenaco", "dolor fuerte", "inflamacion", "golpes", "articulaciones", "muscular"],
  "MED-012": ["fexofenadina", "alergia fuerte", "ronchas", "picazon", "estornudos"],
  "MED-013": ["reflujo", "acidez", "ardor", "estomago", "indigestion", "alginato"],
  "MED-014": ["vitamina c", "defensas", "gripe", "resfriado", "inmunidad"],
  "MED-015": ["colesterol", "trigliceridos", "atorvastatina", "grasas"],
  "MED-016": ["quemaduras", "rozaduras", "piel", "dermatitis", "cicatrizante"],
  "MED-017": ["diabetes", "azucar", "glucosa", "metformina"],
  "MED-018": ["tos", "flema", "expectorante", "bronquitis", "gripe", "ambroxol"],
  "MED-019": ["heridas", "infeccion piel", "crema", "acido fusidico"],
  "MED-020": ["diabetes", "glucosa", "azucar", "sitagliptina"],
};

export interface VoiceMatchResult {
  searchTerm: string;
  matchedMed?: Medicamento;
  confidence: "high" | "medium" | "low";
  originalSpoken: string;
  reason?: string;
  alternatives: { name: string; score: number }[];
}

/**
 * Strips conversational fluff in Spanish.
 */
export function cleanSpokenPhrase(raw: string): string {
  let s = (raw || "").trim();

  // Remove common punctuation
  s = s.replace(/^[¿¡"'\s.,;:-]+|[¿¡"'\s.,;:-]+$/g, "");

  // Strip conversational prefixes
  s = s.replace(
    /^(busca|buscar|encuentra|encontrar|quiero|necesito|dame|deme|tienes|tienen|hay|precio de|cuanto cuesta|consultar|ver|vendes|venden|medicamento para|medicina para|pastilla para|pastillas para|jarabe para|algo para|remedio para)\s+/i,
    ""
  );

  // Strip conversational suffixes
  s = s.replace(/\s+(por favor|gracias|muchas gracias)$/i, "");

  return s.trim();
}

/**
 * Main function: resolves a spoken raw voice string to the most accurate
 * product name or active principle in the pharmacy inventory.
 */
export function resolvePharmaceuticalVoiceQuery(
  rawInput: string,
  catalogMeds: Medicamento[] = []
): VoiceMatchResult {
  const cleaned = cleanSpokenPhrase(rawInput);
  const normCleaned = normalizeText(cleaned);

  if (!normCleaned) {
    return {
      searchTerm: "",
      confidence: "low",
      originalSpoken: rawInput,
      alternatives: [],
    };
  }

  // 1. Direct match in dictionary of common speech-to-text corruptions
  if (PHONETIC_CORRECTIONS[normCleaned]) {
    const targetName = PHONETIC_CORRECTIONS[normCleaned];
    const med = catalogMeds.find((m) =>
      normalizeText(m.nombre).includes(normalizeText(targetName)) ||
      normalizeText(m.principio).includes(normalizeText(targetName))
    );
    return {
      searchTerm: targetName,
      matchedMed: med,
      confidence: "high",
      originalSpoken: rawInput,
      reason: `Corregido de "${cleaned}" a "${targetName}"`,
      alternatives: [],
    };
  }

  // Check sub-phrase match in dictionary
  for (const [misheard, proper] of Object.entries(PHONETIC_CORRECTIONS)) {
    if (normCleaned.includes(misheard)) {
      const med = catalogMeds.find((m) =>
        normalizeText(m.nombre).includes(normalizeText(proper)) ||
        normalizeText(m.principio).includes(normalizeText(proper))
      );
      return {
        searchTerm: proper,
        matchedMed: med,
        confidence: "high",
        originalSpoken: rawInput,
        reason: `Corregido de "${misheard}" a "${proper}"`,
        alternatives: [],
      };
    }
  }

  // 2. Symptom / Indication detection
  for (const [symptom, suggestions] of Object.entries(SYMPTOM_TO_MED)) {
    if (normCleaned.includes(symptom)) {
      const primary = suggestions[0];
      const med = catalogMeds.find((m) => normalizeText(m.nombre).includes(normalizeText(primary)));
      const alternatives = suggestions.slice(1).map((s) => ({ name: s, score: 0.85 }));
      return {
        searchTerm: primary,
        matchedMed: med,
        confidence: "medium",
        originalSpoken: rawInput,
        reason: `Indicado para "${symptom}"`,
        alternatives,
      };
    }
  }

  // 3. Match against actual database medications (both Name and Active Principle)
  const scoredMeds: { med: Medicamento; score: number; matchedField: string }[] = [];

  for (const m of catalogMeds) {
    const nameScore = similarityScore(normCleaned, m.nombre);
    const principleScore = similarityScore(normCleaned, m.principio);
    const catScore = similarityScore(normCleaned, m.categoria) * 0.8;

    let bestScore = Math.max(nameScore, principleScore, catScore);
    let field = nameScore >= principleScore ? m.nombre : m.principio;

    // Check individual tokens if multi-word
    const tokens = normCleaned.split(" ").filter((t) => t.length > 2);
    for (const t of tokens) {
      const tokenNameScore = similarityScore(t, m.nombre);
      const tokenPrincScore = similarityScore(t, m.principio);
      if (tokenNameScore > bestScore) {
        bestScore = tokenNameScore;
        field = m.nombre;
      }
      if (tokenPrincScore > bestScore) {
        bestScore = tokenPrincScore;
        field = m.principio;
      }
    }

    if (bestScore >= 0.52) {
      scoredMeds.push({ med: m, score: bestScore, matchedField: field });
    }
  }

  scoredMeds.sort((a, b) => b.score - a.score);

  if (scoredMeds.length > 0) {
    const top = scoredMeds[0];
    const isHigh = top.score >= 0.78;
    const isMed = top.score >= 0.60;
    const confidence = isHigh ? "high" : isMed ? "medium" : "low";

    const alternatives = scoredMeds
      .slice(1, 4)
      .map((item) => ({ name: item.med.nombre, score: item.score }));

    return {
      searchTerm: top.med.nombre,
      matchedMed: top.med,
      confidence,
      originalSpoken: rawInput,
      reason: top.score > 0.9 ? undefined : `Coincidencia fonética (${Math.round(top.score * 100)}%)`,
      alternatives,
    };
  }

  // 4. Default: return cleaned phrase
  return {
    searchTerm: cleaned,
    confidence: "low",
    originalSpoken: rawInput,
    alternatives: [],
  };
}

/**
 * Universal intelligent filter for POS and Inventario tables.
 * Matches by Name, Active Principle, Category, Code, and Clinical Indications/Symptoms.
 */
export function matchMedicineFilter(m: Medicamento, rawQuery: string): boolean {
  const qClean = cleanSpokenPhrase(rawQuery);
  const qNorm = normalizeText(qClean);
  if (!qNorm) return true;

  // Direct text match on standard fields
  const mText = normalizeText(`${m.nombre} ${m.principio} ${m.categoria} ${m.codigo}`);
  if (mText.includes(qNorm)) return true;

  // Token inclusion
  const tokens = qNorm.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((tok) => mText.includes(tok))) {
    return true;
  }

  // Check known phonetic correction
  if (PHONETIC_CORRECTIONS[qNorm]) {
    const corrected = normalizeText(PHONETIC_CORRECTIONS[qNorm]);
    if (mText.includes(corrected)) return true;
  }

  // Check clinical indications/symptoms tags
  const tags = MED_INDICATIONS_TAGS[m.id] || [];
  for (const tag of tags) {
    const normTag = normalizeText(tag);
    if (normTag.includes(qNorm) || qNorm.includes(normTag)) return true;
  }

  // Check high phonetic similarity
  const sim = similarityScore(qNorm, m.nombre);
  if (sim >= 0.72) return true;

  return false;
}
