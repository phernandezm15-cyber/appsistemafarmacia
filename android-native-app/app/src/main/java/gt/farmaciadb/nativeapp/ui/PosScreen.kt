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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import gt.farmaciadb.nativeapp.data.PharmacyVoiceResolver
import gt.farmaciadb.nativeapp.data.Venta
import gt.farmaciadb.nativeapp.hardware.BarcodeScannerDialog
import gt.farmaciadb.nativeapp.viewmodel.FarmaciaViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PosScreen(vm: FarmaciaViewModel) {
    var query by remember { mutableStateOf("") }
    var voiceBadge by remember { mutableStateOf<String?>(null) }
    var showScanner by remember { mutableStateOf(false) }
    var showCartSheet by remember { mutableStateOf(false) }
    var lastTicket by remember { mutableStateOf<Venta?>(null) }

    val filtered = remember(query, vm.meds) {
        val q = query.trim().lowercase()
        if (q.isEmpty()) vm.meds
        else vm.meds.filter {
            it.nombre.lowercase().contains(q) ||
                it.principio.lowercase().contains(q) ||
                it.codigo.lowercase().contains(q) ||
                it.categoria.lowercase().contains(q)
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            SectionHeader(
                title = "Punto de Venta (POS)",
                subtitle = "Busca por voz, código de barras o toca para agregar al ticket"
            )

            Spacer(Modifier.height(12.dp))

            // Search + Native Voice + Native Barcode Scanner
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it; voiceBadge = null },
                    placeholder = { Text("Buscar medicina...") },
                    leadingIcon = { Icon(Icons.Default.Search, null) },
                    trailingIcon = {
                        if (query.isNotEmpty()) {
                            IconButton(onClick = { query = ""; voiceBadge = null }) {
                                Icon(Icons.Default.Clear, null)
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.weight(1f)
                )

                NativeVoiceButton(
                    onPartial = { partial ->
                        val resolved = PharmacyVoiceResolver.resolve(partial, vm.meds)
                        query = resolved.searchTerm
                    },
                    onFinal = { spoken ->
                        val resolved = PharmacyVoiceResolver.resolve(spoken, vm.meds)
                        query = resolved.searchTerm
                        voiceBadge = if (resolved.reason != null) {
                            "Voz: \"$spoken\" → ${resolved.searchTerm} (${resolved.reason})"
                        } else {
                            "Buscando: ${resolved.searchTerm}"
                        }
                    },
                    onError = { vm.showToast(it) }
                )

                FilledIconButton(
                    onClick = { showScanner = true },
                    modifier = Modifier.size(48.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = IconButtonDefaults.filledIconButtonColors(containerColor = CyanAccent)
                ) {
                    Icon(Icons.Default.QrCodeScanner, "Escanear código", tint = Color.White)
                }
            }

            if (voiceBadge != null) {
                Spacer(Modifier.height(6.dp))
                StatusPill(voiceBadge!!, EmeraldPrimary)
            }

            Spacer(Modifier.height(12.dp))

            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                contentPadding = PaddingValues(bottom = 86.dp)
            ) {
                items(filtered, key = { it.id }) { med ->
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
                            Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                Text(
                                    text = med.nombre,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = "${med.principio} · ${med.codigo}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = TextMuted,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Spacer(Modifier.height(6.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = formatQ(med.precioVenta),
                                        fontWeight = FontWeight.ExtraBold,
                                        color = EmeraldPrimary
                                    )
                                    StatusPill(
                                        text = "Stock: ${med.stock}",
                                        color = if (med.stock < 10) RoseDanger else EmeraldPrimary
                                    )
                                }
                            }
                            FilledIconButton(
                                onClick = { vm.addToCart(med) },
                                enabled = med.stock > 0,
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Icon(Icons.Default.Add, "Agregar")
                            }
                        }
                    }
                }
            }
        }

        // Floating Cart Checkout Bar
        if (vm.cart.isNotEmpty()) {
            Surface(
                onClick = { showCartSheet = true },
                color = EmeraldPrimary,
                shape = RoundedCornerShape(18.dp),
                shadowElevation = 8.dp,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 18.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Icon(Icons.Default.ShoppingCart, null, tint = Color.White)
                        Text(
                            text = "Ver Ticket (${vm.cart.sumOf { it.cantidad }} items)",
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = formatQ(vm.cartTotal()),
                        color = Color.White,
                        fontWeight = FontWeight.ExtraBold,
                        style = MaterialTheme.typography.titleMedium
                    )
                }
            }
        }
    }

    if (showScanner) {
        BarcodeScannerDialog(
            onBarcodeDetected = { code ->
                showScanner = false
                val match = vm.meds.firstOrNull { it.codigo == code || it.id == code }
                if (match != null) {
                    vm.addToCart(match)
                    vm.showToast("Escaneado y agregado: ${match.nombre}")
                } else {
                    query = code
                    vm.showToast("Código leído: $code")
                }
            },
            onDismiss = { showScanner = false }
        )
    }

    if (showCartSheet) {
        ModalBottomSheet(
            onDismissRequest = { showCartSheet = false },
            containerColor = SlateSurface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .padding(bottom = 28.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("Ticket de Venta", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)

                vm.cart.forEach { item ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(item.medicamento.nombre, fontWeight = FontWeight.SemiBold, color = Color.White)
                            Text(formatQ(item.medicamento.precioVenta) + " c/u", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { vm.updateCartQty(item.medicamento.id, -1) }) {
                                Icon(Icons.Default.RemoveCircleOutline, null, tint = TextMuted)
                            }
                            Text("${item.cantidad}", fontWeight = FontWeight.Bold, color = Color.White)
                            IconButton(onClick = { vm.updateCartQty(item.medicamento.id, 1) }) {
                                Icon(Icons.Default.AddCircleOutline, null, tint = EmeraldPrimary)
                            }
                        }
                    }
                }

                HorizontalDivider(color = SlateBorder)

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf(0.0, 5.0, 10.0, 15.0).forEach { pct ->
                        FilterChip(
                            selected = vm.posDiscountPct == pct,
                            onClick = { vm.posDiscountPct = pct },
                            label = { Text("${pct.toInt()}% desc") }
                        )
                    }
                }

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Subtotal:", color = TextMuted)
                    Text(formatQ(vm.cartSubtotal()), color = Color.White)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("IVA (12%):", color = TextMuted)
                    Text(formatQ(vm.cartIva()), color = Color.White)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("TOTAL A COBRAR:", fontWeight = FontWeight.Bold, color = Color.White)
                    Text(formatQ(vm.cartTotal()), fontWeight = FontWeight.ExtraBold, color = EmeraldPrimary, style = MaterialTheme.typography.titleLarge)
                }

                Button(
                    onClick = {
                        lastTicket = vm.completeSale()
                        showCartSheet = false
                    },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Icon(Icons.Default.CheckCircle, null)
                    Spacer(Modifier.width(8.dp))
                    Text("Cobrar y Generar Ticket", fontWeight = FontWeight.Bold)
                }
            }
        }
    }

    if (lastTicket != null) {
        val t = lastTicket!!
        AlertDialog(
            onDismissRequest = { lastTicket = null },
            containerColor = SlateSurface,
            title = { Text("¡Venta Exitosa ${t.codigo}!", color = EmeraldPrimary, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("Vendedor: ${t.vendedorNombre}", color = TextMuted)
                    t.items.forEach {
                        Text("• ${it.cantidad}x ${it.nombre} (${formatQ(it.precio * it.cantidad)})", color = Color.White)
                    }
                    HorizontalDivider(modifier = Modifier.padding(vertical = 6.dp), color = SlateBorder)
                    Text("Total Cobrado: ${formatQ(t.total)}", fontWeight = FontWeight.ExtraBold, color = Color.White)
                }
            },
            confirmButton = {
                Button(onClick = { lastTicket = null }) { Text("Cerrar") }
            }
        )
    }
}
