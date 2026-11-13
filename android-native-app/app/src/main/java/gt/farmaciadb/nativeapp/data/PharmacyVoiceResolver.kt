package gt.farmaciadb.nativeapp.data

import java.text.Normalizer

data class VoiceMatchResult(
    val searchTerm: String,
    val originalSpoken: String,
    val reason: String? = null
)

object PharmacyVoiceResolver {
    private val symptomMap = mapOf(
        "dolor de cabeza" to ("Panadol Extra" to "Alivio analgésico para dolor de cabeza"),
        "migraña" to ("Panadol Extra" to "Alivio para migraña"),
        "fiebre" to ("Panadol Extra" to "Antipirético recomendado"),
        "calentura" to ("Panadol Extra" to "Antipirético"),
        "dolor muscular" to ("Advil" to "Antiinflamatorio para dolor muscular"),
        "inflamacion" to ("Advil" to "Antiinflamatorio Ibuprofeno"),
        "dolor de estomago" to ("Omeprazol MK" to "Protector gástrico"),
        "acidez" to ("Omeprazol MK" to "Control de acidez gástrica"),
        "gastritis" to ("Omeprazol MK" to "Tratamiento para gastritis"),
        "alergia" to ("Clarityne" to "Antihistamínico Loratadina"),
        "picazon" to ("Clarityne" to "Alivio de alergias"),
        "gripe" to ("Tabcin Gripe" to "Alivio antigripal"),
        "resfriado" to ("Tabcin Gripe" to "Descongestionante y antigripal"),
        "tos" to ("Ventolin" to "Broncodilatador respiratorio"),
        "asma" to ("Ventolin" to "Salbutamol inhalador"),
        "infeccion" to ("Amoxil" to "Antibiótico Amoxicilina"),
        "vitaminas" to ("Centrum" to "Multivitamínico completo")
    )

    private val phoneticFixes = mapOf(
        "amoxil" to "Amoxil",
        "amoxicilina" to "Amoxil",
        "panadol" to "Panadol Extra",
        "paracetamol" to "Panadol Extra",
        "acetaminofen" to "Panadol Extra",
        "advil" to "Advil",
        "ibuprofeno" to "Advil",
        "omeprazol" to "Omeprazol MK",
        "clarityne" to "Clarityne",
        "claritin" to "Clarityne",
        "loratadina" to "Clarityne",
        "losartan" to "Losartán Denk",
        "aspirina" to "Aspirina Bayer",
        "ventolin" to "Ventolin",
        "salbutamol" to "Ventolin",
        "cipro" to "Cipro",
        "voltaren" to "Voltaren",
        "diclofenaco" to "Voltaren",
        "tabcin" to "Tabcin Gripe",
        "centrum" to "Centrum"
    )

    private fun normalize(text: String): String {
        val decomposed = Normalizer.normalize(text.lowercase().trim(), Normalizer.Form.NFD)
        return decomposed.replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
    }

    fun resolve(spokenRaw: String, catalog: List<Medicamento>): VoiceMatchResult {
        val clean = spokenRaw.trim()
        if (clean.isEmpty()) return VoiceMatchResult("", spokenRaw)

        val norm = normalize(clean)

        // 1. Direct symptom match
        for ((symptom, target) in symptomMap) {
            if (norm.contains(symptom)) {
                return VoiceMatchResult(target.first, clean, target.second)
            }
        }

        // 2. Phonetic brand/ingredient correction
        for ((key, brand) in phoneticFixes) {
            if (norm.contains(key)) {
                return VoiceMatchResult(brand, clean, "Coincidencia farmacéutica")
            }
        }

        // 3. Direct substring match in live SQLite catalog
        val exact = catalog.firstOrNull {
            normalize(it.nombre).contains(norm) || normalize(it.principio).contains(norm)
        }
        if (exact != null) {
            return VoiceMatchResult(exact.nombre, clean)
        }

        // 4. Fuzzy Levenshtein distance match against catalog names
        var bestMed: Medicamento? = null
        var bestScore = Int.MAX_VALUE
        for (med in catalog) {
            val dist = levenshtein(norm, normalize(med.nombre).split(" ").first())
            if (dist < bestScore) {
                bestScore = dist
                bestMed = med
            }
        }
        if (bestMed != null && bestScore <= 2) {
            return VoiceMatchResult(bestMed.nombre, clean, "Corrección fonética automática")
        }

        return VoiceMatchResult(clean, clean)
    }

    private fun levenshtein(a: String, b: String): Int {
        val dp = Array(a.length + 1) { IntArray(b.length + 1) }
        for (i in 0..a.length) dp[i][0] = i
        for (j in 0..b.length) dp[0][j] = j
        for (i in 1..a.length) {
            for (j in 1..b.length) {
                val cost = if (a[i - 1] == b[j - 1]) 0 else 1
                dp[i][j] = minOf(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost
                )
            }
        }
        return dp[a.length][b.length]
    }
}
