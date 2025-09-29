---
title: Invoices – TM Air
summary: Administración y consulta de facturas TM (aéreas) con filtros avanzados, paginación y exportación.
order: 7
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-tm-air
roles: [Administrador, Finanzas, Operaciones]
tags: [invoices, tm, air, facturacion, pagos, exportacion]
---

# Objetivo
Proporcionar un módulo centralizado para la **gestión de facturas TM de transporte aéreo**,  
con herramientas para búsqueda, filtros múltiples, validación de pagos y exportación a Excel.

# Descripción General
El módulo integra un **sistema de filtros dinámicos**, tabla interactiva de resultados y controles de navegación.  
Permite validar estados de pago, tipos de factura (Proforma o Invoice), CFDIs vinculados, notas de crédito y clientes asociados.

# Funcionalidades
- **Filtros disponibles**:
  - Rango de fechas (*Date from / Date to*).  
  - Tipo de factura (*Proforma / Invoice*).  
  - Año fiscal (prefixYears).  
  - Referencia simple o múltiple (por campo o por textarea).  
  - Cliente consignatario (con buscador avanzado).  
  - Master AWB.  
  - Estatus de eliminación.  
  - Estatus de pago (*Paid, Partial, Pending*).  
  - CFDI vinculado (*All, Pending, Linked*).  

- **Gestión de múltiples referencias**:
  - Captura de varios números de factura por líneas.  
  - Conversión automática en chips interactivos.  
  - Eliminación de referencias o folios desde interfaz.  

- **Tabla de resultados**:
  - Cabecera fija, datos paginados y búsqueda global.  
  - Columnas clave:  
    - Acciones rápidas (Ver, Previsualizar).  
    - Servicios asociados (referencias aéreas).  
    - Estado de pago y color según condición.  
    - Tipo de factura (Proforma / Invoice).  
    - Notas de crédito asociadas.  
    - Cliente y conceptos de cobro.  
    - Uso CFDI, método de pago, totales y divisa.  
    - Usuario creador y fecha de emisión.  

- **Exportación**:
  - Descarga de registros a **Excel (.xlsx)** con filtros aplicados.  
  - Archivo nombrado dinámicamente con timestamp.  

# Flujo General de Uso
1. **Acceso al módulo**  
   Desde *Invoices*, seleccionar **TM Air Invoices**.  

2. **Aplicar filtros**  
   - Definir fechas, año o cliente.  
   - Agregar referencias individuales o múltiples.  
   - Seleccionar estatus de pago o CFDI vinculado.  
   - Presionar **Search** o tecla **Enter**.  

3. **Revisión de resultados**  
   - Explorar tabla paginada.  
   - Ver estado visual de cada factura (chips de color).  
   - Revisar notas de crédito y conceptos.  

4. **Acciones disponibles**  
   - Usar **View** para detalle completo.  
   - Previsualizar factura en modal emergente.  
   - Exportar resultados a Excel.  
   - Limpiar filtros con botón **Clear**.  

# Consideraciones
- Los invoices cancelados se muestran en rojo.  
- Las facturas proforma tienen estilo diferenciado.  
- El cálculo de pagos parciales se valida en base a cargos asociados.  
- Se soportan múltiples divisas en un mismo invoice, mostrando totales por moneda.  

# Roles con Acceso
- **Administrador**: acceso completo, exportación y validaciones.  
- **Finanzas**: control de pagos, CFDIs y conciliación.  
- **Operaciones**: consulta de servicios y referencias aéreas.  

# Beneficios
- Centralización de facturación aérea TM.  
- Agilidad en búsqueda por múltiples criterios.  
- Exportación rápida de resultados para reportes financieros.  
- Identificación visual clara de estados y pagos.  
