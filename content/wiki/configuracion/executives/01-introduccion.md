---
title: Executives – Introducción
summary: Catálogo de ejecutivos asociados a operaciones y clientes.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-executives
roles: [Administrador, Operaciones, Ventas]
tags: [configuracion, catalogos, personal]
---

# Objetivo
Mantener el catálogo de ejecutivos con sus datos de contacto y relación con clientes/operaciones.

# Alcance
Incluye alta, edición, búsqueda, inhabilitación y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.executives.manage`
- Catálogos relacionados: **Customers**

# Navegación
- Menú: `Configuration → Executives`
- Ruta: `/configuration/executives`

# Flujo general
1. Crear/editar ejecutivo
2. Validar información de contacto
3. Guardar y notificar
4. Asignar a clientes o líneas según corresponda

> **Nota:** evita duplicados; usa búsqueda antes de crear un nuevo ejecutivo.

## Vistas principales
- **Listado** con filtros por nombre, cargo y cliente asignado.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (clientes, líneas)

## Campos y validaciones (resumen)
- **Nombre completo** *(obligatorio)*  
- **Correo electrónico** *(opcional)*  
- **Teléfono / extensión** *(opcional)*  
- **Cliente asignado** *(opcional)*  

## Errores comunes
- Nombre duplicado.
- Correo inválido.
