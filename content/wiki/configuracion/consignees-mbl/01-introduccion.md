---
title: Catálogo de Consignees MBL
summary: Administración de consignees asociados a Master Bill of Lading (MBL), con opción de habilitar el proceso de demurrages.
roles: [Administrador, Operaciones]
tags: [configuración, consignees, mbl, catálogo]
order: 11
status: draft
version: 1.0.0
updatedAt: 2025-09-11
module: configuration-consignees-mbl
permalink: /manual/consignees-mbl
---

# 1. Objetivo y alcance
Gestionar consignees vinculados a Master Bill of Lading (MBL), permitiendo registrar su información básica y definir si generan procesos de demurrages.

# 2. Prerrequisitos
- Permisos: `consignees_mbl.create`, `consignees_mbl.update`, `consignees_mbl.view`, `consignees_mbl.delete`
- Datos maestros: Ninguno (solo se requiere nombre)
- Integraciones: Procesos de **Demurrages**

# 3. Navegación en la app
- Ruta de menú: `Configuración > Catálogos > Consignees MBL`
- URL: `/configuration/consignees-mbl`
- Secciones/pestañas:
  - Datos básicos
  - Similares (búsqueda y validación)

# 4. Conceptos clave
- **Consignee MBL:** Cliente consignatario asociado al documento MBL.
- **Has Demurrages:** Indicador para iniciar procesos de demurrages automáticamente si el consignee está vinculado.
- **Similar Consignees:** Validación automática que detecta nombres similares antes de guardar.

# 5. Flujo de negocio (E2E)
1. Usuario accede al módulo de **Consignees MBL**.
2. Ingresa el nombre y define si activa el proceso de demurrages.
3. El sistema busca consignees con nombres similares.
4. Si existen coincidencias:
   - Se muestran en un panel lateral y/o en un modal de confirmación.
   - El usuario puede cancelar o confirmar la creación.
5. Si no hay conflictos, se guarda el registro.
6. El consignee queda disponible en operaciones MBL y procesos de demurrages.

:::tip
El campo **has_demurrages** permite controlar desde el alta si el consignee disparará procesos de cobro por demurrages.
:::

# 6. Pantallas y campos
## 6.1 Formulario de Consignee MBL
**Propósito**: Registrar o editar consignees asociados al MBL.

**Campos**:
- `Name` (obligatorio) — Nombre del consignee.
- `Init demurrages?` (obligatorio) — Sí/No, define si el consignee activa procesos de demurrages.

**Acciones**:  
- Guardar  
- Cancelar  
- Buscar similares  

**Mensajes del sistema**:
- **Éxito:** "Consignee MBL created" / "Consignee MBL updated"
- **Advertencia:** "Name is required", "Validate form before submit"
- **Confirmación:** "Consignees with similar name"

_(Figura X — Captura del formulario de alta de Consignee MBL)_

## 6.2 Panel de similares
- Botón: `Search similar`
- Sección lateral con listado de coincidencias
- Modal de confirmación antes de guardar

# 7. Procedimientos
## 7.1 Alta de Consignee MBL
**Precondiciones**: Usuario con permiso `consignees_mbl.create`.  
**Entradas**: Nombre, Init demurrages (Sí/No).  

**Pasos**:
1. Abrir el formulario en `Configuración > Consignees MBL > Nuevo`.
2. Completar los campos obligatorios.
3. Presionar **Guardar**.
4. El sistema ejecuta búsqueda de similares.
5. Confirmar creación en caso de coincidencias.

**Resultado esperado**: El consignee queda registrado.  
**Postcondiciones**: El consignee aparece en el listado y puede ser utilizado en operaciones MBL.

# 8. Reglas de negocio
- El campo **Name** no puede estar vacío.
- El campo **Init demurrages?** es obligatorio (true/false).
- El sistema realiza búsqueda de similares por `name` antes de permitir guardar.
- La eliminación/restauración es lógica (SoftDelete).
- Si el consignee tiene `has_demurrages = true`, los servicios asociados al MBL disparan procesos de demurrages automáticamente.

# 9. Integraciones
- **Demurrages:** Uso directo del indicador `has_demurrages` para activar procesos de cobro.
- **Operaciones MBL:** Relación directa con documentos Master Bill of Lading (MBL).
- **Usuarios internos:** Campos `created_by` y `deleted_by` registrados automáticamente.
