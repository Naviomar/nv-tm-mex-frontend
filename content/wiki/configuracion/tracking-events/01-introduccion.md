---
title: Tracking Events – Introducción
summary: Catálogo de eventos de seguimiento de envíos.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-tracking-events
roles: [Administrador, Operaciones]
tags: [configuracion, tracking, catalogos]
---

# Objetivo
Mantener el catálogo de eventos de tracking para envíos y operaciones logísticas.

# Alcance
Incluye alta, edición, búsqueda y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.trackingEvents.manage`

# Navegación
- Menú: `Configuration → Tracking Events`
- Ruta: `/configuration/tracking-events`

# Flujo general
1. Crear/editar evento
2. Validar descripción y código
3. Guardar y notificar
4. Usar en módulos de seguimiento de carga

> **Nota:** evita duplicados; usa búsqueda antes de crear un nuevo evento.

## Vistas principales
- **Listado** con filtros por nombre y código.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (tracking de contenedores o envíos)

## Campos y validaciones (resumen)
- **Nombre del evento** *(obligatorio)*  
- **Código** *(opcional)*  

## Errores comunes
- Nombre duplicado.
- Código inválido.
