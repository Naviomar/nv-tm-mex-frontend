---
title: Audit Module
summary: Registro y consulta de auditoría sobre las acciones realizadas dentro del sistema.
order: 3
status: stable
version: 1.0.0
updatedAt: 2025-09-22
module: audit-log
roles: [Administrador, Auditoría, Compliance]
tags: [auditoria, seguridad, log, historial]
---

# Introducción
El módulo **Audit** permite visualizar y analizar el historial de acciones realizadas en el sistema, asegurando trazabilidad y transparencia en los procesos.

# Componentes principales
- **AuditLogTable** → Tabla que muestra los registros de auditoría con detalles de usuario, fecha y acción ejecutada.

# Funcionalidades
- Consultar logs de auditoría en tiempo real.
- Filtrar registros por usuario, módulo o fecha.
- Monitorear actividades críticas y cambios relevantes.
- Exportar logs para revisiones externas o compliance.

# Módulo de Auditoría – Audit Module

El Audit Module (Módulo de Auditoría) es una sección del sistema dedicada al registro, visualización y seguimiento de todas las acciones realizadas por los usuarios dentro de la plataforma.
Su propósito es garantizar la transparencia, trazabilidad y control de los cambios o eventos que ocurren, tanto en la base de datos como en la interfaz de usuario.

---

# Descripción general de la interfaz

La pantalla se compone principalmente de dos elementos clave:

1. Encabezado del módulo (Audit Module)

2. Tabla de registros de auditoría (AuditLogTable)

Ambos están contenidos dentro de una estructura de tipo container fluid, lo que significa que se adapta automáticamente al ancho completo de la pantalla, ofreciendo una vista amplia y flexible.

---

# Estructura visual y funcional

Encabezado del módulo

- Título principal: “Audit Module”.
Se muestra en la parte superior de la pantalla con una tipografía grande y en negritas, indicando de forma clara el propósito de la vista.

- Ícono de historial:
Se utiliza un ícono representado por mdi-history, ubicado antes del título.
Este ícono refuerza visualmente el concepto de auditoría e historial, ayudando al usuario a identificar rápidamente que esta sección contiene eventos pasados o rastros de actividad.

- Diseño visual:
El encabezado tiene márgenes inferiores para mantener una separación limpia respecto a la tabla de datos.
Se utiliza un formato consistente con el resto del sistema, siguiendo la línea estética de los módulos principales.

---

# Tabla de registros (AuditLogTable)

La tabla de auditoría es el elemento central del módulo.
Su función es listar todas las acciones capturadas en el sistema, ofreciendo una vista detallada de qué usuario realizó qué acción, cuándo y sobre qué entidad o módulo.

Aunque el contenido exacto depende de cómo esté implementado el componente AuditLogTable, generalmente incluye los siguientes campos:

| Campo                        | Descripción                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Fecha y hora (Timestamp)** | Muestra el momento exacto en que ocurrió la acción, con precisión de segundos.                                                             |
| **Usuario**                  | Nombre o identificador del usuario que realizó la acción (por ejemplo, un administrador, operador o cliente interno).                      |
| **Módulo o entidad**         | Indica el área o módulo del sistema donde se ejecutó la acción (por ejemplo, “Support Tickets”, “Users”, “Payments”, etc.).                |
| **Acción**                   | Describe la operación realizada, como *create*, *update*, *delete*, *login*, *logout*, etc.                                                |
| **Detalles del cambio**      | Puede incluir información adicional sobre los valores modificados o los datos afectados (por ejemplo, “Se cambió el estado del ticket #45 de open a closed”).|
| **Dirección IP o sesión**    | En algunos casos, se registra desde qué IP, dispositivo o sesión se realizó la acción, útil para seguridad o auditoría forense.            |

---

# Funcionamiento general

El módulo actúa como un historial global de operaciones, que recopila automáticamente la información cada vez que un usuario realiza una acción relevante.
A continuación, se detalla su comportamiento típico:

1. Captura automática de eventos:
Cada vez que un usuario crea, modifica o elimina un registro en cualquier módulo del sistema, el evento se registra automáticamente con información contextual.

2. Registro centralizado:
Todos los eventos se almacenan en una base de datos o servicio de auditoría central, accesible desde esta vista.

3. Visualización estructurada:
El componente AuditLogTable muestra los registros en formato tabular, generalmente con paginación, filtros por fecha o usuario, y ordenamiento por columnas.

4. Propósito del análisis:
Permite a administradores o auditores revisar la secuencia de acciones y validar el cumplimiento de políticas internas o la trazabilidad de cambios.

---

# Casos de uso

El módulo de auditoría es esencial en escenarios donde se requiere control y trazabilidad total. 

Algunos casos prácticos incluyen:

- Seguimiento de modificaciones: Saber quién cambió un dato crítico (como un estado de pago o un usuario eliminado).

- Auditorías internas: Proporcionar evidencia ante revisiones de seguridad o cumplimiento normativo.

- Investigaciones: Identificar el origen de errores o comportamientos sospechosos.

- Control de operaciones sensibles: Monitorear accesos, ediciones y eliminaciones en tiempo real.

---

# Beneficios principales

- Transparencia total: Todo cambio queda registrado con hora y responsable.

- Seguridad reforzada: Permite detectar comportamientos irregulares o accesos indebidos.

- Confianza organizacional: Garantiza que cada acción en el sistema sea verificable.

- Soporte a la trazabilidad: Cumple con estándares de auditoría y gestión de calidad.

---

El Audit Module es una herramienta indispensable para la gestión, seguridad y trazabilidad de datos dentro del sistema.

Su interfaz simple —un encabezado informativo con ícono y una tabla de registros detallada— ofrece al usuario una visión clara y organizada de toda la actividad ocurrida en la plataforma.

---

# Módulo de Registros de Auditoría (Audit Logs)

El módulo de auditoría muestra un historial detallado de todas las acciones importantes que se realizan dentro del sistema.
Su objetivo es ofrecer una visión clara de quién hizo qué, cuándo y sobre qué elemento, ayudando a mantener la transparencia, el control y la trazabilidad de cada cambio.

---

# Propósito general

Esta sección permite revisar y analizar los movimientos registrados automáticamente por el sistema.
Cada vez que un usuario modifica permisos, crea registros, elimina información o realiza configuraciones administrativas, se genera una entrada en esta tabla de auditoría.

Gracias a esto, los administradores pueden:

- Detectar qué usuario hizo una acción determinada.

- Revisar cuándo se modificó un registro.

- Conocer el tipo de evento que se ejecutó (por ejemplo, “created”, “updated”, “permissions_updated”, “deleted”).

- Ver la dirección o URL donde ocurrió el cambio.

- Acceder a los detalles del cambio si es necesario.

---

# Interfaz principal

La pantalla del módulo está dividida en dos partes principales:

1. Filtros de búsqueda y control

2. Tabla de resultados (registros de auditoría)

---

1. **Filtros de búsqueda**

En la parte superior de la pantalla, el usuario encuentra una barra de filtros que permite buscar registros de forma específica.

Los filtros más comunes son:

- # ID: Permite buscar un registro exacto de auditoría usando su número identificador.

- Fechas (Start date / End date): Limita los resultados a un rango de tiempo, mostrando solo los registros creados dentro de esas fechas.

- Usuario (Search User): Permite buscar acciones realizadas por un usuario específico dentro del sistema (por ejemplo, “Lidia Ramírez” o “Usuario Admin”).

Debajo de los filtros se encuentran dos botones principales:

- **Clear:** Limpia todos los filtros aplicados y muestra nuevamente todos los registros.

- **Search:** Ejecuta la búsqueda aplicando los filtros seleccionados.

Estos controles hacen que la búsqueda sea flexible y adaptada a las necesidades del usuario.

---

2. Tabla de resultados

Debajo de los filtros aparece la tabla principal donde se muestran los registros de auditoría encontrados.
Cada fila representa una acción realizada dentro del sistema.

Los campos que se muestran son los siguientes:

| Campo                              | Descripción                                                                                                                          |
| ---------------------------------- |------------------------------------------------------------------------------------------------------------------------------------- |
| **#**                              | Número de identificación del registro de auditoría.                                                                                  |
| **Country (País)**                 | Indica el país o sistema en el que se realizó la acción (por ejemplo, México 🇲🇽 o Chile 🇨🇱).                                         |
| **Auditable (Elemento auditado)**  | Es el nombre del usuario, módulo o entidad sobre la cual se realizó la acción. Debajo se muestra el tipo y su identificador interno. |
| **Event (Evento)**                 | Es el tipo de acción registrada: por ejemplo, `permissions_updated`, `created`, `updated`, o `deleted`.                              |
| **Executed by (Ejecutado por)**    | Muestra quién realizó la acción (el nombre del usuario dentro del sistema).                                                          |
| **URL**                            | Dirección técnica donde ocurrió la acción (por ejemplo, el enlace interno del sistema donde se procesó la modificación).             |
| **Tags**                           | Etiquetas que describen el módulo y el tipo de acción, por ejemplo: `module:admin_users, model:User, action:permissions_updated`.    |
| **Created at (Fecha de creación)** | Indica el día y la hora exacta en que se registró la acción.                                                                         |

---

# Funciones adicionales

- Botón de vista (ícono de ojo):
A la izquierda de cada registro hay un botón que permite abrir un detalle comparativo (“Audit Diff”), donde se muestran los valores antes y después del cambio.
Esto es útil para ver qué información fue modificada, agregada o eliminada en una acción concreta.

- Paginación inferior:
Si hay muchos registros, la tabla se divide en varias páginas.
El usuario puede navegar entre páginas usando los controles circulares (1, 2, 3, etc.) ubicados arriba y abajo de la tabla.

- Actualización automática:
Los datos se actualizan al hacer clic en “Search” o cambiar de página, garantizando que siempre se vea la información más reciente.

---

# Ventana de detalles (Audit Diff)

Cuando se hace clic en el botón de vista 👁️ en una fila, se abre una ventana emergente (un diálogo) que muestra los detalles del cambio realizado.
Allí se pueden comparar los valores antiguos y los nuevos de los campos modificados.

Por ejemplo:

- Antes: el permiso de un usuario estaba en “read-only”.

- Después: se cambió a “admin”.

Esto permite tener un control total sobre lo que se modificó y confirmar que las acciones sean correctas.

La ventana de detalle incluye:

- El tipo de elemento afectado.

- Los datos antiguos.

- Los datos nuevos.

- Un botón Close para cerrar la ventana y volver a la tabla principal.

---

# Funcionamiento general del módulo

1. Carga inicial:
Al abrir la página, el sistema obtiene automáticamente la lista de registros más recientes de auditoría.

2. Filtrado de resultados:
El usuario puede aplicar filtros (por fecha, usuario, o ID) y presionar “Search” para actualizar los resultados.

3. Exploración de páginas:
Si hay muchos registros, se puede navegar entre páginas usando la paginación.

4. Revisión detallada:
Con el ícono de vista, el usuario accede a los detalles exactos de los cambios realizados.

5. Restablecer filtros:
El botón “Clear” borra los filtros activos y recarga toda la información.

---

# Propósito y ventajas

El módulo de auditoría cumple funciones clave en la seguridad y el control del sistema:

- Transparencia total: se registra cada cambio realizado.

- Responsabilidad: se identifica fácilmente quién ejecutó una acción.

- Rastreo histórico: permite revisar el historial de modificaciones.

- Cumplimiento normativo: apoya auditorías internas o externas.

- Detección de errores: facilita encontrar cuándo y cómo se alteró un dato.

---

El módulo Audit Logs es una herramienta esencial para supervisar todas las actividades que ocurren dentro del sistema.
Desde su interfaz, los administradores pueden:

Filtrar acciones específicas.

Consultar quién realizó un cambio.

Ver los detalles técnicos del evento.

Acceder al historial completo con un solo clic.

En conjunto, ofrece un control total y transparente sobre cada operación, garantizando la seguridad y la trazabilidad de la información.

---

# Componente de Botón “View” – Visualización de Registros

Este componente representa un botón de acción con tooltip (ayuda emergente) que permite visualizar detalles de un elemento o registro dentro del sistema.
Es un botón pequeño, interactivo y con un ícono de “ojo” (mdi-eye-outline), muy común en las tablas del sistema para abrir vistas detalladas o modales informativos.

---

# Propósito del componente

El objetivo de este botón es ofrecer al usuario una forma rápida y visual de acceder a los detalles de un elemento listado en una tabla o tarjeta.
Por ejemplo:

- Ver los datos completos de un usuario.

- Consultar el contenido de un ticket de soporte.

- Abrir un registro de auditoría o una ventana de comparación (“Audit Diff”).

Este componente no realiza la acción directamente, sino que emite un evento para que el componente padre (la tabla o vista principal) decida qué hacer al presionar el botón.

---

# Estructura general

El botón está encapsulado dentro de un tooltip (mensaje flotante), que muestra el texto “View” cuando el usuario pasa el cursor por encima.
Esto mejora la usabilidad y deja claro el propósito del botón sin necesidad de texto adicional.

La estructura visual incluye:

- Tooltip (mensaje informativo):
Aparece al colocar el cursor sobre el botón. Indica que la acción es para “ver” o “visualizar”.

- Botón pequeño (v-btn):
Un botón de tamaño extra pequeño (x-small), de color verde oscuro, con estilo elevado (ligera sombra) para destacar sobre la interfaz.

- Ícono representativo:
Muestra un ojo abierto (mdi-eye-outline), símbolo universal de “ver” o “visualizar”.

---

# Funcionamiento interno

El componente está diseñado para ser reutilizable y dinámico.
Su funcionamiento se basa en tres partes:

1. Propiedades recibidas (props)

El componente recibe una propiedad llamada item, que contiene la información del registro o elemento con el que está asociado el botón.
Por ejemplo, si el botón está en una tabla de auditoría, item puede representar un registro específico (como el cambio de permisos de un usuario).

Esto permite que el botón sepa qué elemento debe visualizar al ser presionado.

---

2. Evento emitido (emit)

Cuando el usuario hace clic en el botón, el componente emite un evento personalizado llamado 'click'.
Este evento envía como parámetro el objeto item, permitiendo que el componente principal (por ejemplo, la tabla) reciba esa información y decida qué acción ejecutar.

Por ejemplo:

- Abrir un modal con los detalles del registro.

- Mostrar una vista previa.

- Cargar más información relacionada.

De esta manera, el componente se mantiene independiente y modular, dejando la lógica de negocio fuera de él.

---

3. Acción de clic (onClick)

Al presionar el botón, se activa la función onClick(item), que emite el evento mencionado anteriormente.
En ese momento, el sistema notifica al componente padre que se ha hecho clic en el botón, junto con la información del registro correspondiente.

Ejemplo de flujo:

1. El usuario hace clic en el ícono 👁️.

2. El componente emite el evento 'click' con el registro asociado.

3. La tabla principal escucha ese evento.

4. Se abre una ventana modal mostrando los detalles del registro seleccionado.

---

# Aspecto visual

- Color: Verde oscuro (green-darken-2), indicando acción positiva o segura (ver, consultar, sin riesgo).

- Tamaño: Extra pequeño, ideal para tablas con muchas filas.

- Ícono: Ojo delineado (mdi-eye-outline), símbolo claro de visualización.

- Tooltip: Texto “View”, ayuda contextual para usuarios nuevos.

- Efecto elevado: Da sensación de botón interactivo, separado visualmente del fondo.

---

# Beneficios del diseño

- Reutilizable: Se puede usar en cualquier parte del sistema (tablas, listados, dashboards).

- Minimalista: No ocupa espacio adicional ni requiere texto visible.

- Accesible: El tooltip explica su función al pasar el cursor.

- Interoperable: Comunica la acción mediante eventos, sin depender del contexto.

- Consistente: Mantiene la misma experiencia visual en todos los módulos (Tickets, Auditoría, Usuarios, etc.).

---

# Ejemplo de uso en contexto

Este botón suele verse en la columna de acciones dentro de tablas, junto con otros íconos como:

- (editar),

- (eliminar),

- (ver detalle o historial).

En el caso del módulo de Tickets de soporte o Auditoría, al presionar este botón se abre un modal con la información completa del registro seleccionado, como:

- Descripción detallada,

- Fechas,

- Usuario responsable,

- Estado del ticket,

- Cambios realizados, etc.

---

# Resumen General 

| Aspecto                   | Descripción                                                  |
| ------------------------- | ------------------------------------------------------------ |
| **Nombre del componente** | Botón “View” (Visualizar)                                    |
| **Acción principal**      | Permite ver detalles de un registro                          |
| **Ícono**                 | Ícono de un ojo                                              |
| **Color**                 | Verde oscuro (acción segura)                                 |
| **Evento emitido**        | dando click en el objeto del registro                        |
| **Uso principal**         | Tablas de soporte, auditorías, usuarios, etc.                |
| **Beneficio**             | Proporciona acceso rápido y claro a la información detallada |

---

# Componente de Acción – Botón “View”

Este componente forma parte de los botones de acción rápida utilizados dentro de las tablas y listados del sistema.
Su propósito es permitir al usuario visualizar en detalle la información de un registro (por ejemplo: un usuario, ticket, auditoría, o cambio de permisos) sin necesidad de abandonar la vista principal.

---

# Descripción general

El botón “View” (ver o visualizar) es un elemento interactivo representado con el ícono de un ojo abierto (👁️).
Al pasar el cursor sobre él, se muestra una etiqueta flotante con la palabra “View”, indicando que su función es mostrar más información del registro seleccionado.

Este botón no modifica la información, únicamente activa una vista de lectura o un modal informativo.

---

# Ubicación en el sistema

Este botón aparece dentro de las tablas del sistema, generalmente en la columna de acciones, junto con otros íconos como:

- Editar: modifica un registro existente.

- Eliminar: borra un registro del sistema.

- Ver: consulta o inspecciona los datos sin alterar nada.

Ejemplos de módulos donde se utiliza:

- Gestión de Tickets de Soporte.

- Módulo de Auditorías.

- Administración de Usuarios.
 
- Control de Permisos y Roles.

---

# Comportamiento y funcionamiento

Cuando el usuario presiona el botón de visualización, el sistema realiza el siguiente flujo:

1. El usuario hace clic sobre el ícono 👁️.

2. El componente identifica el registro asociado (por ejemplo, un usuario o evento de auditoría).

3. Se emite un evento interno que comunica al módulo principal cuál fue el registro seleccionado.

4. El sistema abre una ventana modal o una vista detallada, mostrando toda la información relacionada con ese elemento.

De esta forma, el componente no ejecuta la acción directamente, sino que avisa al sistema principal para que muestre los datos correspondientes.

---

# Características principales

| Elemento                     | Descripción                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- |
| **Ícono**                    | 👁️ Representa la acción de ver o inspeccionar.                              |
| **Tooltip (ayuda flotante)** | Muestra el texto “View” al pasar el cursor sobre el botón.                   |
| **Color**                    | Verde oscuro (`green-darken-2`), asociado a acciones seguras y de lectura.   |
| **Tamaño**                   | Extra pequeño (x-small), ideal para interfaces con muchas filas o registros. |
| **Estilo**                   | “Elevated”, con una leve sombra para resaltar sobre el fondo.                |
| **Acción principal**         | Mostrar detalles o información completa de un registro.                      |
| **Evento**                   | Envía al sistema la información del registro seleccionado.                   |
| **Uso común**                | En tablas, listados o paneles de administración.                             |

---

# Estructura visual

El componente se compone de dos elementos principales:

1. Tooltip (texto flotante)

Aparece al pasar el cursor por encima del botón y muestra la palabra “View”, que indica su función.
Su objetivo es guiar al usuario y evitar confusiones, especialmente para quienes no están familiarizados con los íconos.

2. Botón de acción (ícono)

- Tiene un color verde oscuro.

- Su forma es redondeada y de tamaño pequeño, para mantener una apariencia limpia dentro de las tablas.

- Contiene el ícono de un ojo, que comunica de manera visual la acción de “ver”.

---

# Flujo de interacción

A continuación se describe cómo se comporta este botón dentro de una tabla:

1. El usuario visualiza una tabla con registros.

2. En la columna de acciones, identifica el botón 👁️ asociado a un registro específico.

3. Al hacer clic, el sistema captura la información de ese registro.

4. El módulo correspondiente (por ejemplo, Auditoría o Soporte) abre una ventana emergente o vista adicional con los datos completos.

5. El usuario puede consultar la información sin modificarla.

6. Al cerrar la ventana, regresa automáticamente a la tabla original.

---

# Roles que pueden utilizarlo

Este botón está disponible para todos los roles que tengan permiso de lectura o consulta dentro del módulo.
Por ejemplo:

- Administrador: puede ver todos los registros del sistema.

- Supervisor o Jefe de área: puede revisar auditorías, tickets o acciones recientes.

- Usuario general (con permisos limitados): puede consultar únicamente sus propios registros o los asociados a su departamento.

El componente no permite modificar información, por lo que su uso no compromete la seguridad ni integridad de los datos.

---

# Consideraciones de seguridad

- No realiza cambios en la base de datos.

- No requiere confirmaciones ni validaciones previas.

- El acceso al botón depende de los permisos asignados al rol del usuario.

- Ideal para vistas de solo lectura o consultas de auditoría.

--- 

# Ejemplo práctico

En el módulo de Auditorías, este botón aparece junto a cada registro de la tabla.
Al hacer clic, se abre un cuadro llamado “Audit Diff”, donde el sistema muestra las diferencias entre los valores antiguos y nuevos de un registro modificado (por ejemplo, cuando se actualizan los permisos de un usuario).

Este mismo comportamiento se puede replicar en otros módulos, como soporte o administración de usuarios.

---

