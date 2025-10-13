---
title: Countries – Introducción
summary: Catálogo de países para operaciones y datos generales.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: configuration-countries
roles: [Administrador, Operaciones]
tags: [configuracion, catalogos, geografia]
---

# Objetivo
Mantener el catálogo de países con sus códigos ISO y moneda principal.

# Alcance
Incluye alta, edición, búsqueda y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.countries.manage`

# Navegación
- Menú: `Configuration → Countries`
- Ruta: `/configuration/countries`

# Flujo general
1. Crear/editar país
2. Validar código ISO
3. Guardar y notificar
4. Usar en módulos de clientes, proveedores, aeropuertos y operaciones

> **Nota:** evita duplicados; usa búsqueda antes de crear un nuevo país.

## Vistas principales
- **Listado** con filtros por nombre y código ISO.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (clientes, aeropuertos, proveedores)

## Campos y validaciones (resumen)
- **Nombre** *(obligatorio)*  
- **Código ISO 2 / 3** *(obligatorio)*  
- **Moneda preferente** *(opcional)*  
- **Estatus** *(Activo/Inactivo)*  

## Errores comunes
- Código ISO inválido.
- Duplicado por nombre o código.
