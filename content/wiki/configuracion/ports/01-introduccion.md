---
title: Ports – Introducción
summary: Catálogo de puertos para operaciones marítimas.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-ports
roles: [Administrador, Operaciones]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener el catálogo de puertos con código, ubicación y país.

# Alcance
Incluye alta, edición, búsqueda y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.ports.manage`
- Catálogos relacionados: **Countries**

# Navegación
- Menú: `Configuration → Ports`
- Ruta: `/configuration/ports`

# Flujo general
1. Crear/editar puerto
2. Validar código y país
3. Guardar y notificar
4. Usar en operaciones marítimas y tracking

> **Nota:** evita duplicados; usa búsqueda antes de crear un nuevo puerto.

## Vistas principales
- **Listado** con filtros por código, nombre y país.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (vessels, shipments)

## Campos y validaciones (resumen)
- **Nombre** *(obligatorio)*  
- **Código** *(opcional)*  
- **País** *(obligatorio)*  

## Errores comunes
- Código duplicado.
- Nombre inválido.
