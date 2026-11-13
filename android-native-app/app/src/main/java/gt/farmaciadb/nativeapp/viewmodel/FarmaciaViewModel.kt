package gt.farmaciadb.nativeapp.viewmodel

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import gt.farmaciadb.nativeapp.data.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

const val ADMIN_MASTER_PASSWORD = "farmaciadbadmin123"

class FarmaciaViewModel(application: Application) : AndroidViewModel(application) {
    private val db = FarmaciaDbHelper(application)

    var currentUser by mutableStateOf<User?>(null)
        private set

    var meds by mutableStateOf<List<Medicamento>>(emptyList())
        private set

    var clientes by mutableStateOf<List<Cliente>>(emptyList())
        private set

    var proveedores by mutableStateOf<List<Proveedor>>(emptyList())
        private set

    var compras by mutableStateOf<List<Compra>>(emptyList())
        private set

    var ventas by mutableStateOf<List<Venta>>(emptyList())
        private set

    val cart = mutableStateListOf<CartItem>()
    var posDiscountPct by mutableStateOf(0.0)
    var posSelectedClientId by mutableStateOf<String?>(null)

    val chatMessages = mutableStateListOf(
        ChatMessage(
            id = "welcome",
            fromBot = true,
            text = "¡Hola! Soy tu Asistente Clínico de FarmaciaDB.\n\nConsulta síntomas, stock crítico, vencimientos o usa tu voz para buscar.",
            time = currentTimeStr()
        )
    )

    var toastMessage by mutableStateOf<String?>(null)

    init {
        refreshAll()
    }

    fun refreshAll() {
        meds = db.getMedicamentos()
        clientes = db.getClientes()
        proveedores = db.getProveedores()
        compras = db.getCompras()
        ventas = db.getVentas()
    }

    fun showToast(msg: String) {
        toastMessage = msg
    }

    fun clearToast() {
        toastMessage = null
    }

    fun evaluatePasswordStrength(pass: String): PasswordStrength {
        val minChars = pass.length >= 6
        val hasNumber = pass.any { it.isDigit() }
        val hasMixed = pass.any { it.isUpperCase() } || pass.any { !it.isLetterOrDigit() }
        val strongChars = pass.length >= 8

        val score = when {
            !minChars || !hasNumber -> 1
            strongChars && hasMixed -> 3
            else -> 2
        }
        val level = when (score) {
            1 -> "baja"
            2 -> "media"
            else -> "fuerte"
        }
        val label = when (score) {
            1 -> "Baja (No permitida)"
            2 -> "Media (Aceptada)"
            else -> "Fuerte (Excelente)"
        }
        return PasswordStrength(
            score = score,
            level = level,
            label = label,
            isAllowed = score >= 2,
            minChars = minChars,
            hasNumber = hasNumber,
            hasMixedCaseOrSymbol = hasMixed,
            strongChars = strongChars
        )
    }

    fun login(email: String, password: String): String? {
        if (email.isBlank() || password.isBlank()) return "Ingresa tu correo y contraseña"
        val user = db.login(email, password)
            ?: return "Credenciales incorrectas o cuenta no registrada."
        currentUser = user
        refreshAll()
        return null
    }

    fun register(
        nombre: String,
        email: String,
        password: String,
        role: String,
        adminKey: String
    ): String? {
        if (nombre.trim().length < 3) return "Mínimo 3 caracteres para el nombre"
        if (!email.contains("@") || !email.contains(".")) return "Correo electrónico inválido"
        if (!evaluatePasswordStrength(password).isAllowed) {
            return "Contraseña débil. Usa mínimo 6 caracteres combinando letras y números."
        }
        if (role == "admin" && adminKey != ADMIN_MASTER_PASSWORD) {
            return "Clave maestra de administrador incorrecta."
        }
        val (user, err) = db.registerUser(nombre, email, password, role)
        if (err != null || user == null) return err ?: "Error al crear cuenta"
        currentUser = user
        refreshAll()
        return null
    }

    fun logout() {
        currentUser = null
        cart.clear()
    }

    // POS Operations
    fun addToCart(med: Medicamento) {
        if (med.stock <= 0) {
            showToast("Sin stock disponible para ${med.nombre}")
            return
        }
        val idx = cart.indexOfFirst { it.medicamento.id == med.id }
        if (idx >= 0) {
            val existing = cart[idx]
            if (existing.cantidad < med.stock) {
                cart[idx] = existing.copy(cantidad = existing.cantidad + 1)
            } else {
                showToast("Stock máximo alcanzado (${med.stock})")
            }
        } else {
            cart.add(CartItem(med, 1))
        }
    }

    fun updateCartQty(medId: String, delta: Int) {
        val idx = cart.indexOfFirst { it.medicamento.id == medId }
        if (idx < 0) return
        val item = cart[idx]
        val next = item.cantidad + delta
        when {
            next <= 0 -> cart.removeAt(idx)
            next <= item.medicamento.stock -> cart[idx] = item.copy(cantidad = next)
            else -> showToast("Máximo disponible: ${item.medicamento.stock}")
        }
    }

    fun cartSubtotal(): Double = cart.sumOf { it.medicamento.precioVenta * it.cantidad }
    fun cartDiscount(): Double = cartSubtotal() * (posDiscountPct / 100.0)
    fun cartIva(): Double = (cartSubtotal() - cartDiscount()) * 0.12
    fun cartTotal(): Double = (cartSubtotal() - cartDiscount()) + cartIva()

    fun completeSale(): Venta? {
        if (cart.isEmpty()) return null
        val vendedor = currentUser?.nombre ?: "Vendedor"
        val venta = db.registrarVenta(vendedor, posSelectedClientId, posDiscountPct, cart.toList())
        cart.clear()
        posDiscountPct = 0.0
        posSelectedClientId = null
        refreshAll()
        showToast("Venta ${venta.codigo} completada por Q${String.format(Locale.US, "%.2f", venta.total)}")
        return venta
    }

    // Inventory CRUD
    fun saveMedicamento(m: Medicamento) {
        val finalMed = if (m.id.isBlank()) m.copy(id = "MED-${System.currentTimeMillis().toString().takeLast(5)}") else m
        db.upsertMedicamento(finalMed)
        refreshAll()
        showToast("Medicamento guardado en SQLite")
    }

    fun deleteMedicamento(id: String) {
        db.deleteMedicamento(id)
        refreshAll()
        showToast("Medicamento eliminado")
    }

    // Clients CRUD
    fun saveCliente(c: Cliente) {
        val finalClient = if (c.id.isBlank()) c.copy(id = "CLI-${System.currentTimeMillis().toString().takeLast(5)}") else c
        db.upsertCliente(finalClient)
        refreshAll()
        showToast("Cliente guardado")
    }

    // Suppliers CRUD
    fun saveProveedor(p: Proveedor) {
        val finalProv = if (p.id.isBlank()) p.copy(id = "PRV-${System.currentTimeMillis().toString().takeLast(5)}") else p
        db.upsertProveedor(finalProv)
        refreshAll()
        showToast("Proveedor guardado")
    }

    fun deleteProveedor(id: String) {
        db.deleteProveedor(id)
        refreshAll()
        showToast("Proveedor eliminado")
    }

    // Purchases
    fun createCompra(proveedorId: String, medId: String, cantidad: Int, costo: Double, nota: String) {
        val id = "CMP-${System.currentTimeMillis().toString().takeLast(5)}"
        val codigo = "OC-${(1000..9999).random()}"
        val fecha = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).format(Date())
        db.insertCompra(
            Compra(
                id = id,
                codigo = codigo,
                fecha = fecha,
                proveedorId = proveedorId,
                medId = medId,
                cantidad = cantidad,
                costo = costo,
                estado = "Pendiente",
                nota = nota.ifBlank { null }
            )
        )
        refreshAll()
        showToast("Orden de compra $codigo creada")
    }

    fun recibirCompra(compraId: String) {
        db.recibirCompra(compraId)
        refreshAll()
        showToast("Compra recibida e inventario actualizado")
    }

    // AI Assistant
    fun sendChatMessage(text: String) {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) return
        chatMessages.add(
            ChatMessage(
                id = "u-${System.currentTimeMillis()}",
                fromBot = false,
                text = trimmed,
                time = currentTimeStr()
            )
        )
        val reply = PharmacyAiEngine.generateReply(trimmed, meds, ventas)
        chatMessages.add(
            ChatMessage(
                id = "b-${System.currentTimeMillis() + 1}",
                fromBot = true,
                text = reply,
                time = currentTimeStr()
            )
        )
    }

    private fun currentTimeStr(): String =
        SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
}
