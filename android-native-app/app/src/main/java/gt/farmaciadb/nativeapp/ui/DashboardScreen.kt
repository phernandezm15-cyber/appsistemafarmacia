package gt.farmaciadb.nativeapp.ui

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import gt.farmaciadb.nativeapp.viewmodel.FarmaciaViewModel
import java.text.SimpleDateFormat
import java.util.Locale

@Composable
fun DashboardScreen(vm: FarmaciaViewModel, onNavigate: (String) -> Unit) {
    val totalVentas = vm.ventas.sumOf { it.total }
    val lowStock = vm.meds.filter { it.stock < 10 }
    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    val nowMs = System.currentTimeMillis()
    val expiring = vm.meds.filter {
        runCatching {
            val d = sdf.parse(it.caducidad)?.time ?: Long.MAX_VALUE
            (d - nowMs) / 86400000L <= 30
        }.getOrDefault(false)
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            SectionHeader(
                title = "Panel General",
                subtitle = "Bienvenido, ${vm.currentUser?.nombre ?: "Usuario"} (${if (vm.currentUser?.role == "admin") "Administrador" else "Empleado"})"
            )
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                KpiCard(
                    title = "Ingresos",
                    value = formatQ(totalVentas),
                    icon = Icons.Default.Payments,
                    color = EmeraldPrimary,
                    modifier = Modifier.weight(1f)
                )
                KpiCard(
                    title = "Productos",
                    value = "${vm.meds.size}",
                    icon = Icons.Default.Medication,
                    color = CyanAccent,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                KpiCard(
                    title = "Stock Bajo",
                    value = "${lowStock.size}",
                    icon = Icons.Default.WarningAmber,
                    color = RoseDanger,
                    modifier = Modifier.weight(1f)
                )
                KpiCard(
                    title = "Por Vencer",
                    value = "${expiring.size}",
                    icon = Icons.Default.EventBusy,
                    color = AmberWarn,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = { onNavigate("pos") },
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Icon(Icons.Default.PointOfSale, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Abrir Caja POS", fontWeight = FontWeight.Bold)
                }
                OutlinedButton(
                    onClick = { onNavigate("ai") },
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Icon(Icons.Default.SmartToy, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Asistente IA", fontWeight = FontWeight.Bold)
                }
            }
        }

        if (lowStock.isNotEmpty()) {
            item {
                Text(
                    text = "Alertas de Stock Crítico (<10 uds)",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
            items(lowStock) { med ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = SlateSurface),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth().border(1.dp, RoseDanger.copy(alpha = 0.35f), RoundedCornerShape(16.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(med.nombre, fontWeight = FontWeight.Bold, color = Color.White)
                            Text(med.principio, style = MaterialTheme.typography.bodySmall, color = TextMuted)
                        }
                        StatusPill("Stock: ${med.stock}", RoseDanger)
                    }
                }
            }
        }

        if (expiring.isNotEmpty()) {
            item {
                Text(
                    text = "Próximos a Vencer (30 días)",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
            items(expiring) { med ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = SlateSurface),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth().border(1.dp, AmberWarn.copy(alpha = 0.35f), RoundedCornerShape(16.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(med.nombre, fontWeight = FontWeight.Bold, color = Color.White)
                            Text("Vence: ${med.caducidad}", style = MaterialTheme.typography.bodySmall, color = AmberWarn)
                        }
                        StatusPill("${med.stock} uds", AmberWarn)
                    }
                }
            }
        }
    }
}

@Composable
private fun KpiCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.border(1.dp, SlateBorder, RoundedCornerShape(18.dp)),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = SlateSurface)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(title, style = MaterialTheme.typography.labelMedium, color = TextMuted)
                Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
            }
            Spacer(Modifier.height(8.dp))
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold, color = Color.White)
        }
    }
}
