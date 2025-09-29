---
title: Invoices – WM Air
summary: Gestión de facturas WM de transporte aéreo con filtros, paginación y exportación.
order: 8
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-wm-air
roles: [Administrador, Finanzas, Operaciones]
tags: [invoices, wm, air, facturacion, pagos, exportacion]
---

# Objetivo
Centralizar la **gestión de facturas WM aéreas**, con herramientas de búsqueda avanzada,  
visualización de pagos, notas de crédito y exportación de resultados.

# Descripción General
El módulo ofrece filtros dinámicos, tabla interactiva de resultados y paginación.  
Permite validar pagos, consultar tipos de factura (Proforma/Invoice), servicios asociados y clientes.

# Funcionalidades
- **Filtros disponibles**:
  - Rango de fechas (*from / to*).  
  - Tipo de factura (*Proforma / Invoice*).  
  - Año fiscal.  
  - Referencias simples o múltiples (textarea y chips).  
  - Cliente consignatario.  
  - Master AWB.  
  - Estatus de eliminación.  
  - Estatus de pago (*Paid, Partial, Pending*).  

- **Gestión de múltiples referencias**:
  - Captura por línea y conversión a chips interactivos.  
  - Eliminación de referencias o folios desde interfaz.  

- **Tabla de resultados**:
  - Cabecera fija, datos paginados y búsqueda global.  
  - Columnas principales:  
    - Acciones (Ver, Previsualizar).  
    - Número de factura.  
    - Servicios asociados (referencias aéreas o free format).  
    - Estado de pago con color distintivo.  
    - Tipo de factura y facturas vinculadas eliminadas.  
    - Notas de crédito asociadas.  
    - Cliente, conceptos de cobro, totales y divisas.  
    - Usuario creador y fecha de emisión.  

- **Exportación**:
  - Descarga de registros a **Excel (.xlsx)** con filtros aplicados.  
  - Archivo nombrado automáticamente con timestamp.  

# Flujo General de Uso
1. **Acceso**: Invoices → WM Air Invoices.  
2. **Aplicar filtros**: fechas, cliente, referencias, estatus y tipo de factura.  
3. **Revisión de resultados**: tabla paginada, chips de estado y notas de crédito.  
4. **Acciones disponibles**: ver factura, previsualizar, exportar a Excel o limpiar filtros.  

# Consideraciones
- Facturas canceladas se muestran en rojo.  
- Facturas proforma con estilo diferenciado.  
- Pagos parciales calculados por cargos asociados.  
- Múltiples divisas soportadas, mostrando totales por moneda.  

# Roles con Acceso
- **Administrador**: acceso completo, exportación y validaciones.  
- **Finanzas**: control de pagos, conciliación y estatus de factura.  
- **Operaciones**: consulta de servicios y referencias aéreas.  

# Beneficios
- Centralización de facturación aérea WM.  
- Búsqueda ágil por múltiples criterios.  
- Exportación rápida para reportes financieros.  
- Identificación visual clara de estados y pagos.
