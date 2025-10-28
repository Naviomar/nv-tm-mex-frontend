---
title: Administración de Notificaciones por Correo – Mail Notifications Administration
summary: Administración y configuración de los departamentos internos del sistema.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-22
module: configuration-departments
roles: [Administrador, Recursos Humanos]
tags: [configuracion, departamentos, organizacion, usuarios]
---

# Introducción
El módulo **Departments** permite la gestión de los departamentos de la organización.  
Es utilizado para estructurar los equipos de trabajo y facilitar la asignación de usuarios.

# Componentes principales
- **DepartmentForm** → Formulario para registrar y editar departamentos.

# Funcionalidades
- Crear nuevos departamentos.
- Editar información de departamentos existentes.
- Mantener un catálogo actualizado de áreas internas.

---

**Propósito general**

Esta sección permite configurar y administrar las notificaciones por correo electrónico dentro de la aplicación. 
Su objetivo es que los usuarios con permisos adecuados puedan gestionar qué correos se envían automáticamente, personalizar las notificaciones y revisar configuraciones sin necesidad de acceder al backend directamente.

---

# Estructura visual y componentes

1. Botón de navegación

- Back:

    - Permite regresar a la pantalla anterior de manera rápida.

    - Estilo: pequeño, con borde delineado y color neutro para no sobrecargar la interfaz.

    - Ubicación: al inicio de la sección, sobre las configuraciones de notificaciones.

2. Encabezado de sección

- Texto principal: Mail notifications

- Estilo: tamaño de fuente mediano-grande (text-xl) para destacar la sección.

- Ubicación: justo debajo del botón de navegación, centrado horizontalmente con espacio entre otros elementos si existieran.

3. Área de configuración

- Contiene el componente MailNotificationsConfig.

- Función: mostrar todas las opciones configurables para las notificaciones por correo electrónico, incluyendo:
 
    - Activación o desactivación de distintos tipos de correos.
 
    - Personalización de destinatarios y plantillas.

    - Configuración de alertas automáticas según eventos del sistema.

- Diseño: separado del encabezado por un margen superior para claridad visual y mejor organización de la interfaz.

---

# Funcionalidad y flujo de uso

1. Acceso a la sección

    - El usuario accede a “Mail Notifications Administration” desde el menú principal de administración.

    - El layout utilizado es el layout por defecto de la aplicación, garantizando consistencia con otras secciones.

2. Navegación

    - El botón Back permite regresar a la pantalla anterior sin necesidad de guardar cambios, ideal para revisión rápida o navegación entre módulos administrativos.

3. Configuración de notificaciones

    - Los usuarios pueden ajustar la configuración de correo desde el componente central MailNotificationsConfig, que ofrece todas las opciones disponibles de manera visual y accesible.

    - Cambios realizados pueden afectar la recepción de alertas y notificaciones automáticas del sistema.

4. Usabilidad

    - La sección está diseñada para ser clara y sencilla:

        - Botón de regreso destacado pero discreto.
 
        - Encabezado visible y descriptivo.

        - Área principal de configuración aislada, evitando confusión con otros elementos de la interfaz.

---

# Beneficios para el usuario

1. Control centralizado: permite gestionar todas las notificaciones por correo desde un solo lugar.

2. Facilidad de uso: interfaz clara, con navegación sencilla y acciones intuitivas.

3. Flexibilidad: posibilidad de personalizar destinatarios y tipos de notificaciones según las necesidades de la empresa.

4. Seguridad: acceso restringido a usuarios con permisos de administración para evitar cambios no autorizados.

5. Consistencia visual: mantiene el mismo estilo y layout que otras secciones administrativas, mejorando la experiencia de usuario.

---

La sección de Mail Notifications Administration permite gestionar todas las notificaciones que el sistema envía por correo electrónico. 
Su propósito es que los administradores puedan configurar qué notificaciones se envían, a quiénes y bajo qué condiciones.

**Acceso a la sección**

- Los usuarios con permisos administrativos pueden acceder a esta sección desde el menú principal del sistema.

- Al ingresar, se muestra el encabezado de la sección y un botón "Back" que permite regresar a la pantalla anterior sin realizar cambios.

**Funcionalidades principales**

1. Visualización de la sección:

    - La pantalla principal muestra un encabezado con el título "Mail notifications" y carga un componente central de configuración llamado MailNotificationsConfig.

2. Configuración de notificaciones:

    - Activar o desactivar notificaciones específicas según el tipo de evento o acción del sistema.

    - Definir destinatarios de los correos electrónicos.

    - Editar plantillas de correo para personalizar el contenido que se envía.

3. Acciones disponibles:

    - Guardar cambios: aplica la configuración modificada y confirma mediante un mensaje de éxito.

    - Salir sin guardar: permite regresar a la pantalla anterior sin alterar la configuración actual.

**Propósito y uso**

Esta sección garantiza que las notificaciones por correo sean eficientes, personalizadas y controladas, evitando envíos innecesarios y asegurando que la información importante llegue a los destinatarios correctos.

---

# Gestión de Notificaciones por Correo – Búsqueda y Administración

Esta sección permite visualizar, filtrar, y administrar las notificaciones por correo electrónico dentro del sistema, incluyendo la información sobre departamentos, nombres de notificaciones, descripción y fecha de creación.

---

**Filtros de búsqueda**

La interfaz proporciona herramientas para filtrar las notificaciones de manera rápida y precisa:

1. **Nombre de la notificación:**

    - Permite buscar notificaciones específicas por su nombre o título corto.

2. Departamento:

    - Permite seleccionar uno o varios departamentos para filtrar las notificaciones asociadas.

3. Acciones sobre filtros:

    - Clear: limpia todos los filtros y muestra nuevamente la lista completa.

    - Search: aplica los filtros seleccionados y actualiza la lista de notificaciones.

---

# Listado de notificaciones

Las notificaciones se presentan en una tabla compacta que muestra la información principal de cada registro:

- Acciones:

    - Permite editar la notificación seleccionada.

    - Los elementos eliminados se muestran con un fondo diferenciado para identificar registros inactivos.

- Departamentos asociados:

    - Cada notificación puede estar vinculada a uno o varios departamentos.

    - Los departamentos se muestran como etiquetas (chips) para una rápida identificación visual.

- Nombre de la notificación:

    - Se muestra el nombre corto o identificador de la notificación.

- Descripción:

    - Contiene información detallada sobre el propósito de la notificación.

- Fecha de creación:

    - Indica cuándo fue creada la notificación, mostrando la fecha en formato legible.

---

**Paginación**

- El listado de notificaciones se maneja con paginación, permitiendo navegar entre diferentes páginas de resultados.

- Se puede seleccionar la página a visualizar y la lista se actualiza automáticamente según el filtro aplicado.

---

**Funcionalidades adicionales**

- Edición de notificaciones:

    - Al seleccionar una notificación, el sistema redirige a la pantalla de edición correspondiente, donde se pueden modificar los detalles de la notificación.

- Carga de catálogos:

    - La sección obtiene información de catálogo de departamentos desde el sistema para permitir filtrados correctos y consistentes.
 
- Indicadores visuales de carga:

    - Mientras se obtienen los datos, se muestra un indicador de carga para informar al usuario que el sistema está procesando la solicitud.

- Actualización dinámica:

    - Cada acción (filtrado, limpieza de filtros, paginación) actualiza dinámicamente el listado sin necesidad de recargar la página.

---

Esta sección está diseñada para que los administradores puedan gestionar de manera efectiva todas las notificaciones del sistema, asegurando que estén correctamente asignadas, visibles y accesibles según los departamentos y criterios de búsqueda definidos.

---
# Secciones que puedes agregar o ampliar

1. Encabezado de la sección

Agrega una pequeña descripción visual del encabezado “Mail notifications”, indicando que es el título principal de la vista:

El encabezado Mail notifications identifica la sección del sistema dedicada a la administración de notificaciones automáticas por correo electrónico. Permite gestionar alertas, recordatorios y avisos internos relacionados con procesos operativos.

---

2. Campo de búsqueda – Diseño y comportamiento

Menciona que los campos “Name” y “Department” están alineados horizontalmente y se complementan con botones de acción:

Los campos de búsqueda están organizados en una barra superior.

- El campo Name admite texto libre.

- El campo Department utiliza un menú desplegable con selección única.
 
- Los botones Clear y Search están alineados a la derecha y tienen colores distintivos para facilitar su uso (gris para limpiar, azul para buscar).

---

3. Tabla principal – Detalles visuales

Agrega una descripción más visual de la tabla:

La tabla presenta un diseño oscuro con texto claro para mejorar la legibilidad.
Cada fila representa una notificación del sistema y las columnas incluyen:

- Actions: muestra un ícono de lápiz azul que permite editar.
 
- Departments: aunque no se muestran etiquetas en la imagen, el espacio está reservado para indicar a qué departamento pertenece la notificación.
 
- Name: indica el identificador del evento (por ejemplo: AirExportRevalidation, InvoiceTmCancelled).
 
- Description: ofrece una descripción legible de la función de cada notificación.

- Created At: indica la fecha y hora exacta en que fue creada, mostrando uniformemente “7 May 2025 2:30 AM”.

---

4. Orden y consistencia de datos

Puedes añadir una nota sobre la consistencia y el formato:

Todas las notificaciones visibles comparten la misma fecha de creación, lo cual indica una carga inicial o migración de datos en lote.
Los nombres siguen una convención camelCase o PascalCase, lo que facilita la lectura técnica y evita duplicados.

---

5. Función del ícono de acción

Incluye una breve explicación del ícono circular con lápiz:

El ícono circular azul con lápiz representa la acción Editar.
Al seleccionarlo, se accede a la pantalla de edición donde se pueden modificar los campos del registro (nombre, descripción, departamento, o configuración del correo).

---

6. Indicaciones de interfaz no visibles (comportamientos esperados)

Aunque no se muestra en la imagen, el sistema puede incluir:

- Mensajes de confirmación al editar o guardar cambios.

- Alertas o notificaciones flotantes para indicar éxito o error en las operaciones.

- Criterios de ordenamiento por columnas al hacer clic en los encabezados.

---

7. Experiencia de usuario

La interfaz está optimizada para uso administrativo, priorizando velocidad y simplicidad.
El diseño oscuro ayuda a reducir la fatiga visual, especialmente en ambientes de monitoreo o uso prolongado.
El sistema está preparado para búsquedas instantáneas, mostrando resultados en tiempo real sin recargar la página completa.

---

