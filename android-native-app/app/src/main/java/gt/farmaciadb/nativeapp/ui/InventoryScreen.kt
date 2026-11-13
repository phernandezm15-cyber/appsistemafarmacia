package gt.farmaciadb.nativeapp.ui

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
import gt.farmaciadb.nativeapp.data.Medicamento
import gt.farmaciadb.nativeapp.data.PharmacyVoiceResolver
import gt.farmaciadb.nativeapp.viewmodel.FarmaciaViewModel

@Composable
fun InventoryScreen(vm: FarmaciaViewModel) {
    var search by remember { mutableStateOf("") }
    var editingMed by remember { mutableStateOf<Medicamento?>(null) }
    var showForm by remember { mutableStateOf(false) }

    val isAdmin = vm.currentUser?.role == "admin"

    val filtered = remember(search, vm.meds) {
        val q = search.trim().lowercase()
        if (q.isEmpty()) vm.meds
        else vm.meds.filter {
            it.nombre.lowercase().contains(q) ||
                it.principio.lowercase().contains(q) ||
                it.categoria.lowercase().contains(q) ||
                it.codigo.lowercase().contains(q)
        }
    }

    Scaffold(
        containerColor = SlateBg,
        floatingActionButton = {
            if (isAdmin) {
                FloatingActionButton(
                    onClick = {
                        editingMed = null
                        showForm = true
                    },
                    containerColor = EmeraldPrimary,
                    contentColor = Color.White
                ) {
                    Icon(Icons.Default.Add, "Nuevo medicamento")
                }
            }
        }
    ) { pad ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(pad)
                .padding(16.dp)
        ) {
            SectionHeader(
                title = "Inventario (${filtered.size})",
                subtitle = "Catálogo persistente en base de datos SQLite nativa"
            )

            Spacer(Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = search,
                    onValueChange = { search = it },
                    placeholder = { Text("Buscar por nombre o principio...") },
                    leadingIcon = { Icon(Icons.Default.Search, null) },
                    singleLine = true,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.weight(1f)
                )
                NativeVoiceButton(
                    onPartial = { search = PharmacyVoiceResolver.resolve(it, vm.meds).searchTerm },
                    onFinal = { search = PharmacyVoiceResolver.resolve(it, vm.meds).searchTerm },
                    onError = { vm.showToast(it) }
                )
            }

            Spacer(Modifier.height(12.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(filtered, key = { it.id }) { med ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SlateSurface),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth().border(1.dp, SlateBorder, RoundedCornerShape(16.dp))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(med.nombre, fontWeight = FontWeight.Bold, color = Color.White)
                                    Text("${med.principio} · ${med.categoria}", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                                    Text("Código: ${med.codigo} · Vence: ${med.caducidad}", style = MaterialTheme.typography.labelSmall, color = TextMuted)
                                }
                                StatusPill(
                                    text = "${med.stock} uds",
                                    color = if (med.stock < 10) RoseDanger else EmeraldPrimary
                                )
                            }
                            Spacer(Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Compra: ${formatQ(med.precioCompra)}  |  Venta: ${formatQ(med.precioVenta)}",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.SemiBold,
                                    color = CyanAccent
                                )
                                if (isAdmin) {
                                    Row {
                                        IconButton(onClick = { editingMed = med; showForm = true }) {
                                            Icon(Icons.Default.Edit, "Editar", tint = TextMuted)
                                        }
                                        IconButton(onClick = { vm.deleteMedicamento(med.id) }) {
                                            Icon(Icons.Default.Delete, "Eliminar", tint = RoseDanger)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showForm) {
        MedFormDialog(
            initial = editingMed,
            onDismiss = { showForm = false },
            onSave = { med ->
                vm.saveMedicamento(med)
                showForm = false
            }
        )
    }
}

@Composable
private fun MedFormDialog(
    initial: Medicamento?,
    onDismiss: () -> Unit,
    onSave: (Medicamento) -> Unit
) {
    var nombre by remember { mutableStateOf(initial?.nombre ?: "") }
    var principio by remember { mutableStateOf(initial?.principio ?: "") }
    var codigo by remember { mutableStateOf(initial?.codigo ?: "7501${(100000..999999).random()}") }
    var categoria by remember { mutableStateOf(initial?.categoria ?: "Analgésicos") }
    var caducidad by remember { mutableStateOf(initial?.caducidad ?: "2027-12-31") }
    var pCompra by remember { mutableStateOf(initial?.precioCompra?.toString() ?: "") }
    var pVenta by remember { mutableStateOf(initial?.precioVenta?.toString() ?: "") }
    var stock by remember { mutableStateOf(initial?.stock?.toString() ?: "50") }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = SlateSurface,
        title = { Text(if (initial == null) "Nuevo Medicamento" else "Editar Medicamento", color = Color.White) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = nombre, onValueChange = { nombre = it }, label = { Text("Nombre comercial") }, singleLine = true)
                OutlinedTextField(value = principio, onValueChange = { principio = it }, label = { Text("Principio activo") }, singleLine = true)
                OutlinedTextField(value = codigo, onValueChange = { codigo = it }, label = { Text("Código barras") }, singleLine = true)
                OutlinedTextField(value = categoria, onValueChange = { categoria = it }, label = { Text("Categoría") }, singleLine = true)
                OutlinedTextField(value = caducidad, onValueChange = { caducidad = it }, label = { Text("Caducidad (YYYY-MM-DD)") }, singleLine = true)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = pCompra, onValueChange = { pCompra = it }, label = { Text("P. Compra") }, singleLine = true, modifier = Modifier.weight(1f))
                    OutlinedTextField(value = pVenta, onValueChange = { pVenta = it }, label = { Text("P. Venta") }, singleLine = true, modifier = Modifier.weight(1f))
                }
                OutlinedTextField(value = stock, onValueChange = { stock = it }, label = { Text("Stock inicial") }, singleLine = true)
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (nombre.isNotBlank()) {
                        onSave(
                            Medicamento(
                                id = initial?.id ?: "",
                                codigo = codigo,
                                nombre = nombre.trim(),
                                principio = principio.trim().ifBlank { "Genérico" },
                                categoria = categoria.trim(),
                                caducidad = caducidad.trim(),
                                precioCompra = pCompra.toDoubleOrNull() ?: 10.0,
                                precioVenta = pVenta.toDoubleOrNull() ?: 15.0,
                                stock = stock.toIntOrNull() ?: 0
                            )
                        )
                    }
                }
            ) { Text("Guardar") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        }
    )
}
