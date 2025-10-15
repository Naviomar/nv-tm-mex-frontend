---
title: Supplier CFDIs – Introducción
summary: Administración de facturas electrónicas (CFDIs) de proveedores, con filtros avanzados y control de pagos.
order: 20
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-suppliers-cfdis
roles: [Administrador, Finanzas, Operaciones]
tags: [facturacion, proveedores, cfdi, pagos, request, catalogos]
---

# Objetivo
Centralizar el manejo de CFDIs de proveedores, incluyendo:
- Registro de nuevas facturas.
- Consulta mediante filtros avanzados.
- Control de pagos solicitados, pendientes y procesados.
- Integración con solicitudes de pago y anticipos.

# Acceso
- Menú principal: **Invoices > Suppliers > CFDIs**.
- Barra de navegación rápida:
  - **CFDI Invoices**: listado principal de CFDIs.
  - **Request payments**: solicitudes de pago.
  - **Advance payments**: anticipos de proveedores.

# Captura de un nuevo CFDI
- Botón **Add new supplier CFDI** disponible en la vista principal.
- Campos mínimos: proveedor, serie, folio, fecha y archivo XML.
- El sistema permite adjuntar CFDIs manuales en caso necesario.

# Búsqueda y filtros
El sistema ofrece filtros avanzados para localizar facturas:
- Por fechas: **invoice date**, **start date**, **end date**.
- Por proveedor: búsqueda mediante **RFC** o nombre.
- Por datos fiscales: **serie**, **folio**, **UUID**.
- Por estado de vínculo: ligado a proveedor o no.
- Por servicio: tipo (marítimo o aéreo), año y número de servicio.
- Por comprobante: ingreso, egreso, traslado, nómina o pago.
- Por importe: monto completo, parcial o no provisionado.
- Por moneda: filtrado por divisa registrada.
- Sección adicional para búsqueda por **folios múltiples**.

# Acciones disponibles
- **Search**: aplica filtros seleccionados.
- **Clear**: restablece filtros y muestra todos los registros.
- **Sync CFDI**: vincula manualmente con proveedor si aún no está asociado.
- **View/Edit/Delete**: opciones disponibles en cada CFDI.
- **Request payment**: redirige al módulo de solicitudes de pago.

# Estados de facturas
Los CFDIs se clasifican en diferentes estados:
- **Pending payment** (gris): pendiente de pago.
- **Payment requested** (amarillo): solicitud en curso.
- **Invoice paid** (verde): pagada correctamente.
- **Cancelled** (rojo): factura cancelada.

# Validaciones y reglas
- Los CFDIs deben incluir **RFC emisor** y **UUID** válidos.
- Facturas canceladas se muestran resaltadas en color.
- Si el importe provisionado es menor al CFDI, se marca como **tocado**.
- CFDIs manuales se identifican con un **chip amarillo**.

# Beneficios
- Control centralizado de todas las facturas de proveedores.
- Integración con solicitudes de pago y anticipos.
- Filtros flexibles para localizar facturas rápidamente.
- Estados visuales claros para auditoría y control financiero.
- Soporte a múltiples divisas y tipos de comprobante.

# Roles y permisos
- **Administrador**: acceso total (crear, editar, eliminar, pagos).
- **Finanzas**: puede crear CFDIs y solicitar pagos.
- **Operaciones**: puede consultar facturas y dar seguimiento.

# Notas
- Compatible con sincronización automática de CFDIs.
- Optimizado para búsquedas masivas por folios o UUID.
- Compatible con futuras mejoras en reportes financieros.
- Interfaz preparada para flujos marítimos y aéreos.
