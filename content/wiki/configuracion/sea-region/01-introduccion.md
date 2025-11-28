---
title: Catálogo de Sea Regions
summary: Catálogo de regiones marítimas utilizadas para clasificar rutas y operaciones en el módulo marítimo.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-sea-regions
roles: [Administrador, Operaciones]
tags: [configuracion, maritimo, catalogos]
---

# Objetivo 
El catálogo de **Sea Regions** permite registrar y administrar las regiones marítimas que se utilizan para organizar y clasificar operaciones en el sistema.  

# Alcance
Sirven como referencia en otros módulos de transporte marítimo.

---

# Prerrequisitos
- **Permisos**:
  - Rol: `Administrador` o `Operaciones`
  - Acceso a la ruta `/configuration/sea-regions`
- Usuario con sesión iniciada.
- Conocer la nomenclatura o código asignado a cada región.

---

# Navegación en la app
- **Ruta de menú**: `Configuración → Sea Regions`
- **URL**: `/configuration/sea-regions`
- **Secciones/pestañas**:
  1. Listado de regiones.
  2. Formulario de creación/edición.
  3. Búsqueda de regiones similares.

---

# Conceptos clave
- **Sea Region**: Área geográfica marítima definida para la operación logística.
- **Code**: Abreviatura o identificador único de la región.
- **Regiones similares**: Regiones con coincidencia parcial en el nombre, detectadas para evitar duplicados.

---

# Flujo de negocio (E2E)
1. El usuario ingresa a `Configuración → Sea Regions`.
2. Consulta el listado existente.
3. Para agregar una región:
   - Presiona **Nuevo**.
   - Completa los campos `Region name` y `Code`.
4. El sistema verifica si existen regiones con nombres similares.
5. Si hay coincidencias, muestra una lista y solicita confirmación.
6. Al confirmar, guarda la nueva región y la asocia al usuario creador.

:::tip
Si la región ya existía pero estaba eliminada, se restaurará en lugar de crear una nueva.
:::

---

# Pantallas y campos

## 6.1 Listado de Sea Regions
**Propósito**: Consultar, filtrar y administrar las regiones marítimas.
**Campos visibles**:
- **ID** — Identificador único.
- **Region name** — Nombre de la región.
- **Code** — Código único de la región.
- **Estado** — Activo / Eliminado.
- **Creado por** — Usuario creador.
- **Eliminado por** — Usuario que eliminó (si aplica).
**Acciones**:
- Editar
- Eliminar / Restaurar

---

## Formulario de creación/edición
**Propósito**: Crear o modificar una región marítima.
**Campos**:
- `Region name` (obligatorio) — Nombre de la región.
- `Code` (obligatorio) — Identificador único de la región.
**Validaciones**:
- `Region name` y `Code` no pueden estar vacíos.
- Antes de guardar, se verifica si existe una región con nombre similar.
**Acciones**:
- Guardar — Valida y confirma creación/edición.
- Cancelar — Regresa al listado.
**Mensajes del sistema**:
- Éxito: "Sea region created" / "Sea region updated".
- Advertencia: "Name is required".
- Error: "Please fill in all required fields".

---

# Procedimientos

## Crear una región marítima
**Precondiciones**:
- Tener permisos de creación.
- Conocer el código de la región.
**Entradas**:
- Nombre (`Region name`).
- Código (`Code`).
**Pasos**:
1. Ingresar al formulario de creación.
2. Completar los campos obligatorios.
3. Guardar.
4. Confirmar creación si se detectan coincidencias.
**Resultado esperado**:
- Registro creado y visible en el listado.
**Postcondiciones**:
- La región queda disponible para su uso en otros módulos.

---

## Editar una región marítima
**Precondiciones**:
- Permisos de edición.
**Entradas**:
- ID de la región.
**Pasos**:
1. Abrir el registro desde el listado.
2. Modificar campos requeridos.
3. Guardar cambios.
**Resultado esperado**:
- Datos actualizados en la base de datos.
**Postcondiciones**:
- Cambios reflejados en el listado.

---

# Reglas de negocio
- El campo `Region name` es obligatorio.
- El campo `Code` es obligatorio y único.
- Si existe coincidencia parcial en el nombre, se debe confirmar antes de guardar.
- Al crear una región ya eliminada, se restaura.
