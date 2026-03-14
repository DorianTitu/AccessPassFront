# 📸 Screenshot Capturer

Una aplicación web simple y elegante construida con **React + Vite + TypeScript** que permite capturar la pantalla con un solo clic.

## ✨ Características

- ✅ **Interfaz minimalista** - Un solo botón para capturar
- ✅ **Captura de pantalla automática** - Presiona el botón y se guarda la imagen
- ✅ **Diseño moderno** - Gradient animado con efectos glassmorphism
- ✅ **Responsive** - Funciona perfectamente en desktop y mobile
- ✅ **Rápido** - Construido con Vite para máximo rendimiento
- ✅ **TypeScript** - Tipo seguro y código limpio

## 🚀 Inicio Rápido

### 1. **Clonar / Descargar el proyecto**
```bash
cd /Users/doriantituana/Desktop/Proyectos/Producto/AccessPassFront
```

### 2. **Instalar dependencias** (ya está hecho)
```bash
npm install
```

### 3. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

El proyecto estará disponible en: **http://localhost:5173/**

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Preview de la build de producción

## 🛠 Tecnologías Utilizadas

- **React 19** - Librería UI
- **Vite 8** - Build tool ultra-rápido
- **TypeScript 5.9** - Tipado estático
- **html2canvas** - Librería para capturar screenshots
- **CSS3** - Estilos con gradientes y animaciones

## 📁 Estructura del Proyecto

```
AccessPassFront/
├── src/
│   ├── App.tsx          # Componente principal
│   ├── App.css          # Estilos
│   ├── main.tsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── index.html           # HTML base
├── vite.config.ts       # Configuración de Vite
├── tsconfig.json        # Configuración de TypeScript
├── package.json         # Dependencias
└── .gitignore           # Archivos ignorados

```

## 🎨 Cómo Funciona

1. **Presiona el botón** "📸 Capturar Pantalla"
2. **Se inicia la captura** (ves el mensaje "Iniciando captura de pantalla...")
3. **Se descarga automáticamente** una imagen PNG de tu pantalla
4. **Recibes una confirmación** de éxito

## 📸 Función de Captura

La aplicación utiliza **html2canvas**, una librería que:
- Convierte el contenido HTML/CSS a una imagen canvas
- Soporta casi todas las propiedades de CSS
- Permite descargar directamente el archivo PNG

## ⚙️ Configuración de Producción

Para construir para producción:

```bash
npm run build
```

Esto generará una carpeta `dist/` lista para desplegar en cualquier servidor web.

## 🐛 Troubleshooting

**¿La captura no funciona?**
- Verifica que el navegador tenga los permisos necesarios
- Intenta en una pestaña anónima/incógnita
- Asegúrate de que no haya bloqueadores de scripts

**¿Puerto 5173 en uso?**
```bash
npm run dev -- --port 3000
```

## 📝 Licencia

ISC

---

**¡Disfruta capturando pantallas! 🎉**
