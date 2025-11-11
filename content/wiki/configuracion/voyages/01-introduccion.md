---
title: Voyages – Introducción
summary: Catálogo de viajes marítimos para seguimiento de buques.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-voyages
roles: [Administrador, Operaciones]
tags: [configuracion, logistica, catalogos]
---

# Objetivo
Mantener el catálogo de viajes de buques con origen, destino y fechas.

# Alcance
Incluye alta, edición, búsqueda y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.voyages.manage`
- Catálogos relacionados: **Vessels**, **Ports**

# Navegación
- Menú: `Configuration → Voyages`
- Ruta: `/configuration/voyages`

# Flujo general
1. Crear/editar viaje
2. Validar buque, origen y destino
3. Guardar y notificar
4. Usar en operaciones y tracking

> **Nota:** evita duplicados; usa búsqueda antes de crear un nuevo viaje.

## Vistas principales
- **Listado** con filtros por buque, origen, destino y fecha.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (containers, shipments)

## Campos y validaciones (resumen)
- **Nombre / ID del voyage** *(obligatorio)*  
- **Vessel** *(obligatorio)*  
- **Puerto de origen** *(obligatorio)*  
- **Puerto de destino** *(obligatorio)*  
- **Fecha de salida/llegada** *(opcional)*  

## Errores comunes
- Nombre duplicado.
- Origen/destino inválido.
