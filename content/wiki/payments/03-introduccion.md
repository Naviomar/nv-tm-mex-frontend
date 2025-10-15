---
title: Suppliers – CFDI & Payments
summary: Módulo para gestionar facturas CFDI de proveedores y solicitudes de pago, incluyendo anticipos y conciliación.
order: 12
status: stable
version: 1.0.0
updatedAt: 2025-09-25
module: payments-suppliers
roles: [Administrador, Finanzas, Operaciones]
tags: [pagos, proveedores, cfdi, facturas, suppliers, solicitudes]
---

# Objetivo
Administrar las facturas CFDI de proveedores y generar solicitudes de pago, incluyendo anticipos y control del estado de pago.

# Alcance
Incluye:
- Registro y listado de CFDI de proveedores.  
- Solicitud de pagos (manuales y anticipados).  
- Relación de facturas con servicios relacionados.  
- Conciliación y actualización del estado de pagos.  

# Prerrequisitos
- Permisos necesarios:  
  - `payments.suppliers.view`  
  - `payments.suppliers.manage`  
  - `invoices.suppliers.cfdi`  
- Catálogos relacionados: **Suppliers**, **Monedas**, **Servicios**

# Navegación
- Menú: `Payments → Suppliers`  
- Rutas principales:  
  - `/invoices/suppliers/cfdis` → CFDI Invoices  
  - `/invoices/suppliers/cfdis/request-payment` → Request Payments  
  - `/advance-payments` → Advance Payments  

# Flujo general
1. Filtrar facturas por proveedor, folio, moneda o rango de fechas.  
2. Seleccionar facturas a pagar y anticipos aplicables.  
3. Ingresar notas y seleccionar bancos de origen y beneficiario.  
4. Validar montos y moneda de anticipos.  
5. Generar solicitud de pago y redirigir a vista de detalle.  

> **Nota:** Una factura debe estar ligada a un proveedor válido antes de poder solicitar pago.  

# Vistas principales
- **Listado de facturas:** Filtros por folio, proveedor, fecha, moneda y estado.  
- **Formulario de solicitud de pago:** Selección de facturas, anticipos, notas y bancos.  
- **Detalle de solicitud:** Muestra CFDIs seleccionados, anticipos aplicados y bancos involucrados.  

# Campos y validaciones (resumen)
- **Folio / Número de factura** *(obligatorio)*  
- **Proveedor** *(obligatorio, catálogo válido)*  
- **Moneda** *(obligatorio)*  
- **Monto total seleccionado** *(calculado automáticamente, restando anticipos aplicables)*  
- **Estado de pago** (Unpaid / Paid) *(sistema)*  
- **Notas** *(opcional)*  
- **Bancos** *(origen y beneficiario, obligatorios para generar solicitud)*  

# Funcionalidades adicionales
- Agregar folios manualmente o eliminar individuales.  
- Seleccionar/deseleccionar todas las facturas.  
- Vaciar resultados de búsqueda.  
- Alertas tipo snackbar para errores o información.  
- Indicadores visuales de selección, estado de pago y moneda.  

# Errores comunes
- CFDI no válido, duplicado o sin proveedor asignado.  
- Monto incorrecto o sin formato válido.  
- Selección de anticipos en distinta moneda.  
- No seleccionar banco origen o beneficiario antes de generar solicitud.
