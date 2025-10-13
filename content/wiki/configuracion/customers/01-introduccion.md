---
title: Customers – Introducción
summary: Catálogo de clientes para operaciones logísticas y comerciales.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-customers
roles: [Administrador, Ventas, Operaciones]
tags: [configuracion, clientes, catalogos]
---

# Objetivo
Mantener el catálogo de clientes con datos de contacto y referencias comerciales.

# Alcance
Incluye alta, edición, búsqueda, inhabilitación y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.customers.manage`
- Catálogos relacionados: **Executives**, **Countries**

# Navegación
- Menú: `Configuration → Customers`
- Ruta: `/configuration/customers`

# Flujo general
1. Crear/editar cliente
2. Validar información de contacto
3. Guardar y notificar
4. Usar en contratos, operaciones y tracking

> **Nota:** evita duplicados; usa búsqueda antes de crear un nuevo cliente.

## Vistas principales
- **Listado** con filtros por nombre, país y ejecutivo asignado.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (ejecutivo, contratos, líneas)

## Campos y validaciones (resumen)
- **Nombre / razón social** *(obligatorio)*  
- **RFC / VAT** *(opcional)*  
- **Correo electrónico** *(opcional)*  
- **Teléfono / contacto principal** *(opcional)*  
- **País** *(opcional)*  

## Errores comunes
- Nombre duplicado.
- RFC o correo inválido.
