---
title: Handlers – Catálogo
summary: Catálogo de air handlers utilizados en operaciones de import/export.
order: 5
status: stable
version: 1.0.0
updatedAt: 2025-09-10
module: configuration-handlers
roles: [Administrador, Operaciones, Logística]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener el catálogo de air handlers con información de nombre y gaffette, incluyendo gestión de creación, edición, eliminación y restauración.

# Alcance
Incluye alta, edición, búsqueda de handlers similares, validación de datos y restauración de registros eliminados.

# Prerrequisitos
- Permisos: `catalogs.handlers.manage`
- Catálogos relacionados: ninguno específico

# Navegación
- Menú: `Configuration → Handlers`
- Ruta: `/configuration/handlers`

# Flujo general
1. Crear/editar un handler
2. Validar nombre y gaffette
3. Buscar handlers con nombre similar para evitar duplicados
4. Guardar y notificar
5. Usar en módulos de import/export

> **Nota:** revisa handlers con nombres similares antes de crear uno nuevo para mantener consistencia y evitar duplicados.

## Vistas principales
- **Listado** con filtros por nombre y gaffette.
- **Formulario** de alta/edición:
  - Campos: Name, Gaffette
  - Botones: Guardar, Cancelar
- **Detalle** del handler

## Campos y validaciones (resumen)
- **Name** *(obligatorio)*  
- **Gaffette** *(obligatorio)*  

## Acciones especiales
- **Soft delete**: permite eliminar y restaurar handlers
- **Búsqueda de similares**: ayuda a evitar duplicados antes de crear o actualizar
- **Integración con API**: alta, edición y eliminación mediante endpoints del backend

## Errores comunes
- Nombre duplicado
- Gaffette duplicado
- Intentar eliminar un handler que está referenciado sin revisar
- Formulario enviado con campos vacíos
