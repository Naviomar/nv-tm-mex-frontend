---
title: Bank Movements – Gestión integral de movimientos bancarios
summary: Este módulo permite consultar, filtrar, gestionar, auditar y exportar movimientos bancarios. Incluye filtros avanzados, tabla de resultados, paginación, acciones sobre cada movimiento y visualización de pagos asociados.
order: 1
status: stable
version: 1.2.0
updatedAt: 2025-10-07
module: finance
---

# Bank Movements

El módulo de **Bank Movements** ofrece una solución integral para la gestión de los movimientos bancarios de la empresa. Permite a los usuarios **consultar, auditar, aplicar pagos y exportar información** de manera centralizada, asegurando un control completo de la actividad financiera.  

El módulo se organiza en varias secciones: filtros de búsqueda, tabla de movimientos, acciones rápidas, visualización de pagos asociados, paginación, exportación de información y manejo de cheques y notas. Cada sección facilita la operación y revisión de los movimientos bancarios de manera clara y comprensible.

---

## Filtros de búsqueda

La primera sección del módulo permite **restringir los movimientos bancarios** según múltiples criterios:

- **Identificador único (ID)**: Búsqueda de un movimiento específico.  
- **Texto libre**: Filtrado por cualquier texto en descripción, notas o referencias.  
- **Cuenta bancaria**: Selección de la cuenta asociada al movimiento.  
- **Tipo de movimiento**: Filtrado por la naturaleza de la operación (cheque, transferencia, depósito, etc.).  
- **Depósito / Retiro**: Clasificación de la operación.  
- **Monto de movimiento**: Filtrado por valor específico del movimiento.  
- **Saldo pendiente**: Filtra movimientos con saldo pendiente.  
- **Saldo utilizado**: Filtra movimientos que ya han sido utilizados en pagos.  
- **Rango de fechas**: Filtrado por periodo de tiempo.  
- **Número de referencia**: Búsqueda por número de referencia asociado.

Además, incluye **botones de acción rápida**:  
- **Limpiar filtros** → Resetea todos los filtros aplicados.  
- **Buscar** → Aplica los filtros seleccionados.  
- **Exportar Excel** → Descarga los resultados en formato Excel.  
- **Exportar por pagos** → Descarga la información agrupada por pagos aplicados.

Estos filtros facilitan la búsqueda precisa y permiten a los usuarios **enfocarse en los registros relevantes**.

---

## Tabla de movimientos

Los resultados se muestran en una **tabla interactiva** que permite visualizar los datos más importantes de cada movimiento bancario.

**Columnas principales y su significado:**

1. **Acciones rápidas**  
   - Aplicar pagos si el movimiento es utilizable.  
   - Bloquear o desbloquear el movimiento mediante notas.  
   - Acceso a notas del movimiento.  
   - Opciones futuras de aplicar notas crédito/débito.  

2. **Acciones de registro**  
   - Ver detalle completo del movimiento.  
   - Copiar identificador al portapapeles.  
   - Badge del usuario responsable.  

3. **Fecha de movimiento** → Fecha de registro del movimiento.  
4. **Banco / Cuenta bancaria** → Cuenta asociada.  
5. **Tipo de movimiento** → Naturaleza del movimiento.  
   - Para cheques: estado (pendiente, aprobado, devuelto) y posibilidad de actualizarlo.  
6. **Depósito / Retiro** → Indica la naturaleza de la operación.  
7. **Monto** → Valor de la operación con su moneda.  
8. **Saldo disponible** → Saldo restante tras el movimiento.  
9. **Descripción** → Detalle textual del movimiento.  
10. **Referencia** → Número de referencia del movimiento.  
11. **Texto adicional** → Información complementaria.  
12. **Es utilizable para pagos** → Indica si puede aplicarse para pagos.  
13. **Notas de utilización** → Comentarios relacionados con la utilización.  
14. **Usuario responsable** → Persona que registró o gestionó el movimiento.

Esta estructura permite **visualizar todos los aspectos relevantes de un movimiento** de manera clara y rápida.

---

## Pagos asociados a un movimiento

Cada movimiento puede tener uno o más **pagos asociados**, visualizables mediante un **diálogo modal**:

- **Servicio / Módulo** → Referencia del servicio, proyecto o módulo del pago.  
- **Concepto** → Nombre del cargo cobrado.  
- **Factura** → Factura vinculada al pago.  
- **ID de pago** → Identificador del pago.  
- **Monto** → Valor del pago con moneda.  
- **Fecha de pago** → Fecha y usuario responsable.

Características importantes:  
- Pagos eliminados se resaltan visualmente.  
- Total de pagos al pie de la tabla para auditoría.  
- Modal interactivo y accesible sin modificar datos originales.

Esto proporciona **transparencia y trazabilidad**, ayudando a auditar y controlar los movimientos financieros.

---

## Paginación y navegación

La tabla incluye **paginación compacta** para navegar entre páginas de resultados, con resumen del rango de registros visibles:  
*"Mostrando X a Y de Z registros en total"*.  

Esto facilita la revisión de grandes volúmenes de datos sin perder el contexto.

---

## Acciones sobre los movimientos

1. **Aplicar pagos** → Asignación de pagos a movimientos utilizable.  
2. **Bloquear / desbloquear** → Restringir o habilitar movimientos.  
3. **Ver detalle** → Acceso completo al registro.  
4. **Copiar ID** → Copiar el identificador del movimiento.  
5. **Actualizar estado de cheques** → Para cheques: pendiente, aprobado o devuelto.  
6. **Visualizar pagos asociados** → Revisión detallada de los pagos vinculados.

Estas acciones permiten **gestionar y controlar los movimientos directamente desde la interfaz**, agilizando la operación.

---

## Exportación de información

- **Exportación general** → Lista completa de movimientos filtrados.  
- **Exportación por pagos** → Información agrupada según pagos aplicados.  

Esto facilita la **generación de reportes financieros y auditorías externas**.

---

## Diálogos y formularios

- **Diálogo de cheques** → Actualización del estado de cheques, mostrando monto, fecha y hora.  
- **Diálogo de notas** → Agregar, editar o visualizar notas de un movimiento.  
- **Diálogo de pagos** → Listado detallado de pagos asociados para auditoría.

Garantiza un **flujo de trabajo intuitivo y centralizado** sin necesidad de múltiples pantallas.

---

## Integraciones y funcionalidades adicionales

- Conexión con el **backend mediante API** para obtener movimientos y filtros.  
- Uso de catálogos dinámicos para cuentas y tipos de movimiento.  
- **Notificaciones visuales** para confirmar acciones.  
- Copia rápida de identificadores mediante portapapeles.  
- Control de estados de carga para mejor experiencia.  
- Gestión completa de pagos asociados para auditoría financiera.

---

## Resumen final

El módulo de **Bank Movements** proporciona una **gestión integral de los movimientos bancarios**:

- Filtros avanzados y búsqueda precisa.  
- Visualización clara de datos relevantes.  
- Acciones rápidas para aplicar pagos, bloquear registros y actualizar cheques.  
- Diálogo de pagos asociados para auditar transacciones.  
- Exportación en Excel para reportes internos y auditorías.  
- Paginación eficiente y navegación intuitiva.

Facilita el **control financiero y la conciliación bancaria**, asegurando que cada movimiento pueda ser revisado, auditado y utilizado de manera confiable dentro del sistema.
