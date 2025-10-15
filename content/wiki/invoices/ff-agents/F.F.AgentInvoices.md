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

# Layout del Componente – User Info Badge

Este componente es un badge interactivo de información de usuario que se puede añadir junto a cualquier contenido (slot). 
Su objetivo es mostrar, de manera rápida y accesible, los datos de quién creó, actualizó o eliminó un registro dentro del sistema.

Este componente funciona como un accesorio visual para mostrar la información de los usuarios que han interactuado con un registro del sistema (por ejemplo: quién lo creó, quién lo actualizó y quién lo eliminó).

# Funcionamiento general

- El componente tiene un slot de contenido principal, es decir, puedes colocar dentro cualquier información o elemento que quieras, y este contenido se mostrará acompañado de un pequeño ícono flotante de ayuda.

- Ese ícono abre un modal emergente con los detalles de los usuarios vinculados al registro.

# Botón flotante con tooltip

- Al lado del contenido aparece un ícono de usuario con un signo de interrogación.
 
- Si el usuario pasa el cursor por encima, aparece un tooltip que indica que ahí puede consultar los detalles del registro.

- Al hacer clic en el ícono, se abre una ventana modal con la información de los usuarios.

# Ventana modal de detalles

Dentro del modal se presenta una tarjeta con tres posibles secciones:

1. Created by (Creado por):

- Muestra el nombre y correo de la persona que creó el registro.

- Incluye un ícono verde como referencia visual.

- También muestra la fecha exacta en que se creó.

2. Last updated by (Última actualización por):

- Indica quién fue la última persona que modificó el registro.

- Se acompaña de un ícono ámbar.

- Muestra tanto el correo como la fecha de actualización.

3. Deleted by (Eliminado por):

- Solo aparece si el registro tiene fecha de eliminación.

- Muestra el nombre y correo de la persona que lo eliminó.

- Se marca con un ícono rojo.

- También se despliega la fecha en que se eliminó.

# Lógica interna

- El componente recibe como propiedades el objeto del registro, donde vienen los identificadores de usuarios (created_by, updated_by, deleted_by).

- Con esos datos consulta en el store de usuarios para obtener la información completa (nombre, correo, etc.).

- Se asegura de que, si no existe alguno de esos campos, esa sección no aparezca.

# Comportamiento

- El estado del modal se maneja con una variable booleana que alterna entre abierto y cerrado cuando se hace clic en el ícono.

- La información se carga automáticamente cuando el componente se monta, garantizando que los usuarios estén disponibles en el store.

