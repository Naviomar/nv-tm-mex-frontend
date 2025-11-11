---
title: Catálogo de Contenedores (Containers)
summary: Administración de los tipos de contenedores utilizados en operaciones logísticas y marítimas.
order: 5
status: stable
version: 1.0.0
updatedAt: 2025-09-10
module: configuration-containers
roles: [Administrador, Operaciones]
tags: [configuracion, maritimo, contenedores, catalogos]
---

# Objetivo y alcance
El **Catálogo de Contenedores (Containers)** permite administrar los tipos de contenedores disponibles para operaciones logísticas.  
Se utiliza para clasificar, identificar y gestionar capacidades en operaciones de transporte marítimo y multimodal.

# Prerrequisitos
- Permisos: acceso al módulo **Configuración → Contenedores**.  
- Rol sugerido: Administrador del sistema o usuario de operaciones.  
- Conocimiento de los estándares de contenedores (ej. 20’, 40’, High Cube, Reefer).  

# Navegación en la app
- Ruta de menú: `Configuración → Contenedores`  
- URL: `/configuration/containers`  
- Secciones principales:
  - Listado de contenedores  
  - Creación de nuevo contenedor  
  - Edición de contenedor existente  
  - Búsqueda de contenedores similares  

# Conceptos clave
- **Container Type:** Registro que identifica un tipo de contenedor con sus atributos.  
- **TEUs (Twenty-foot Equivalent Unit):** Medida estandarizada para capacidad de contenedores (ej. 20’ = 1 TEU, 40’ = 2 TEUs).  
- **Reefer:** Contenedor refrigerado (Yes/No).  

# Flujo de negocio (E2E)
1. El usuario accede a **Configuración → Contenedores**.  
2. Consulta el listado de contenedores existentes o crea uno nuevo.  
3. Ingresa nombre, código, TEUs y si es refrigerado o no.  
4. Valida si existen nombres similares antes de guardar.  
5. Confirma la creación o actualización.  
   → El contenedor queda disponible en catálogos y operaciones logísticas.  

:::tip
La validación de nombres similares ayuda a evitar duplicidades en la configuración de contenedores.
:::

# Pantallas y campos
## Edición / Creación de contenedor
**Propósito:** Crear o modificar un tipo de contenedor.  

**Campos principales:**
- `Name` (obligatorio, texto) — nombre del contenedor (ej. "40’ High Cube").  
- `Code` (opcional, texto) — código identificador interno.  
- `TEUs` (obligatorio, numérico) — capacidad en TEUs.  
- `Reefer` (opcional, selección Yes/No) — indica si el contenedor es refrigerado.  

**Acciones disponibles:**
- Guardar cambios  
- Cancelar  
- Buscar contenedores con nombre similar (`Search similar`)  
- Eliminar/restaurar contenedor (soft delete)  

_(Figura 1 — Pantalla de edición de contenedor)_

# Procedimientos
## Crear un contenedor nuevo
**Precondiciones:** Acceso al módulo Configuración.  
**Entradas:** Nombre, TEUs (obligatorio), código y reefer (opcionales).  
**Pasos:**
1. Ingresar al menú **Configuración → Contenedores → Nuevo**.  
2. Capturar el nombre, código, TEUs y si es refrigerado.  
3. Presionar **Search similar** para validar coincidencias.  
4. Confirmar la creación.  
**Resultado esperado:** El nuevo contenedor aparece en el listado activo.  

## Editar un contenedor
**Pasos:**
1. Seleccionar un contenedor en el listado.  
2. Modificar los campos permitidos.  
3. Guardar cambios.  
**Resultado esperado:** La información se actualiza en el catálogo.  

## Eliminar / restaurar un contenedor
**Pasos:**
1. En el listado, seleccionar **Eliminar**.  
2. Confirmar la acción.  
**Resultado esperado:** El contenedor se marca como eliminado (soft delete).  
3. Para restaurar, seleccionar **Restaurar** en el mismo registro.  

# Reglas de negocio
- El campo `name` es obligatorio y debe ser único.  
- El campo `teus` es obligatorio y debe ser numérico positivo.  
- Antes de crear un contenedor, el sistema busca coincidencias de nombre (`searchByName`).  
- El campo `reefer` solo acepta valores 1 (Yes) o 0 (No).  
- Los registros eliminados se manejan con **soft delete** y pueden restaurarse.  
- Todas las operaciones quedan asociadas al usuario autenticado (`created_by`, `deleted_by`).  
