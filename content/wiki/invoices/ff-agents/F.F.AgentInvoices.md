---
title: F.F. Agent Invoices Notes
summary: Gestión de notas de facturación de Freight Forwarders con visualización, filtros y PDF.
order: 9
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-ffagents
roles: [Administrador, Finanzas, Operaciones]
tags: [ffagents, invoices, notas, pagos, pdf, exportacion]
---

# Objetivo
Centralizar la **gestión de notas de facturación de agentes de carga (F.F. Agents)**  
permitiendo su búsqueda, visualización de detalles, estados de pago y exportación.

# Descripción General
El módulo permite filtrar notas por agente, referencia, servicio, tipo y folios múltiples.  
Se muestra tabla paginada con información clave, botones de acciones y acceso a PDF.

# Funcionalidades
- **Filtros disponibles**:
  - Freight Forwarder.  
  - Sea reference number.  
  - Linked to service.  
  - Tipo de nota (Credit / Debit).  
  - Búsqueda de folios múltiples (textarea + chips).  

- **Tabla de resultados**:
  - Columnas principales: Actions, Locked, Folio, F.F. Agent, Type, Credit/Debit,  
    Service type, Service Ref #, Req. Payment, Invoice date, Amount, Attachment, System Id, Created by.  
  - Iconos visuales para acciones (ver detalle, PDF).  
  - Estados de pago destacados con colores (Pending / Paid).  

- **Detalle de nota**:
  - Información general: folio, agente, tipo, estado de pago y bloqueo.  
  - Referencia vinculada y sistema ID.  
  - Total de la nota y tipo de moneda.  
  - Tasa de cambio (si aplica).  
  - Notas adicionales y creador con fecha.  
  - Solicitudes de pago con botones a detalle de pago.  
  - PDF preview integrado en modal.  
  - Cancelación de nota con razón y usuario que canceló.  

- **Invoice detail**:
  - Tabla con conceptos, monto y moneda de cada cargo asociado a la nota.  

# Flujo General de Uso
1. Acceder a **Invoices → F.F. Agent Notes**.  
2. Aplicar filtros según agente, referencia, servicio o folios múltiples.  
3. Revisar resultados en tabla paginada con visualización de pagos y bloqueo.  
4. Seleccionar nota para ver detalles completos y conceptos de facturación.  
5. Visualizar o descargar PDF de la nota.  
6. Consultar solicitud de pago y estado asociado.  

# Consideraciones
- Notas canceladas se muestran en alerta roja con motivo de cancelación.  
- Pagos pendientes resaltados en color púrpura.  
- Bloqueo visual con íconos de candado según estado de verificación.  
- PDF se genera dinámicamente y se visualiza en modal.  

# Roles con Acceso
- **Administrador**: acceso completo, validación de pagos y descargas PDF.  
- **Finanzas**: consulta de pagos y solicitud de pagos.  
- **Operaciones**: revisión de referencias y detalles de notas.  

# Beneficios
- Centralización de notas de F.F. Agents.  
- Visualización rápida de pagos y estado de bloqueo.  
- Descarga e impresión de notas en PDF.  
- Búsqueda avanzada por múltiples criterios y folios.
