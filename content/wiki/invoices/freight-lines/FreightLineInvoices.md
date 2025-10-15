---
title: Freight Line Invoices – Introducción
summary: Gestión de notas e ingresos de facturas para líneas de flete.
order: 12
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-lines
roles: [Administrador, Operaciones, Facturación]
tags: [facturacion, lineas de flete, notas, catalogos, permisos]
---

# Objetivo
Centralizar la gestión de facturas y notas de líneas de flete, facilitando la captura de información,
la búsqueda de referencias marítimas y la creación de facturas de línea.

## Acceso a notas de línea
- Navega a **Invoices > Lines > Notes**.
- La tabla principal muestra todas las notas existentes.
- Botones:
  - **Back**: Regresa a la vista anterior.
  - **Create invoice**: Captura una nueva factura de línea.

## Captura de factura de línea
- Campos principales:
  - **Freight line**: Selección de la línea de flete.
  - **Serie y Folio**: Identificadores de la factura.
  - **Invoice date**: Fecha de emisión.
  - **Attachment**: Archivo adjunto (opcional).
- Sección de **Maritime Services**:
  - Agrega números Master BL para buscar referencias.
  - Selecciona referencias que se aplicarán a la factura.
- El sistema calcula automáticamente el **Total Amount**.
- Nota de crédito opcional si el monto excede el valor de compra.

## Validaciones
- Línea de flete, folio y fecha son obligatorios.
- Cada referencia agregada requiere monto válido.
- No se permite guardar si el monto total es cero.
- Excedentes controlados mediante nota de crédito.

## Acciones
- Buscar referencias por Master BL.
- Agregar o eliminar referencias.
- Guardar la factura con referencias seleccionadas.

## Beneficios
- Reducción de errores en captura manual.
- Centralización de la información de facturación.
- Control automático de excedentes.
- Integración con referencias marítimas.

## Notas
- Moneda por defecto: USD.
- Solo usuarios con rol **Administrador** o **Facturación** pueden crear facturas.
- Permite control y seguimiento eficiente de cada factura.
- Facilita auditorías internas y revisiones de pagos.
- Compatible con futuras mejoras en reportes y alertas.
