---
title: Invoices – Sea Export References
summary: Consulta y gestión de referencias marítimas de exportación vinculadas a clientes, BLs, contenedores e invoices.
order: 6
status: stable
version: 1.0.0
updatedAt: 2025-09-28
module: invoices-sea-export
roles: [Administrador, Operaciones, Finanzas]
tags: [invoices, sea-export, referencias, maritimo, exportacion]
---

# Objetivo
Facilitar la **búsqueda y gestión de referencias de exportación marítima**, 
permitiendo visualizar información clave como consignatarios, BLs, contenedores,
conceptos de venta e invoices relacionadas.

# Descripción General
El módulo muestra un listado dinámico de **Sea Export References** con filtros avanzados,
paginación y tabla interactiva.  
Cada referencia incluye datos de cliente, BLs (Master/House), contenedores asociados,
conceptos de cobro, facturas TM/WM y fecha de creación.

# Funcionalidades
- **Filtros de búsqueda**:
  - Año de referencia.
  - Número(s) de referencia (múltiples, separados por comas).
  - Master BL y House BL.
  - Cliente consignatario.
  - Contenedor y número de booking.
  - Indicadores: con/sin facturas TM o WM.
  - Estado de eliminación (activo, eliminado).
- **Gestión de resultados**:
  - Tabla paginada con cabecera fija y altura optimizada.
  - Identificación de referencias eliminadas con fondo rojo.
  - Chips interactivos para BLs, contenedores, conceptos e invoices.
- **Acciones rápidas**:
  - Visualización de referencia con botón de acción.
  - Navegación fluida mediante paginación.
  - Limpieza de filtros en un solo clic.

# Flujo General de Uso
1. **Acceso al módulo**  
   Desde *Invoices*, seleccionar **Sea Export References**.
2. **Aplicar filtros**  
   - Definir año, cliente, BLs o contenedor.  
   - Ingresar múltiples referencias separadas por comas.  
   - Elegir si se desean referencias con/sin invoices TM o WM.  
   - Presionar **Search** o tecla **Enter**.  
3. **Revisión de resultados**  
   - Explorar tabla con referencias.  
   - Identificar chips de BLs, contenedores y conceptos.  
   - Validar facturas asociadas (TM y WM) o detectar ausencia.  
4. **Acciones disponibles**  
   - Usar botón **View** para consultar detalle completo.  
   - Cambiar página mediante **paginación interactiva**.  
   - Eliminar filtros con **Clear** para reiniciar búsqueda.  
5. **Validación visual**  
   - Registros eliminados resaltados en rojo.  
   - Chips de conceptos muestran iconos de enlace activo o inactivo.

# Consideraciones
- Los conceptos de venta distinguen si están ligados a una factura (icono y color).  
- Los invoices TM y WM se presentan con número e indicador (Invoice o Proforma).  
- La carga de datos se actualiza automáticamente al limpiar filtros o cambiar de página.  
- El módulo soporta búsqueda global de consignatarios para mayor precisión.

# Roles con Acceso
- **Administrador**: control total sobre filtros, visualización y gestión.  
- **Operaciones**: consulta de referencias, BLs, contenedores y conceptos.  
- **Finanzas**: validación de invoices y conciliación de cargos.

# Beneficios
- Centralización de información de exportaciones marítimas.  
- Rapidez en la búsqueda de referencias por múltiples criterios.  
- Visualización clara de facturas y cargos asociados.  
- Mayor control operativo y financiero en procesos de exportación.
