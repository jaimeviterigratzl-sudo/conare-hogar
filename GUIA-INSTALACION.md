# CONARE HOGAR — Guía de instalación paso a paso

## Lo que necesitas (todo gratuito para empezar)

| Servicio | Para qué | Costo |
|----------|----------|-------|
| Vercel | Hospedar la app online | Gratis |
| Supabase | Base de datos y usuarios | Gratis hasta 500MB |
| Flow | Cobros con tarjeta en Chile | Solo comisión por venta (2.95%) |

---

## PASO 1 — Crear cuenta en Supabase (base de datos)

1. Ve a **supabase.com** y haz clic en "Start your project"
2. Regístrate con tu cuenta de Google o correo
3. Haz clic en "New project"
4. Ponle nombre: `conare-hogar`
5. Elige una contraseña segura para la base de datos (guárdala)
6. Región: selecciona **South America (São Paulo)** — la más cercana a Chile
7. Haz clic en "Create new project" y espera ~2 minutos

### Configurar la base de datos:
1. En el menú izquierdo ve a **SQL Editor**
2. Haz clic en "New query"
3. Abre el archivo `supabase-schema.sql` de esta carpeta
4. Copia TODO su contenido y pégalo en el editor
5. Haz clic en **Run** (botón verde)
6. Deberías ver "Success. No rows returned"

### Obtener tus credenciales:
1. Ve a **Settings** (engranaje) → **API**
2. Copia estos dos valores:
   - **Project URL** → empieza con `https://...supabase.co`
   - **anon public key** → texto largo que empieza con `eyJ...`

---

## PASO 2 — Configurar tu archivo de credenciales

1. Abre el archivo `js/config.js` con cualquier editor de texto (Notepad, TextEdit, etc.)
2. Reemplaza los valores:

```javascript
SUPABASE_URL: 'https://TU_PROYECTO.supabase.co',  ← pega tu Project URL aquí
SUPABASE_KEY: 'TU_SUPABASE_ANON_KEY',              ← pega tu anon key aquí
ADMIN_EMAIL:  'tu-correo@gmail.com',               ← tu email de administrador
APP_URL:      'https://conare-hogar-app.vercel.app',     ← lo cambias después de subir a Vercel
```

3. Guarda el archivo

---

## PASO 3 — Crear cuenta en Vercel (hosting)

1. Ve a **vercel.com** y haz clic en "Sign Up"
2. Elige "Continue with GitHub" (necesitas cuenta GitHub) O "Continue with Email"
3. Si usas email, confirma tu correo

### Subir la app:
1. En el dashboard de Vercel haz clic en **"Add New → Project"**
2. Elige **"Browse"** para subir desde tu computador (no necesitas GitHub)
   - O alternativamente: arrastra la carpeta `conare-hogar` completa
3. Vercel detecta automáticamente que es un proyecto web
4. Haz clic en **"Deploy"**
5. Espera ~1 minuto
6. ¡Listo! Vercel te dará una URL tipo `conare-hogar-xxx.vercel.app`

### Configurar variables de entorno en Vercel:
1. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**
2. Agrega estas variables una por una:

| Nombre | Valor |
|--------|-------|
| `FLOW_API_KEY` | Tu API key de Flow |
| `FLOW_SECRET_KEY` | Tu Secret key de Flow |
| `FLOW_URL_BASE` | `https://www.flow.cl/app/web/pay.php` |
| `APP_URL` | Tu URL de Vercel (ej: `https://conare-hogar-app.vercel.app`) |

3. Haz clic en **"Redeploy"** para que tome efecto

### Actualizar config.js con tu URL final:
1. Abre `js/config.js` y actualiza `APP_URL` con tu URL real de Vercel
2. Vuelve a subir los archivos a Vercel

---

## PASO 4 — Crear cuenta en Flow (pagos)

1. Ve a **flow.cl** y haz clic en "Regístrate"
2. Completa el formulario con tus datos y RUT de empresa (o persona natural)
3. Flow revisará tu cuenta (puede tomar 1-2 días hábiles)
4. Una vez aprobado, ve a **Panel → Integración → API**
5. Copia tu **API Key** y **Secret Key**
6. Agrégalos en las variables de entorno de Vercel (paso 3 arriba)

> 💡 **Mientras esperas la aprobación de Flow:** puedes usar el modo Sandbox de Flow
> cambiando `FLOW_URL_BASE` a `https://sandbox.flow.cl/app/web/pay.php`
> y usando las credenciales de prueba que Flow te entrega.

---

## PASO 5 — Instalar la app en tu celular

### En iPhone (iOS):
1. Abre Safari y ve a tu URL de Vercel
2. Toca el botón de **compartir** (cuadrado con flecha)
3. Selecciona **"Añadir a pantalla de inicio"**
4. Ponle nombre y toca "Añadir"
5. ¡La app aparece en tu pantalla de inicio como una app normal!

### En Android:
1. Abre Chrome y ve a tu URL de Vercel
2. Chrome mostrará automáticamente un banner "Añadir a pantalla de inicio"
3. O toca los 3 puntos → "Instalar app"
4. ¡Listo!

---

## Hacer cambios después de lanzar

Para cambiar cualquier cosa en la app (diseño, precios, funciones):
1. Modifica los archivos en tu computador
2. Vuelve a subir la carpeta a Vercel (drag & drop)
3. Vercel despliega los cambios en ~30 segundos
4. Tus usuarios ven los cambios inmediatamente

---

## ¿Necesitas ayuda?

Pregúntale a Claude en cualquier momento:
- "¿Cómo cambio el precio del plan básico?"
- "¿Cómo agrego un nuevo plan?"
- "¿Cómo veo los pagos recibidos en Flow?"
- "¿Cómo personalizo el nombre de la app?"
