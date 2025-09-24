---
title: Locations – Introducción
summary: Catálogo de ubicaciones físicas dentro de instalaciones o almacenes.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-locations
roles: [Administrador, Operaciones]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener el catálogo de ubicaciones físicas para almacenamiento o distribución.

# Alcance
Incluye alta, edición, búsqueda y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.locations.manage`

# Navegación
- Menú: `Configuration → Locations`
- Ruta: `/configuration/locations`

# Flujo general
1. Crear/editar ubicación
2. Validar código y descripción
3. Guardar y notificar
4. Usar en operaciones y tracking

> **Nota:** evita duplicados; usa búsqueda antes de crear una nueva ubicación.

## Vistas principales
- **Listado** con filtros por código y descripción.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (envíos, contenedores)

## Campos y validaciones (resumen)
- **Código / ID** *(obligatorio)*  
- **Nombre / Descripción** *(obligatorio)*  

## Errores comunes
- Código duplicado.
- Descripción inválida.
