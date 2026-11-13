package gt.farmaciadb.nativeapp.data

data class User(
    val id: Long = 0,
    val email: String,
    val password: String = "",
    val nombre: String,
    val role: String // "admin" | "empleado"
)

data class Medicamento(
    val id: String,
    val codigo: String,
    val nombre: String,
    val principio: String,
    val categoria: String,
    val caducidad: String, // yyyy-MM-dd
    val precioCompra: Double,
    val precioVenta: Double,
    val stock: Int
)

data class Cliente(
    val id: String,
    val nombre: String,
    val telefono: String,
    val nit: String,
    val puntos: Int
)

data class Proveedor(
    val id: String,
    val empresa: String,
    val contacto: String,
    val telefono: String,
    val correo: String,
    val direccion: String
)

data class Compra(
    val id: String,
    val codigo: String,
    val fecha: String,
    val proveedorId: String,
    val medId: String,
    val cantidad: Int,
    val costo: Double,
    val estado: String, // "Pendiente" | "Completado"
    val nota: String?
)

data class VentaItem(
    val medId: String,
    val nombre: String,
    val cantidad: Int,
    val precio: Double
)

data class Venta(
    val id: String,
    val codigo: String,
    val fecha: String,
    val subtotal: Double,
    val descuento: Double,
    val descPct: Double,
    val iva: Double,
    val total: Double,
    val vendedorNombre: String,
    val clienteId: String?,
    val puntos: Int,
    val items: List<VentaItem>
)

data class CartItem(
    val medicamento: Medicamento,
    val cantidad: Int
)

data class ChatMessage(
    val id: String,
    val fromBot: Boolean,
    val text: String,
    val time: String
)

data class PasswordStrength(
    val score: Int, // 1=baja, 2=media, 3=fuerte
    val level: String,
    val label: String,
    val isAllowed: Boolean,
    val minChars: Boolean,
    val hasNumber: Boolean,
    val hasMixedCaseOrSymbol: Boolean,
    val strongChars: Boolean
)
