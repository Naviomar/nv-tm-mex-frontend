---
title: Export TM Invoices – Introducción
summary: Permite filtrar, visualizar y exportar facturas del sistema TM a Excel.
order: 13
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-export
roles: [Administrador, Finanzas]
tags: [facturacion, invoices, export, TM]
---

# Objetivo
Facilitar la búsqueda, visualización y exportación de facturas del sistema TM, con filtros por número, fechas y tipo de CFDI, y la posibilidad de descargar reportes en Excel.

# Alcance
- Filtrado por número de factura, rango de fechas y tipo de CFDI (Timbradas, Sin timbrar, Todas).
- Visualización de resultados en tabla compacta con detalles de servicios, tipo, fecha, número, total, cargos, método y forma de pago, moneda, RFC, cliente, UUID, y enlaces a XML/PDF.
- Paginación para navegar entre resultados.
- Exportación de datos a Excel con advertencia si incluye facturas timbradas.

# Prerrequisitos
- Acceso al sistema TM con permisos para ver y exportar facturas.
- Conocimiento básico de los tipos de CFDI y manejo de Excel.

# Navegación
- Menú principal: **Invoices → Export TM Invoices**
- Ruta directa: `/adminpack/export-tm-invoices`

# Flujo general de uso
1. Ingresa al módulo de Export TM Invoices desde el menú principal.
2. Completa los filtros deseados: invoice number, date from, date to, tipo de CFDI.
3. Haz clic en "Search" para obtener los resultados.
4. Revisa la tabla con las facturas encontradas y sus detalles.
5. Usa la paginación para moverte entre páginas si es necesario.
6. Haz clic en "Export Excel" para descargar los resultados filtrados.
7. Descarga XML y PDF de cada factura según se requiera.

> **Recomendación:** Siempre verifica los filtros antes de exportar para asegurar que los datos sean correctos.

---

## Vistas principales
- **Filtros:** Panel superior para búsqueda avanzada de facturas.
- **Tabla de resultados:** Visualiza las facturas con sus detalles y enlaces de descarga.
- **Paginación:** Navega entre las páginas de resultados.
- **Exportación:** Botón para generar archivo Excel con las facturas filtradas.

## Campos y validaciones
- **Invoice number:** Texto libre, opcional.
- **Date from / Date to:** Fechas válidas.
- **Invoice type:** Selección entre Timbradas, Sin timbrar o Todas.
- Exportación alerta si se incluyen CFDIs timbradas.

---

## Casos de uso
- **Buscar facturas:** Aplica filtros y haz clic en Search.
- **Limpiar filtros:** Restablece los filtros a valores predeterminados.
- **Exportar Excel:** Descarga un reporte de las facturas filtradas.
- **Descargar XML/PDF:** Botones individuales para cada factura.

---

## Permisos necesarios
Para acceder y utilizar el módulo:
- **Ver facturas:** `invoices-view`
- **Exportar facturas:** `invoices-export`

---

## Errores comunes
- **Filtros vacíos:** Puede devolver muchos resultados, ralentizando la búsqueda.
- **Fechas inválidas:** Deben estar en formato válido.
- **Permisos insuficientes:** No podrás visualizar ni exportar facturas.
- **Error de servidor:** Reintenta más tarde si falla la carga o exportación.

---

## Auditoría
El sistema registra:
- Usuario que realizó la búsqueda y exportación.
- Fecha y hora de la operación.
- Archivo exportado para mantener un historial seguro.
