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

# Módulo: Supplier – Request Payments

Este módulo forma parte del sistema de CFDIs de proveedores (Supplier CFDI), dentro del apartado de Facturas y pagos de proveedores.

---

**Propósito general**

Permitir al usuario consultar, crear y gestionar solicitudes de pago hacia los proveedores registrados en el sistema.
Estas solicitudes se basan en los CFDIs de proveedores previamente registrados, y sirven como punto de partida para autorizar o programar pagos.

---

**Estructura general de la vista**

La pantalla está organizada de la siguiente manera:

**1. Encabezado funcional común**
Incluye el componente de navegación SupplierCfdiModuleLinks, que muestra accesos rápidos a los submódulos de CFDI de proveedores:

- CFDI Invoices (facturas CFDI)

- Request payments (solicitudes de pago)

- Advance payments (anticipos)

- New payment request (nuevo registro manual)

**2. Título de la vista**
Muestra el encabezado "Supplier – Request payments", indicando que el usuario se encuentra en la sección de solicitudes de pago a proveedores.

**3. Acción principal disponible**
Un botón con la etiqueta “Request new payment”, que redirige a la pantalla de creación de una nueva solicitud de pago.
Su ruta es:
/invoices/suppliers/cfdis/request-payment/new

**4. Tabla principal de solicitudes**
La sección central contiene el componente SupplierRequestPaymentsTable, que muestra el listado de solicitudes existentes con información como:

- Proveedor

- Número de CFDI

- Monto solicitado

- Estado de aprobación o pago

- Fecha de registro y usuario responsable

---

# Componente relacionado: SupplierCfdiModuleLinks

Es un componente de navegación contextual que facilita el desplazamiento entre los distintos submódulos del sistema de Supplier CFDIs.
Su objetivo es mantener una experiencia fluida y unificada entre las operaciones de facturación y pagos.

---

**Elementos que contiene**

**1. Botón “Back”**
Permite regresar a la vista anterior del navegador.

**2. Indicador de contexto**
Muestra el texto “Supplier CFDI modules ➡️”, seguido de los botones de navegación.

**3. Botones de acceso rápido:**

- CFDI Invoices → lleva al listado principal de facturas CFDI de proveedores.
Ruta: /invoices/suppliers/cfdis

- Request payments → abre el listado de solicitudes de pago.
Ruta: /invoices/suppliers/cfdis/request-payment

- New payment request → (por ahora oculto) permite crear manualmente una nueva solicitud.
Ruta: /invoices/suppliers/cfdis/request-payment/new

- Advance payments → dirige al módulo de anticipos a proveedores.
Ruta: /advance-payments

**4. Indicadores visuales dinámicos**
Cada botón puede mostrar un ícono circular de estado cuando el usuario se encuentra actualmente dentro de ese módulo.
Esto se determina automáticamente comparando la ruta activa del sistema con las rutas configuradas.

---

**Resumen funcional conjunto**

| Elemento                         | Descripción                                                                 | Tipo                |
| -------------------------------- | --------------------------------------------------------------------------- | ------------------- |
| **Supplier – Request payments**  | Pantalla de gestión de solicitudes de pago a proveedores basadas en CFDIs.  | Vista principal     |
| **SupplierCfdiModuleLinks**      | Barra de navegación entre módulos CFDI de proveedores.                      | Componente auxiliar |
| **SupplierRequestPaymentsTable** | Tabla que lista todas las solicitudes registradas con sus datos relevantes. | Subcomponente       |
| **Request new payment**          | Acción que abre el formulario para registrar una nueva solicitud.           | Botón de acción     |

---

**Flujo típico de uso**

1. El usuario accede al módulo “Request payments”.

2. Revisa las solicitudes registradas en la tabla.

3. Si desea generar una nueva solicitud, presiona “Request new payment”.

4. Es redirigido al formulario para capturar los detalles del nuevo pago.

5. Desde el encabezado puede cambiar rápidamente a los módulos de CFDI Invoices o Advance payments según la necesidad.

---

# Módulo: Supplier Request Payments Table

Pertenece al submódulo Request Payments del sistema de Supplier CFDIs (Facturas CFDI de proveedores).

---

**Propósito**

Este módulo permite visualizar, filtrar, paginar y gestionar las solicitudes de pago a proveedores.
Desde esta interfaz, los usuarios pueden:

- Buscar solicitudes específicas.

- Ver detalles de cada solicitud.

- Identificar servicios asociados.

- Consultar montos pagados y pendientes.

- Cancelar solicitudes de pago con comentarios justificativos.

---

**Estructura funcional**

**1. Panel de filtros**

Ubicado al inicio de la vista, este bloque permite aplicar criterios de búsqueda sobre las solicitudes registradas.
Incluye los siguientes campos:

**- Folio:** número identificador de la solicitud.

**- Proveedor:** buscador dinámico mediante el componente ASupplierSearch, que permite seleccionar un proveedor registrado.

**- Fecha desde / Fecha hasta:** rango temporal para filtrar por fecha de creación.

También se incluyen dos botones de acción:

**- Clear** → Limpia todos los filtros y recarga la información completa.

**- Search** → Aplica los filtros seleccionados y actualiza la tabla.
Además, se puede presionar Enter para ejecutar la búsqueda rápidamente.

---

**2. Listado de solicitudes (tabla principal)**

El corazón del módulo es una tabla con paginación que muestra las solicitudes obtenidas desde la API.
Cada fila representa una solicitud de pago a proveedor con información clave:

| Columna         | Descripción                                                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actions**     | Contiene botones de acción, como “ver detalles” o “eliminar” (cancelar).                                                                                    |
| **Folio**       | Identificador único del registro de solicitud.                                                                                                              |
| **Supplier**    | Nombre del proveedor asociado.                                                                                                                              |
| **Services**    | Listado de servicios o referencias vinculadas al pago (muestra chips con los números de referencia).                                                        |
| **Amount**      | Monto total solicitado, con formato de moneda y tipo de divisa.                                                                                             |
| **Amount paid** | Monto total ya pagado, si aplica.                                                                                                                           |
| **Pay status**  | Estado del pago, representado con chips de color verde (Paid) o rojo (Unpaid). Incluye un subcomponente que permite ver detalles de los pagos relacionados. |
| **Created at**  | Fecha de creación de la solicitud, junto con el usuario que la registró (a través del componente `UserInfoBadge`).                                          |

Los registros cancelados se muestran con un color de fondo distintivo (rojo tenue), para indicar su estado inactivo.

---

**3. Paginación**

Se muestra tanto arriba como abajo de la tabla, permitiendo navegar entre páginas de resultados.
El número de páginas y el estado actual se obtienen del backend mediante la respuesta de la API.

---

**4. Diálogo de cancelación**

Cuando el usuario elige cancelar una solicitud, aparece una ventana modal que muestra:

- El número de folio afectado.

- Un campo de texto para ingresar comentarios obligatorios justificando la cancelación.

- Botones para cerrar o confirmar la acción.

La confirmación realiza una llamada al endpoint correspondiente de la API (cancelSupReqPayment), marcando la solicitud como cancelada y actualizando la tabla.

---

**Componente: Invoice Charge Payments View**

Este componente se utiliza dentro del módulo de Solicitudes de pago a proveedores (Supplier Request Payments) para mostrar los pagos asociados a una factura específica.
Se integra dentro de la tabla de solicitudes de pago y se activa mediante un botón “Show payments”.

---

**Propósito**

Proporcionar al usuario un resumen detallado de todos los pagos asociados a las facturas de un proveedor, incluyendo montos, tipos de pago y fechas.
Permite visualizar de manera rápida:

- Todos los pagos realizados.

- Monto total acumulado.

- Estado de los pagos (activos o eliminados).

---

**Estructura funcional**

**1. Botón de acceso**

- Solo se muestra si existen pagos asociados (hasPayments = true).

- Botón con etiqueta “Show payments” y color destacado (ámbar) para llamar la atención.

- Al presionar, se abre el diálogo que contiene la lista de pagos.

**2. Diálogo de pagos**

Ventana modal con tamaño máximo de 800px y color de encabezado ámbar, que incluye:

- Título: muestra el ícono de pago y la cantidad total de pagos (Payments (N)).

- Tabla de pagos: lista todos los pagos asociados a la factura.

  - Columnas:

    - Payment type: tipo de pago, con enlace al detalle si aplica.

    - Payment ID: identificador único del pago.

    - Amount: monto pagado, con moneda y formato.

    - Payment Date: fecha de registro del pago y usuario responsable.

  - Los pagos eliminados se destacan con un color de fondo rojo tenue para indicar que ya no son activos.

- Fila de total: suma automática de todos los montos de pago en la tabla, para mostrar el total pagado de la factura.

- Acciones del diálogo: botón Close para cerrar la ventana modal.

---

**Lógica funcional**

- Extracción de pagos: se recopilan todos los pagos de todas las cargas (charges) de la factura.

- Validación de existencia: solo se muestra el botón si hay al menos un pago registrado.

- Cálculo de totales: se suman automáticamente los montos de todos los pagos para mostrar el total.

- Apertura del diálogo: al hacer clic en el botón “Show payments”, se activa la ventana modal.

---

# Módulo: Advance Payments – Gestión de Pagos Anticipados

Este módulo permite la gestión y visualización de pagos anticipados realizados a proveedores.
Se accede a través del módulo de pagos anticipados en el sistema.

---

**Propósito**

Permite a los usuarios:

- Filtrar y consultar pagos anticipados por folio, proveedor y fechas.

- Visualizar todos los pagos anticipados existentes, su estado y servicios asociados.

- Gestionar acciones sobre los pagos: ver detalle, cancelar pagos si es necesario.

- Mantener un registro completo del historial de pagos anticipados.

---

**Estructura funcional**

**1. Filtros**

Permite acotar los registros mostrados en la lista:

- Folio: número identificador del pago anticipado.

- Proveedor: selección mediante búsqueda.

- Fecha desde / hasta: rango de fechas de creación del pago.

Botones disponibles:

- Clear: limpia todos los filtros.

- Search: aplica filtros y actualiza la lista de pagos.

---

**2. Tabla de Pagos Anticipados**

Muestra los pagos anticipados existentes con la siguiente información:

| Columna             | Descripción                                                         |
| ------------------- | ------------------------------------------------------------------- |
| **Actions**         | Permite ver detalles del pago o cancelarlo si no ha sido eliminado. |
| **Folio**           | Número de referencia del pago anticipado.                           |
| **Supplier**        | Nombre del proveedor beneficiario.                                  |
| **Services linked** | Lista de servicios asociados al pago.                               |
| **Amount**          | Monto del pago anticipado y moneda asociada.                        |
| **Status**          | Indica si la factura asociada está pagada o pendiente.              |
| **Created at**      | Fecha de creación del pago y usuario que lo registró.               |

- Los pagos eliminados se muestran resaltados en rojo.

- Si no hay servicios asociados o registros, se indica que no se encontraron registros.

---

**3. Acciones sobre los pagos**

- Ver detalle: permite abrir la vista completa del pago anticipado.

- Cancelar pago: abre un diálogo de confirmación que solicita comentarios antes de realizar la acción.

Diálogo de confirmación:

- Muestra el folio del pago anticipado.

- Solicita comentarios obligatorios para la cancelación.

- Botones: Cerrar y Confirmar.

---

**Funciones principales**

- **Consulta de pagos:** permite obtener los pagos anticipados aplicando filtros y paginación.

- **Filtrado y búsqueda:** acota la lista de pagos por folio, proveedor y fechas.

- **Paginación:** permite navegar entre diferentes páginas de registros.

- **Visualización de detalles:** muestra información completa de un pago seleccionado.

- **Cancelación de pagos:** elimina un pago anticipado previo registro de comentarios.

---

Componentes clave

- **Búsqueda de proveedor:** facilita seleccionar un proveedor mediante autocompletado.

- **Vista de pagos de factura:** muestra el detalle de pagos asociados a la factura del pago anticipado.

- **Badge de usuario:** muestra información del usuario que creó el pago y fecha.

- **Botones de acción:** permiten ver detalles o cancelar pagos.

- **Tabla y paginación:** muestran los registros de forma ordenada y navegable.

---

**Resumen general**

| Categoría              | Descripción                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Módulo**             | Advance Payments                                                                                              |
| **Propósito**          | Consultar, filtrar y gestionar pagos anticipados a proveedores.                                               |
| **Interfaz principal** | Filtros, tabla de pagos con detalles, acciones y diálogo de cancelación.                                      |
| **Usuarios objetivo**  | Finanzas, contabilidad y operaciones.                                                                         |
| **Resultado esperado** | Gestionar de forma segura y trazable todos los pagos anticipados, con control de estado y registro histórico. |

---

# Módulo: Supplier Invoices – Factra incoming CFDIs

Se accede desde el módulo de facturas de proveedores, específicamente para gestionar CFDIs (Comprobantes Fiscales Digitales por Internet) entrantes.

---

**Propósito**

Permite a los usuarios:

- Consultar y filtrar CFDIs de proveedores de manera detallada.

- Gestionar la información de cada CFDI, incluyendo descarga de XML y PDF.

- Vincular CFDIs con proveedores registrados en el sistema.

- Solicitar pagos y controlar el estado de cada CFDI.

- Mantener un registro histórico y trazable de todas las facturas de proveedores.

---

**Estructura funcional**

**1. Filtros**

Los filtros permiten acotar la búsqueda de CFDIs según múltiples criterios:

- **Fechas:**

  - **Invoice date:** fecha de emisión de la factura.

  - **Start date / End date:** rango de fechas para buscar facturas.

- **Proveedor:** búsqueda mediante autocompletado.

- **Serie y Folio:** para localizar facturas específicas.

- **RFC Emisor / CFDI UUID:** identificación del emisor o del CFDI.

- **Vinculación a proveedor:** filtra CFDIs que ya están ligados o no a proveedores registrados.

- **Tipo de comprobante:** Ingreso, Egreso, Traslado, Nómina, Pago.

- **Monto provisionado:** filtra según la cantidad total provisionada en el sistema.

- **Moneda:** permite filtrar por tipo de moneda.

- **Servicios asociados:** filtra por tipo de servicio (marítimo o aéreo), año y número de servicio.

- **Folios adicionales:** permite agregar múltiples folios para la búsqueda.

Botones disponibles:

- **Clear:** limpia todos los filtros.

- **Search:** aplica los filtros y actualiza la lista de CFDIs.

---

**2. Tabla de CFDIs**

Muestra la lista de CFDIs con la siguiente información:

| Columna                        | Descripción                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| **Actions**                    | Permite ver, editar, eliminar, o sincronizar CFDIs según estén vinculados a proveedores. |
| **XML / PDF**                  | Descarga de los archivos adjuntos del CFDI.                                              |
| **# Req payment**              | Número de solicitud de pago asociada (si aplica).                                        |
| **Reissued**                   | Indica si el CFDI ha sido reemitido.                                                     |
| **Serie-Folio**                | Serie y folio de la factura.                                                             |
| **Emisor / Proveedor**         | RFC y nombre del emisor; indica si está vinculado a un proveedor.                        |
| **Receptor**                   | RFC y nombre del receptor.                                                               |
| **Tipo de comprobante (T.C.)** | Clasificación de la factura (Ingreso, Egreso, Traslado, etc.).                           |
| **Total CFDI**                 | Monto total de la factura y moneda.                                                      |
| **Provisioned**                | Monto provisionado dentro del sistema.                                                   |
| **Concepts**                   | Conceptos o cargos asociados al CFDI.                                                    |
| **Invoice date**               | Fecha de emisión del CFDI.                                                               |
| **Created at**                 | Fecha de registro en el sistema.                                                         |
| **Last modified**              | Última fecha de modificación.                                                            |
| **Cancelled?**                 | Indica si el CFDI ha sido cancelado.                                                     |

- Los registros cancelados se resaltan en rojo, y los CFDIs pendientes o con pagos solicitados tienen indicadores visuales.

- La tabla permite paginación para navegar entre múltiples registros.

---

**3. Acciones disponibles**

- **Ver detalle:** permite abrir la vista completa de un CFDI.

- **Editar:** abre la interfaz para modificar información del CFDI (si aplica).

- **Eliminar / Restaurar:** solicita confirmación antes de eliminar o restaurar un CFDI.

- **Sincronizar con proveedor:** permite vincular un CFDI con un proveedor existente en el sistema.

- **Solicitar pago:** redirige al módulo de solicitudes de pago para generar la operación correspondiente.

Indicadores visuales:

- **Pendiente de pago** (gris)

- **Pago solicitado** (amarillo)

- **Factura pagada** (verde)

- **Cancelada** (rojo)

---

**Funciones principales**

- **Consulta y filtrado de CFDIs:** búsqueda avanzada mediante múltiples criterios.

- **Gestión de pagos:** solicita pagos de CFDIs directamente desde la interfaz.

- **Visualización de archivos:** permite descargar XML y PDF de cada factura.

- **Vinculación con proveedores:** asegura que cada CFDI tenga un proveedor asociado.

- **Control de estado:** seguimiento de pagos, reemisiones y cancelaciones.

- **Paginación:** navegación entre páginas de registros para un manejo eficiente de grandes volúmenes de CFDIs.

---

**Resumen general**

| Categoría              | Descripción                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Módulo**             | Supplier Invoices – Factra incoming CFDIs                                                                                     |
| **Propósito**          | Consultar, filtrar y gestionar facturas de proveedores CFDIs.                                                                 |
| **Interfaz principal** | Filtros avanzados, tabla de CFDIs con acciones, indicadores de estado y paginación.                                           |
| **Usuarios objetivo**  | Finanzas, contabilidad y operaciones.                                                                                         |
| **Resultado esperado** | Gestionar todas las facturas de proveedores de forma trazable, vinculando pagos y asegurando la integridad de la información. |
