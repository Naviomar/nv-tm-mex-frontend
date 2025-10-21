---
title: Support Tickets
summary: Módulo para la gestión y seguimiento de tickets de soporte en el sistema.
order: 2
status: stable
version: 1.0.0
updatedAt: 2025-09-22
module: support-tickets
roles: [Administrador, Soporte Técnico]
tags: [soporte, tickets, incidencias, atencion]
---

# Introducción
El módulo **Support Tickets** centraliza la gestión de solicitudes, incidencias y reportes enviados por los usuarios.  
Facilita el seguimiento y resolución de problemas dentro de la plataforma.

# Componentes principales
- **SupportTicketsTable** → Tabla principal que lista los tickets creados, su estado y asignación.

# Funcionalidades
- Crear y gestionar tickets de soporte.
- Asignar tickets a agentes de soporte.
- Monitorear el estado y tiempos de resolución.
- Generar reportes de incidencias recurrentes.

# Gestión de Tickets de Soporte – Vista General

Esta sección corresponde a la página principal del módulo de soporte técnico, donde los usuarios pueden visualizar, administrar y dar seguimiento a los tickets de soporte registrados en el sistema.
La estructura está diseñada para mostrar la información en formato de tabla, con una interfaz clara y centralizada dentro del diseño general de la aplicación.

---

# Estructura general de la página

**Descripción general**

Esta pantalla pertenece al módulo “Support Tickets”, que permite consultar, filtrar y analizar el estado de los reportes o incidencias del sistema. 
Aquí los usuarios pueden ver los tickets activos, en progreso, listos para probar, cerrados, y categorizados según prioridad, gravedad, módulo y otros criterios.

El objetivo principal es centralizar toda la información de soporte técnico, ofreciendo tanto estadísticas visuales (panel de métricas) como detalles específicos (tabla de tickets).

---

# Barra de búsqueda y filtros principales

En la parte superior se encuentran campos y filtros interactivos para personalizar la búsqueda:

1. # Support ticket

Permite buscar directamente un ticket por su número de identificación único (por ejemplo, #102 o #99).
Ideal cuando ya se conoce el ID o se quiere acceder a un caso específico.

2. Search in text
Realiza una búsqueda por texto libre dentro de los campos del ticket, como el asunto o la descripción.
Esto facilita encontrar incidencias relacionadas con palabras clave (por ejemplo, “payment”, “rates”, “import”).

3. Search User
Campo con búsqueda inteligente/autocompletar, donde el usuario puede escribir al menos tres caracteres para buscar entre la lista de usuarios registrados.
Muestra nombre y correo del usuario, y permite seleccionar uno específico para filtrar los tickets creados o asignados a esa persona.

4. Start date / End date
Filtros de rango de fechas que permiten limitar los resultados a un periodo concreto, útil para auditorías o seguimiento por semanas o meses.

5. By priority, severity, status, category y module
Menús desplegables que filtran los tickets según criterios de clasificación interna:

- Priority (Prioridad): urgente, alta, media, baja.

- Severity (Gravedad): nivel del impacto técnico (por ejemplo, s1 a s6).

- Status (Estado): abierto, en trabajo, en prueba, cerrado, etc.

- Category (Categoría): tipo de incidencia (bug, pregunta, documentación, feature, etc.).

- Module (Módulo): parte del sistema afectada (por ejemplo, “maritime-export”, “payments”, etc.).

6. Botones CLEAR y SEARCH

- **CLEAR:** limpia todos los filtros y devuelve la vista a su estado inicial.

- **SEARCH:** aplica los filtros seleccionados y actualiza la tabla y el dashboard con los resultados.

---

# Funcionamiento general del módulo

1. El usuario ingresa al módulo “Support Tickets”.

2. Aplica filtros según necesidad: puede buscar por usuario, estado, rango de fechas, etc.

3. Presiona “Search” y el sistema consulta la base de datos, mostrando los resultados filtrados.

4. El panel de métricas se actualiza para reflejar la cantidad de tickets en cada estado.

5. La tabla de resultados lista los tickets coincidentes, mostrando su información esencial.

6. El usuario puede:

- Ver detalles de un ticket específico.

- Editar o actualizar su estado.

- Marcarlo como cerrado una vez resuelto.

- Limpiar filtros para volver a ver todos los registros.

---

# Panel de métricas o tablero resumen

Justo debajo de los filtros, el sistema muestra un panel de resumen estadístico, con tarjetas de colores que agrupan los tickets según su estado actual.

Cada tarjeta indica el número total de tickets en esa categoría:

| Tarjeta                 | Color           | Descripción                                                                   |
| ----------------------- | --------------- | ----------------------------------------------------------------------------- |
| **Open Tickets (2)**    | Azul            | Tickets recién abiertos que aún no tienen asignación o acción.                |
| **Working Tickets (1)** | Amarillo        | Tickets que están siendo atendidos actualmente.                               |
| **Ready to Test (5)**   | Verde agua      | Tickets ya solucionados que esperan revisión o validación final.              |
| **Closed (78)**         | Verde brillante | Tickets completamente resueltos y cerrados.                                   |
| **Next Phase (0)**      | Naranja         | Casos pendientes de pasar a una siguiente etapa o aprobación.                 |
| **Observation (0)**     | Morado          | Tickets que requieren revisión o comentarios adicionales.                     |
| **More Info (3)**       | Amarillo oscuro | Casos donde se necesita información adicional del usuario o del área técnica. |
| **Doesn’t Apply (0)**   | Rojo oscuro     | Tickets descartados o no aplicables.                                          |

---

# Propósito del diseño

El objetivo de esta interfaz es simplificar la gestión de incidencias y ofrecer una visión clara del rendimiento del equipo de soporte, así como del estado actual de las tareas técnicas.

Gracias a su estructura visual, los usuarios pueden:

- Detectar rápidamente cuántos tickets están pendientes.

- Identificar prioridades críticas (por color o etiquetas).

- Revisar el historial de comunicación.

- Analizar la carga de trabajo y los tiempos de resolución.

---

1. **Contenedor principal**

La página se presenta dentro de un contenedor fluido que ocupa todo el ancho disponible en la pantalla.
Esto permite que la tabla de tickets se adapte automáticamente a distintos tamaños de dispositivos, manteniendo una visualización limpia y ordenada.

- Facilita la responsividad del contenido.

- Asegura que la información se vea correctamente tanto en pantallas grandes como en dispositivos móviles.
 
- Mantiene coherencia con el diseño del resto del sistema.

---

2. Componente central – SupportTicketsTable

Dentro del contenedor se encuentra el componente principal: SupportTicketsTable.

Este componente representa la tabla interactiva donde se muestran los tickets de soporte.
Aunque en el fragmento no se detalla su contenido, generalmente este tipo de componente incluye las siguientes funciones o columnas:

**Elementos que suele mostrar la tabla**

- ID del ticket: número o código único que identifica el reporte.

- Asunto o título: breve descripción del problema o solicitud del usuario.

- Departamento o área responsable: a quién está asignado el caso.

- Estado actual: abierto, en proceso, resuelto o cerrado.

- Prioridad: baja, media, alta o crítica.

- Usuario o solicitante: persona que reportó el problema.

- Fecha de creación y última actualización.

**Posibles acciones disponibles**

- Ver detalles del ticket.
 
- Responder o agregar comentarios.

- Cambiar el estado (por ejemplo, marcar como resuelto o pendiente).

- Asignar responsable.

- Filtrar, buscar o exportar información.

El propósito de este componente es centralizar la gestión de tickets de soporte en una interfaz sencilla y eficiente, donde los administradores y técnicos puedan tener control total sobre las solicitudes en curso.

---

# Configuración de la página

La página define metadatos (mediante la función definePageMeta) que determinan su título, diseño y comportamiento dentro del sistema.

1. Título de la página

El título configurado es:

"TM - Support Tickets"

Esto significa que cuando el usuario entra en esta vista:

- El nombre del módulo aparece en la pestaña del navegador o encabezado de la aplicación.

- Se utiliza como referencia en menús, breadcrumbs o sistemas de navegación interna.

“TM” podría corresponder al nombre del sistema o módulo principal (por ejemplo, Ticket Management o Task Manager).

---

2. Diseño aplicado (layout)

El layout utilizado es:

layout: 'default'

Esto indica que la página usa la plantilla visual predeterminada del sistema, lo que normalmente incluye:

- Barra superior de navegación (con logo, nombre de usuario o accesos rápidos).

- Menú lateral con accesos a otros módulos (como usuarios, reportes, configuración, etc.).

- Pie de página o área informativa común.

Gracias a esto, la vista de soporte se integra visualmente con el resto del sistema y mantiene una experiencia de usuario uniforme.

---

# Función y propósito dentro del sistema

El objetivo de esta página es ser el punto central de atención al cliente o soporte técnico.
Permite a los usuarios y al personal autorizado:

1. Visualizar todos los tickets activos o históricos.

2. Controlar el flujo de trabajo de soporte, desde la creación hasta la resolución.

3. Garantizar trazabilidad, ya que cada acción queda registrada.

4. Optimizar la comunicación entre usuarios y el equipo de soporte.

5. Analizar métricas de desempeño o carga de trabajo (por ejemplo, cuántos tickets están pendientes o cuántos se resuelven por día).

---

# Resumen conceptual

| Elemento                  | Descripción                                            |
| ------------------------- | ------------------------------------------------------ |
| **Módulo**                | Soporte técnico                                        |
| **Componente principal**  | Tabla de tickets (`SupportTicketsTable`)               |
| **Diseño**                | Predeterminado (`layout: default`)                     |
| **Título mostrado**       | TM - Support Tickets                                   |
| **Función principal**     | Mostrar y gestionar tickets de soporte                 |
| **Usuarios principales**  | Técnicos, administradores o personal de atención       |
| **Características clave** | Visualización, filtrado, estado, prioridad, asignación |

---

# Módulo de Tickets de Soporte – Panel de Administración

Esta vista es el centro de control y seguimiento de los tickets de soporte del sistema.
Permite buscar, filtrar, visualizar, personalizar y navegar entre los reportes de incidencias o solicitudes creadas por los usuarios.

Su estructura combina un panel de filtros avanzados, un tablero resumen (dashboard) y una tabla dinámica de resultados con funciones de interacción directa, todo dentro de una tarjeta (card) visualmente limpia y organizada.

---

# Estructura general del módulo

La interfaz se compone de tres secciones principales:

1. Encabezado de módulo: muestra el título general “Support Tickets”.

2. Panel de filtros y controles: donde el usuario puede realizar búsquedas específicas.

3. Área de resultados: que incluye un tablero de resumen, la tabla con los tickets y controles de paginación.

---

# Panel de búsqueda y filtros

Esta es la sección más importante para el análisis y gestión activa de los tickets.
Permite aplicar distintos filtros combinados para encontrar rápidamente cualquier reporte.

Los filtros están dispuestos en una rejilla  de varias columnas que ordena cada campo de forma compacta y clara.
Cada campo tiene la opción de limpiar valores y un diseño compacto, lo que mejora la experiencia en pantallas reducidas.

---

**Campos de filtro disponibles**

| Filtro                    | Descripción funcional                                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|**# Support ticket**| Permite buscar directamente por el número o identificador único del ticket. Ideal cuando ya se conoce el ID.                                                                                  |
|  **Search in text**| Realiza una búsqueda general dentro del texto o mensaje del ticket. Útil para localizar palabras clave o temas específicos.                                                                   |
|  **Start/End date**| Filtra los tickets según un rango de fechas de creación. Permite visualizar solo los registros creados entre dos fechas específicas.                                                          |
|  **By status**     | Desplegable que filtra por estado actual del ticket. Los estados disponibles incluyen: `open`, `working`, `ready-to-test`, `in-observation`, `more-info`, `closed`, `next-phase`, `rejected`. |
|  **User**          | Campo de búsqueda avanzada de usuario (mediante el componente `AUserSearch`). Permite filtrar los tickets según la persona que los creó.                                                      |
|  **By priority**   | Filtro basado en el nivel de prioridad asignado (por ejemplo: baja, media, alta o crítica).                                                                                                   |
|  **By severity**   | Clasifica los tickets según la severidad o impacto del problema.                                                                                                                              |
|  **By category**   | Permite agrupar los tickets por tipo o categoría (por ejemplo: incidencias técnicas, solicitudes de mejora, errores de sistema).                                                              |
|  **By module**     | Filtra los tickets según el módulo o sección del sistema al que pertenecen. Esto facilita ubicar incidencias específicas dentro de cada área funcional.                                       |

---

**Acciones de filtrado**

Debajo de los filtros principales hay una pequeña barra con botones de acción:

- Clear: limpia todos los filtros aplicados y restablece los valores a su estado inicial.

- Search: ejecuta la búsqueda con los filtros seleccionados.

- Además, el sistema permite presionar la tecla Enter para activar la búsqueda de forma rápida.

---

**Dashboard de soporte**

Debajo del panel de búsqueda aparece el componente SupportTicketsDashboard.
Este bloque muestra un resumen general de métricas o estadísticas del sistema de soporte, como por ejemplo:

- Total de tickets creados.

- Cantidad de tickets abiertos, cerrados o en observación.

- Distribución por prioridad o por categoría.

- Promedio de tiempo de resolución.

Esto permite a los supervisores tener una visión general del estado operativo sin necesidad de revisar ticket por ticket.

---

# Tabla de resultados

La sección central presenta una tabla dinámica con todos los tickets que cumplen los criterios de búsqueda.

**Encabezados principales**

La tabla contiene las siguientes columnas:

| Columna        | Descripción                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Acciones**| Permite acceder a herramientas rápidas como ver detalles o cambiar color.                                                                                       |
| **Ticket #**   | Número único del ticket, con prefijo “#”.                                                                                                                    |
| **Status**     | Estado actual del ticket (ejemplo: open, closed). Se muestra dentro de una etiqueta de color (chip) para fácil identificación.                               |
| **Subject**    | Asunto o título del ticket, que resume brevemente el problema o solicitud.                                                                                   |
| **Message**    | Contiene el mensaje principal. Muestra un ícono de texto y, al pasar el cursor, aparece un **tooltip con el contenido completo**. Puede activarse o desactivarse la visualización total mediante el icono de “ojo” o “ojo tachado”. |
| **Priority**   | Nivel de prioridad asignado.                                                                                                                                 |
| **Severity**   | Grado de severidad o impacto.                                                                                                                                |
| **Category**   | Categoría del ticket.                                                                                                                                        |
| **IP**         | Dirección IP desde donde se generó el reporte.                                                                                                               |
| **User**       | Nombre del usuario que creó el ticket.                                                                                                                       |
| **Created at** | Fecha de creación formateada de manera legible.                                                                                                              |

---

# Acciones dentro de cada fila

Cada registro tiene accesos directos que permiten al usuario:

1. Ver detalles completos del ticket → mediante el botón de vista, que redirige a la ruta /system/support-tickets/ticket-[id].

2. Cambiar el color de fondo del ticket → usando el componente ButtonColorPicker.

    - Permite asignar un color visual al ticket (por ejemplo, según su estado o urgencia).

    - Los cambios se guardan en el sistema con un mensaje de confirmación tipo “Guardar Color ”.

Si un ticket fue eliminado o marcado como inactivo (deleted_at no nulo), la fila cambia de color de fondo (rojo tenue) para indicar su estado especial.

---

# Personalización visual y estilo

- Los tickets pueden tener colores personalizados guardados por usuario o por ticket.

- Si un registro tiene color asignado, la fila muestra ese tono de fondo.
 
- Si está eliminado, el color cambia automáticamente a un rojo desaturado.

- Esto ayuda a identificar rápidamente prioridades, estados o responsables.

---

# Paginación

El módulo usa paginación doble (al inicio y al final de la tabla).
Permite desplazarse entre las páginas de resultados de forma compacta y visual, con botones redondeados.
El sistema actualiza los datos dinámicamente cada vez que se cambia de página.

---

# Carga y actualización de datos

La información de los tickets se obtiene desde el servidor mediante la función obtener tickets de soporte.
Esta realiza una petición al API incluyendo los filtros seleccionados y la página actual.

Mientras se carga la información:

- Se activa un indicador de carga global (loadingStore).

- Al finalizar, se detiene con un pequeño retardo para suavizar la transición visual.

Los resultados se almacenan en un objeto supportTickets, que contiene:

- data: los tickets obtenidos.

- current_page: la página actual.

- last_page: total de páginas disponibles.

- perPage: cantidad de registros por página.

---

# Sincronización con la URL

Cada vez que el usuario cambia un filtro, los valores se actualizan automáticamente en la barra de dirección (query string).
Esto significa que:

- Si el usuario recarga la página, los filtros se conservan.

- También se pueden compartir enlaces con filtros aplicados, permitiendo que otros usuarios vean los mismos resultados.

Al iniciar la vista (onMounted), el sistema:

1. Lee los parámetros de la URL.

2. Los aplica a los filtros visibles.

3. Ejecuta automáticamente la carga inicial de tickets.

---

# Funciones y objetivos principales del módulo

El propósito de esta interfaz es centralizar la gestión operativa del soporte técnico.
Permite que los administradores, técnicos o supervisores:

1. Busquen rápidamente tickets específicos.

2. Filtren información por criterios múltiples.

3. Controlen el estado y seguimiento de incidencias.

4. Asignen prioridades visuales mediante colores.

5. Obtengan métricas resumidas con el dashboard.

6. Mantengan trazabilidad y navegación amigable a través de la URL.

---

# Resumen funcional

| Elemento                | Descripción                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| **Título del módulo**   | Support Tickets                                                                             |
| **Tipo de interfaz**    | Panel de filtros + tabla de resultados                                                      |
| **Filtros principales** | ID, texto, fechas, estado, usuario, prioridad, severidad, categoría, módulo                 |
| **Funciones clave**     | Búsqueda avanzada, paginación, dashboard, personalización por color, sincronización con URL |
| **Usuarios típicos**    | Técnicos, administradores, soporte interno                                                  |
| **Objetivo general**    | Centralizar y optimizar la gestión de tickets en tiempo real                                |

---

# Selector de Color Personalizado – Componente Interactivo

Este componente representa un selector de color compacto e intuitivo diseñado para asignar o modificar colores asociados a elementos dentro del sistema (por ejemplo, tickets de soporte, tareas, categorías, etc.).

Su función principal es permitir que el usuario seleccione rápidamente un color visual desde una paleta predefinida, mediante un botón pequeño con ícono, sin recargar la página ni abrir ventanas adicionales.

---

# Estructura general del componente

El componente está compuesto por tres elementos visuales principales:

1. Botón de acción que abre o cierra el selector de color.

2. Selector de color (color picker) con paleta de colores predefinida.

3. Vista previa opcional del color seleccionado (actualmente oculta).

Todo está contenido dentro de un bloque compacto y adaptable, que se integra fácilmente en tablas o formularios.

---

# Botón de activación del selector

El primer elemento visible es un botón pequeño de color negro que contiene un ícono de cubeta de pintura.
Este botón funciona como disparador principal del selector de color:

- Al hacer clic sobre él, se despliega o se oculta la paleta de colores.

- Tiene un diseño “tonal” y tamaño extra pequeño, lo que permite integrarlo dentro de filas o celdas sin ocupar espacio excesivo.

- Visualmente comunica al usuario la función de “cambiar color”.

Este botón es el punto de interacción inicial del usuario.

---

# Selector de color (Color Picker)

Cuando el usuario hace clic en el botón, se muestra un selector de color emergente directamente debajo o encima del botón, dependiendo del espacio disponible en pantalla.

Este selector tiene las siguientes características:

**Comportamiento general**

- Aparece y desaparece dinámicamente, sin recargar la página.

- Está configurado para trabajar en el modo “hexa” (código hexadecimal), el formato más común para representar colores en sistemas web.

- Se oculta automáticamente si el usuario hace clic fuera del componente (gracias al detector de clics externos).

- Su posición se ajusta de forma automática, detectando si hay suficiente espacio debajo o si debe mostrarse arriba del botón (para evitar que se corte o salga de la pantalla).

**Diseño visual**

- Tiene un tamaño reducido, sin área de lienzo ni entradas de texto.

- Solo muestra una serie de muestras de color (“swatches”) organizadas en filas.

- Esto simplifica la experiencia del usuario, ya que no necesita ingresar valores manuales.

**Paleta de colores disponible**

El componente define dos filas de colores predeterminados.
Cada fila contiene 5 colores representativos:

**Fila 1:** tonos azules, morados, verdes y naranjas.
**Fila 2:** tonos turquesa, rojos, azules oscuros y grises.

Estas combinaciones ofrecen una paleta equilibrada entre colores fríos y cálidos, permitiendo que el usuario elija opciones visualmente distintivas pero coherentes con la interfaz general.

Ejemplo de uso:

- Azul → tareas en progreso.

- Rojo → tickets urgentes.
 
- Verde → completados.

- Gris → pausados.

---

# Gestión del color seleccionado

Cuando el usuario selecciona un color de la paleta:

1. El selector se cierra automáticamente.

2. El color elegido se almacena internamente como valor activo (selectedColor).

3. El componente emite un evento de actualización (update) hacia el componente padre, notificando el nuevo color elegido.

Esto permite que el sistema guarde el color en la base de datos, lo aplique a un elemento o actualice su vista inmediatamente.

El color seleccionado puede ser posteriormente usado, por ejemplo:

- Para colorear la fila de un ticket en una tabla.
 
- Para identificar una categoría o prioridad visualmente.

- O simplemente como una etiqueta de referencia visual.

---

# Detección automática de posición

El componente calcula de forma dinámica si el selector debe mostrarse arriba o abajo del botón, según el espacio disponible en la ventana.

- Si no hay suficiente espacio debajo (por ejemplo, el usuario está al final de la página), el selector se mostrará encima del botón.

- Este comportamiento mejora la usabilidad y accesibilidad visual, evitando que la paleta se corte o quede fuera de vista.

---

# Cierre automático por clic externo

Si el usuario hace clic fuera del área del selector, este se cierra automáticamente.
Esto se logra mediante un sistema de detección de clics externos, lo que garantiza una interacción fluida y sin errores.

De esta manera, el selector se mantiene limpio, funcional y sin ocupar espacio innecesario cuando no está en uso.

Propiedades y comunicación

El componente recibe un objeto (item) como propiedad.
Este objeto representa el elemento asociado al color (por ejemplo, un ticket de soporte).
Al montar el componente:

- Se asigna el color actual del ítem al selector, asegurando que el usuario vea el color previamente guardado.

El componente también emite eventos al componente padre cada vez que se selecciona un nuevo color.
El evento “update” incluye el valor hexadecimal del color seleccionado.

---

# Diseño visual y estilo

El contenedor principal utiliza un posicionamiento relativo e inline, lo que significa que:

- Se puede colocar fácilmente dentro de celdas o filas de tablas.

- El selector aparece posicionado de forma absoluta respecto al botón, sin afectar el flujo de los demás elementos.

El diseño es minimalista, elegante y compatible con temas claros u oscuros (useDarkMode()), adaptándose automáticamente al modo visual del sistema.

---

# Resumen funcional

| Elemento                         | Descripción                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------ |
| **Nombre del componente**        | Selector de color (Color Picker)                                               |
| **Función principal**            | Permitir elegir un color de forma rápida y asociarlo a un elemento del sistema |
| **Acción principal del usuario** | Hacer clic en el ícono de cubeta para abrir la paleta de colores               |
| **Salida del componente**        | Emite el color seleccionado al sistema mediante un evento “update”             |
| **Paleta disponible**            | 10 colores (5 por fila) con tonos variados                                     |
| **Interacciones especiales**     | Cierre automático, detección de clic externo, ajuste de posición dinámico      |
| **Usos comunes**                 | Colorear filas, categorías, prioridades o etiquetas visuales                   |
| **Diseño visual**                | Compacto, adaptable, compatible con modo oscuro                                |

---

# Objetivo general

El propósito de este componente es ofrecer una herramienta visual de personalización rápida, sin complicaciones técnicas, que mejore la identificación visual y organización del contenido dentro del sistema.

Gracias a su diseño compacto, puede integrarse en cualquier módulo donde se requiera asignar colores a registros, como:

- Tickets de soporte,
 
- Tareas,

- Estados de proyectos,

- Prioridades,

- O categorías de incidentes.

---

# Dashboard de Tickets de Soporte

Este componente representa un panel de control (dashboard) que muestra el estado general de los tickets de soporte técnico dentro del sistema. 
Está diseñado para proporcionar una visión rápida y visualmente clara del progreso, carga de trabajo y distribución de tickets en distintas fases del proceso de atención.

---

# Propósito general

El objetivo de esta vista es ofrecer indicadores clave de desempeño (KPIs) relacionados con el soporte técnico, agrupando los tickets según su estado actual. 
También permite actualizar la información en tiempo real mediante un botón de recarga (refresh).

De esta forma, los usuarios (como administradores o miembros del equipo de soporte) pueden:

- Ver cuántos tickets están abiertos, en trabajo, listos para probar o cerrados.

- Consultar estados adicionales como “siguiente fase”, “observación”, “más información” o “no aplica”.

- Actualizar los datos con un solo clic sin tener que recargar toda la página.

---

# Estructura general

El diseño se compone de tres bloques funcionales principales:

1. Barra de acciones (parte superior)

Contiene un botón de actualización con el ícono de sincronización (mdi-sync) y el texto “Refresh dashboard”.

- Al hacer clic, ejecuta la función que recarga los datos (getSupportTicketsDash()).
 
- Su objetivo es obtener los valores más recientes del backend sin necesidad de recargar la aplicación completa.

- Visualmente, el botón se muestra centrado para destacarse como una acción principal del dashboard.

---

2. Primera fila de indicadores principales

Se divide en una cuadrícula (grid) de cuatro tarjetas principales (cards), cada una con su propio color y métrica.

Estas tarjetas muestran los estados generales más comunes de los tickets:

| Estado              | Descripción                                                         | Color representativo                 | Propósito visual                             |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------- |
| **Open Tickets**    | Tickets nuevos o pendientes de atención.                            | Azul claro                           | Indica tareas que aún no han sido atendidas. |
| **Working Tickets** | Tickets actualmente en desarrollo o revisión.                       | Verde lima oscuro                    | Representa progreso activo.                  |
| **Ready to Test**   | Tickets que ya fueron desarrollados y están listos para validación. | Verde azulado                        | Marca el paso previo al cierre.              |
| **Closed**          | Tickets finalizados o resueltos exitosamente.                       | Verde claro                          | Simboliza éxito o tareas completadas.        |

---

Cada tarjeta contiene:

- Un título en formato overline (texto pequeño y discreto en la parte superior).

- Un número grande y destacado (formato de encabezado h3) que muestra la cantidad de tickets en ese estado.

3. Segunda fila de indicadores adicionales

La segunda fila también usa una cuadrícula de cuatro tarjetas más pequeñas, pero enfocadas en estados complementarios o de excepción.

Cada tarjeta es más compacta, con un estilo “outlined” y colores más oscuros para diferenciarse de las métricas principales.

Estas categorías son:

| Estado            | Descripción                                                      | Ícono/Emoji | Color                               | Significado                                  |
| ----------------- | ---------------------------------------------------------------- | ----------- | ----------------------------------- | -------------------------------------------- |
| **Next phase**    | Tickets que avanzarán a la siguiente etapa del flujo de trabajo. | 🚀          | Ámbar oscuro (`amber-darken-4`)     | Indica progreso hacia la siguiente fase.     |
| **Observation**   | Tickets que requieren observaciones o revisiones específicas.    | 🧐          | Morado oscuro (`purple-darken-4`)   | Destaca posibles áreas de mejora o revisión. |
| **More info**     | Tickets que necesitan información adicional para continuar.      | 🔎          | Verde lima oscuro (`lime-darken-4`) | Señala falta de datos o bloqueos.            |
| **Doesn't apply** | Tickets rechazados o no válidos.                                 | 🫠          | Rojo oscuro (`red-darken-4`)        | Marca los casos descartados o no relevantes. |

Cada uno muestra la cantidad correspondiente y un título ilustrado con un emoji que facilita la interpretación visual.

--- 

# Diseño visual y experiencia de usuario

- Se utiliza Vuetify junto con Tailwind CSS para definir el diseño y espaciados.

- Las tarjetas usan colores distintivos para crear una jerarquía visual clara, ayudando al usuario a identificar rápidamente los estados más importantes.
 
- Los números grandes resaltan los valores, mientras que el uso de emojis añade un toque intuitivo y visualmente agradable.

- El diseño es responsivo, adaptándose automáticamente a una columna en pantallas pequeñas y a cuatro columnas en escritorio (grid-cols-1 md:grid-cols-4).

---

# Comportamiento esperado

- Al entrar al módulo, el sistema muestra los conteos actualizados de todos los estados.

- Si un usuario nota cambios en los tickets (por ejemplo, se cierra uno o se crea otro), puede presionar el botón Refresh dashboard para sincronizar los datos.

- Los contadores se actualizan sin recargar la página, lo que mejora la velocidad y fluidez de uso.

---

# Resumen funcional

| Elemento                            | Función                                            | Interacción                |
| ----------------------------------- | -------------------------------------------------- | -------------------------- |
| **Botón “Refresh dashboard”**       | Recarga todos los datos desde el servidor.         | Manual (clic del usuario). |
| **Tarjetas de estados principales** | Muestran conteos de progreso general.              | Solo lectura.              |
| **Tarjetas de estados adicionales** | Reflejan condiciones específicas o excepcionales.  | Solo lectura.              |
| **Colores e íconos**                | Refuerzan la comprensión visual de cada categoría. | Estáticos.                 |

---

# Buscador de Usuarios – Componente Interactivo

Este componente implementa un campo de búsqueda dinámica (autocomplete) que permite localizar y seleccionar usuarios dentro del sistema.
Su diseño está orientado a ofrecer una experiencia rápida, limpia y asistida, ideal para formularios donde se necesita elegir un usuario específico (por ejemplo, asignar responsables, autores, clientes, etc.).

---

# Propósito general

El objetivo de este módulo es facilitar la búsqueda y selección de usuarios desde una lista obtenida del servidor.
En lugar de mostrar todos los usuarios (lo cual sería lento e ineficiente), el componente consulta el backend en tiempo real a medida que el usuario escribe un nombre, cargando únicamente los resultados relevantes.

De esta manera:

- Se optimiza el rendimiento del sistema.

- Se mejora la experiencia del usuario con búsquedas rápidas.

- Se asegura que la información esté actualizada directamente desde la base de datos.

---

# Estructura funcional

El componente tiene dos áreas principales:

1. Campo de búsqueda (autocomplete)

2. Botón de limpieza o reinicio (clear)

Ambos elementos se coordinan mediante variables reactivas y llamadas a la API interna del sistema.

---

1. Campo de búsqueda – Autocomplete

Este es el núcleo del componente.
Se utiliza un campo desplegable autocompletado, que muestra sugerencias conforme el usuario escribe al menos tres caracteres.

- El campo incluye un ícono de lupa (mdi-magnify) para indicar su función de búsqueda.

- El texto de la etiqueta (label) es dinámico, dependiendo del tipo de elemento que se esté buscando. 
Por defecto, muestra “Search users”, pero puede cambiarse mediante una propiedad (label).

Se puede borrar fácilmente con el botón de limpieza interno del campo (clearable).

**Características clave**

- Entrada controlada: El valor seleccionado y el texto de búsqueda son controlados por las variables selectedUser y searchQuery.

- Sin datos vacíos: Si no se encuentran resultados, el campo no muestra la opción “no data”.

- Sugerencias dinámicas: Las sugerencias se generan al escribir, utilizando una función de búsqueda que se ejecuta solo si hay al menos 3 caracteres.

**Interacción visual**

Cuando el usuario escribe, se despliega una lista con los resultados encontrados.
Cada resultado muestra:

- El nombre del usuario.

- El correo electrónico concatenado junto al nombre (por ejemplo: Juan Pérez – juan@correo.com).

Esto facilita la identificación precisa del usuario, especialmente si existen nombres similares.

---

2. Botón de reinicio (Clear)

Debajo del campo de búsqueda aparece un pequeño botón “Clear” con diseño discreto, visible únicamente cuando ya hay un usuario seleccionado.

- Al presionarlo, limpia el campo, borra la lista de usuarios mostrada y emite un valor nulo al componente padre.

- Permite al usuario comenzar una nueva búsqueda sin recargar la página ni cambiar de vista.

---

**Propiedades (props)**

El componente es altamente reutilizable gracias a tres propiedades configurables:

| Propiedad      | Tipo            | Descripción                                                                         | Valor por defecto |
| -------------- | --------------- | ----------------------------------------------------------------------------------- | ----------------- |
| **modelValue** | String / Number | Valor del usuario seleccionado, usado para comunicación con el componente padre.    | `nulo`            |
| **label**      | String          | Define el texto visible en el campo de búsqueda.                                    | `'usuarios'`         |
| **setId**      | String / Number | Permite precargar un usuario por su ID, útil cuando se edita un registro existente. | `nulo`            |

---

# Búsqueda dinámica con control inteligente

El sistema de búsqueda está diseñado para optimizar el rendimiento y evitar llamadas innecesarias al servidor:

1. Se observa el texto de búsqueda (searchQuery) mediante un watcher.

2. Solo si el usuario escribe al menos tres caracteres y no hay datos cargados, se ejecuta la función de búsqueda (onSearch).

3. La búsqueda se realiza de forma asíncrona con un retraso de 500 ms (debounce) para evitar sobrecargar el servidor con llamadas por cada tecla presionada.

4. Si la API devuelve resultados:

- Se transforman los datos para unir nombre y correo electrónico.
 
- Si solo se encuentra un usuario, se selecciona automáticamente.

5. Si no hay resultados, se muestra una notificación tipo “info” indicando que no se encontraron coincidencias.

6. En caso de error, se muestra una alerta tipo “error” informando de fallos en la conexión o en la búsqueda.

---
