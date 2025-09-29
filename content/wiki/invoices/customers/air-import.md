---
title: Invoices – Air Import References
summary: Búsqueda y consulta de referencias de importación aérea.
order: 13
status: draft
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-air-import
roles: [Administrador, Finanzas, Operaciones]
tags: [invoices, referencias, importacion, aerea, busqueda, filtros]
---

# Objetivo
Permitir la **búsqueda, filtrado y visualización** de referencias de importación aérea, incluyendo información de consignatarios, guías aéreas (Master y House AWB), conceptos de venta asociados, e integración con facturas TM y WM.

# Alcance
El módulo está diseñado para:
- Localizar referencias de importación aérea mediante filtros avanzados.
- Consultar facturas asociadas en **TM** y **WM**.
- Identificar conceptos de venta y facturas proforma o definitivas.
- Acceder al detalle de cada referencia para análisis más profundo.

# Roles y Permisos
- **Administrador**: Acceso total, gestión de filtros y navegación completa.
- **Finanzas**: Consulta de facturas y validación de conceptos.
- **Operaciones**: Revisión de referencias y seguimiento de guías aéreas.

# Flujo General de Uso
1. Seleccionar los filtros iniciales (año, número de referencia, AWB, consignatario, facturas).
2. Agregar múltiples referencias manualmente (separadas por comas).
3. Ejecutar la búsqueda con el botón **Search**.
4. Visualizar resultados en tabla con paginación.
5. Consultar detalles de cada referencia:
   - Datos generales
   - Consignee
   - Master y House AWB
   - Conceptos de venta
   - Facturas TM / WM
6. Abrir el detalle de la referencia con el botón **Ver (eye)**.
7. Exportar o dar seguimiento según necesidades internas.

# Componentes Principales
- **Filtros de búsqueda**:
  - Año
  - Referencias múltiples
  - Master AWB
  - House AWB
  - Consignee
  - Facturas TM / WM (Sí/No)
- **Tabla de resultados**:
  - Acciones disponibles (Ver referencia)
  - Número de referencia
  - Consignee
  - Master / House AWB
  - Conceptos de venta
  - Facturas TM y WM
  - Fecha y usuario de registro
- **Navegación**:
  - Paginación superior e inferior
  - Chips para mostrar filtros activos
  - Botón de limpieza (**Clear**) para reiniciar búsqueda

# Ejemplo de Caso de Uso
Un analista financiero necesita validar si ciertas referencias de importación aérea ya cuentan con facturas TM o WM emitidas:
1. Ingresa la lista de referencias en el campo **Add reference #**.
2. Filtra por consignatario específico.
3. Ejecuta la búsqueda y revisa en la tabla:
   - Si existen conceptos de venta asociados.
   - Si hay facturas vinculadas.
4. Si alguna referencia carece de facturas, procede a coordinar con el área de facturación.

# Notas Técnicas
- Se utilizan componentes como:
  - **ACustomerSearch** para búsqueda de consignatarios.
  - **v-chip** para visualización de referencias múltiples y estados.
  - **v-pagination** para manejo de páginas.
  - **ServiceNumberLabel** y **UserInfoBadge** para etiquetas dinámicas.
- El consumo de datos se realiza vía `$api.invoices.getAirImportReferencias`.

# Estado Actual
- Versión inicial del módulo.
- Integración con filtros y tabla funcional.
- Pendiente mejorar exportación de datos y reportes.

---
