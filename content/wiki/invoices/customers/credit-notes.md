---
title: Invoices – Credit Notes
summary: Administración y consulta de Notas de Crédito de clientes asociadas a facturas TM/WM (aéreas y marítimas).
order: 5
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-credit-notes
roles: [Administrador, Finanzas, Operaciones]
tags: [invoices, credit-notes, clientes, facturacion]
---

# Objetivo
Gestionar y consultar las **Notas de Crédito de clientes**, permitiendo su emisión,
búsqueda y relación con facturas y servicios vinculados.

# Descripción General
Este módulo presenta un listado interactivo de **Customer Credit Notes**.  
Los usuarios pueden aplicar filtros para localizar notas específicas y
realizar acciones como visualización, edición o eliminación.

Cada registro incluye:
- Folio interno y folio externo.
- Cliente relacionado.
- Servicios vinculados (marítimos o aéreos).
- Factura asociada (TM o WM).
- Monto total y monto disponible.
- Usuario y fecha de creación.

# Funcionalidades
- **Filtros de búsqueda**:
  - Cliente consignatario.
  - Número de Nota de Crédito.
  - Tipo de factura (TM o WM).
  - Rango de fechas (desde / hasta).
- **Gestión de resultados**:
  - Tabla compacta con datos principales.
  - Resaltado visual de notas eliminadas.
  - Paginación con navegación fluida.
- **Acciones rápidas**:
  - Ver detalles de la nota.
  - Editar información.
  - Eliminar con confirmación.

# Flujo General de Uso
1. **Acceso al módulo**  
   Desde *Invoices*, seleccionar **Credit Notes**.
2. **Aplicar filtros**  
   - Elegir cliente, tipo de factura o fechas.  
   - Presionar **Search** o tecla **Enter**.  
3. **Revisar resultados**  
   - Explorar tabla paginada.  
   - Validar montos y facturas relacionadas.  
   - Identificar notas eliminadas por su fondo rojo.  
4. **Acciones disponibles**  
   - **View** para consultar detalle completo.  
   - **Edit** para modificar datos.  
   - **Delete** con confirmación obligatoria.  
5. **Limpiar búsqueda**  
   - Usar botón **Clear** para reiniciar filtros y recargar datos.

# Consideraciones
- La relación con facturas distingue claramente entre **TM** y **WM**, tanto en aéreo como en marítimo.
- Los servicios asociados muestran referencias (sea: reference_number, air: air_reference_number).
- Al eliminar una nota, se liberan los montos y vínculos relacionados.
- El sistema requiere confirmación explícita antes de eliminar cualquier nota.

# Roles con Acceso
- **Administrador**: acceso total al catálogo y gestión.  
- **Finanzas**: consulta, edición y eliminación.  
- **Operaciones**: revisión de notas y servicios relacionados.  

# Beneficios
- Centralización de las **Notas de Crédito de clientes**.  
- Control sobre los montos aplicados y disponibles.  
- Mayor eficiencia en conciliación financiera.  
- Transparencia en la relación entre notas, servicios y facturas.
