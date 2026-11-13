package gt.farmaciadb.nativeapp.data

import java.text.SimpleDateFormat
import java.util.Locale

object PharmacyAiEngine {
    fun generateReply(
        query: String,
        meds: List<Medicamento>,
        ventas: List<Venta>
    ): String {
        val q = query.lowercase().trim()

        if (q.contains("stock") || q.contains("agotar") || q.contains("bajo") || q.contains("inventario")) {
            val low = meds.filter { it.stock < 10 }
            return if (low.isEmpty()) {
                "✅ Todo el inventario tiene stock saludable (ningún medicamento por debajo de 10 unidades)."
            } else {
                buildString {
                    append("⚠️ **Medicamentos con Stock Crítico (<10 unidades):**\n")
                    low.forEach { append("• ${it.nombre} (${it.principio}): ${it.stock} uds — Q${String.format(Locale.US, "%.2f", it.precioVenta)}\n") }
                }.trim()
            }
        }

        if (q.contains("vencer") || q.contains("caduc") || q.contains("vencimiento")) {
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val nowMs = System.currentTimeMillis()
            val soon = meds.filter {
                runCatching {
                    val d = sdf.parse(it.caducidad)?.time ?: Long.MAX_VALUE
                    (d - nowMs) / 86400000L <= 30
                }.getOrDefault(false)
            }
            return if (soon.isEmpty()) {
                "✅ No hay medicamentos próximos a vencer en los siguientes 30 días."
            } else {
                buildString {
                    append("⏰ **Alertas de Caducidad (próximos 30 días):**\n")
                    soon.forEach { append("• ${it.nombre} — Vence: ${it.caducidad} (Stock: ${it.stock})\n") }
                }.trim()
            }
        }

        if (q.contains("venta") || q.contains("vendido") || q.contains("total") || q.contains("caja")) {
            val totalSum = ventas.sumOf { it.total }
            return "📊 **Resumen de Ventas:**\n• Operaciones registradas: ${ventas.size}\n• Total acumulado: Q${String.format(Locale.US, "%.2f", totalSum)}"
        }

        // Resolve medication or symptom recommendation from SQLite catalog
        val resolved = PharmacyVoiceResolver.resolve(query, meds)
        val matched = meds.firstOrNull {
            it.nombre.equals(resolved.searchTerm, ignoreCase = true) ||
                it.nombre.lowercase().contains(q) ||
                it.principio.lowercase().contains(q)
        }

        if (matched != null) {
            return buildString {
                append("💊 **Recomendación Farmacéutica:**\n")
                append("• **${matched.nombre}** (${matched.principio})\n")
                append("• Categoría: ${matched.categoria}\n")
                append("• Precio Venta: Q${String.format(Locale.US, "%.2f", matched.precioVenta)}\n")
                append("• Stock disponible: ${matched.stock} unidades\n")
                if (resolved.reason != null) append("• Indicación: ${resolved.reason}\n")
                append("\n⚕️ Verifica alergias del paciente antes de despachar.")
            }
        }

        return "🤖 Puedo ayudarte a consultar síntomas (dolor de cabeza, gripe, acidez, alergias), precios de medicamentos, stock crítico (<10) o vencimientos próximos."
    }
}
