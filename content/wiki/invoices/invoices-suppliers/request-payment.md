---
title: Supplier CFDI – Request Payments
summary: Gestión de solicitudes de pago para facturas de proveedores (CFDIs).
order: 12
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-suppliers-cfdis
roles: [Administrador, Finanzas, Operaciones]
tags: [invoices, suppliers, cfdi, request-payment, catalogos]
---

# Objetivo
Permitir a los usuarios buscar CFDIs de proveedores, generar solicitudes de pago y gestionar anticipos asociados.

# Navegación de módulos
Se incluyen los siguientes accesos rápidos:

- **CFDI Invoices:** Lista de CFDIs de proveedores.
- **Request Payments:** Generación de solicitudes de pago.
- **Advance Payments:** Administración de anticipos.
- Iconos `mdi-circle-double` indican el módulo activo.

# Funcionalidades principales

1. **Búsqueda de facturas**
   - Filtros por proveedor, folios, fechas, tipo de comprobante y moneda.
   - Se pueden agregar múltiples folios manualmente.
   - Autocompletado para proveedores y selección de moneda.

2. **Selección de CFDIs**
   - Se pueden seleccionar todas o deseleccionar todas.
   - Se muestra estado de pago: pendiente, solicitado, pagado o cancelado.
   - Se calcula el total de CFDIs seleccionados considerando anticipos aplicables.

3. **Anticipos disponibles**
   - Se listan anticipos asociados al proveedor.
   - Solo se pueden usar los que coinciden con la moneda seleccionada.

4. **Generación de solicitud de pago**
   - Requiere seleccionar:
     - Al menos un CFDI.
     - Cuenta bancaria origen.
     - Cuenta bancaria del proveedor.
   - Permite agregar notas adicionales.
   - Se genera un registro de solicitud de pago y redirige a la vista detallada.

5. **Sincronización de CFDIs**
   - Para CFDIs no ligados a proveedores, se puede sincronizar manualmente.

# Componentes incluidos
- `ASupplierSearch` – Selección de proveedor.
- `SystemSelectBankAccount` – Cuenta bancaria origen.
- `SupplierSelectBankAccount` – Cuenta bancaria destino.
- `v-table`, `v-chip`, `v-pagination` – Listado de CFDIs y navegación.
- Botones: `ViewButton`, `EditButton`, `TrashButton`, `v-btn` para acciones.

# Observaciones
- Los CFDIs cancelados se muestran con fondo rojo.
- Los CFDIs con receptor diferente a TM se resaltan con fondo amarillo.
- Validaciones de moneda al aplicar anticipos.
- Campos y filtros reactivamente actualizan la lista de CFDIs.

# Flujo resumido
1. Seleccionar proveedor y moneda.
2. Aplicar filtros o agregar folios.
3. Seleccionar CFDIs a pagar.
4. Seleccionar cuentas bancarias origen y destino.
5. Confirmar y generar solicitud de pago.

# Notas técnicas
- Computed properties controlan módulo activo para la navegación.
- Se utilizan `ref` y `reactive` para estado de filtros y formularios.
- Métodos principales: `onClickSearch`, `addInvoiceToSearch`, `selectAllCfdis`, `onClickGenerateReq`, `syncSupplierCfdi`.
- Integración con API: `$api.suppliers` para búsquedas, sincronización y generación de pagos.

# Seguridad y permisos
- Accesible solo para roles: Administrador, Finanzas, Operaciones.
- Confirmaciones y alertas para operaciones críticas.

