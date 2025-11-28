---
title: Catálogo de Conceptos (Charges)
summary: Administración de conceptos operativos y de facturación utilizados en los servicios (marítimo, aéreo, libre formato).
order: 2
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-charges
roles: [Administrador, Operaciones, Facturación]
tags: [configuracion, conceptos, cargos, catalogos]
---

# 1. Objetivo y alcance
El **Catálogo de Conceptos (Charges)** permite administrar los cargos operativos y de facturación que se utilizan en los distintos servicios del sistema (marítimo, aéreo, libre formato).  
Desde aquí se definen las reglas básicas de cálculo, las asociaciones a entidades, divisas, y los nombres de CFDI que se usarán en facturación.

# 2. Prerrequisitos
- Permisos: acceso al módulo **Configuración → Conceptos**.
- Rol sugerido: Administrador del sistema o usuario de operaciones con permisos de edición.
- Conocimiento básico de los servicios a los que se asocian los conceptos (Marítimo, Aéreo, etc.).

# 3. Navegación en la app
- Ruta de menú: `Configuración → Conceptos`
- URL: `/configuration/charges`
- Secciones principales:
  - Listado de conceptos
  - Edición de un concepto
  - Opciones según tipo de servicio (Marítimo / Aéreo / Libre formato)
  - CFDI similares

# 4. Conceptos clave
- **Charge (Concepto):** Registro que define un cargo específico, asociado a un servicio.
- **Entidad (Entity):** Relación del cargo con un área del sistema (ej. marítimo, aéreo, libre).
- **Service(s):** Servicio(s) donde el cargo puede utilizarse.
- **CFDI Names:** Nombres equivalentes que se usarán en facturación electrónica.
- **Opciones Marítimas/Aéreas:** Configuraciones adicionales dependiendo del tipo de servicio.

# 5. Flujo de negocio (E2E)
1. El usuario accede a **Configuración → Conceptos**.
2. Consulta el listado de conceptos existentes o crea uno nuevo.
3. Define nombre, código, entidad, servicios y parámetros adicionales.
4. Configura opciones específicas (ejemplo: Importación/Exportación marítima o aérea).
5. Define monto y moneda por defecto.
6. Asocia nombres CFDI para facturación.
7. Guarda los cambios.  
   → El concepto queda disponible para ser usado en referencias, facturas u operaciones.

:::tip
Se recomienda mantener un control estricto de los nombres CFDI para evitar duplicidad y problemas en la facturación SAT.
:::

# 6. Pantallas y campos
## 6.1 Edición de concepto
**Propósito:** Crear o modificar un concepto existente.

**Campos principales:**
- `Name` (obligatorio, solo lectura al editar) — nombre único del concepto.
- `Code` (opcional) — identificador adicional.
- `Entity` (lista desplegable) — entidad a la que se asocia el cargo.
- `Service(s)` (multiselección) — servicios disponibles (Marítimo, Aéreo, Libre formato).
- `Default Amount` — monto por defecto.
- `Currency` — moneda asociada al monto.
- `Can be deleted?` — indicador si el concepto puede eliminarse.

**Opciones adicionales:**
- **Sea charge:**
  - is import, is export, is local, is warranty deposit, is OCF.
- **Air charge:**
  - is import, is export, is air freight.
- **Free format:**
  - include IVA.

**Acciones disponibles:**
- Guardar cambios
- Cancelar
- Buscar cargos con nombre similar
- Administrar CFDI Names (agregar / eliminar)

_(Figura 1 — Pantalla de edición de concepto)_

# 7. Procedimientos
## 7.1 Crear un concepto nuevo
**Precondiciones:** Acceso al módulo Configuración.  
**Entradas:** Nombre del concepto, código, entidad, servicios.  
**Pasos:**
1. Ingresar al menú **Configuración → Conceptos → Nuevo**.
2. Capturar los campos principales.
3. Seleccionar los servicios donde aplicará el concepto.
4. Configurar las opciones de acuerdo al tipo de servicio.
5. Guardar el registro.
**Resultado esperado:** El concepto aparece en el listado con estatus activo.

## 7.2 Asociar un CFDI Name
**Pasos:**
1. En la edición de un concepto, ir a la sección *Invoice similar name(s)*.
2. Presionar el botón **+** para agregar un nombre.
3. Ingresar el texto y guardar.
**Resultado esperado:** El nuevo CFDI name queda registrado y disponible en la tabla de nombres similares.

# 8. Reglas de negocio
- El nombre del concepto (`name`) es único y no puede modificarse una vez creado.
- Un concepto puede asociarse a múltiples servicios, pero solo con un conjunto válido de opciones.
- Los valores booleanos en las opciones (ejemplo: `is_import`) se almacenan en la tabla pivote `charge_services`.
- Los conceptos eliminados se manejan con **soft delete** y pueden restaurarse.
- La moneda por defecto (`default_currency_id`) debe existir en el catálogo de monedas.
- Los CFDI Names deben ser únicos por concepto.

