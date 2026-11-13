# 📱 Cómo Generar el Archivo `.APK` Nativo Real (Aplicación Android Independiente)

Este proyecto está configurado con **Capacitor** en modo **Standalone Nativo** (`webDir: "dist"` en `capacitor.config.json`), lo que significa que la aplicación se **empaqueta completa dentro del archivo `.apk`** (no es un acceso directo de Chrome ni un enlace web).

---

## ⚡ Método 1: Compilar el `.APK` automáticamente desde tu GitHub (Sin instalar Android Studio)

Ya se incluyó el archivo `.github/workflows/build-apk.yml` en el proyecto. Si ya tienes el código en GitHub, GitHub puede compilar el archivo ejecutable **`FarmaciaDB.apk`** por ti en la nube:

1. Sube los archivos del proyecto a tu repositorio de GitHub (`main` o `master`).
2. Entra a tu repositorio en GitHub y haz clic en la pestaña **Actions** (arriba).
3. Verás el flujo llamado **"Compilar FarmaciaDB Android APK"**.
   - Se ejecuta automáticamente en cada push, o puedes ejecutarlo manualmente tocando **Run workflow**.
4. Espera ~2 minutos a que aparezca el cheque verde ✅.
5. Baja hasta la sección **Artifacts** y haz clic en **`FarmaciaDB-Android-APK`**.
6. Descomprime el ZIP descargado: adentro está tu ejecutable real **`FarmaciaDB.apk`**, listo para enviarlo por WhatsApp, Telegram o USB e instalarlo en cualquier celular Android.

---

## 🛠️ Método 2: Compilar el `.APK` en tu computadora con Android Studio

Si prefieres compilarlo directamente en tu PC:

1. Asegúrate de tener instalado [Node.js](https://nodejs.org/) (v18+) y [Android Studio](https://developer.android.com/studio).
2. Abre la terminal dentro de la carpeta del proyecto y ejecuta:
   ```bash
   npm install
   npm install @capacitor/core @capacitor/android @capacitor/cli
   npm run build
   npx cap add android
   npx cap sync android
   npx cap open android
   ```
3. Espera a que Android Studio termine de sincronizar Gradle (*Gradle sync finished*).
4. En el menú superior ve a:
   **Build > Build Bundle(s) / APK(s) > Build APK(s)**
5. Al terminar, haz clic en **locate** en la notificación inferior derecha.
6. Tu archivo ejecutable real estará en:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
   Puedes renombrarlo a `FarmaciaDB.apk` e instalarlo en cualquier teléfono Android.

---

## 🎙️ Permisos Nativos en el APK
El flujo y el paquete nativo configuran automáticamente en `AndroidManifest.xml` y `MainActivity.java`:
- `RECORD_AUDIO` y puente `WebChromeClient.onPermissionRequest` para que el buscador por voz y micrófono funcionen directo dentro del APK.
- `CAMERA` para el escáner de códigos de barra.
- `INTERNET` y respaldo offline local para que la app no falle sin conexión.
