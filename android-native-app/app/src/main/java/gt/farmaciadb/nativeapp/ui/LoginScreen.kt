package gt.farmaciadb.nativeapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import gt.farmaciadb.nativeapp.viewmodel.FarmaciaViewModel

@Composable
fun LoginScreen(vm: FarmaciaViewModel) {
    var selectedTab by remember { mutableIntStateOf(0) }

    // Login state (clean, no preset credentials)
    var loginEmail by remember { mutableStateOf("") }
    var loginPass by remember { mutableStateOf("") }
    var loginShowPass by remember { mutableStateOf(false) }
    var loginError by remember { mutableStateOf<String?>(null) }

    // Register state
    var regNombre by remember { mutableStateOf("") }
    var regEmail by remember { mutableStateOf("") }
    var regPass by remember { mutableStateOf("") }
    var regShowPass by remember { mutableStateOf(false) }
    var regRole by remember { mutableStateOf("empleado") }
    var regAdminKey by remember { mutableStateOf("") }
    var regError by remember { mutableStateOf<String?>(null) }

    val strength = vm.evaluatePasswordStrength(regPass)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(SlateBg, Color(0xFF0F1F2E), SlateBg)
                )
            )
            .systemBarsPadding()
            .imePadding(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // App Logo Header
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(Brush.linearGradient(listOf(EmeraldPrimary, CyanAccent))),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.LocalPharmacy,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(36.dp)
                )
            }

            Spacer(Modifier.height(12.dp))
            Text(
                text = "FarmaciaDB",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White
            )
            Text(
                text = "Sistema de Gestión Farmacéutica",
                style = MaterialTheme.typography.bodySmall,
                color = TextMuted
            )

            Spacer(Modifier.height(24.dp))

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, EmeraldPrimary.copy(alpha = 0.25f), RoundedCornerShape(24.dp)),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = SlateSurface)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    TabRow(
                        selectedTabIndex = selectedTab,
                        containerColor = SlateCard,
                        modifier = Modifier.clip(RoundedCornerShape(14.dp))
                    ) {
                        Tab(
                            selected = selectedTab == 0,
                            onClick = { selectedTab = 0 },
                            text = { Text("Iniciar Sesión", fontWeight = FontWeight.SemiBold) }
                        )
                        Tab(
                            selected = selectedTab == 1,
                            onClick = { selectedTab = 1 },
                            text = { Text("Crear Cuenta", fontWeight = FontWeight.SemiBold) }
                        )
                    }

                    Spacer(Modifier.height(20.dp))

                    if (selectedTab == 0) {
                        OutlinedTextField(
                            value = loginEmail,
                            onValueChange = { loginEmail = it; loginError = null },
                            label = { Text("Correo electrónico") },
                            placeholder = { Text("tu@correo.com") },
                            leadingIcon = { Icon(Icons.Default.Email, null) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp)
                        )

                        Spacer(Modifier.height(12.dp))

                        OutlinedTextField(
                            value = loginPass,
                            onValueChange = { loginPass = it; loginError = null },
                            label = { Text("Contraseña") },
                            leadingIcon = { Icon(Icons.Default.Lock, null) },
                            trailingIcon = {
                                IconButton(onClick = { loginShowPass = !loginShowPass }) {
                                    Icon(
                                        if (loginShowPass) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        null
                                    )
                                }
                            },
                            visualTransformation = if (loginShowPass) VisualTransformation.None else PasswordVisualTransformation(),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp)
                        )

                        if (loginError != null) {
                            Spacer(Modifier.height(8.dp))
                            Text(loginError!!, color = RoseDanger, style = MaterialTheme.typography.bodySmall)
                        }

                        Spacer(Modifier.height(18.dp))

                        Button(
                            onClick = {
                                loginError = vm.login(loginEmail, loginPass)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Text("Ingresar al Sistema", fontWeight = FontWeight.Bold)
                        }
                    } else {
                        OutlinedTextField(
                            value = regNombre,
                            onValueChange = { regNombre = it; regError = null },
                            label = { Text("Nombre completo") },
                            leadingIcon = { Icon(Icons.Default.Person, null) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp)
                        )

                        Spacer(Modifier.height(10.dp))

                        OutlinedTextField(
                            value = regEmail,
                            onValueChange = { regEmail = it; regError = null },
                            label = { Text("Correo electrónico") },
                            placeholder = { Text("tu@correo.com") },
                            leadingIcon = { Icon(Icons.Default.Email, null) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp)
                        )

                        Spacer(Modifier.height(12.dp))

                        Text("Rol de Cuenta", style = MaterialTheme.typography.labelMedium, color = TextMuted)
                        Spacer(Modifier.height(6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilterChip(
                                selected = regRole == "empleado",
                                onClick = { regRole = "empleado"; regAdminKey = "" },
                                label = { Text("Empleado") },
                                modifier = Modifier.weight(1f)
                            )
                            FilterChip(
                                selected = regRole == "admin",
                                onClick = { regRole = "admin" },
                                label = { Text("Administrador") },
                                modifier = Modifier.weight(1f)
                            )
                        }

                        if (regRole == "admin") {
                            Spacer(Modifier.height(10.dp))
                            OutlinedTextField(
                                value = regAdminKey,
                                onValueChange = { regAdminKey = it; regError = null },
                                label = { Text("Clave Maestra de Administrador") },
                                leadingIcon = { Icon(Icons.Default.Key, null) },
                                visualTransformation = PasswordVisualTransformation(),
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp)
                            )
                        }

                        Spacer(Modifier.height(10.dp))

                        OutlinedTextField(
                            value = regPass,
                            onValueChange = { regPass = it; regError = null },
                            label = { Text("Contraseña") },
                            leadingIcon = { Icon(Icons.Default.Lock, null) },
                            trailingIcon = {
                                IconButton(onClick = { regShowPass = !regShowPass }) {
                                    Icon(
                                        if (regShowPass) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        null
                                    )
                                }
                            },
                            visualTransformation = if (regShowPass) VisualTransformation.None else PasswordVisualTransformation(),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp)
                        )

                        if (regPass.isNotEmpty()) {
                            Spacer(Modifier.height(8.dp))
                            val barColor = when (strength.score) {
                                1 -> RoseDanger
                                2 -> AmberWarn
                                else -> EmeraldPrimary
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                repeat(3) { idx ->
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(5.dp)
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(if (strength.score > idx) barColor else SlateCard)
                                    )
                                }
                            }
                            Spacer(Modifier.height(4.dp))
                            Text(
                                text = strength.label,
                                style = MaterialTheme.typography.labelSmall,
                                color = barColor
                            )
                        }

                        if (regError != null) {
                            Spacer(Modifier.height(8.dp))
                            Text(regError!!, color = RoseDanger, style = MaterialTheme.typography.bodySmall)
                        }

                        Spacer(Modifier.height(16.dp))

                        Button(
                            onClick = {
                                regError = vm.register(regNombre, regEmail, regPass, regRole, regAdminKey)
                            },
                            enabled = strength.isAllowed,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Text(
                                if (regRole == "admin") "Crear Administrador" else "Crear Empleado",
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
