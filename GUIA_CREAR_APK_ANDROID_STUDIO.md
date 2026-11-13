# 📱 FarmaciaDB Android Nativo (Kotlin + Jetpack Compose desde Cero)

Este repositorio ahora incluye en la carpeta **`android-native-app/`** la aplicación **100% nativa de Android escrita desde cero en Kotlin, Jetpack Compose Material 3, SQLite, SpeechRecognizer y CameraX + ML Kit** (sin usar WebView, HTML ni navegador).

---

## ⚡ Opción 1: Generar el `.APK` Nativo en GitHub automáticamente

1. Sube la carpeta **`android-native-app/`** y el archivo **`.github/workflows/build-apk.yml`** a tu repositorio de GitHub.
2. En GitHub entra a la pestaña **Actions**.
3. Selecciona **"Compilar FarmaciaDB Android APK Nativo"** (o pulsa **Run workflow**).
4. Al terminar (~2 min), baja el archivo de **Artifacts** llamado **`FarmaciaDB-Nativo-APK`**.
5. Descomprime el ZIP y obtendrás **`FarmaciaDB-Nativo.apk`** listo para pasar por WhatsApp, Telegram o USB e instalar en tu teléfono Android.

---

## 🛠️ Opción 2: Abrir y Compilar en Android Studio

1. Descarga el proyecto nativo desde el botón **"App Nativa Kotlin / APK"** en la app (o usa la carpeta `android-native-app/` de tu repositorio).
2. Abre **Android Studio**.
3. Haz clic en **File > Open** y selecciona la carpeta **`android-native-app`**.
4. Espera a que termine la sincronización de Gradle.
5. Haz clic en:
   **Build > Build Bundle(s) / APK(s) > Build APK(s)**
6. Tu ejecutable nativo estará en:
   ```
   android-native-app/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## ✅ Módulos incluidos en código Kotlin nativo (`android-native-app/`)
- **`FarmaciaDbHelper.kt`**: Base de datos SQLite nativa en el teléfono (usuarios, medicamentos, ventas transaccionales, compras, proveedores, clientes).
- **`LoginScreen.kt`**: Inicio de sesión y registro con roles (Empleado / Administrador con clave maestra) y medidor de fortaleza de contraseña, sin usuarios predeterminados.
- **`DashboardScreen.kt`**: Panel con ingresos, conteo de medicamentos, alertas de stock crítico y vencimientos.
- **`PosScreen.kt`**: Punto de Venta con **Búsqueda por Voz Nativa (`NativeVoiceRecognizer.kt`)**, **Escáner de Código de Barras Nativo (`CameraX + ML Kit`)**, carrito de compras, descuentos, IVA 12% y ticket.
- **`InventoryScreen.kt`**: CRUD completo de medicamentos con búsqueda por voz nativa.
- **`OperationsScreens.kt`**: Compras (con recepción e incremento de stock), Proveedores, Clientes/Puntos, Reportes y Asistente Clínico IA con voz.
