---
title: Payments – Introducción
summary: Módulo para la gestión de pagos a proveedores y terceros.
order: 4
status: stable
version: 1.0.0
updatedAt: 2025-09-09
module: payments
roles: [Administrador, Finanzas]
tags: [modulos, pagos, finanzas]
---

# Módulo de Pagos y Conciliaciones de Freight Forwarders (F.F. Agents)
**Descripción general**

Esta sección forma parte del sistema de gestión financiera de agentes de carga internacional (Freight Forwarders).
Su propósito es controlar, conciliar y registrar pagos relacionados con los agentes que participan en operaciones marítimas, terrestres o aéreas.

El módulo se divide en varias subsecciones o accesos directos (módulos internos), permitiendo a los usuarios navegar fácilmente entre diferentes herramientas de pago, conciliación, y reportes.

---

**Objetivo**

Proporcionar una interfaz unificada donde los usuarios puedan:

- Visualizar los saldos y estados de cuenta (SOA) de los agentes.

- Registrar y consultar pagos realizados.

- Generar reportes financieros.

- Mantener un seguimiento de las operaciones entre los agentes y la empresa.

---

**Estructura de la pantalla**

La vista se compone de dos secciones principales:

1. Barra de navegación modular (FFAgentModuleLinks)

2. Componente funcional principal (FreightSoaPayment)

---

**1. Barra de navegación de módulos – FFAgentModuleLinks**

Esta barra se muestra en la parte superior de la vista y permite moverse entre las distintas áreas del módulo de agentes.
Está diseñada como una franja horizontal con fondo claro (modo claro/oscuro) y botones de colores que representan diferentes secciones funcionales.

**Elementos principales:**

- **Botón “Back” (Regresar):**
Permite volver a la vista anterior en la navegación.

- **Título de referencia:**
Un texto descriptivo indica el módulo actual, por ejemplo:
“F.F. Agent modules ➡️”.

- **Botones de acceso a submódulos:**
Cada botón representa una funcionalidad dentro del módulo de agentes.

| Color    | Nombre del botón    | Función                     | Descripción                                                                                 |
| -------- | ------------------- | --------------------------- | ------------------------------------------------------------------------------------------- |
|  Rosa    | **Check module**    | *Deshabilitado actualmente* | Módulo planeado para revisión o validación de pagos individuales.                           |
|  Ámbar   | **SOA module**      | Activo                      | Permite gestionar y visualizar los estados de cuenta (Statement of Account) de los agentes. |
|  Lima    | **Payments module** | Activo                      | Permite registrar, validar o consultar pagos realizados a los agentes.                      |
|  Púrpura | **Reports module**  | Activo                      | Permite generar reportes consolidados de pagos, movimientos y saldos.                       |

**Indicadores de navegación dinámica:**

Cada botón muestra un ícono circular doble cuando la ruta actual coincide con el submódulo correspondiente.
Esto le indica visualmente al usuario en qué sección del módulo se encuentra.

Rutas internas más comunes:

- /payments/agents/soa → Módulo de conciliaciones SOA

- /payments/agents/payments → Módulo de pagos

- /payments/agents/reports → Reportes financieros

- /payments/agents/check → Módulo de validación (aún inactivo o no visible)

---

**2. Sección funcional – FreightSoaPayment**

Esta es la vista principal de trabajo, donde se muestran y gestionan las conciliaciones de pagos (SOA).
Corresponde a la parte operativa del módulo de agentes.

**Propósito:**

Centralizar la información de los pagos y saldos pendientes con cada agente de Freight Forwarder, permitiendo:

- Consultar los estados de cuenta (SOA).

- Ver los movimientos financieros asociados (cargos, abonos, transferencias).

- Generar conciliaciones automáticas entre los pagos recibidos y los registros contables.

- Validar los pagos aplicados correctamente o identificar diferencias.

**Contenido esperado en esta sección:**

- Listado de estados de cuenta por agente.

- Filtros por fecha, agente, o número de documento.

- Totales de pagos, cargos y saldos.

- Botones de acción para generar reportes o conciliaciones.

- Indicadores de estado (pendiente, conciliado, en revisión).

El componente también puede incluir accesos rápidos a descargas o reportes en Excel, así como ventanas modales para revisar los detalles de cada transacción.

---

**Comportamiento general del sistema**

**1. Navegación fluida entre módulos:**
La barra superior permite cambiar rápidamente de módulo (SOA, Payments, Reports) sin salir del entorno principal.

**2. Destacado del módulo activo:**
El sistema detecta automáticamente la ruta actual y marca el módulo activo mediante un ícono visual.

**3. Diseño responsivo y adaptable:**
La barra de módulos está optimizada para ajustarse a pantallas pequeñas o grandes (usa disposición flex-wrap).

**4. Carga dinámica de datos:**
Al ingresar al módulo “SOA”, se cargan automáticamente los datos financieros del agente correspondiente.

**5. Acceso controlado por roles:**
Los módulos están destinados principalmente a usuarios de los departamentos de contabilidad, finanzas, y operaciones internacionales, con permisos específicos según el rol.

---

**Submódulos relacionados**

| Módulo                             | Descripción                                                | Objetivo principal                               |
| ---------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| **SOA Module**                     | Conciliación y consulta de estados de cuenta.              | Comparar registros contables y pagos realizados. |
| **Payments Module**                | Gestión de pagos a agentes.                                | Registrar y validar transacciones financieras.   |
| **Reports Module**                 | Generación de reportes financieros y exportación de datos. | Control y auditoría de pagos y saldos.           |
| **Check Module** *(en desarrollo)* | Validación de pagos específicos.                           | Control cruzado y verificación manual.           |

---

**Usuarios y roles sugeridos**

Este módulo está diseñado para:

- Departamentos de Finanzas y Contabilidad.

- Equipos de Operaciones Marítimas o Aéreas.

- Administradores de pagos internacionales.

- Supervisores o auditores financieros.

---

**Beneficios**

- Centraliza la gestión de pagos y conciliaciones con los agentes.

- Mejora la trazabilidad de operaciones financieras internacionales.

- Permite un control más eficiente de los estados de cuenta.

- Facilita la elaboración de reportes y auditorías.

- Reduce errores manuales en conciliaciones contables.

---

# Módulo: Agents F.F. SOA - Credit / Debit Notes
Descripción general

Esta pantalla permite consultar, revisar y administrar las notas de crédito y débito relacionadas con los agentes de Freight Forwarder (F.F.).
El objetivo principal es verificar, generar reportes y solicitar pagos de notas registradas, con filtros avanzados y herramientas para validar el estado financiero de cada operación.

---

**Objetivos del módulo**

- Consultar las notas de crédito y débito generadas por o hacia los agentes F.F.

- Aplicar filtros por fechas, moneda, agente o grupo de agentes.

- Visualizar el estado de cada nota y su relación con solicitudes de pago.

- Descargar reportes en PDF o Excel.

- Bloquear, desbloquear o solicitar el pago de múltiples notas seleccionadas.

- Controlar y verificar los saldos pendientes entre los agentes y la empresa (TM).

---

**Sección de filtros de búsqueda**

Esta parte superior permite definir los criterios para la búsqueda de notas.

**Filtros disponibles:**

- **Freight Forwarder:** selecciona el agente asociado.

- **Freight Forwarder Group:** busca un grupo de agentes utilizando un buscador global.

- **Start Date / End Date:** permite acotar la búsqueda por fechas.

- **Currency:** filtra las notas por tipo de moneda.

# Note (oculto): campo interno para buscar por número de nota, aunque normalmente está deshabilitado.

Botones principales:

- **Clear:** limpia todos los filtros.

- **Search:** ejecuta la búsqueda según los filtros aplicados.

---

**Opciones de control de notas**

Una vez cargadas las notas, el usuario puede usar botones rápidos:

- Check all: marca todas las notas disponibles como seleccionadas.

- Uncheck all: desmarca todas las notas.

Si hay notas seleccionadas, se muestran las siguientes acciones:

- **PDF:** genera una vista previa o archivo con las notas marcadas.

- **Excel:** descarga un reporte en formato Excel.

- **Lock notes:** bloquea las notas seleccionadas (evita modificaciones).

- **Unlock notes:** desbloquea notas previamente bloqueadas.

- **Request payment:** crea una solicitud de pago para las notas seleccionadas.

---

**Colores e indicadores**

Debajo del panel de acciones se explica el significado de los colores o etiquetas:

- Check note: nota pendiente de validación.

- Payment request: nota con solicitud de pago activa.

- Cancelled note: nota cancelada.

Además, aparece una advertencia si hay demasiadas notas (más de 2000), indicando que se alcanzó el límite máximo de resultados.

---

**Tabla principal de notas**

Esta tabla muestra toda la información detallada de las notas encontradas.

**Columnas principales:**

**1. Actions:** opciones disponibles para cada nota (adjuntar archivos, bloquear/desbloquear, marcar).

**2. Note #:** número de la nota (visible cuando hay notas seleccionadas).

**3. Payment request:** estado de la solicitud de pago (pendiente o con número de pago).

**4. Vessel:** embarcación o vuelo asociado al servicio.

**5. Date:** fecha de creación de la nota.

**6. DN / CN #:** número de la nota de débito o crédito.

**7. Credit Note / Debit Note:** valores de crédito y débito aplicados.

**8. Balance:** muestra el balance acumulado hasta esa nota.

**9. Service Ref #:** referencia del servicio (por ejemplo, número de operación).

**10. BL (Bill of Lading):** número de conocimiento de embarque o guía aérea.

**11. Customer:** cliente o consignatario.

**12. F.F. Agent / F.F. Group:** agente o grupo responsable.

**13. Type:** tipo de nota (Credit/Debit) y origen (From Agent o From TM).

**14. Base currency:** moneda base utilizada.

**15. Buy rate / Sell rate (USD):** tarifas de compra y venta con sus tipos (Prepaid/Collect).

**16. Profit sell / Rebate / Profit:** información de margen de ganancia y descuentos.

**17. Freight payment:** monto final del pago de flete.

**18. Container types:** número de contenedores según tipo.

**19. Status:** indica si la nota está activa o cancelada.

---

**Cálculos y totales**

- Cada fila tiene un balance acumulado calculado automáticamente con base en las notas anteriores.

- Al final de la tabla, se muestra una tarjeta resumen con el total del balance de las notas seleccionadas:

  - En verde, si el saldo corresponde a TM.

  - En rojo, si el saldo corresponde al agente F.F.

---

**Gestión individual de notas**

Desde la columna de acciones, el usuario puede:

- **Adjuntar archivos:** subir documentos o comprobantes.

- **Bloquear o desbloquear** notas individualmente.

- **Ver detalles:** abrir la nota en una vista detallada.

- **Tooltip de advertencia:** muestra qué información falta (como adjuntos o pagos).

Cuando una nota tiene errores o información faltante, el sistema lo notifica con mensajes visuales y etiquetas de color.

---

**Funciones automáticas del sistema**

- Validación de pendientes: el sistema determina automáticamente si una nota está pendiente de revisión o completa.

- Recuento de seleccionadas: se muestra cuántas notas están marcadas.

- Prevención de exceso: el sistema avisa si se superan los 2000 registros en la búsqueda.

- Sincronización con catálogos: al ingresar, se cargan automáticamente los tipos de contenedor y la lista de agentes.

---

**Flujo de trabajo típico**

1. El usuario selecciona filtros (agente, fechas, moneda, etc.).

2. Ejecuta la búsqueda con Search.

3. El sistema lista las notas que coinciden con los filtros.

4. El usuario revisa, marca las necesarias y realiza una de las acciones disponibles:

  - Descargar PDF/Excel.

  - Bloquear/desbloquear.

  - Enviar solicitud de pago.

5. Se muestra el balance total de las notas seleccionadas.

---

**Mensajes del sistema**

- Error: cuando falta un filtro obligatorio (por ejemplo, sin agente seleccionado).

- Información: si no se encuentran notas con los filtros aplicados.

- Advertencia: si se excede el límite de notas.

- Éxito: cuando se completa una acción (PDF generado, nota desbloqueada, pago solicitado, etc.).

---

# Información del Usuario – Visualización y Detalles

Este componente permite consultar los datos de los usuarios relacionados con un registro, mostrando quién lo creó, quién lo actualizó y, en caso de eliminación, quién lo eliminó.
Está diseñado para ofrecer una vista rápida y accesible de la información del usuario mediante un ícono flotante y un cuadro emergente (modal) con detalles.

**Función principal**

El componente muestra un ícono con un signo de interrogación junto al contenido principal.
Al hacer clic sobre él, se abre una ventana modal con la información de los usuarios vinculados a la acción (creación, actualización o eliminación) de un registro.

Esta herramienta se utiliza principalmente para auditorías internas o para saber qué usuario realizó determinadas acciones dentro del sistema.

---

**Elementos principales del componente**

**1. Contenedor principal**

Es el área donde se incluye el contenido principal (por ejemplo, un formulario o una tarjeta de datos).
Dentro de este contenedor se integra un pequeño botón o ícono que activa los detalles de usuario.

**2. Botón flotante de información**

- Se representa con un ícono de usuario con signo de pregunta.

- Al pasar el cursor sobre el ícono, aparece un tooltip (mensaje emergente) que indica “User details”.

- Al hacer clic, se abre una ventana modal con toda la información de los usuarios asociados.

**3. Ventana de detalles (modal)**

Cuando se activa, se muestra una tarjeta de información con los siguientes apartados:

**a. Encabezado**

- Muestra el ícono de “detalles de usuario”.

- Título: “Users Information”.

**b. Cuerpo del modal**

Presenta una lista con los posibles usuarios involucrados en el registro actual:

**1. Usuario que creó el registro (Creado por):**

  - Se muestra su nombre y correo electrónico.

  - Incluye un ícono de color verde que representa la creación.

  - Debajo se indica la fecha en que se creó el registro.

**2. Usuario que actualizó el registro (Actualizado por):**

  - Muestra nombre y correo electrónico del usuario que realizó la última modificación.

  - El ícono es de color ámbar.

  - También se indica la fecha de actualización.

**3. Usuario que eliminó el registro (Eliminado por):**

- Solo aparece si el registro fue eliminado.

- Incluye nombre, correo y fecha de eliminación.

- El ícono es de color rojo.

Cada uno de estos apartados se presenta con un avatar (ícono circular) y un tooltip que indica la acción que realizó el usuario.

**c. Acciones del modal**

- En la parte inferior se incluye un botón “Close” para cerrar la ventana de detalles.

---

**Comportamiento interactivo**

- Al hacer clic en el ícono del usuario, el sistema abre o cierra el modal de información.

- Los datos de los usuarios se obtienen desde un almacén central (store) que contiene la lista de usuarios disponibles en el sistema.

- Si el componente detecta los identificadores de los usuarios (quién creó, actualizó o eliminó), busca automáticamente sus datos para mostrarlos (nombre, correo y fechas).

- Cuando el componente se carga, verifica y actualiza la información de los usuarios disponibles para garantizar que los datos sean actuales.

---

**Estilos y presentación**

- El botón de información está diseñado para resaltar visualmente sin interferir con el contenido principal.

- Los tooltips se muestran con fondo oscuro y texto blanco, ubicados justo encima del ícono.

- El diseño mantiene un formato limpio, compacto y fácil de leer, con íconos y colores que identifican rápidamente el tipo de acción (verde = creación, ámbar = actualización, rojo = eliminación).

---

**Uso práctico**

Este componente se utiliza dentro de pantallas donde es importante rastrear quién hizo qué acción sobre un registro, por ejemplo:

- En formularios de creación o edición de datos.

- En paneles administrativos de usuarios, órdenes, o productos.

- En registros con control de auditoría.

