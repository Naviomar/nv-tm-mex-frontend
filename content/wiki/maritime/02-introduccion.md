---
title: Sea Export – Introducción
summary: Formulario y administración de referencias de exportación marítima en México.
order: 5
status: stable
version: 1.0.0
updatedAt: 2025-09-25
module: maritime-export
roles: [Administrador, Operaciones, Facturación]
tags: [maritimo, exportacion, catalogos, referencia]
---

# Objetivo
Contar con un módulo centralizado para la captura, validación y seguimiento de referencias de exportación marítima.

# Alcance
Este módulo permite gestionar:
- Información de exportación marítima de México.
- Datos de clientes (consignee, shipper, notify party, freight forwarder).
- Información de carga y contenedores.
- Tránsitos y transbordos (transhipments).
- BLs maestros y house, así como números de booking.

# Secciones del formulario
1. **Sea Export Information**
   - Fecha de cierre de documentación y días de tránsito.
   - Tipo de TM y tipo de BL.
   - Línea responsable, región y viaje de salida.
   - Puertos de origen (POL), destino (POD) y puntos intermedios.
   - Alertas de año próximo y creación de referencia para el siguiente año.

2. **Transhipment Information**
   - Agregar o eliminar transbordos con puerto y fecha.
   - Listado dinámico de transhipments.

3. **Customer Information**
   - Selección de shipper, consignee, notify party y freight forwarder.
   - Visualización de información adicional del shipper (crédito y ejecutivo activo).

4. **Cargo Information**
   - Tipo de carga, embalaje y descripción de commodities.
   - Contenedores y posicionamiento.
   - Número de validación de carga.

# Funcionalidades principales
- **Búsquedas globales** para clientes, puertos y shippers.
- **Cálculo automático** de totales de volumen, peso y paquetes.
- **Indicador de crédito vencido** para clientes basado en fecha de llegada y días de crédito.
- **Creación de referencia** mediante API con todos los datos capturados.
- **Validación de formulario** antes de guardar, mostrando alertas y errores.
- **Actualización de fecha de salida** según el viaje seleccionado.

# Consideraciones
- Algunos campos son de solo lectura y se generan automáticamente.
- Los contenedores y BLs se gestionan mediante componentes inteligentes (Smart Components).
- Las alertas y colores cambian según la vigencia del crédito y año de referencia.

# Flujo general de uso
1. Ingresar al módulo de Sea Export.
2. Capturar información básica de la exportación (fechas, tipo de TM, BL, línea y región).
3. Seleccionar clientes, puertos de origen, destino y transbordos.
4. Agregar contenedores, tipos de carga y detalles de commodities.
5. Revisar alertas de crédito y año próximo.
6. Validar el formulario y corregir errores si existen.
7. Guardar la referencia marítima.
8. Acceder a la vista de detalle de la referencia creada para seguimiento.

# Referencias
- [Schema del formulario de exportación marítima](~~/forms/maritimeReferenceForm)
- [Componente Smart para BLs](SeaExportMasterBlsSmart)
- [Catálogos de líneas, regiones y puertos](getCatalogs)
