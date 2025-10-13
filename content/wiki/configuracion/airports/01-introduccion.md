---
title: Catálogo de Aeropuertos (Airports)
summary: Administración de aeropuertos utilizados en operaciones aéreas dentro del sistema.
order: 3
status: stable
version: 1.0.0
updatedAt: 2025-09-10
module: configuration-airports
roles: [Administrador, Operaciones]
tags: [configuracion, aereo, aeropuertos, catalogos]
---

# 1. Objetivo y alcance
El **Catálogo de Aeropuertos (Airports)** permite administrar los aeropuertos que se utilizarán en las operaciones aéreas, vinculándolos con un país y un código único de identificación (IATA/ICAO).  
Este catálogo es fundamental para la correcta gestión de guías aéreas, tracking y facturación relacionada con transporte aéreo.

# 2. Prerrequisitos
- Permisos: acceso al módulo **Configuración → Aeropuertos**.  
- Rol sugerido: Administrador del sistema o usuario de operaciones con permisos de edición.  
- Conocimiento básico de los aeropuertos a utilizar en las rutas o servicios.

# 3. Navegación en la app
- Ruta de menú: `Configuración → Aeropuertos`  
- URL: `/configuration/airports`  
- Secciones principales:
  - Listado de aeropuertos
  - Edición de aeropuerto
  - Creación de un nuevo aeropuerto

# 4. Conceptos clave
- **Airport (Aeropuerto):** Registro que identifica un aeropuerto específico.  
- **Country:** País al que está asociado el aeropuerto.  
- **Code:** Código IATA o ICAO que identifica al aeropuerto.  
- **Address / Zip Code:** Información complementaria disponible en edición.  

# 5. Flujo de negocio (E2E)
1. El usuario accede a **Configuración → Aeropuertos**.  
2. Consulta el listado de aeropuertos existentes o crea uno nuevo.  
3. Define país, nombre y código del aeropuerto.  
4. (Opcional) Ingresa dirección y código postal en caso de edición.  
5. Guarda los cambios.  
   → El aeropuerto queda disponible para ser utilizado en operaciones aéreas.  

:::tip
El código IATA de 3 letras es el más común para aeropuertos comerciales. Validar antes de crear un nuevo registro para evitar duplicados.
:::

# 6. Pantallas y campos
## 6.1 Edición / Creación de aeropuerto
**Propósito:** Crear o modificar un aeropuerto existente.  

**Campos principales:**
- `Country` (obligatorio, desplegable) — país al que pertenece el aeropuerto.  
- `Name` (obligatorio, texto) — nombre oficial del aeropuerto.  
- `Code` (obligatorio, texto) — código IATA/ICAO.  
- `Address` (opcional, texto) — dirección física del aeropuerto.  
- `Zip Code` (opcional, texto) — código postal asociado.  

**Acciones disponibles:**
- Guardar cambios  
- Cancelar  
- Restaurar / eliminar aeropuerto (soft delete)  

_(Figura 1 — Pantalla de edición de aeropuerto)_

# 7. Procedimientos
## 7.1 Crear un aeropuerto nuevo
**Precondiciones:** Acceso al módulo Configuración.  
**Entradas:** País, nombre, código.  
**Pasos:**
1. Ingresar al menú **Configuración → Aeropuertos → Nuevo**.  
2. Capturar país, nombre y código.  
3. (Opcional) Completar dirección y código postal.  
4. Guardar el registro.  
**Resultado esperado:** El aeropuerto aparece en el listado con estatus activo.  

## 7.2 Editar un aeropuerto
**Pasos:**
1. Seleccionar un aeropuerto en el listado.  
2. Modificar campos permitidos (ej. dirección, código postal).  
3. Guardar cambios.  
**Resultado esperado:** La información queda actualizada y disponible en operaciones.  

## 7.3 Eliminar / restaurar un aeropuerto
**Pasos:**
1. En el listado de aeropuertos, seleccionar **Eliminar**.  
2. Confirmar acción.  
**Resultado esperado:** El aeropuerto se marca como eliminado (soft delete).  
3. Para restaurar, seleccionar **Restaurar** en el mismo registro.  

# 8. Reglas de negocio
- El campo `code` debe ser único por aeropuerto.  
- El campo `name` debe estar asociado a un país válido.  
- Los aeropuertos eliminados se manejan con **soft delete** y pueden restaurarse.  
- `address` y `zip_code` son opcionales, pero recomendados para ediciones detalladas.  
- Los cambios en aeropuertos impactan en módulos relacionados (ej. Air Shipments, Tracking).  
