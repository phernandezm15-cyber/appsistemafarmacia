package gt.farmaciadb.nativeapp

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import gt.farmaciadb.nativeapp.ui.*
import gt.farmaciadb.nativeapp.viewmodel.FarmaciaViewModel

class MainActivity : ComponentActivity() {
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        requestNeededPermissions()

        setContent {
            FarmaciaNativeTheme {
                FarmaciaRootApp()
            }
        }
    }

    private fun requestNeededPermissions() {
        val perms = arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA
        ).filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (perms.isNotEmpty()) {
            permissionLauncher.launch(perms.toTypedArray())
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FarmaciaRootApp(vm: FarmaciaViewModel = viewModel()) {
    val context = LocalContext.current

    LaunchedEffect(vm.toastMessage) {
        vm.toastMessage?.let { msg ->
            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
            vm.clearToast()
        }
    }

    if (vm.currentUser == null) {
        LoginScreen(vm)
        return
    }

    var currentRoute by remember { mutableStateOf("dashboard") }
    var showMoreMenu by remember { mutableStateOf(false) }

    val isAdmin = vm.currentUser?.role == "admin"

    Scaffold(
        containerColor = SlateBg,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SlateSurface),
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.LocalPharmacy, null, tint = EmeraldPrimary)
                        Text("FarmaciaDB", fontWeight = FontWeight.ExtraBold, color = Color.White)
                    }
                },
                actions = {
                    Box {
                        IconButton(onClick = { showMoreMenu = true }) {
                            Icon(Icons.Default.MoreVert, "Más opciones", tint = Color.White)
                        }
                        DropdownMenu(
                            expanded = showMoreMenu,
                            onDismissRequest = { showMoreMenu = false }
                        ) {
                            if (isAdmin) {
                                DropdownMenuItem(
                                    text = { Text("Compras") },
                                    leadingIcon = { Icon(Icons.Default.LocalShipping, null) },
                                    onClick = { currentRoute = "compras"; showMoreMenu = false }
                                )
                                DropdownMenuItem(
                                    text = { Text("Proveedores") },
                                    leadingIcon = { Icon(Icons.Default.Business, null) },
                                    onClick = { currentRoute = "proveedores"; showMoreMenu = false }
                                )
                                DropdownMenuItem(
                                    text = { Text("Reportes") },
                                    leadingIcon = { Icon(Icons.Default.Assessment, null) },
                                    onClick = { currentRoute = "reportes"; showMoreMenu = false }
                                )
                            }
                            DropdownMenuItem(
                                text = { Text("Clientes") },
                                leadingIcon = { Icon(Icons.Default.People, null) },
                                onClick = { currentRoute = "clientes"; showMoreMenu = false }
                            )
                            HorizontalDivider()
                            DropdownMenuItem(
                                text = { Text("Cerrar Sesión", color = RoseDanger) },
                                leadingIcon = { Icon(Icons.AutoMirrored.Filled.Logout, null, tint = RoseDanger) },
                                onClick = { showMoreMenu = false; vm.logout() }
                            )
                        }
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar(containerColor = SlateSurface) {
                NavigationBarItem(
                    selected = currentRoute == "dashboard",
                    onClick = { currentRoute = "dashboard" },
                    icon = { Icon(Icons.Default.Dashboard, null) },
                    label = { Text("Inicio") }
                )
                NavigationBarItem(
                    selected = currentRoute == "pos",
                    onClick = { currentRoute = "pos" },
                    icon = { Icon(Icons.Default.PointOfSale, null) },
                    label = { Text("POS") }
                )
                NavigationBarItem(
                    selected = currentRoute == "inventario",
                    onClick = { currentRoute = "inventario" },
                    icon = { Icon(Icons.Default.Medication, null) },
                    label = { Text("Stock") }
                )
                NavigationBarItem(
                    selected = currentRoute == "ai",
                    onClick = { currentRoute = "ai" },
                    icon = { Icon(Icons.Default.SmartToy, null) },
                    label = { Text("Asistente") }
                )
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            when (currentRoute) {
                "dashboard" -> DashboardScreen(vm) { currentRoute = it }
                "pos" -> PosScreen(vm)
                "inventario" -> InventoryScreen(vm)
                "compras" -> ComprasScreen(vm)
                "proveedores" -> ProveedoresScreen(vm)
                "clientes" -> ClientesScreen(vm)
                "reportes" -> ReportesScreen(vm)
                "ai" -> AiAssistantScreen(vm)
            }
        }
    }
}
