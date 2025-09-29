---
title: Invoices – Búsqueda de Referencias Aéreas de Exportación
summary: Catálogo de referencias de exportación aérea, con filtros para consulta de cargos y facturación.
order: 4
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-search-air-export
roles: [Administrador, Finanzas, Operaciones]
tags: [invoices, air-export, referencias, facturacion]
---

# Objetivo
Facilitar la **consulta de referencias aéreas de exportación**, permitiendo identificar cargos,
facturas TM/WM y validar el estado de las guías aéreas asociadas a cada referencia.

# Descripción General
Este módulo muestra un **listado de referencias de exportación aérea**.  
Los usuarios pueden aplicar filtros dinámicos para ubicar rápidamente referencias específicas y
consultar facturas y cargos vinculados.

Cada registro en la tabla contiene información sobre:
- Número de referencia.
- Cliente consignatario.
- Master y House AWB.
- Cargos de venta (sell concepts).
- Facturas TM y WM.
- Fecha de creación y usuario asociado.

# Funcionalidades
- **Búsqueda avanzada**:
  - Año de operación.
  - Referencia(s) múltiple(s) separadas por comas.
  - Master AWB y House AWB.
  - Cliente consignatario (Consignee).
  - Estado de facturación TM y WM.
- **Gestión de filtros**:
  - Chips dinámicos para visualizar/eliminar referencias.
  - Botón **Clear** para limpiar todos los filtros.
- **Tabla interactiva**:
  - Resultados paginados con navegación.
  - Estilo resaltado para referencias eliminadas.
  - Chips de color que indican estado de cargos y facturas.
- **Acciones rápidas**:
  - Botón de ojo para acceder al detalle de cada referencia.

# Flujo General de Uso
1. **Acceder al módulo**  
   Desde el menú de *Invoices*, seleccionar **Air Export Search**.  
2. **Aplicar filtros**  
   - Elegir el año de operación.  
   - Ingresar referencia(s) separadas por comas.  
   - Añadir filtros adicionales (AWBs, cliente, estado de facturación).  
   - Presionar **Enter** o hacer clic en **Search**.  
3. **Consultar resultados**  
   - Revisar la tabla con datos de cada referencia.  
   - Identificar fácilmente registros sin cargos o facturas mediante chips de error.  
   - Navegar entre páginas usando la paginación.  
4. **Detalle de referencia**  
   - Dar clic en el icono de **ojo** para abrir el detalle de la referencia exportada.  
5. **Reiniciar búsqueda**  
   - Usar el botón **Clear** para limpiar filtros y comenzar una nueva consulta.  

# Consideraciones
- Las referencias ingresadas con comas se gestionan automáticamente como lista múltiple.  
- Los cargos sin facturación muestran un icono de **enlace inactivo** (mdi-link-off).  
- La paginación mantiene la búsqueda activa al cambiar de página.  
- El módulo refleja únicamente operaciones de **Air Export**.  

# Roles con Acceso
- **Administrador**: control total del módulo.  
- **Finanzas**: consulta de facturación TM/WM.  
- **Operaciones**: análisis de clientes, referencias y AWBs.  

# Beneficios
- Optimización de la búsqueda de referencias aéreas exportadas.  
- Reducción de tiempos en validación de cargos y facturas.  
- Mayor control sobre las operaciones de exportación en el área financiera y operativa.  
