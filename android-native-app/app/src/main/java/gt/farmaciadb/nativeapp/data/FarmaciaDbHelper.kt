package gt.farmaciadb.nativeapp.data

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class FarmaciaDbHelper(context: Context) : SQLiteOpenHelper(
    context,
    "farmaciadb_native.db",
    null,
    1
) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                nombre TEXT NOT NULL,
                role TEXT NOT NULL
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE medicamentos (
                id TEXT PRIMARY KEY,
                codigo TEXT NOT NULL,
                nombre TEXT NOT NULL,
                principio TEXT NOT NULL,
                categoria TEXT NOT NULL,
                caducidad TEXT NOT NULL,
                precio_compra REAL NOT NULL,
                precio_venta REAL NOT NULL,
                stock INTEGER NOT NULL
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE clientes (
                id TEXT PRIMARY KEY,
                nombre TEXT NOT NULL,
                telefono TEXT NOT NULL,
                nit TEXT NOT NULL,
                puntos INTEGER NOT NULL DEFAULT 0
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE proveedores (
                id TEXT PRIMARY KEY,
                empresa TEXT NOT NULL,
                contacto TEXT NOT NULL,
                telefono TEXT NOT NULL,
                correo TEXT NOT NULL,
                direccion TEXT NOT NULL
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE compras (
                id TEXT PRIMARY KEY,
                codigo TEXT NOT NULL,
                fecha TEXT NOT NULL,
                proveedor_id TEXT NOT NULL,
                med_id TEXT NOT NULL,
                cantidad INTEGER NOT NULL,
                costo REAL NOT NULL,
                estado TEXT NOT NULL,
                nota TEXT
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE ventas (
                id TEXT PRIMARY KEY,
                codigo TEXT NOT NULL,
                fecha TEXT NOT NULL,
                subtotal REAL NOT NULL,
                descuento REAL NOT NULL,
                desc_pct REAL NOT NULL,
                iva REAL NOT NULL,
                total REAL NOT NULL,
                vendedor_nombre TEXT NOT NULL,
                cliente_id TEXT,
                puntos INTEGER NOT NULL DEFAULT 0
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE venta_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                venta_id TEXT NOT NULL,
                med_id TEXT NOT NULL,
                nombre TEXT NOT NULL,
                cantidad INTEGER NOT NULL,
                precio REAL NOT NULL
            )
        """.trimIndent())

        seedInitialData(db)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS venta_items")
        db.execSQL("DROP TABLE IF EXISTS ventas")
        db.execSQL("DROP TABLE IF EXISTS compras")
        db.execSQL("DROP TABLE IF EXISTS proveedores")
        db.execSQL("DROP TABLE IF EXISTS clientes")
        db.execSQL("DROP TABLE IF EXISTS medicamentos")
        db.execSQL("DROP TABLE IF EXISTS users")
        onCreate(db)
    }

    private fun futureDate(daysAhead: Int): String {
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, daysAhead)
        return SimpleDateFormat("yyyy-MM-dd", Locale.US).format(cal.time)
    }

    private fun isoDate(daysAgo: Int): String {
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, -daysAgo)
        return SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).format(cal.time)
    }

    private fun seedInitialData(db: SQLiteDatabase) {
        val meds = listOf(
            Medicamento("MED-001", "75010000010", "Panadol Extra", "Paracetamol 500mg", "Analgésicos", futureDate(400), 8.50, 14.00, 120),
            Medicamento("MED-002", "75010079191", "Advil", "Ibuprofeno 400mg", "Antiinflamatorios", futureDate(300), 12.00, 19.50, 85),
            Medicamento("MED-003", "75010158382", "Amoxil", "Amoxicilina 500mg", "Antibióticos", futureDate(20), 35.00, 55.00, 6),
            Medicamento("MED-004", "75010237573", "Clarityne", "Loratadina 10mg", "Antihistamínicos", futureDate(250), 22.00, 34.00, 48),
            Medicamento("MED-005", "75010316764", "Omeprazol MK", "Omeprazol 20mg", "Gastrointestinal", futureDate(180), 15.00, 25.00, 64),
            Medicamento("MED-006", "75010395955", "Losartán Denk", "Losartán 50mg", "Cardiovascular", futureDate(365), 28.00, 42.00, 8),
            Medicamento("MED-007", "75010475146", "Centrum", "Multivitamínico", "Vitaminas", futureDate(500), 95.00, 139.00, 30),
            Medicamento("MED-008", "75010554337", "Ventolin", "Salbutamol 100mcg", "Respiratorio", futureDate(25), 48.00, 72.00, 22),
            Medicamento("MED-009", "75010633528", "Aspirina Bayer", "Ácido acetilsalicílico 100mg", "Analgésicos", futureDate(600), 6.00, 10.00, 150),
            Medicamento("MED-010", "75010712719", "Cipro", "Ciprofloxacino 500mg", "Antibióticos", futureDate(210), 40.00, 62.00, 5),
            Medicamento("MED-011", "75010791900", "Voltaren", "Diclofenaco 50mg", "Antiinflamatorios", futureDate(15), 18.00, 29.00, 40),
            Medicamento("MED-012", "75010871091", "Tabcin Gripe", "Clorfeniramina + Paracetamol", "Respiratorio", futureDate(280), 9.00, 15.50, 95)
        )
        for (m in meds) {
            db.insert("medicamentos", null, ContentValues().apply {
                put("id", m.id)
                put("codigo", m.codigo)
                put("nombre", m.nombre)
                put("principio", m.principio)
                put("categoria", m.categoria)
                put("caducidad", m.caducidad)
                put("precio_compra", m.precioCompra)
                put("precio_venta", m.precioVenta)
                put("stock", m.stock)
            })
        }

        val provs = listOf(
            Proveedor("PRV-001", "Droguería La Salud S.A.", "Luis Morales", "2310-4500", "ventas@lasalud.gt", "Zona 4, Ciudad de Guatemala"),
            Proveedor("PRV-002", "Bayer Centroamérica", "Andrea Castro", "2385-9000", "pedidos@bayer.com", "Zona 14, Ciudad de Guatemala"),
            Proveedor("PRV-003", "Farmasa Distribuciones", "Carlos Rivera", "2421-7788", "info@farmasa.com", "Mixco, Guatemala")
        )
        for (p in provs) {
            db.insert("proveedores", null, ContentValues().apply {
                put("id", p.id)
                put("empresa", p.empresa)
                put("contacto", p.contacto)
                put("telefono", p.telefono)
                put("correo", p.correo)
                put("direccion", p.direccion)
            })
        }

        val clients = listOf(
            Cliente("CLI-001", "Ana Morales", "5512-3344", "4589632-1", 45),
            Cliente("CLI-002", "Carlos Juárez", "5523-8899", "CF", 10),
            Cliente("CLI-003", "Lucía Barrios", "4456-7788", "7845123-6", 120)
        )
        for (c in clients) {
            db.insert("clientes", null, ContentValues().apply {
                put("id", c.id)
                put("nombre", c.nombre)
                put("telefono", c.telefono)
                put("nit", c.nit)
                put("puntos", c.puntos)
            })
        }

        db.insert("compras", null, ContentValues().apply {
            put("id", "CMP-001")
            put("codigo", "OC-1001")
            put("fecha", isoDate(1))
            put("proveedor_id", "PRV-001")
            put("med_id", "MED-003")
            put("cantidad", 50)
            put("costo", 35.0)
            put("estado", "Pendiente")
            put("nota", "Reposición urgente antibiótico")
        })
        db.insert("compras", null, ContentValues().apply {
            put("id", "CMP-002")
            put("codigo", "OC-1002")
            put("fecha", isoDate(4))
            put("proveedor_id", "PRV-002")
            put("med_id", "MED-001")
            put("cantidad", 100)
            put("costo", 8.5)
            put("estado", "Completado")
            put("nota", "Lote analgésicos")
        })
    }

    // AUTH
    fun login(email: String, password: String): User? {
        val db = readableDatabase
        db.rawQuery(
            "SELECT id, email, nombre, role FROM users WHERE LOWER(email)=LOWER(?) AND password=?",
            arrayOf(email.trim(), password)
        ).use { c ->
            if (c.moveToFirst()) {
                return User(
                    id = c.getLong(0),
                    email = c.getString(1),
                    nombre = c.getString(2),
                    role = c.getString(3)
                )
            }
        }
        return null
    }

    fun registerUser(nombre: String, email: String, password: String, role: String): Pair<User?, String?> {
        val db = writableDatabase
        db.rawQuery("SELECT id FROM users WHERE LOWER(email)=LOWER(?)", arrayOf(email.trim())).use { c ->
            if (c.moveToFirst()) {
                return null to "Este correo ya está registrado"
            }
        }
        val id = db.insert("users", null, ContentValues().apply {
            put("email", email.trim())
            put("password", password)
            put("nombre", nombre.trim())
            put("role", role)
        })
        if (id == -1L) return null to "No se pudo crear la cuenta"
        return User(id = id, email = email.trim(), nombre = nombre.trim(), role = role) to null
    }

    // MEDICAMENTOS
    fun getMedicamentos(): List<Medicamento> {
        val list = mutableListOf<Medicamento>()
        readableDatabase.rawQuery(
            "SELECT id, codigo, nombre, principio, categoria, caducidad, precio_compra, precio_venta, stock FROM medicamentos ORDER BY nombre ASC",
            null
        ).use { c ->
            while (c.moveToNext()) {
                list.add(
                    Medicamento(
                        id = c.getString(0),
                        codigo = c.getString(1),
                        nombre = c.getString(2),
                        principio = c.getString(3),
                        categoria = c.getString(4),
                        caducidad = c.getString(5),
                        precioCompra = c.getDouble(6),
                        precioVenta = c.getDouble(7),
                        stock = c.getInt(8)
                    )
                )
            }
        }
        return list
    }

    fun upsertMedicamento(m: Medicamento) {
        writableDatabase.insertWithOnConflict(
            "medicamentos",
            null,
            ContentValues().apply {
                put("id", m.id)
                put("codigo", m.codigo)
                put("nombre", m.nombre)
                put("principio", m.principio)
                put("categoria", m.categoria)
                put("caducidad", m.caducidad)
                put("precio_compra", m.precioCompra)
                put("precio_venta", m.precioVenta)
                put("stock", m.stock)
            },
            SQLiteDatabase.CONFLICT_REPLACE
        )
    }

    fun deleteMedicamento(id: String) {
        writableDatabase.delete("medicamentos", "id=?", arrayOf(id))
    }

    // CLIENTES
    fun getClientes(): List<Cliente> {
        val list = mutableListOf<Cliente>()
        readableDatabase.rawQuery("SELECT id, nombre, telefono, nit, puntos FROM clientes ORDER BY nombre ASC", null).use { c ->
            while (c.moveToNext()) {
                list.add(Cliente(c.getString(0), c.getString(1), c.getString(2), c.getString(3), c.getInt(4)))
            }
        }
        return list
    }

    fun upsertCliente(cl: Cliente) {
        writableDatabase.insertWithOnConflict(
            "clientes",
            null,
            ContentValues().apply {
                put("id", cl.id)
                put("nombre", cl.nombre)
                put("telefono", cl.telefono)
                put("nit", cl.nit)
                put("puntos", cl.puntos)
            },
            SQLiteDatabase.CONFLICT_REPLACE
        )
    }

    // PROVEEDORES
    fun getProveedores(): List<Proveedor> {
        val list = mutableListOf<Proveedor>()
        readableDatabase.rawQuery("SELECT id, empresa, contacto, telefono, correo, direccion FROM proveedores ORDER BY empresa ASC", null).use { c ->
            while (c.moveToNext()) {
                list.add(Proveedor(c.getString(0), c.getString(1), c.getString(2), c.getString(3), c.getString(4), c.getString(5)))
            }
        }
        return list
    }

    fun upsertProveedor(p: Proveedor) {
        writableDatabase.insertWithOnConflict(
            "proveedores",
            null,
            ContentValues().apply {
                put("id", p.id)
                put("empresa", p.empresa)
                put("contacto", p.contacto)
                put("telefono", p.telefono)
                put("correo", p.correo)
                put("direccion", p.direccion)
            },
            SQLiteDatabase.CONFLICT_REPLACE
        )
    }

    fun deleteProveedor(id: String) {
        writableDatabase.delete("proveedores", "id=?", arrayOf(id))
    }

    // COMPRAS
    fun getCompras(): List<Compra> {
        val list = mutableListOf<Compra>()
        readableDatabase.rawQuery(
            "SELECT id, codigo, fecha, proveedor_id, med_id, cantidad, costo, estado, nota FROM compras ORDER BY fecha DESC",
            null
        ).use { c ->
            while (c.moveToNext()) {
                list.add(
                    Compra(
                        id = c.getString(0),
                        codigo = c.getString(1),
                        fecha = c.getString(2),
                        proveedorId = c.getString(3),
                        medId = c.getString(4),
                        cantidad = c.getInt(5),
                        costo = c.getDouble(6),
                        estado = c.getString(7),
                        nota = c.getString(8)
                    )
                )
            }
        }
        return list
    }

    fun insertCompra(c: Compra) {
        writableDatabase.insert("compras", null, ContentValues().apply {
            put("id", c.id)
            put("codigo", c.codigo)
            put("fecha", c.fecha)
            put("proveedor_id", c.proveedorId)
            put("med_id", c.medId)
            put("cantidad", c.cantidad)
            put("costo", c.costo)
            put("estado", c.estado)
            put("nota", c.nota)
        })
    }

    fun recibirCompra(compraId: String) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            db.rawQuery("SELECT med_id, cantidad, costo, estado FROM compras WHERE id=?", arrayOf(compraId)).use { c ->
                if (c.moveToFirst()) {
                    val medId = c.getString(0)
                    val qty = c.getInt(1)
                    val cost = c.getDouble(2)
                    val estado = c.getString(3)
                    if (estado != "Completado") {
                        db.execSQL("UPDATE compras SET estado='Completado' WHERE id=?", arrayOf(compraId))
                        db.execSQL("UPDATE medicamentos SET stock = stock + ?, precio_compra = ? WHERE id=?", arrayOf(qty, cost, medId))
                    }
                }
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    // VENTAS TRANSACCIONAL
    fun getVentas(): List<Venta> {
        val list = mutableListOf<Venta>()
        val db = readableDatabase
        db.rawQuery(
            "SELECT id, codigo, fecha, subtotal, descuento, desc_pct, iva, total, vendedor_nombre, cliente_id, puntos FROM ventas ORDER BY fecha DESC",
            null
        ).use { c ->
            while (c.moveToNext()) {
                val ventaId = c.getString(0)
                val items = mutableListOf<VentaItem>()
                db.rawQuery("SELECT med_id, nombre, cantidad, precio FROM venta_items WHERE venta_id=?", arrayOf(ventaId)).use { ic ->
                    while (ic.moveToNext()) {
                        items.add(VentaItem(ic.getString(0), ic.getString(1), ic.getInt(2), ic.getDouble(3)))
                    }
                }
                list.add(
                    Venta(
                        id = ventaId,
                        codigo = c.getString(1),
                        fecha = c.getString(2),
                        subtotal = c.getDouble(3),
                        descuento = c.getDouble(4),
                        descPct = c.getDouble(5),
                        iva = c.getDouble(6),
                        total = c.getDouble(7),
                        vendedorNombre = c.getString(8),
                        clienteId = c.getString(9),
                        puntos = c.getInt(10),
                        items = items
                    )
                )
            }
        }
        return list
    }

    fun registrarVenta(
        vendedorNombre: String,
        clienteId: String?,
        descPct: Double,
        cart: List<CartItem>
    ): Venta {
        val subtotal = Math.round(cart.sumOf { it.medicamento.precioVenta * it.cantidad } * 100.0) / 100.0
        val descuento = Math.round(subtotal * (descPct / 100.0) * 100.0) / 100.0
        val base = subtotal - descuento
        val iva = Math.round(base * 0.12 * 100.0) / 100.0
        val total = Math.round((base + iva) * 100.0) / 100.0
        val puntos = (total / 100.0).toInt() * 5
        val nowIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).format(Date())
        val id = "vta-${System.currentTimeMillis()}"
        val codigo = "VTA-${(1000..9999).random()}"

        val db = writableDatabase
        db.beginTransaction()
        try {
            db.insert("ventas", null, ContentValues().apply {
                put("id", id)
                put("codigo", codigo)
                put("fecha", nowIso)
                put("subtotal", subtotal)
                put("descuento", descuento)
                put("desc_pct", descPct)
                put("iva", iva)
                put("total", total)
                put("vendedor_nombre", vendedorNombre)
                put("cliente_id", clienteId)
                put("puntos", puntos)
            })

            val items = cart.map { ci ->
                db.insert("venta_items", null, ContentValues().apply {
                    put("venta_id", id)
                    put("med_id", ci.medicamento.id)
                    put("nombre", ci.medicamento.nombre)
                    put("cantidad", ci.cantidad)
                    put("precio", ci.medicamento.precioVenta)
                })
                db.execSQL(
                    "UPDATE medicamentos SET stock = MAX(0, stock - ?) WHERE id=?",
                    arrayOf(ci.cantidad, ci.medicamento.id)
                )
                VentaItem(ci.medicamento.id, ci.medicamento.nombre, ci.cantidad, ci.medicamento.precioVenta)
            }

            if (!clienteId.isNullOrBlank() && puntos > 0) {
                db.execSQL("UPDATE clientes SET puntos = puntos + ? WHERE id=?", arrayOf(puntos, clienteId))
            }

            db.setTransactionSuccessful()
            return Venta(id, codigo, nowIso, subtotal, descuento, descPct, iva, total, vendedorNombre, clienteId, puntos, items)
        } finally {
            db.endTransaction()
        }
    }
}
