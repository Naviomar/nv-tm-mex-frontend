---
title: Invoices – Sea Import References
summary: Submódulo para la búsqueda y consulta de referencias marítimas de importación en facturación.
order: 9
status: stable
version: 1.0.0
updatedAt: 2025-09-26
module: invoices-sea-import
roles: [Administrador, Finanzas, Operaciones]
tags: [facturas, clientes, importación, marítimo, referencias, búsqueda]
---

# Introducción
El submódulo **Sea Import References** forma parte de la sección de facturación de clientes.  
Su función principal es permitir la **búsqueda, consulta y navegación** de referencias de importación marítima, 
facilitando el acceso al detalle de cada operación para procesos administrativos y financieros.

Este módulo está directamente relacionado con la facturación de operaciones internacionales 
y con los procesos de integración de información dentro del sistema.

# Objetivo
Centralizar en un único espacio la información de las referencias de importación marítima, 
permitiendo al usuario:
- Buscar y filtrar referencias registradas.
- Consultar el detalle de cada referencia.
- Acceder de manera rápida al historial y facturas vinculadas.

# Alcance
El módulo incluye:
- Listado general de referencias marítimas de importación.  
- Acceso directo al detalle de la referencia seleccionada.  
- Integración con el módulo **Customer Invoices**.  
- Compatibilidad con roles administrativos, de finanzas y operaciones.

# Navegación
- Menú: `Invoices → Customers → Sea Import References`  
- Ruta principal: `/invoices/search/sea-import`  
- Botón auxiliar: **Back to invoices search**, para regresar al buscador general de facturas.  

# Funcionalidades principales
- Visualización de referencias mediante la tabla `InvoiceSeaImportTable`.  
- Opción **View reference** para acceder al detalle (`/view-{id}`).  
- Uso de filtros heredados del módulo principal de facturación.  
- Integración con procesos de búsqueda y consulta de facturas.  

# Flujo general de uso
1. El usuario accede al submódulo desde el menú **Invoices → Customers**.  
2. Se carga la tabla con las referencias de importación marítima.  
3. Se pueden aplicar filtros y realizar búsquedas para acotar los resultados.  
4. Una vez localizada la referencia, se selecciona la acción **Ver referencia**.  
5. El sistema redirige al detalle de la referencia (`/view-{id}`).  
6. Desde la vista de detalle es posible consultar facturas, pagos y estatus relacionados.  
7. El usuario puede regresar al buscador general mediante el botón **Back to invoices search**.  

# Consideraciones
- El acceso está limitado según los **roles asignados** (Administrador, Finanzas u Operaciones).  
- Solo se muestran referencias registradas en el sistema TM.  
- La correcta consulta depende de la integración de información previa de importaciones.  
- Este submódulo es parte del flujo de facturación de clientes, y se conecta con otros módulos
  como **Sea Export, Air Import, Air Export y Credit Notes**.  

# Actualizaciones
- **v1.0.0 (2025-09-26):** Publicación inicial del módulo con funcionalidades de búsqueda y consulta.  
