---
title: Freight Line Credit Notes – Introducción
summary: Gestión de notas de crédito asociadas a facturas de líneas de flete.
order: 13
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-lines
roles: [Administrador, Operaciones, Facturación]
tags: [facturacion, lineas de flete, credit notes, catalogos, permisos]
---

# Objetivo
Centralizar la administración de notas de crédito relacionadas con facturas de línea de flete, incluyendo captura, filtrado, visualización y eliminación.

# Flujo de trabajo

## 1. Visualizar notas de crédito
- Navega a **Invoices > Lines > Credit Notes**.
- Tabla principal muestra las notas de crédito existentes.
- Botones disponibles:
  - **Back to line invoices**: Regresa a la lista de facturas de línea.
  - **Capture Credit note**: Redirige al formulario de captura de nota de crédito.

## 2. Captura de nota de crédito
- Campos principales:
  - **Freight line**: Selección de línea de flete mediante catálogo.
  - **Credit Note #**: Número de la nota de crédito.
  - **Date from / Date to**: Rangos de fecha para filtrado.
- Botones disponibles:
  - **Search**: Aplica los filtros ingresados.
  - **Clear**: Limpia los filtros y recarga la tabla.

## 3. Tabla de notas de crédito
- Columnas principales:
  - **Actions**: Visualizar o eliminar nota de crédito.
  - **Folio**: Identificador de la nota.
  - **Freight line**: Línea de flete asociada.
  - **Notes**: Descripción de la nota.
  - **Line invoice related**: Factura de línea vinculada.
  - **Amount** y **Amount available**: Montos de la nota.
  - **Created at**: Fecha de creación con información del usuario.
- Paginación disponible arriba y abajo de la tabla.

## 4. Acciones
- **View**: Abrir nota de crédito en detalle.
- **Delete**: Solicita confirmación antes de eliminar la nota.
- **View Line Invoice**: Abre la factura de línea asociada en nueva ventana.

## 5. Validaciones
- La línea de flete y folio son obligatorios al crear nota de crédito.
- Los filtros aplican correctamente para búsqueda por línea, número y fechas.
- Notas eliminadas se destacan visualmente en la tabla.

# Consideraciones técnicas
- Uso de componentes:
  - `v-autocomplete` para selección de líneas.
  - `v-text-field` para captura de número y fechas.
  - `v-table` para listado de notas de crédito.
  - `v-pagination` para navegar entre páginas.
  - Botones con íconos para acciones de usuario (`ViewButton`, `TrashButton`).
- Métodos principales:
  - `getData()`: Obtiene notas de crédito paginadas según filtros.
  - `getCatalogs()`: Carga catálogos de líneas de flete.
  - `onClickFilters()`, `onClickPagination()`, `clearFilters()`: Gestión de filtros y navegación.
  - `viewCreditNote()`, `viewLineInvoice()`, `showConfirmDelete()`: Acciones sobre notas de crédito.

# Beneficios
- Centralización de notas de crédito por línea de flete.
- Filtrado eficiente por fecha, línea o número de nota.
- Visualización rápida de notas relacionadas con facturas de línea.
- Control de eliminación con confirmación para prevenir errores.

# Notas
- Solo usuarios con rol **Administrador** o **Facturación** pueden crear o eliminar notas.
- El sistema muestra la disponibilidad de monto restante para cada nota de crédito.
