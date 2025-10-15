---
title: Request Payment – Suppliers
summary: Permite buscar facturas de proveedores, seleccionar CFDIs y generar solicitudes de pago.
order: 12
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-suppliers
roles: [Administrador, Finanzas]
tags: [facturacion, suppliers, request-payment, cfdi]
---

# Objetivo
Facilitar la búsqueda de facturas de proveedores, seleccionar CFDIs y anticipos disponibles, y generar solicitudes de pago.

# Funcionalidades principales
- Buscar CFDIs por proveedor, folios, fecha o moneda.
- Selección individual o masiva de facturas.
- Mostrar anticipos disponibles y permitir sumarlos a la solicitud.
- Completar información adicional: notas, cuenta de origen y cuenta beneficiaria.
- Generar la solicitud de pago y redirigir a la vista del detalle.

# Pantalla principal
- **Filtros de búsqueda:** proveedor, folios, fechas y moneda.
- **Botones de acción:** Search, Check all, Uncheck all.
- **Resultados:** tabla de CFDIs con información relevante (serie/folio, proveedor, tipo de comprobante, fecha y monto).
- **Selección de CFDIs:** checkbox para marcar las facturas a pagar.
- **Anticipos:** se muestran solo si hay disponibles, y solo se suman si la moneda coincide.
- **Resumen:** monto total seleccionado en la moneda de la solicitud.
- **Información adicional:** notas de la solicitud, cuenta de origen y datos bancarios del proveedor.

# Navegación del módulo
- Breadcrumb o barra de módulos con botones rápidos:
  - CFDI Invoices
  - Request Payments (actual)
  - Advance Payments

# Reglas de negocio
- No se puede generar solicitud sin seleccionar proveedor, moneda, CFDIs y cuentas bancarias.
- Facturas de tipo 'E' se consideran negativas al calcular totales.
- Anticipos solo se aplican si la moneda coincide con la de la solicitud.
- Se permite agregar folios manualmente o mediante búsqueda por rango de fechas.

# Flujo de operación
1. Seleccionar proveedor y moneda.
2. Agregar folios o definir rango de fechas.
3. Ejecutar búsqueda y seleccionar CFDIs.
4. Revisar anticipos disponibles y seleccionar si aplica.
5. Completar notas y elegir cuentas bancarias.
6. Generar solicitud de pago.

# Beneficio
Optimiza el proceso de solicitud de pagos a proveedores, evitando errores y duplicidades, y mantiene registro de anticipos y facturas seleccionadas.
