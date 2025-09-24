---
title: Suppliers – Payments
summary: Módulo de proveedores enfocado en la gestión de facturas CFDI, solicitudes de pago y conciliación de servicios.
order: 3
status: stable
version: 1.0.0
updatedAt: 2025-09-11
module: payments-suppliers
roles: [Administrador, Finanzas, Operaciones]
tags: [pagos, proveedores, cfdi, facturas, suppliers]
---

# Objetivo
Administrar las facturas de proveedores (CFDI), incluyendo la solicitud de pagos, validación de servicios relacionados y control del estado de pago.

# Alcance
Incluye:
- Registro de CFDI de proveedores.  
- Solicitud de pagos (manuales y anticipados).  
- Relación de facturas con servicios marítimos/aéreos.  
- Conciliación del estado de pagos y reportes financieros.  

# Prerrequisitos
- Permisos:  
  - `payments.suppliers.view`  
  - `payments.suppliers.manage`  
  - `invoices.suppliers.cfdi`  
- Catálogos relacionados: **Suppliers**, **Monedas**, **Servicios**

# Navegación
- Menú: `Payments → Suppliers`
- Ruta: `/invoices/suppliers/cfdis/request-payment`

# Flujo general
1. Cargar facturas CFDI del proveedor.  
2. Relacionar facturas con servicios (marítimos/aéreos).  
3. Generar solicitud de pago.  
4. Validar montos y estado de la factura.  
5. Actualizar estatus (Unpaid / Paid).  

> **Nota:** Una factura debe estar ligada a un proveedor válido antes de poder solicitar pago.

## Vistas principales
- **Listado** de facturas de proveedores con filtros por folio, proveedor, fecha y estatus.  
- **Formulario** para registro/edición de CFDI y solicitud de pago.  
- **Detalle** con servicios vinculados y estado de pago.  

## Campos y validaciones (resumen)
- **Folio** *(obligatorio)*  
- **Proveedor** *(obligatorio, catálogo válido)*  
- **Monto** *(obligatorio, > 0, formato moneda válido)*  
- **Estado de pago** (Unpaid / Paid) *(sistema)*  
- **Servicios relacionados** *(opcional, recomendado)*  

## Errores comunes
- CFDI no válido o duplicado.  
- Proveedor inexistente en catálogo.  
- Monto incorrecto o sin formato válido.  
- Factura sin servicios vinculados (cuando el flujo lo requiere).  
