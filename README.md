# Naviomar/TM — Frontend (México)

> **Propósito:** README técnico-operativo para traspaso entre equipos. Cubre arquitectura, requisitos, bootstrap local, comandos, despliegue (SSR/SSG/Docker), seguridad, y troubleshooting. Enfocado al frontend de **México** del ecosistema Naviomar/TM, construido con **Nuxt 3**.

---

## Índice
- [Naviomar/TM — Frontend (México)](#naviomartm--frontend-méxico)
  - [Índice](#índice)
  - [Resumen y alcance](#resumen-y-alcance)
  - [Arquitectura y módulos](#arquitectura-y-módulos)
  - [Requisitos del entorno](#requisitos-del-entorno)
  - [Bootstrap local](#bootstrap-local)
  - [Comandos útiles](#comandos-útiles)
  - [Despliegue (SSR / Static / Docker)](#despliegue-ssr--static--docker)
    - [Opción A — SSR (Node en servidor)](#opción-a--ssr-node-en-servidor)
    - [Opción B — Static (SSG)](#opción-b--static-ssg)
    - [Opción C — Docker (multi-stage)](#opción-c--docker-multi-stage)
  - [Buenas prácticas de seguridad](#buenas-prácticas-de-seguridad)
  - [Resolución de problemas](#resolución-de-problemas)
    - [1) Incompatibilidades con **rolldown-vite**](#1-incompatibilidades-con-rolldown-vite)
    - [2) `better-sqlite3` (módulo nativo)](#2-better-sqlite3-módulo-nativo)
    - [3) **SSR**: hydration mismatch / estilos](#3-ssr-hydration-mismatch--estilos)
    - [4) **Tailwind v4** no aplica utilidades](#4-tailwind-v4-no-aplica-utilidades)
    - [5) **pnpm** y rutas largas (Windows)](#5-pnpm-y-rutas-largas-windows)
    - [6) Versiones de Node desalineadas](#6-versiones-de-node-desalineadas)
  - [Licencia](#licencia)

> **Nota:** Este README **omite deliberadamente** secciones solicitadas por el equipo (estructura de carpetas, configuración detallada de `nuxt.config.ts`, autenticación, tiempo real, estilos, formularios, búsqueda, PWA y runtime config).

---

## Resumen y alcance
Frontend **Nuxt 3** (SSR listo para producción) para el país **México**, consumiendo la API de **Laravel 12**. Se utilizan librerías de interfaz y DX modernas, build estable con **rolldown-vite**, y empaquetado con **pnpm**. El proyecto está preparado para **SSR** (Node), **SSG** (estático) y **contenedorización**.

**Stack clave:**
- **Nuxt** `^3.19.2`  
- **Gestor de paquetes**: `pnpm@10.15.1` (Volta pin)  
- **Node**: `20.18.1` (Volta pin)  
- **UI**: Vuetify 3, Tailwind CSS v4, MDI icons  
- **Estado / DX**: Pinia, lodash, snackbar  
- **Contenido**: @nuxt/content  
- **Validación**: VeeValidate + Yup  
- **Otras**: Moment/moment-timezone, Rive, WangEditor  
- **Búsqueda (cliente)**: nuxt-meilisearch (si backend la habilita)

---

## Arquitectura y módulos
**Herramientas / módulos destacados** (sin detallar configuración omitida):
- **@pinia/nuxt** para estado global.
- **Vuetify 3** + **Tailwind v4** para UI híbrida (utilitario + componentes).
- **@nuxt/content** para documentación interna (Markdown en `/content`).
- **@vite-pwa/nuxt** habilitado a nivel de proyecto (no se documenta aquí su setup).
- **nuxt-lodash**, **nuxt-snackbar**, **@vee-validate/nuxt**, **@vee-validate/yup**.
- **nuxt-meilisearch** para integrar búsquedas del backend (Scout/Meili).
- **Volta** para fijar versión de Node y **pnpm overrides** para `rolldown-vite@7.1.5` (build reproducible).
- **better-sqlite3** presente en dependencias — requiere toolchain nativa si se usa (ver troubleshooting).

---

## Requisitos del entorno

**Sistema / Tooling**
- **Node**: `20.18.1` (se recomienda **Volta** para fijar versión).
- **pnpm**: `10.15.1` (Corepack habilitado).
- **Git** y acceso al repositorio.
- **WSL2** (Windows) recomendado si se compilan dependencias nativas.

**Backend**
- API **Laravel 12** accesible (HTTPS), CORS y cookies de sesión configuradas a nivel de dominio (si aplica).

**Red / Navegación**
- En SSR se recomienda un **reverse proxy** (Nginx) delante del proceso Node.

---

## Bootstrap local

```bash
# 1) Clonar
git clone git@github.com:adtv/naviomar-tm-frontend-mex.git
cd naviomar-tm-frontend-mex

# 2) Tooling (Volta + Corepack)
corepack enable
volta setup || true
volta pin node@20.18.1
volta pin pnpm@10.15.1

# 3) Dependencias
pnpm i

# 4) Desarrollo
pnpm dev
# abre http://localhost:3000
```

> **Windows:** preferible **WSL2** (Ubuntu). Si se usa Windows nativo, instalar toolchain para módulos nativos al compilar (`python`, `make`, `g++`).

---

## Comandos útiles

```bash
pnpm dev         # servidor de desarrollo
pnpm build       # build de producción (SSR por defecto)
pnpm preview     # previsualizar build local
pnpm generate    # generar salida estática (SSG)
pnpm postinstall # 'nuxt prepare' (auto en hooks)
```

**Notas:**
- El proyecto fija **Vite** a `rolldown-vite@7.1.5` vía `pnpm.overrides`.  
- Si un plugin Vite falla con rolldown, evaluar temporalmente quitar el override (ver troubleshooting).

---

## Despliegue (SSR / Static / Docker)

### Opción A — SSR (Node en servidor)
**Build & Run**
```bash
pnpm i --frozen-lockfile
pnpm build
node .output/server/index.mjs
```
**Variables de entorno mínimas**
- `PORT`, `HOST` (si el orquestador no los inyecta).
- Variables públicas/privadas según plataforma (definidas fuera de este README por omisión solicitada).

**Nginx (reverse proxy, ejemplo)**
```nginx
server {
  listen 443 ssl http2;
  server_name mx.example.com;

  # ssl_certificate /etc/ssl/certs/fullchain.pem;
  # ssl_certificate_key /etc/ssl/private/privkey.pem;

  location / {
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header Connection "";
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:3000;
  }
}
```

**Subruta (p.ej. `/mex/`)**
```nginx
location /mex/ {
  proxy_set_header Host $host;
  proxy_pass http://127.0.0.1:3000/;
  sub_filter_types text/html;
  # si se hace path-prefix, revisar base routing en la app
}
```

**systemd (SSR como servicio)**
```ini
[Unit]
Description=Naviomar TM MX (Nuxt SSR)
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/naviomar-mx
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=always
Environment=NODE_ENV=production
# Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

---

### Opción B — Static (SSG)
```bash
pnpm generate
# desplegar .output/public a CDN/hosting estático
```
> Verifica que las rutas dinámicas necesarias estén pre-renderizadas o haya fallback en el CDN.

---

### Opción C — Docker (multi-stage)

```dockerfile
# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable  && pnpm i --frozen-lockfile  && pnpm build

# Run (SSR)
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

> Para **SSG**, copia `.output/public` a una imagen Nginx o a un bucket/CloudFront.

---

## Buenas prácticas de seguridad
- **HTTPS** extremo a extremo (proxy ⇄ app).
- Endurecer **CSP** (Content-Security-Policy) acorde a los orígenes usados (CDNs, websockets, imágenes).
- Revisar **headers de seguridad**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Cross-Origin-*`.
- Limitar **exposición** de variables públicas (solo lo indispensable).
- Mantener dependencias al día (renovación periódica de lockfile y auditoría).
- Evitar fuga de información en errores/hydration logs en producción.

---

## Resolución de problemas

### 1) Incompatibilidades con **rolldown-vite**
- Plugins de Vite que dependan de internals de `vite` pueden fallar.  
- **Acción**: eliminar temporalmente el override:
  ```json
  // package.json
  "pnpm": { "overrides": { /* quitar vite: "npm:rolldown-vite@7.1.5" */ } }
  ```
  y volver a `vite` estable; reportar el plugin problemático.

### 2) `better-sqlite3` (módulo nativo)
- Requiere toolchain (python/g++/make).  
- **WSL2** recomendado en Windows.  
- **Acción**:  
  ```bash
  pnpm rebuild better-sqlite3
  ```
  Asegura Node 20.18.1 (Volta) y que no hay `node-gyp` roto.

### 3) **SSR**: hydration mismatch / estilos
- Verifica que no se dupliquen imports de estilos.  
- Asegura transpile de librerías que lo requieran.  
- Revisa que el servidor entregue la misma versión de la app que el cliente (cache busting correcto).

### 4) **Tailwind v4** no aplica utilidades
- Confirmar que el CSS global importe `tailwindcss`.  
- Asegurar que no existan configuraciones obsoletas (propias de v3) interfiriendo en el pipeline.

### 5) **pnpm** y rutas largas (Windows)
- Preferir **WSL2** o habilitar soporte de rutas largas en Git/Windows.  
- Limpieza:
  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm i
  ```

### 6) Versiones de Node desalineadas
- El proyecto usa **Volta**.  
- **Acción**: `volta pin node@20.18.1 && volta pin pnpm@10.15.1` y reinstalar.

---

## Licencia
Licencia privada ADTV.
