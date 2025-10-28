---
title: Schedule BL Payment – Gestión de Pagos BL
summary: Módulo central para la programación, liberación y control de pagos asociados a documentos BL (Bill of Lading), incluyendo enlaces a submódulos y funciones de notificación.
roles: [Finanzas, Operaciones, Logística, Administrador]
tags: [pagos, bl, marítimo, liberaciones, reportes, notificaciones]
order: 8
status: stable
version: 1.0.0
updatedAt: 2025-10-23
module: schedule-bl-payment
permalink: /manual/schedule-bl-payment
---

# Pantalla principal del módulo – Home del módulo de pagos BL

**Función general**

La pantalla principal actúa como el tablero central del módulo, desde donde el usuario puede:

- Acceder a las diferentes secciones del módulo mediante un bloque de enlaces.

- Visualizar la tabla con las programaciones de pagos BL existentes.

Esta página se integra al diseño general del sistema y utiliza el formato de página estándar, con un título y un layout predeterminado que mantiene la coherencia visual con el resto de la aplicación.

**Componentes principales**

**1. Bloque de enlaces del módulo:**
Permite acceder rápidamente a las distintas subpáginas del área de pagos BL.
Está representado por el componente “Schedule BL Module Links”.

**2. Tabla de programaciones de pagos:**
Muestra los registros activos de programaciones de pago relacionadas con documentos BL.
Generalmente incluye columnas con información como:

  - Número de BL (Bill of Lading)

  - Línea naviera o proveedor asociado

  - Fecha programada del pago

  - Monto total

  - Estado del pago (pendiente, pagado, en proceso)

También puede incluir acciones de gestión como edición, eliminación o visualización detallada de un registro.

**Estructura visual**

La página se presenta dentro de un contenedor de ancho completo, de modo que aprovecha todo el espacio de la pantalla para mostrar los datos y los controles del módulo.

---

# Bloque de enlaces del módulo – Schedule BL Module Links

**Descripción general**

Este bloque funciona como una barra de navegación interna dentro del módulo “Schedule BL Payment”.
Permite moverse entre las distintas secciones o pantallas relacionadas con la gestión de pagos BL.

Está compuesto por una fila de botones con estilos y colores diferenciados que representan cada tipo de acción o reporte disponible.

**Elementos que lo componen**

**1. Encabezado del bloque:**
Presenta el título “Schedule BL Payment” como identificador del módulo.
Sirve como referencia visual para que el usuario sepa en qué área está trabajando.

**2. Botones de navegación:**
Cada botón lleva al usuario a una sección distinta dentro del sistema.

- Historial de pagos liberados: Muestra los registros anteriores de pagos realizados.

- Nuevo reporte de liberación: Permite generar un nuevo reporte sobre pagos BL liberados.

- Nuevas liberaciones de pagos BL: Abre la sección donde se pueden registrar nuevas liberaciones de pago relacionadas con servicios marítimos.

Los botones utilizan colores llamativos (por ejemplo, verde lima, rosa y ámbar) para distinguir sus funciones y facilitar la identificación visual.

**3. Indicadores visuales de estado:**
Cada botón puede mostrar un ícono especial cuando el usuario se encuentra actualmente en la sección correspondiente.
Este ícono actúa como marcador de posición activa, ayudando a identificar de manera rápida en qué pantalla se está trabajando.

**Comportamiento dinámico**

El sistema detecta automáticamente la ruta o dirección actual en la que se encuentra el usuario.
Según esa información:

- Se activa el ícono correspondiente al botón de esa ruta.

- Los demás botones permanecen sin ícono, indicando que no están activos.

De esta manera, la barra de enlaces se actualiza dinámicamente a medida que el usuario navega entre las secciones del módulo.

---

**Funcionamiento conjunto**

Ambos componentes —la pantalla principal y los enlaces del módulo— trabajan en conjunto para ofrecer una experiencia fluida:

- La pantalla principal sirve como centro de información, mostrando los datos actuales de las programaciones de pago BL.

- El bloque de enlaces facilita el desplazamiento entre submódulos sin necesidad de salir de la vista principal.

Esto permite al usuario realizar tareas como:

- Revisar pagos pendientes o históricos.

- Generar nuevos reportes.

- Registrar nuevas liberaciones de pagos.

- Mantener el control de las operaciones relacionadas con los documentos BL.

---

**Objetivo del módulo**

El módulo de “Schedule BL Payment” tiene como propósito:

- Centralizar la gestión de pagos vinculados a documentos BL.

- Facilitar el seguimiento y la liberación de pagos a las líneas navieras.

- Ofrecer una navegación rápida entre las distintas etapas del proceso (registro, reporte, historial).

- Aumentar la eficiencia en el control financiero y operativo de los pagos marítimos.

---

# Historial de Liberación de Pagos BL

**Descripción general**

Esta sección permite consultar, filtrar y gestionar los registros históricos de pagos liberados asociados a documentos BL (Bill of Lading).
Los usuarios pueden visualizar información detallada de cada programación de pago, descargar comprobantes en Excel, revisar los datos bancarios de las líneas navieras, y enviar notificaciones por correo electrónico a los contactos involucrados.

---

**Objetivo**

El objetivo de esta pantalla es proporcionar un panel de control integral donde los usuarios puedan:

- Buscar y filtrar programaciones de pago según diferentes criterios.

- Acceder a los detalles de cada pago.

- Enviar notificaciones por correo.

- Descargar reportes y archivos relacionados.

- Consultar el estado de envío de correos o reportes previos.

---

**1. Filtros de búsqueda**

Ubicada en la parte superior, esta área permite filtrar los registros de pagos BL.

**Campos disponibles:**

- Buscar por folio: permite ingresar un número o identificador del pago.

- Línea naviera: busca y selecciona la línea de transporte (Freight Line) asociada.

Los filtros se pueden ejecutar presionando el botón de búsqueda o al presionar la tecla Enter.
También se incluye un botón para limpiar los filtros y restaurar los valores iniciales.

**Funcionalidad adicional:**

- Si no se encuentran resultados, el sistema muestra una notificación informativa.

---

**2. Envío de correos masivos**

Cuando el usuario selecciona programaciones de pago, aparece una sección adicional para enviar correos electrónicos a múltiples destinatarios.

**Opciones disponibles:**

- Campo de texto para escribir varias direcciones de correo separadas por comas.

- Botón para ejecutar el envío a todos los registros seleccionados.

Esta herramienta es útil para notificar a las líneas navieras o departamentos financieros sobre pagos liberados o pendientes.

---

**3. Tabla principal de historial**

Es el componente central de la vista.
Muestra una lista paginada con la información más relevante de cada programación de pago BL.

**Columnas mostradas:**

- Email: botón para enviar notificación del pago.

- Excel: opción para descargar un archivo Excel del registro.

- Folio: número identificador del pago, con acceso a más detalles.

- Línea: nombre de la línea naviera o transportista.

- Información bancaria: muestra datos del banco asociado (nombre, IBAN, CLABE o número de cuenta).

- Monto total: cantidad total programada, formateada en su respectiva moneda.

- Referencias vinculadas: muestra los documentos o referencias relacionados, con posibilidad de abrirlos en una nueva vista.

- Fecha de creación: muestra cuándo se registró el pago, junto con información del usuario que lo creó.

- Fecha de envío: indica la fecha en que se envió la notificación; si no se ha enviado, aparece como “Pendiente”.

**Comportamiento adicional:**

- Cada registro incluye botones de acción específicos:

  - Enviar notificación: abre un formulario para redactar y enviar correos asociados al pago.

  - Ver detalle: abre una ventana con los detalles de las referencias vinculadas.

  - Descargar Excel: descarga un reporte del pago seleccionado.

La tabla incluye paginación arriba y abajo para facilitar la navegación entre páginas de resultados.

---

**4. Detalle de programación de pago**

Cuando se selecciona un registro específico, se abre un diálogo modal (ventana emergente) con la información detallada de esa programación.

**Información que se muestra:**

- Lista de referencias relacionadas con el pago.

- Código de referencia (Ref #).

- Número de documento maestro (MBL).

- Monto asociado a cada referencia.

Incluye un botón para cerrar la vista de detalle y volver al listado general.

---

**5. Formulario de notificación de pago**

Este es un cuadro de diálogo que se abre al enviar una notificación desde la tabla.

**Elementos principales:**

- Selección de usuarios del sistema para añadir sus correos automáticamente.

- Campo de texto con todos los correos que recibirán la notificación.

- Área para agregar un mensaje o comentarios adicionales.

- Sección para visualizar y adjuntar archivos relacionados con el pago (a través del componente de archivos del sistema).

- Botones de acción para cancelar o enviar el correo.

**Comportamiento inteligente:**

- Cuando se elige un usuario, su correo se agrega automáticamente al listado (evitando duplicados).

- El sistema valida que existan correos antes de intentar el envío.

---

**6. Visualización de referencias**

Otro diálogo permite ver información detallada de una referencia específica vinculada al pago.
Esta vista se abre en modo pantalla completa e incluye:

- Un encabezado con el número de referencia.

- Botones para cerrar la vista.

- Información detallada del documento dependiendo de su tipo:

  - Importación marítima: muestra la vista “Sea Import View Details”.

  - Exportación marítima: muestra la vista “Sea Export View Details”.

---

**Lógica y comportamiento del sistema**

**1. Carga inicial de datos:**
Al entrar en la vista, el sistema carga:

  - El catálogo de líneas navieras disponibles.

  - La lista inicial de programaciones de pago con paginación.

**2. Actualización dinámica:**
Cada vez que el usuario aplica filtros, cambia de página o envía un correo, la información se actualiza automáticamente sin recargar toda la vista.

**3. Descarga de reportes:**
Los archivos Excel se generan y descargan directamente desde el servidor, con el nombre del registro correspondiente.

**4. Envío de notificaciones:**
El envío de correos se gestiona mediante un servicio API que recibe:

  - La lista de programaciones de pago.

  - Los correos electrónicos.

  - El cuerpo del mensaje o comentarios.

Una vez enviado, el sistema muestra un mensaje de confirmación de éxito.

**5. Indicadores de carga:**
Durante las operaciones (búsqueda, descarga o envío de correos), se muestra un indicador de carga visual para informar al usuario que el sistema está procesando la acción.

**6. Notificaciones del sistema:**
Se utilizan alertas emergentes o “snackbars” para informar al usuario sobre:

  - Errores en la búsqueda o conexión.

  - Envíos exitosos de correo.

  - Resultados vacíos o inexistentes.

---

**Usuarios y roles sugeridos**

Esta vista está dirigida principalmente a los usuarios de los departamentos de finanzas, operaciones y logística, que necesiten dar seguimiento o controlar los pagos marítimos programados por línea.

---

**Beneficios**

- Permite centralizar toda la información de pagos BL en un solo lugar.

- Mejora la trazabilidad de los pagos y notificaciones.

- Facilita la comunicación interna y con las líneas navieras.

- Reduce errores al automatizar el envío de correos y reportes.

- Brinda acceso rápido a la información bancaria y documentos asociados.

---
