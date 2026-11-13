package gt.farmaciadb.nativeapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import gt.farmaciadb.nativeapp.data.Cliente
import gt.farmaciadb.nativeapp.data.Proveedor
import gt.farmaciadb.nativeapp.viewmodel.FarmaciaViewModel

@Composable
fun ComprasScreen(vm: FarmaciaViewModel) {
    var showNewDialog by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = SlateBg,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showNewDialog = true },
                containerColor = EmeraldPrimary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, "Nueva compra")
            }
        }
    ) { pad ->
        Column(modifier = Modifier.fillMaxSize().padding(pad).padding(16.dp)) {
            SectionHeader(title = "Compras (${vm.compras.size})", subtitle = "Órdenes a proveedores y recepción a stock")
            Spacer(Modifier.height(12.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), contentPadding = PaddingValues(bottom = 80.dp)) {
                items(vm.compras, key = { it.id }) { cmp ->
                    val medName = vm.meds.firstOrNull { it.id == cmp.medId }?.nombre ?: cmp.medId
                    val provName = vm.proveedores.firstOrNull { it.id == cmp.proveedorId }?.empresa ?: cmp.proveedorId
                    val completed = cmp.estado == "Completado"

                    Card(
                        colors = CardDefaults.cardColors(containerColor = SlateSurface),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth().border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("${cmp.codigo} · $medName", fontWeight = FontWeight.Bold, color = Color.White)
                                StatusPill(cmp.estado, if (completed) EmeraldPrimary else AmberWarn)
                            }
                            Text("Proveedor: $provName", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                            Text(
                                "Cantidad: ${cmp.cantidad} uds · Costo c/u: ${formatQ(cmp.costo)} · Total: ${formatQ(cmp.cantidad * cmp.costo)}",
                                style = MaterialTheme.typography.bodySmall,
                                color = CyanAccent
                            )
                            if (!completed) {
                                Button(
                                    onClick = { vm.recibirCompra(cmp.id) },
                                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Icon(Icons.Default.Inventory, null, modifier = Modifier.size(16.dp))
                                    Spacer(Modifier.width(6.dp))
                                    Text("Recibir Compra y Sumar Stock", fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showNewDialog) {
        var selectedMedId by remember { mutableStateOf(vm.meds.firstOrNull()?.id ?: "") }
        var selectedProvId by remember { mutableStateOf(vm.proveedores.firstOrNull()?.id ?: "") }
        var qty by remember { mutableStateOf("25") }
        var costo by remember { mutableStateOf("10.0") }
        var nota by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showNewDialog = false },
            containerColor = SlateSurface,
            title = { Text("Nueva Orden de Compra", color = Color.White) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Medicamento: ${vm.meds.firstOrNull { it.id == selectedMedId }?.nombre ?: "-"}", color = EmeraldPrimary, fontWeight = FontWeight.SemiBold)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        vm.meds.take(3).forEach { m ->
                            FilterChip(
                                selected = selectedMedId == m.id,
                                onClick = { selectedMedId = m.id; costo = m.precioCompra.toString() },
                                label = { Text(m.nombre.take(10)) }
                            )
                        }
                    }
                    Text("Proveedor: ${vm.proveedores.firstOrNull { it.id == selectedProvId }?.empresa ?: "-"}", color = CyanAccent, fontWeight = FontWeight.SemiBold)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        vm.proveedores.take(2).forEach { p ->
                            FilterChip(
                                selected = selectedProvId == p.id,
                                onClick = { selectedProvId = p.id },
                                label = { Text(p.empresa.take(12)) }
                            )
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = qty, onValueChange = { qty = it }, label = { Text("Cantidad") }, singleLine = true, modifier = Modifier.weight(1f))
                        OutlinedTextField(value = costo, onValueChange = { costo = it }, label = { Text("Costo u.") }, singleLine = true, modifier = Modifier.weight(1f))
                    }
                    OutlinedTextField(value = nota, onValueChange = { nota = it }, label = { Text("Nota opcional") }, singleLine = true)
                }
            },
            confirmButton = {
                Button(onClick = {
                    if (selectedMedId.isNotBlank() && selectedProvId.isNotBlank()) {
                        vm.createCompra(
                            proveedorId = selectedProvId,
                            medId = selectedMedId,
                            cantidad = qty.toIntOrNull() ?: 10,
                            costo = costo.toDoubleOrNull() ?: 10.0,
                            nota = nota
                        )
                        showNewDialog = false
                    }
                }) { Text("Crear Orden") }
            },
            dismissButton = {
                TextButton(onClick = { showNewDialog = false }) { Text("Cancelar") }
            }
        )
    }
}

@Composable
fun ProveedoresScreen(vm: FarmaciaViewModel) {
    var showForm by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = SlateBg,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showForm = true },
                containerColor = EmeraldPrimary,
                contentColor = Color.White
            ) { Icon(Icons.Default.Add, "Nuevo proveedor") }
        }
    ) { pad ->
        Column(modifier = Modifier.fillMaxSize().padding(pad).padding(16.dp)) {
            SectionHeader(title = "Proveedores (${vm.proveedores.size})", subtitle = "Distribuidoras farmacéuticas")
            Spacer(Modifier.height(12.dp))
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), contentPadding = PaddingValues(bottom = 80.dp)) {
                items(vm.proveedores, key = { it.id }) { p ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SlateSurface),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth().border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp).fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(p.empresa, fontWeight = FontWeight.Bold, color = Color.White)
                                Text("Contacto: ${p.contacto} · Tel: ${p.telefono}", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                                Text(p.direccion, style = MaterialTheme.typography.labelSmall, color = CyanAccent)
                            }
                            IconButton(onClick = { vm.deleteProveedor(p.id) }) {
                                Icon(Icons.Default.Delete, "Eliminar", tint = RoseDanger)
                            }
                        }
                    }
                }
            }
        }
    }

    if (showForm) {
        var empresa by remember { mutableStateOf("") }
        var contacto by remember { mutableStateOf("") }
        var telefono by remember { mutableStateOf("") }
        var correo by remember { mutableStateOf("") }
        var direccion by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showForm = false },
            containerColor = SlateSurface,
            title = { Text("Nuevo Proveedor", color = Color.White) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = empresa, onValueChange = { empresa = it }, label = { Text("Empresa") }, singleLine = true)
                    OutlinedTextField(value = contacto, onValueChange = { contacto = it }, label = { Text("Contacto") }, singleLine = true)
                    OutlinedTextField(value = telefono, onValueChange = { telefono = it }, label = { Text("Teléfono") }, singleLine = true)
                    OutlinedTextField(value = correo, onValueChange = { correo = it }, label = { Text("Correo") }, singleLine = true)
                    OutlinedTextField(value = direccion, onValueChange = { direccion = it }, label = { Text("Dirección") }, singleLine = true)
                }
            },
            confirmButton = {
                Button(onClick = {
                    if (empresa.isNotBlank()) {
                        vm.saveProveedor(Proveedor("", empresa, contacto, telefono, correo, direccion))
                        showForm = false
                    }
                }) { Text("Guardar") }
            },
            dismissButton = { TextButton(onClick = { showForm = false }) { Text("Cancelar") } }
        )
    }
}

@Composable
fun ClientesScreen(vm: FarmaciaViewModel) {
    var showForm by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = SlateBg,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showForm = true },
                containerColor = EmeraldPrimary,
                contentColor = Color.White
            ) { Icon(Icons.Default.PersonAdd, "Nuevo cliente") }
        }
    ) { pad ->
        Column(modifier = Modifier.fillMaxSize().padding(pad).padding(16.dp)) {
            SectionHeader(title = "Clientes (${vm.clientes.size})", subtitle = "Fidelización y puntos acumulados")
            Spacer(Modifier.height(12.dp))
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), contentPadding = PaddingValues(bottom = 80.dp)) {
                items(vm.clientes, key = { it.id }) { cl ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SlateSurface),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth().border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp).fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(cl.nombre, fontWeight = FontWeight.Bold, color = Color.White)
                                Text("NIT: ${cl.nit} · Tel: ${cl.telefono}", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                            }
                            StatusPill("${cl.puntos} pts", EmeraldPrimary)
                        }
                    }
                }
            }
        }
    }

    if (showForm) {
        var nombre by remember { mutableStateOf("") }
        var telefono by remember { mutableStateOf("") }
        var nit by remember { mutableStateOf("CF") }

        AlertDialog(
            onDismissRequest = { showForm = false },
            containerColor = SlateSurface,
            title = { Text("Registrar Cliente", color = Color.White) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = nombre, onValueChange = { nombre = it }, label = { Text("Nombre completo") }, singleLine = true)
                    OutlinedTextField(value = telefono, onValueChange = { telefono = it }, label = { Text("Teléfono") }, singleLine = true)
                    OutlinedTextField(value = nit, onValueChange = { nit = it }, label = { Text("NIT") }, singleLine = true)
                }
            },
            confirmButton = {
                Button(onClick = {
                    if (nombre.isNotBlank()) {
                        vm.saveCliente(Cliente("", nombre, telefono, nit, 0))
                        showForm = false
                    }
                }) { Text("Guardar") }
            },
            dismissButton = { TextButton(onClick = { showForm = false }) { Text("Cancelar") } }
        )
    }
}

@Composable
fun ReportesScreen(vm: FarmaciaViewModel) {
    val totalIngresos = vm.ventas.sumOf { it.total }
    val totalIva = vm.ventas.sumOf { it.iva }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        SectionHeader(title = "Reportes y Ventas", subtitle = "Historial de operaciones registradas en SQLite")
        Spacer(Modifier.height(12.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = SlateSurface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, EmeraldPrimary.copy(alpha = 0.35f), RoundedCornerShape(16.dp))
        ) {
            Row(
                modifier = Modifier.padding(16.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Total Vendido", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    Text(formatQ(totalIngresos), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold, color = EmeraldPrimary)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("IVA Acumulado", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                    Text(formatQ(totalIva), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = CyanAccent)
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(vm.ventas, key = { it.id }) { v ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = SlateSurface),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth().border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(v.codigo, fontWeight = FontWeight.Bold, color = Color.White)
                            Text(formatQ(v.total), fontWeight = FontWeight.ExtraBold, color = EmeraldPrimary)
                        }
                        Text("Vendedor: ${v.vendedorNombre} · ${v.items.size} productos", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                    }
                }
            }
        }
    }
}

@Composable
fun AiAssistantScreen(vm: FarmaciaViewModel) {
    var input by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        SectionHeader(title = "Asistente Clínico IA", subtitle = "Consulta síntomas, dosis, stock crítico o vencimientos")
        Spacer(Modifier.height(10.dp))

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(vm.chatMessages, key = { it.id }) { msg ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (msg.fromBot) Arrangement.Start else Arrangement.End
                ) {
                    Surface(
                        color = if (msg.fromBot) SlateSurface else EmeraldPrimary,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .widthIn(max = 300.dp)
                            .then(if (msg.fromBot) Modifier.border(1.dp, SlateBorder, RoundedCornerShape(16.dp)) else Modifier)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(msg.text, color = Color.White, style = MaterialTheme.typography.bodyMedium)
                            Spacer(Modifier.height(4.dp))
                            Text(msg.time, color = if (msg.fromBot) TextMuted else Color.White.copy(alpha = 0.75f), style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = input,
                onValueChange = { input = it },
                placeholder = { Text("Pregunta o usa el micrófono...") },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.weight(1f)
            )
            NativeVoiceButton(
                onPartial = { input = it },
                onFinal = { spoken ->
                    input = ""
                    vm.sendChatMessage(spoken)
                },
                onError = { vm.showToast(it) }
            )
            FilledIconButton(
                onClick = {
                    val text = input
                    input = ""
                    vm.sendChatMessage(text)
                },
                modifier = Modifier.size(48.dp),
                shape = RoundedCornerShape(14.dp)
            ) {
                Icon(Icons.Default.Send, "Enviar")
            }
        }
    }
}
