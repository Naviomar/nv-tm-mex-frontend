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
En esta sección se describen los aspectos técnicos más relevantes del módulo de notas de crédito, explicando la forma en que está construido y cómo funciona internamente:

- Interfaz de usuario y componentes visuales
El módulo está diseñado para facilitar la consulta, búsqueda y administración de las notas de crédito. Se utilizan campos de selección, entradas de texto y controles de paginación que permiten al usuario interactuar de manera clara y ordenada. La interfaz ofrece además botones de acción para visualizar detalles o eliminar registros de manera rápida.

- Gestión de datos y filtros
El sistema permite aplicar filtros personalizados para localizar notas de crédito específicas, ya sea por número de documento, línea de transporte, fechas de emisión o cualquier otro criterio habilitado. Estos filtros se combinan con un esquema de paginación que optimiza la navegación, evitando que el usuario tenga que desplazarse por listados extensos de información.

- Catálogos de referencia
Las notas de crédito están vinculadas a catálogos maestros, como el de líneas de flete. Esto garantiza consistencia en la información y reduce el riesgo de errores al momento de asociar registros. Los catálogos se cargan automáticamente para que estén disponibles durante la creación o consulta de documentos.

- Procesos principales
El flujo técnico contempla la recuperación de notas de crédito desde la base de datos, aplicando los filtros y condiciones de búsqueda definidos por el usuario. Una vez obtenidos los resultados, estos se presentan en un listado ordenado y navegable. Además, se contemplan acciones puntuales como la visualización detallada de la nota y la eliminación de registros que ya no sean necesarios.

- Seguridad y validaciones
Para garantizar la integridad de la información, el módulo implementa validaciones en los campos de entrada y controles en las operaciones sensibles, como la eliminación de notas. Esto asegura que únicamente los datos correctos puedan ser procesados y que las acciones críticas estén protegidas.

- Escalabilidad del diseño
La arquitectura del módulo está pensada para crecer. Esto significa que pueden añadirse nuevos filtros, catálogos o acciones sin necesidad de reestructurar el sistema completo. Así, se asegura que la herramienta pueda adaptarse a futuras necesidades del negocio.

# Beneficios
- Centralización de notas de crédito por línea de flete.
- Filtrado eficiente por fecha, línea o número de nota.
- Visualización rápida de notas relacionadas con facturas de línea.
- Control de eliminación con confirmación para prevenir errores.

# Notas
- Solo usuarios con rol **Administrador** o **Facturación** pueden crear o eliminar notas.
- El sistema muestra la disponibilidad de monto restante para cada nota de crédito.
