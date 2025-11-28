---
title: Embalajes – Catálogo
summary: Catálogo de tipos de embalajes utilizados en operaciones de import/export.
order: 3
status: stable
version: 1.0.0
updatedAt: 2025-09-10
module: configuration-embalajes
roles: [Administrador, Operaciones, Logística]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener el catálogo de tipos de embalajes con información de nombre, código y validación de duplicados.

# Alcance
Incluye alta, edición, búsqueda de embalajes similares y restauración de registros eliminados.

# Prerrequisitos
- Permisos: `catalogs.embalajes.manage`
- Catálogos relacionados: ninguno específico

# Navegación
- Menú: `Configuration → Embalajes`
- Ruta: `/configuration/embalajes`

# Flujo general
1. Crear/editar un embalaje
2. Validar nombre y código
3. Buscar embalajes con nombre similar para evitar duplicados
4. Guardar y notificar
5. Usar en módulos de import/export

> **Nota:** antes de crear un nuevo embalaje, revisa embalajes con nombres similares para mantener consistencia y evitar duplicados.

## Vistas principales
- **Listado** con filtros por nombre y código.
- **Formulario** de alta/edición:
  - Campos: Nombre, Código
  - Botones: Guardar, Cancelar, Buscar similares
- **Detalle** del embalaje

## Campos y validaciones (resumen)
- **Nombre** *(obligatorio)*  
- **Código** *(opcional)*  

## Acciones especiales
- **Buscar similares**: muestra embalajes con nombres parecidos antes de guardar
- **Soft delete**: permite eliminar y restaurar embalajes

## Errores comunes
- Nombre duplicado
- Código duplicado
- Intentar eliminar un embalaje que está referenciado sin revisar
