---
title: Catálogo de Monedas (Currencies)
summary: Administración de las monedas disponibles en el sistema para operaciones y facturación.
order: 3
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-currencies
roles: [Administrador, Operaciones, Facturación]
tags: [configuracion, monedas, divisas, catalogos]
---

# 1. Objetivo y alcance
El **Catálogo de Monedas (Currencies)** permite administrar las divisas que serán utilizadas en el sistema.  
Desde aquí se registran, actualizan y eliminan las monedas, garantizando la consistencia en operaciones comerciales y procesos de facturación.

# 2. Prerrequisitos
- Permisos: acceso al módulo **Configuración → Monedas**.
- Rol sugerido: Administrador del sistema o usuario con permisos de configuración.
- Conocimiento básico de los códigos internacionales de divisas (ISO 4217).

# 3. Navegación en la app
- Ruta de menú: `Configuración → Monedas`
- URL: `/configuration/currencies`
- Secciones principales:
  - Listado de monedas
  - Creación/edición de una moneda
  - Eliminación o restauración de registros

# 4. Conceptos clave
- **Currency (Divisa):** Registro que define una moneda dentro del sistema.
- **Code:** Código corto asociado a la divisa (ej. MXN, USD, EUR).
- **Soft Delete:** Las monedas eliminadas se mantienen en base de datos y pueden restaurarse.

# 5. Flujo de negocio (E2E)
1. El usuario accede a **Configuración → Monedas**.
2. Consulta el listado de divisas existentes o selecciona *Nueva moneda*.
3. Captura el **nombre** y **código** de la moneda.
4. Guarda los cambios.  
   → La moneda queda disponible para ser utilizada en operaciones y facturación.

:::tip
Se recomienda mantener actualizado este catálogo conforme a las divisas aceptadas por la empresa para evitar errores de cálculo o facturación.
:::

# 6. Pantallas y campos
## 6.1 Formulario de moneda
**Propósito:** Crear o modificar una moneda.

**Campos principales:**
- `Name` (obligatorio) — nombre de la divisa.
- `Code` (obligatorio) — código de la divisa.

**Acciones disponibles:**
- Guardar cambios
- Cancelar
- Restaurar moneda eliminada

_(Figura 1 — Pantalla de creación/edición de moneda)_

# 7. Procedimientos
## 7.1 Crear una moneda nueva
**Precondiciones:** Acceso al módulo Configuración.  
**Entradas:** Nombre y código de la moneda.  
**Pasos:**
1. Ingresar al menú **Configuración → Monedas → Nuevo**.
2. Capturar los campos requeridos.
3. Guardar el registro.
**Resultado esperado:** La nueva divisa aparece en el listado con estatus activo.

## 7.2 Eliminar o restaurar una moneda
**Pasos:**
1. En el listado de monedas, seleccionar la opción *Eliminar* sobre el registro deseado.
2. Confirmar la acción.  
   → El sistema marca la moneda como eliminada (soft delete).  
3. Para restaurar, repetir la acción y confirmar la restauración.  
**Resultado esperado:** La moneda queda nuevamente disponible.

# 8. Reglas de negocio
- El nombre (`name`) y código (`code`) son obligatorios.
- El código debe ser único y preferentemente cumplir con el estándar ISO 4217.
- Las monedas eliminadas se manejan con **soft delete** y pueden restaurarse.
- Una divisa puede ser referenciada por otros catálogos y operaciones, por lo que debe validarse antes de su eliminación definitiva.
