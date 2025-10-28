---
title: Vessels – Introducción
summary: Catálogo de buques utilizados en operaciones marítimas.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-vessels
roles: [Administrador, Operaciones]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener el catálogo de buques con nombre, IMO y tipo.

# Alcance
Incluye alta, edición, búsqueda y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.vessels.manage`

# Navegación
- Menú: `Configuration → Vessels`
- Ruta: `/configuration/vessels`

# Flujo general
1. Crear/editar buque
2. Validar IMO y tipo
3. Guardar y notificar
4. Usar en operaciones marítimas y tracking

> **Nota:** evita duplicados; usa búsqueda antes de crear un nuevo buque.

## Vistas principales
- **Listado** con filtros por nombre, IMO y tipo.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (voyages, shipments)

## Campos y validaciones (resumen)
- **Nombre** *(obligatorio)*  
- **IMO** *(opcional)*  
- **Tipo** *(opcional)*  

## Errores comunes
- Nombre duplicado.
- IMO inválido.
