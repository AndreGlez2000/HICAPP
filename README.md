# HiC Native App

¡Bienvenidos al repositorio de la aplicación nativa de HiC! 🚀

## 🛠️ ¿Cómo probar el proyecto rápido? (Desarrollo)

Construir un APK o un IPA cada vez que quieres ver un cambio es **lentísimo**. La forma correcta y ágil en la que vamos a trabajar es usando **Expo Go**. 

### 1. Instalación de dependencias
Asegúrate de tener [Node.js](https://nodejs.org/) instalado. Luego, en la terminal, dentro de esta carpeta, corre:
```bash
npm install
```

### 2. Descargar Expo Go en tu celular
- **Android:** Descarga la app "Expo Go" desde la Google Play Store.
- **iOS:** Descarga la app "Expo Go" desde la App Store.

### 3. Levantar el servidor de desarrollo
Corre el siguiente comando para iniciar el servidor (Metro Bundler):
```bash
npm start
```
Esto te mostrará un **código QR** enorme en la terminal.

### 4. Ver la app en tu celular
- **Android:** Abre la app de Expo Go, selecciona "Scan QR code" y escanea el código de la terminal.
- **iOS:** Abre la aplicación de **Cámara** normal de tu iPhone, apunta al QR y toca el enlace amarillo que dice "Abrir en Expo Go".

¡Y listo! La app se abrirá. Cualquier cambio que guardes en el código se reflejará instantáneamente en tu celular.

---

## 📦 ¿Cómo generar el APK o instalable de iOS?

Si lo que quieres es tener el archivo `.apk` real para instalarlo permanentemente (sin usar Expo Go), necesitamos compilar el proyecto.

### Opción 1: Compilar en la nube (EAS Build - Recomendado)
Expo ofrece un servicio gratuito para compilar tu app en sus servidores.

1. Instala el CLI de EAS (solo una vez):
   ```bash
   npm install -g eas-cli
   ```
2. Inicia sesión con tu cuenta de Expo:
   ```bash
   eas login
   ```
3. Genera el APK para Android:
   ```bash
   eas build -p android --profile preview
   ```
   *(Esto te dará un link para descargar el APK cuando termine de compilar en sus servidores).*

4. Para iOS:
   ```bash
   eas build -p ios
   ```
   *(Ojo: Para instalar en iOS sin pasar por la App Store necesitas configurar certificados de desarrollador de Apple).*

### Opción 2: Compilación Local (Solo si tienes el entorno configurado)
Si el desarrollador que tiene Mac quiere correr la versión nativa compilada en su máquina, debe tener **Xcode** instalado y correr:
```bash
npm run ios
```

Y para Android (si tienes Android Studio):
```bash
npm run android
```