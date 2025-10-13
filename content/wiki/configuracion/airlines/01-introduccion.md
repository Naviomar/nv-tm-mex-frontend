---
title: Aerolíneas – Introducción
summary: Catálogo de aerolíneas para operaciones aéreas (AWB/HAWB).
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-08
module: configuration-airlines
roles: [Administrador, Operaciones]
tags: [configuracion, aereo, catalogos]
---

# Objetivo
Mantener el catálogo de aerolíneas con su código IATA/ICAO, razón social y estatus.

# Alcance
Incluye alta, edición, búsqueda, inhabilitación y validaciones básicas.

# Prerrequisitos
- Permisos: `catalogs.airlines.manage`
- Catálogos relacionados: **Airports**, **Currencies** (opcional)

# Navegación
- Menú: `Configuration → Airlines`
- Ruta: `/configuracion/airlines`

# Flujo general
1. Crear/editar aerolínea
2. Validar códigos IATA/ICAO
3. Guardar y notificar
4. Usar en módulos de **Aéreo** (import/export)

> **Nota:** evita duplicados; usa búsqueda antes de crear una nueva entrada.

## Vistas principales
- **Listado** con filtros por nombre, código y estatus.
- **Formulario** de alta/edición.
- **Detalle** con relaciones (contratos/tarifas si aplica).

## Campos y validaciones (resumen)
- **Nombre** *(obligatorio)*  
- **Código IATA** *(2–3 letras)*  
- **Código ICAO** *(3 letras)*  
- **RFC / VAT** *(opcional, país-dependiente)*  
- **Moneda preferente** *(opcional)*  
- **Estatus** *(Activo/Inactivo)*  

## Errores comunes
- Código IATA inválido (longitud).  
- Duplicado por nombre o código.  