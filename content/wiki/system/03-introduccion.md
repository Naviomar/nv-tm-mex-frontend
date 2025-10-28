---
title: System Banks Accounts – Bank Administration
summary: Configuración y administración de las cuentas bancarias del sistema.
order: 3
status: stable
version: 1.0.0
updatedAt: 2025-09-22
module: system-banks
roles: [Administrador, Finanzas]
tags: [bancos, cuentas, configuración, administración]
---

# Introducción
El módulo **Bank Accounts Administration** permite gestionar las cuentas bancarias que utiliza el sistema.  
Incluye la creación, modificación y seguimiento de las cuentas registradas.

El módulo Bank Accounts permite visualizar, gestionar y editar las cuentas bancarias asociadas a cada empresa registrada dentro del sistema. 
Desde esta vista, los usuarios con permisos adecuados pueden revisar la información financiera de las empresas, agregar nuevas cuentas, modificar datos existentes o eliminar registros bancarios no vigentes.

La interfaz se encuentra organizada de manera visual y comparativa, mostrando los datos de cada empresa en columnas independientes, permitiendo una revisión rápida y ordenada.

# Componentes principales
- **SystemBanksAdministration** → Componente principal para administrar las cuentas bancarias.

**SystemAccountsConfig**
Vista general de configuración de las cuentas del sistema.  
Desde aquí se pueden visualizar las **entidades bancarias principales** registradas (empresas), sus RFC, dirección fiscal y códigos postales.

**SystemBanksAdministration**
Permite **administrar las cuentas bancarias específicas** asociadas a cada entidad registrada.  
Cada entidad puede tener múltiples cuentas bancarias en distintas divisas o bancos.

# Funcionalidades
- Registrar nuevas cuentas bancarias.
- Editar o eliminar cuentas existentes.
- Asociar cuentas con operaciones financieras del sistema.

# Interfaz del módulo

La interfaz se divide en dos áreas principales:

**Encabezado**

- **Botón azul “CREAR CUENTA DEL SISTEMA””**  
  Permite crear una nueva cuenta del sistema o registrar una nueva empresa emisora.  
  Abre un formulario donde se ingresan datos como nombre, RFC o número de registro fiscal, dirección y país.

- **Enlace “Cuentas bancarias del sistema” con ícono de recarga**  
  Actualiza la lista de cuentas mostradas, garantizando que siempre se visualicen los datos más recientes tras crear o editar alguna cuenta.

---

# Sección: System Bank Accounts

Esta sección lista las **entidades registradas** que tienen relación con el sistema financiero.  
Cada tarjeta corresponde a una **empresa o razón social** con cuentas bancarias asociadas.

---

## **Transporte Multimodal**

**Identificador fiscal:** `TMU861110IP2`  
**Dirección:** Baja California #309, Col. Hipódromo, Alcaldía Cuauhtémoc, Ciudad de México  
**Código postal:** `06100`  
**Acceso rápido:**  
- Botón “VIEW BANK ACCOUNTS” → Abre la lista de cuentas bancarias asociadas a esta empresa.  
- Ícono de banco verde 🏦 → Indica que esta entidad tiene **cuentas activas** en el sistema.  
- Botón circular ▼ → Despliega acciones adicionales o detalles extendidos (como edición o eliminación).

**Descripción funcional:**  
Esta entidad representa la razón social **mexicana** del sistema.  
Todas las operaciones financieras dentro del territorio nacional (pagos, facturación local, CFDI, etc.) se vinculan a esta cuenta.

---

## **World Maritime**

**Identificador fiscal internacional:** `CHE-102.207.320`  
**Dirección:** St. Alban - Anlage 46, 4052 Basel, Switzerland  
**Código postal:** `4052`  
**Acceso rápido:**  
- Botón “VIEW BANK ACCOUNTS” → Muestra las cuentas bancarias internacionales o en divisas extranjeras.  
- Ícono verde 🏦 → Indica que esta entidad tiene **cuentas activas vinculadas**.  
- Botón circular ▼ → Despliega opciones avanzadas o edición de datos.

**Descripción funcional:**  
Corresponde a la razón social **internacional**, utilizada para operaciones de comercio exterior, pagos internacionales y cuentas en divisas (USD, EUR, CHF).  
Su registro permite mantener la trazabilidad fiscal y financiera de las operaciones fuera de México.

---

# Funcionalidades generales del módulo

| Función | Descripción |
|----------|-------------|
| **Crear cuenta del sistema** | Permite registrar una nueva entidad con sus datos fiscales y dirección. |
| **Ver cuentas bancarias** | Acceso directo a las cuentas asociadas de cada empresa registrada. |
| **Actualizar lista de cuentas** | Mediante el ícono de recarga se sincroniza la información del módulo. |
| **Expandir información** | El botón desplegable (▼) puede mostrar opciones de edición o detalles adicionales. |
| **Identificación visual** | Cada entidad se representa con una tarjeta de color amarillo claro y un ícono bancario verde. |

---

# Flujo de trabajo típico

1. **Crear una nueva cuenta del sistema**  
   El administrador presiona **“CREATE SYSTEM ACCOUNT”** e ingresa los datos fiscales y dirección de la empresa.  

2. **Verificar la entidad registrada**  
   Una vez guardada, la empresa aparece como tarjeta en la vista principal, junto con su RFC o registro fiscal.  

3. **Asociar cuentas bancarias**  
   A través del enlace **“VIEW BANK ACCOUNTS”**, se accede al módulo donde se registran las cuentas bancarias individuales (con su número CLABE, banco y divisa).  

4. **Sincronizar información**  
   Se utiliza el botón de recarga (🔄) para actualizar la lista y confirmar los cambios realizados.  

---

# Notas adicionales

- El fondo de cada tarjeta (amarillo pálido) identifica **entidades activas** en el sistema.  
- Las tarjetas se muestran en disposición horizontal con bordes redondeados y estructura tipo **card layout**.  
- Cada entidad puede contener múltiples cuentas bancarias, tanto nacionales como internacionales.  
- La gestión de cuentas específicas (por ejemplo, número de cuenta, banco y divisa) se maneja en el submódulo **System Bank Accounts Details**.

---

# Roles con acceso

| Rol | Permisos |
|------|----------|
| **Administrador** | Acceso total para crear, editar y eliminar cuentas del sistema. |
| **Finanzas** | Acceso para visualizar y gestionar cuentas bancarias asociadas. |
| **Consulta General** *(opcional)* | Puede tener permisos de solo lectura para auditoría o revisión. |

---

El módulo **System Banks Accounts** es esencial para la correcta **integración financiera** del sistema.  
Permite mantener organizada la estructura fiscal de las entidades registradas y garantiza que las transacciones bancarias se ejecuten con la información corporativa adecuada.

Su diseño modular facilita la administración simultánea de **entidades nacionales e internacionales**, ofreciendo una visión completa y unificada de las cuentas utilizadas en todas las operaciones del sistema.

---

**Vista principal: Config System Accounts**

Esta vista representa la pantalla principal del módulo de administración de cuentas bancarias del sistema. 
Es el punto de entrada donde los usuarios con permisos administrativos o financieros pueden configurar, visualizar y gestionar las cuentas bancarias asociadas a la organización.

---

Propósito general

El objetivo de esta vista es centralizar la administración de las cuentas bancarias del sistema, tanto nacionales como internacionales, dentro de un entorno visual limpio y unificado.
Desde esta página, los administradores pueden registrar nuevas cuentas, editar la información existente o eliminar registros que ya no sean válidos.

La página sirve como contenedor principal del componente encargado de mostrar y administrar las entidades bancarias registradas. 
Además, establece la estructura visual y el contexto de la funcionalidad, manteniendo coherencia con el resto del sistema administrativo.

---

**Estructura general**

La interfaz contiene tres elementos principales:

1. Encabezado o título de la vista
En la parte superior se muestra el texto “Config system accounts”, que identifica de forma clara el propósito del módulo.
Este encabezado mantiene la misma línea visual que el resto de las secciones de configuración del sistema, utilizando tipografía destacada, estilo subrayado y espaciado adecuado para diferenciarlo del contenido operativo.

2. Contenedor principal de contenido
Toda la información de cuentas bancarias se organiza dentro de un contenedor flexible y adaptable a distintos tamaños de pantalla.
Este diseño garantiza una visualización correcta tanto en monitores grandes como en dispositivos más pequeños, sin perder claridad ni legibilidad.
El contenedor actúa como marco general que mantiene alineado el contenido y permite futuras expansiones, como filtros, paginación o indicadores visuales.

3. Componente de administración de bancos del sistema
Dentro de este contenedor se integra el módulo funcional encargado de desplegar y gestionar las cuentas bancarias.
Aquí se listan todas las entidades registradas (por ejemplo, “Transporte Multimodal” o “World Maritime”) junto con sus datos fiscales, dirección, códigos postales y opciones para visualizar las cuentas asociadas.
También incluye un botón destacado que permite crear nuevas cuentas bancarias del sistema, así como una opción de actualización para sincronizar la información más reciente.

---

**Comportamiento y flujo de uso**

1. El usuario accede al módulo desde el menú principal del sistema administrativo.

2. La vista muestra inmediatamente el encabezado “Config system accounts” y, debajo, el listado completo de cuentas bancarias configuradas.

3. Desde esta interfaz, el usuario puede:

    - Consultar los datos de cada entidad bancaria registrada.

    - Ingresar al detalle de sus cuentas mediante el botón “View Bank Accounts”.

    - Crear una nueva cuenta del sistema utilizando la opción “Create System Account”.

    - Sincronizar la lista actualizada de cuentas mediante la opción de recarga.

4. Toda la interacción se realiza dentro del mismo entorno, sin necesidad de cambiar de módulo o recargar toda la página, lo que mejora la eficiencia del flujo de trabajo.

---

**Integración dentro del sistema**

Esta página forma parte del módulo de administración bancaria, el cual se encuentra bajo la categoría de configuración del sistema.
Su propósito es mantener actualizada la información financiera institucional, garantizando que las operaciones contables y los movimientos bancarios se realicen con datos confiables y bien organizados.

El módulo utiliza la estructura estándar del sistema, lo que significa que:

- Comparte el mismo diseño y layout que las demás páginas administrativas.

- Se adapta automáticamente a los permisos del usuario autenticado.

- Puede integrarse con otros módulos, como finanzas, cuentas por pagar o control de gastos, para enlazar operaciones con cuentas específicas.

---

**Aspectos técnicos y funcionales**

- Título de la vista: Bank Accounts Administration.

- Ubicación dentro del sistema: Módulo de configuración del sistema, sección de bancos.

- Tipo de usuarios con acceso: Administradores del sistema y personal del área de finanzas.

- Funciones principales:

    - Mostrar todas las cuentas bancarias registradas.

    - Permitir la creación, edición o eliminación de cuentas.
 
    - Facilitar la consulta de información fiscal y de localización.

    - Ofrecer acceso rápido a las cuentas bancarias de cada entidad.

    - Mantener sincronizados los datos financieros del sistema.

---

**Beneficios**

- Centralización: agrupa todas las cuentas bancarias institucionales en una sola interfaz.

- Eficiencia: permite realizar modificaciones y consultas sin navegar entre múltiples secciones.
 
- Claridad visual: el diseño estructurado facilita la identificación de cada entidad y su información relevante.

- Escalabilidad: admite la incorporación de nuevos bancos o cuentas en el futuro sin necesidad de rediseñar el módulo.

- Coherencia: mantiene el mismo formato visual y funcional que los demás apartados del sistema administrativo.

---

La vista Config System Accounts es el componente que da acceso a la administración completa de las cuentas bancarias del sistema.
Su función principal es servir como interfaz de gestión para las entidades bancarias registradas, integrando opciones de consulta, creación y mantenimiento en un entorno unificado, intuitivo y alineado con los estándares del sistema.

---

**Sección: System Bank Accounts**

Esta sección representa el núcleo operativo del módulo de cuentas bancarias del sistema, donde se visualizan, actualizan y gestionan todas las cuentas institucionales registradas.
Su propósito principal es mostrar de forma estructurada la información de las cuentas configuradas, permitiendo su consulta directa y brindando al usuario herramientas para mantener los datos actualizados en tiempo real.

---

**Estructura general y propósito**

El diseño de esta vista sigue un enfoque claro y jerárquico: inicia con un encabezado funcional, continúa con una zona de control de carga de información y finaliza mostrando el listado de cuentas en formato de tarjetas interactivas.

Su composición permite al usuario visualizar el estado completo del sistema bancario interno, detectar si existen cuentas configuradas y actualizar los datos con un solo clic.

El encabezado principal, con el texto “System Bank Accounts”, actúa como identificador del módulo y establece la función específica de la vista. Junto al título se incluye un ícono de recarga o actualización, que al ser presionado ejecuta la función encargada de sincronizar los datos con el servidor. Esta acción asegura que la información mostrada corresponda siempre a los registros más recientes.

---

**Gestión del estado de carga**

Durante el proceso de sincronización o consulta de datos, el sistema muestra un indicador visual de carga en forma de estructura temporal (skeleton loader).
Este elemento tiene el propósito de mantener una experiencia fluida y transparente para el usuario, comunicando que el sistema se encuentra procesando información.
El uso de este tipo de elemento visual reduce la incertidumbre del usuario y refuerza la percepción de respuesta inmediata del sistema, incluso cuando las operaciones requieren algunos segundos.

Si el sistema no encuentra registros de cuentas configuradas, se muestra una alerta visual en tono de advertencia.
Esta alerta comunica de manera clara y no invasiva que actualmente no existen cuentas bancarias registradas, incentivando al usuario a utilizar la opción de creación disponible en otras secciones del módulo.
De esta forma, la interfaz guía al usuario mediante mensajes informativos sin generar errores visuales ni interrupciones.

---

**Visualización de cuentas registradas**

Cuando el sistema obtiene los datos correctamente, las cuentas bancarias se despliegan dentro de una rejilla adaptable que organiza los elementos de manera limpia y proporcional.
En dispositivos de escritorio, la información se muestra en dos columnas, mientras que en pantallas pequeñas se adapta automáticamente a una sola columna, manteniendo una experiencia de uso coherente y legible en todo momento.

Cada cuenta se presenta mediante una tarjeta de detalle individual, representada por el componente System Account Detail Card.
Estas tarjetas contienen la información principal de cada cuenta: nombre de la entidad, número de cuenta, tipo de banco, país, moneda y demás detalles relevantes.
Además, incorporan elementos interactivos que permiten realizar acciones como edición, actualización o visualización de movimientos asociados, dependiendo de los permisos del usuario.

---

**Actualización dinámica de datos**

El sistema está diseñado para funcionar de manera reactiva y automatizada.
Cuando se realiza una modificación en alguna cuenta (por ejemplo, después de guardar cambios o crear una nueva cuenta), el componente ejecuta automáticamente un proceso de actualización para refrescar la lista de cuentas mostradas.
De este modo, la información visible en pantalla siempre refleja el estado actual del sistema, evitando que el usuario tenga que recargar la página manualmente.

Este comportamiento es complementado por la funcionalidad del botón de recarga del encabezado, que permite al usuario forzar manualmente una sincronización general si lo considera necesario.
El proceso está optimizado para mantener un equilibrio entre rendimiento y usabilidad, asegurando que las operaciones de consulta sean rápidas y confiables.

---

**Integración con el sistema principal**

La vista System Bank Accounts se integra directamente con la capa de comunicación de la aplicación, estableciendo conexión con la API central encargada de gestionar las cuentas del sistema.
A través de esta integración, el módulo obtiene los datos en tiempo real desde el backend y los presenta en formato visual al usuario.
Asimismo, se vincula con el sistema global de carga y estado del proyecto (loading store), el cual controla los indicadores visuales de espera y garantiza una experiencia uniforme en toda la plataforma.

Gracias a esta integración, el módulo puede:

- Consultar todas las cuentas bancarias registradas en el sistema central.

- Detectar y manejar errores de conexión o fallos de respuesta.

- Actualizar la información después de cada modificación o evento exitoso.

- Mantener una experiencia fluida incluso durante operaciones asincrónicas.

---

**Beneficios funcionales**

- Actualización inmediata: los cambios en las cuentas se reflejan automáticamente sin necesidad de recargar la página.

- Claridad visual: cada cuenta se presenta en tarjetas individuales, facilitando su identificación.

- Adaptabilidad: la disposición de las tarjetas se ajusta dinámicamente a distintos tamaños de pantalla.

- Transparencia en procesos: los indicadores de carga y las alertas informativas comunican claramente el estado del sistema.
 
- Control centralizado: el usuario puede refrescar o verificar la información en cualquier momento con un solo clic.

---

**Experiencia de usuario**

Desde el punto de vista del usuario, esta sección transmite una sensación de orden, control y eficiencia.
Cada elemento tiene un propósito bien definido: 
E
l encabezado facilita la orientación, el ícono de recarga comunica actualización inmediata, los mensajes informan del estado actual, y las tarjetas agrupan la información relevante en bloques accesibles.

El flujo de interacción es directo: el usuario llega, revisa la lista, actualiza si es necesario, o accede a los detalles de una cuenta específica.

La transición entre los distintos estados (carga, vacío, listado) ocurre de manera suave y lógica, sin interrupciones visuales abruptas.

---

La sección System Bank Accounts constituye el centro de consulta y visualización de las cuentas institucionales dentro del sistema.
Integra funciones de sincronización, gestión del estado de carga, comunicación con la API y representación visual optimizada en un mismo entorno.
Gracias a su diseño adaptable, mensajes claros y lógica reactiva, este módulo proporciona una herramienta confiable, intuitiva y moderna para la administración bancaria dentro del sistema corporativo.

---

**Detalle del componente: SystemAccountDetailCard**

El componente SystemAccountDetailCard es una pieza clave dentro del módulo Bank Accounts Administration, ya que permite visualizar, administrar y modificar la información de las cuentas bancarias asociadas a una entidad o cuenta del sistema.

**Propósito general** 

Su función principal es mostrar la información completa de cada cuenta del sistema junto con las cuentas bancarias vinculadas, permitiendo al usuario realizar operaciones como agregar, editar, eliminar o restaurar cuentas bancarias específicas.

---

**Estructura general y presentación visual**

Cada tarjeta representa una cuenta del sistema, mostrando de forma clara los datos esenciales:

- Nombre de la cuenta y RFC o número fiscal.

- Dirección y código postal.

- Iconografía identificativa (por ejemplo, íconos de banco o moneda).

- Botones de acción interactivos con colores distintivos y animaciones al pasar el cursor.

Las tarjetas emplean colores verdes y lima para indicar cuentas activas, y tonos rojos claros para señalar cuentas eliminadas o inactivas, lo que facilita la interpretación visual del estado de cada cuenta.

---

**Funcionalidades principales**

1. Visualización general

Cada tarjeta muestra un resumen de la cuenta principal, incluyendo sus datos básicos y un listado de las cuentas bancarias asociadas.
Si la cuenta no tiene registros bancarios, se muestra un aviso de alerta informando “No bank accounts found”.

2. Expansión y colapso

Mediante un botón con ícono de flecha, el usuario puede expandir o contraer la información detallada de las cuentas bancarias asociadas.
Esto permite mantener una vista limpia y organizada cuando se manejan múltiples registros.

3. Agregar nueva cuenta bancaria

A través del ícono mdi-bank-plus, el usuario puede abrir un formulario emergente (SystemBankAccountForm) para registrar una nueva cuenta bancaria vinculada a la cuenta del sistema.
Esta acción se realiza sin salir de la vista actual, lo que agiliza el proceso de alta de cuentas.

4. Edición de cuentas bancarias

Cada cuenta listada incluye un botón “Edit” que permite modificar su información (como tipo, número de cuenta, dirección o moneda).
El formulario de edición se despliega directamente en el mismo componente, garantizando una experiencia fluida y sin recargas.

5. Eliminación y restauración

El botón “Delete / Restore” gestiona la activación o desactivación de cuentas bancarias.

- Si la cuenta está activa, la acción “Delete” la marcará como eliminada.

- Si ya fue eliminada, aparecerá la opción “Restore” para reactivarla.
Antes de ejecutar la acción, se muestra una ventana de confirmación que solicita aprobación del usuario para evitar errores.

6. Confirmaciones y notificaciones

El componente integra el sistema de confirmaciones y notificaciones del sistema.

- Confirm dialogs: para validar eliminaciones o restauraciones.

- Snackbars: para informar el resultado de las acciones (por ejemplo: “Bank account deleted”, “Bank account restored”).

7. Actualización automática

Tras cada operación (alta, edición o eliminación), se emite un evento @success hacia el componente padre, que actualiza automáticamente la lista de cuentas del sistema sin necesidad de recargar la página.

---

**Interacción con otros componentes**

- SystemBankAccountForm:
Utilizado para crear o editar una cuenta bancaria.
Se muestra condicionalmente dentro de la tarjeta según las acciones del usuario.

- UserInfoBadge:
Muestra de forma compacta la información del banco o del titular asociado a cada cuenta.

- Confirm Dialogs & Snackbar System:
Elementos globales del sistema encargados de manejar las confirmaciones visuales y los mensajes de éxito o error.

---

**Lógica y comportamiento interno**

El componente mantiene estados internos para controlar:

- show → Indica si la tarjeta está expandida o colapsada.

- showBankAcctForm → Determina si el formulario de cuenta bancaria está visible.

- editBankAccount → Almacena temporalmente la información de la cuenta que se está editando.

El flujo de interacción está diseñado para ser intuitivo y seguro, priorizando la validación y confirmación antes de modificar información sensible como los datos bancarios.

---

**Beneficios y diseño funcional**

- Gestión centralizada: permite administrar todas las cuentas bancarias de una entidad desde un único lugar.

- Usabilidad mejorada: la información está organizada en tarjetas dinámicas con colores y transiciones claras.

- Eficiencia operativa: las acciones CRUD (Crear, Leer, Actualizar, Eliminar) se realizan sin recargar la página.

- Claridad visual: los colores y alertas informan rápidamente el estado de las cuentas.

- Integración modular: se comunica fluidamente con otros componentes del sistema, manteniendo la arquitectura desacoplada.

---

# Formulario de Cuenta Bancaria: Descripción para usuarios

Este formulario permite a los usuarios agregar o editar información de una cuenta bancaria dentro del sistema de manera organizada y segura. 
Está diseñado para recopilar todos los datos necesarios de una cuenta de forma clara y con validación para evitar errores.

1. Título del formulario

- Se muestra un encabezado que indica al usuario que está en la sección de "Formulario de Cuenta Bancaria".

- Esto ayuda a identificar rápidamente la acción que se va a realizar: crear o modificar una cuenta.

2. Campos del formulario

Cada campo tiene un propósito específico para capturar información bancaria esencial:

1. Nombre del banco

    - Aquí el usuario ingresa el nombre de la institución bancaria donde tiene la cuenta.

    - Es obligatorio, ya que el sistema necesita saber a qué banco pertenece la cuenta.

2. Propósito o tipo de cuenta

    - Este campo permite al usuario describir para qué se usará la cuenta (por ejemplo, pagos internos, pagos de clientes, etc.).

    - Es obligatorio y tiene un texto de ayuda para orientar al usuario sobre qué información debe escribir.

3. Tipo de facturación

    - Permite seleccionar para qué tipo de facturación será utilizada la cuenta.

    - Se ofrece un listado de opciones que el usuario puede elegir, asegurando que la cuenta esté asociada correctamente a procesos de facturación.

4. Moneda

    - Permite seleccionar la moneda de la cuenta (por ejemplo, pesos, dólares, euros).

    - Esto es importante para que los montos y transacciones se registren correctamente.

5. Número de cuenta

    - Campo obligatorio donde el usuario ingresa el número de cuenta bancaria.

    - Solo se permiten números, para asegurar que los datos sean válidos para transacciones.

6. CLABE

    - La CLABE es un número único estandarizado para cuentas bancarias mexicanas.

    - Es obligatorio y sirve para identificar de manera precisa la cuenta en transferencias interbancarias.

7. Dirección completa

    - Área donde el usuario escribe la dirección física asociada a la cuenta.

    - Es importante para documentación y procesos administrativos.

8. Código postal

    - Campo para indicar el código postal correspondiente a la dirección.

    -Esto ayuda a validar la ubicación y facilita la gestión administrativa de la cuenta.
 
3. Botones de acción

Al final del formulario, se encuentran dos botones principales:

1. Cancelar

    - Permite al usuario cerrar el formulario sin guardar cambios.

    - Esto es útil si se abrió por error o si se desea abandonar la edición.

2. Guardar cuenta bancaria

    - Valida toda la información ingresada.

    - Si todos los campos obligatorios están completos y correctos, la información se envía al sistema para crear o actualizar la cuenta.

    - Una vez guardada, se muestra un mensaje de éxito indicando que la operación se completó correctamente.

    - Si faltan datos o hay errores, se muestra un mensaje solicitando que se completen todos los campos requeridos.

4. Comportamiento adicional del formulario

    - Si el formulario se abre para editar una cuenta existente, automáticamente carga los datos guardados para que el usuario pueda modificarlos.
 
    - El sistema verifica que toda la información sea válida antes de permitir guardar.

    - El formulario notifica al usuario con mensajes claros en caso de éxito o error.

    - Está diseñado para ser sencillo y directo, evitando que los usuarios ingresen datos incorrectos.

---

**Resumen para el usuario**

Este formulario está hecho para que puedas:

- Registrar una nueva cuenta bancaria o modificar una existente.

- Capturar todos los datos esenciales como banco, propósito, tipo de facturación, moneda, número de cuenta, CLABE, dirección y código postal.
 
- Recibir retroalimentación inmediata sobre errores o confirmación de éxito.

- Cancelar la operación si no quieres guardar cambios.

En pocas palabras, es una herramienta intuitiva que asegura que toda la información de tu cuenta bancaria esté completa y correcta antes de ser registrada en el sistema.

---

# Empresas registradas en el módulo

En el módulo System – Bank Accounts, cada empresa registrada en el sistema aparece con su información fiscal, ubicación y las cuentas bancarias asociadas. A continuación se describen los dos ejemplos visibles en la interfaz:

---

# TRANSPORTE MULTIMODAL

**Tipo de empresa:** Nacional (México)
**RFC:** TMU861110IP2
**Ubicación:**

- Dirección: Baja California #309, Colonia Hipódromo, Alcaldía Cuauhtémoc, Ciudad de México

- Código postal: 06100

**Descripción general:**

TRANSPORTE MULTIMODAL es una empresa mexicana registrada dentro del sistema como cliente o entidad operativa. 
Su información se muestra en el panel izquierdo de la vista, representando una organización con múltiples cuentas bancarias en distintas divisas (MXN y USD), utilizadas para operaciones locales e internacionales.

**Cuentas bancarias asociadas:**

1. Cuenta en pesos mexicanos (MXN)

    - Banco: HSBC México SA Institución de Banca Múltiple Grupo Financiero

    - Tipo: Cargos locales MXN

    - Número de cuenta: #137048972

    - Dirección: Paseo de la Reforma 347, Ciudad de México

    - Código postal: 06100

    - Uso principal: pagos nacionales y operaciones internas en moneda local.

2. Cuenta en dólares estadounidenses (USD)

    - Banco: HSBC México SA Institución de Banca Múltiple Grupo Financiero

    - Tipo: Demoras

    - Número de cuenta: #7001273796

    - Dirección: Paseo de la Reforma 347, Ciudad de México

    - Código postal: 06100

    - Uso principal: operaciones en divisa extranjera relacionadas con transporte internacional.

3. Cuenta en dólares estadounidenses (USD)

    - Banco: HSBC México SA Institución de Banca Múltiple Grupo Financiero

    - Tipo: Garantías USD

    - Número de cuenta: #7001481043

    - Dirección: Paseo de la Reforma 347, Ciudad de México

    - Código postal: 06100

    - Uso principal: cuentas de respaldo financiero o garantías para contratos de transporte.

**Características visuales en el sistema:**

- Las tarjetas de cuenta aparecen con fondo amarillo brillante.

- Cada tarjeta contiene el ícono de usuario financiero 👤, indicando que pertenece a una empresa registrada.

- Se presentan botones Edit y Delete para gestión directa desde la interfaz.

- Este panel muestra múltiples cuentas, reflejando la estructura financiera de una empresa con alta actividad bancaria.

---

# WORLD MARITIME

**Tipo de empresa:** Internacional (Suiza)
**Registro fiscal:** CHE-102.207.320
**Ubicación:**

- Dirección: St. Alban - Anlage 46, 4052 Basel, Switzerland

- Código postal: 4052
 
Descripción general:
WORLD MARITIME representa una empresa extranjera registrada dentro del sistema para operaciones de comercio y transporte marítimo internacional. 
Su información se despliega en el panel derecho, contrastando con la empresa mexicana. 
El registro demuestra la capacidad del sistema para administrar entidades internacionales con información fiscal y bancaria extranjera.

**Cuenta bancaria asociada:**

- Banco: Bank of America NT & SA

- Moneda: USD

- Tipo: Pago Fletes

- Número de cuenta: #6550240651

- Dirección: New York Branch, 10 W. 33rd Street, New York, N.Y. 10001, EE. UU.
 
- Código postal: 10001

- Uso principal: pagos internacionales de servicios de transporte y fletes marítimos.

**Características visuales en el sistema:**

- Su tarjeta también se presenta en color amarillo, dentro de un panel con fondo más claro.

- Al ser una empresa extranjera, se distingue por su dirección y código postal internacional.
 
- Incluye las mismas acciones de gestión (Edit y Delete) que las empresas locales.

- Este registro demuestra la interoperabilidad del sistema con datos de entidades globales.

**Comparativa funcional**

| Característica                  | TRANSPORTE MULTIMODAL                 | WORLD MARITIME                 |
| ------------------------------- | ------------------------------------- | ------------------------------ |
| **Tipo de empresa**             | Nacional (México)                     | Internacional (Suiza)          |
| **Número de cuentas bancarias** | 3                                     | 1                              |
| **Divisas manejadas**           | MXN y USD                             | USD                            |
| **Banco principal**             | HSBC México                           | Bank of America                |
| **Ubicación**                   | Ciudad de México                      | Basel, Suiza                   |
| **Uso de cuentas**              | Operaciones locales e internacionales | Pagos de fletes marítimos      |
| **Gestión desde la interfaz**   | Editar / Eliminar cada cuenta         | Editar / Eliminar cuenta única |

---

**Flujo de trabajo del usuario**

Esta sección describe las acciones que un usuario con permisos adecuados puede realizar dentro del módulo Bank Accounts, incluyendo la consulta, creación, edición y eliminación de cuentas bancarias asociadas a las empresas registradas en el sistema.

---

1. Consultar cuentas bancarias

**Objetivo:** visualizar las cuentas registradas por empresa.

**Pasos:**

1. Accede al sistema y selecciona el módulo System en el panel lateral izquierdo.

2. Dentro del menú, selecciona la opción Bank Accounts.

3. Se mostrará una vista dividida en columnas, donde cada columna corresponde a una empresa registrada.

4. En el encabezado de cada empresa, presiona View Bank Accounts para desplegar todas las cuentas bancarias disponibles.

5. Visualiza la información principal de cada cuenta, que incluye:

    - Nombre del banco

    - Tipo de cuenta

    - Moneda

    - Número de cuenta

    - Dirección y código postal

**Resultado esperado:** el usuario puede revisar las cuentas bancarias activas de cada empresa y su información detallada de manera clara y ordenada.

2. Crear una nueva cuenta bancaria

**Objetivo:** registrar una nueva cuenta asociada a una empresa existente.

**Pasos:**

1. Desde el módulo Bank Accounts, ubica la empresa a la que deseas agregar una cuenta.

2. Selecciona el botón Add Bank Account o su equivalente (si está disponible en el encabezado o dentro del menú de acciones).

3. Se abrirá un formulario con los siguientes campos obligatorios:

    - Bank name: nombre de la institución bancaria.

    - Currency: moneda de la cuenta (por ejemplo, MXN, USD, EUR).

    - Account type: tipo o finalidad de la cuenta (Cargos, Garantías, Pagos, Demoras, etc.).

    - Account number: número completo de la cuenta bancaria.

    -Address: dirección del banco o sucursal.
 
    - Zipcode: código postal del banco.

4. Una vez completados los datos, presiona Save o Guardar.

5. El sistema confirmará la creación y la nueva cuenta aparecerá automáticamente en la lista bajo la empresa seleccionada.

**Resultado esperado:** la cuenta bancaria queda registrada en el sistema y visible para todos los usuarios con acceso a la empresa.

3. Editar una cuenta bancaria existente

**Objetivo:** modificar los datos de una cuenta ya registrada.

**Pasos:**

1. Dentro del panel de la empresa correspondiente, localiza la tarjeta de la cuenta que deseas modificar.

2. Presiona el botón Edit (generalmente visible en la parte inferior derecha de la tarjeta).

3. El sistema abrirá un formulario editable con la información actual de la cuenta.

4. Realiza las modificaciones necesarias (por ejemplo, actualizar el tipo de cuenta, la dirección o el número de cuenta).

5. Guarda los cambios presionando Update o Guardar cambios.

6. La información se actualiza inmediatamente en la vista principal.

**Resultado esperado:** los nuevos datos quedan registrados y visibles para los demás usuarios del sistema.

4. Eliminar una cuenta bancaria

**Objetivo:** eliminar una cuenta bancaria inactiva o incorrecta del registro.

**Pasos:**

1. Localiza la tarjeta de la cuenta que se desea eliminar.

2. Presiona el botón Delete.

3. El sistema mostrará una ventana de confirmación.

4. Confirma la acción seleccionando Yes / Confirmar.

5. La cuenta desaparecerá de la lista de cuentas de la empresa.

**Resultado esperado:** la cuenta es removida del sistema y deja de estar disponible para futuras operaciones o consultas.

5. Roles y restricciones de acceso

El acceso y las acciones disponibles dependen del rol asignado al usuario:

| Rol                                       | Permisos disponibles                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| **Administrador del sistema**             | Ver, crear, editar y eliminar cuentas bancarias de cualquier empresa.     |
| **Coordinador de departamento**           | Ver y editar cuentas de empresas asignadas a su departamento.             |
| **Usuario con rol de lectura (Consulta)** | Solo puede visualizar la información. No puede crear, editar ni eliminar. |

6. Consideraciones adicionales

- El sistema admite tanto empresas nacionales como internacionales, mostrando direcciones y códigos postales según el país.

- Cada empresa puede tener múltiples cuentas bancarias en diferentes monedas.

- Las tarjetas de cuentas están diseñadas con colores contrastantes para facilitar la lectura y la diferenciación entre registros.

- La opción View Bank Accounts permite ocultar o expandir las listas, optimizando la visualización cuando existen muchos registros.

-Toda modificación queda registrada en el historial del sistema (si la bitácora está habilitada).

---

**Notas técnicas**

El módulo Bank Accounts forma parte del subsistema de Configuración y Administración de Empresas dentro de la categoría System. 
Está diseñado para garantizar la trazabilidad, consistencia y seguridad de la información financiera registrada.

**Arquitectura y comportamiento técnico**

- Ubicación del módulo: /system/bank-accounts
 
- Tipo de vista: panel comparativo por empresa (estructura en columnas paralelas).

- Componentes principales:

    - Listado de empresas con datos fiscales.

    - Tarjetas de cuentas bancarias con información detallada.

    - Botones de acción (Edit, Delete, View Bank Accounts).

- Compatibilidad: funciona de manera integrada con el registro de empresas y el módulo de administración de usuarios, permitiendo la vinculación por ID de empresa.

- Interactividad: cada acción de edición o eliminación ejecuta una solicitud al backend mediante API, actualizando la base de datos en tiempo real.
 
- Seguridad:

    - Los permisos están controlados por roles definidos en el módulo Roles & Permissions.

    - Solo usuarios autenticados con permisos de administrador o coordinador pueden modificar registros.

    - Se recomienda el uso de HTTPS para la transmisión segura de datos financieros.

- Campos validados:

    - Bank name → obligatorio, texto con longitud máxima de 150 caracteres.

    - Currency → debe corresponder a una divisa válida según el catálogo del sistema.
 
    - Account number → numérico, longitud máxima 20 caracteres.

    - Zipcode → formato alfanumérico, de acuerdo con el país seleccionado.

---

**Buenas prácticas de uso**

Estas recomendaciones aseguran la correcta administración y mantenimiento de la información bancaria en el sistema:

1. Estandarización de nombres de bancos:

    - Usar siempre el nombre completo y oficial de la institución financiera (por ejemplo, “HSBC México SA Institución de Banca Múltiple Grupo Financiero” en lugar de “HSBC MX”).

    - Evitar abreviaturas no reconocidas o inconsistentes entre empresas.

2. Homogeneidad de monedas:

    - Registrar las divisas en formato internacional ISO (MXN, USD, EUR, etc.).

    - Evitar crear cuentas con divisas no soportadas por el sistema.

3. Validación de datos:

    - Confirmar el número de cuenta antes de guardar cambios.

    - Verificar que la dirección y código postal correspondan a la sucursal correcta.

    - Mantener actualizados los datos de contacto del banco si el módulo lo permite.

4. Gestión de permisos:

    - Asignar permisos de edición solo a usuarios responsables de la administración contable o financiera.

    - Revisar periódicamente los roles de acceso mediante el módulo Roles & Permissions para evitar ediciones indebidas.

5. Mantenimiento y limpieza de registros:

    - Eliminar cuentas duplicadas o inactivas para mantener una base de datos ordenada.

    - Revisar las cuentas obsoletas cada trimestre o tras un cambio de institución bancaria.

6. Auditoría de cambios:

    - Si la bitácora está habilitada, revisar los logs de edición y eliminación de cuentas.

    -Documentar internamente los movimientos de actualización bancaria.
 
7. Consistencia entre empresas:

    - Asegurar que todas las empresas tengan al menos una cuenta bancaria principal.

    - En empresas internacionales, validar que la dirección bancaria y divisa correspondan al país de operación.

8. Seguridad y confidencialidad:

    - No compartir información de cuentas fuera del entorno del sistema.

    - Evitar incluir datos sensibles (como CLABE o SWIFT) en campos no destinados a ello, a menos que el sistema lo soporte expresamente.

---

El módulo System – Bank Accounts centraliza la gestión de cuentas bancarias de todas las empresas registradas en el sistema.
Su diseño visual, organizado por columnas y tarjetas, permite una gestión eficiente, segura y transparente de la información financiera.
La correcta aplicación de las buenas prácticas y la validación técnica asegura la integridad de los datos y facilita el control operativo dentro del entorno administrativo del sistema.

---

**Formulario de Cuenta del Sistema – System Account Form**

Propósito general

El System Account Form es un formulario diseñado para registrar o editar las cuentas del sistema dentro de la aplicación. 
Su objetivo es permitir a los usuarios con permisos adecuados ingresar toda la información fiscal y de ubicación de una entidad (empresa) de manera organizada, segura y validada.

El formulario garantiza que todos los campos obligatorios se completen correctamente antes de enviar los datos al backend, asegurando consistencia en la base de datos y evitando errores en la gestión de cuentas del sistema.

---

**Estructura visual**

El formulario se presenta con un diseño limpio y modular, utilizando Tailwind CSS para estilos y Vuetify para botones:

- Encabezado principal

    - Texto: System account form

    - Estilo: fuente en negrita (font-bold) y margen inferior (mb-2) para separación visual.

- Contenedor de campos

    - Disposición: grid de 12 columnas (grid grid-cols-12) con espacio entre columnas (gap-4).

    -Campos ocupan la mitad del ancho (col-span-6), centrando la información principal en la pantalla.
 
- Campos de entrada

    1. Nombre de la cuenta (InputText)

        - Label: Name *

        - Obligatorio (*)

        - Tipo: texto

        - Estilo: compacto (density="compact")

    2. Número fiscal / TAX ID (InputText)

        - Label: TAX ID *

        - Obligatorio

        - Tipo: texto

        - Estilo: compacto

    3. Dirección completa (InputTextArea)

        - Label: Full address *

        - Obligatorio

        - Área de texto multilinea

        - Estilo: compacto

    4. Código postal (InputText)

        - Label: Zip code *

        - Obligatorio

        - Tipo: numérico

        - Estilo: compacto

- Botones de acción

    - Cancelar

        - Color: secundario

        - Acción: emite evento close para cerrar el formulario sin guardar cambios.

    - Guardar

        - Color: primario

        - Acción: ejecuta la función save, validando y enviando los datos al backend.

---

**Comportamiento y flujo de uso**

1. Ingreso de datos

    - Los usuarios completan todos los campos obligatorios (Name, TAX ID, Full address, Zip code).

    - La validación se realiza en tiempo de envío, usando el esquema schema importado desde systemAccountForm.

2. Validación

    - Si todos los campos son correctos, se llama a la función onSuccess.

    - Si existen errores (campos vacíos, formato incorrecto), se llama a onInvalidSubmit, mostrando un mensaje de error.

3. Guardado de información

    - Función onSuccess:

        1. Envía los datos al endpoint.

        2. Muestra un snackbar de éxito con el mensaje: System account created.

        3. Emite el evento close para cerrar el formulario y regresar a la vista principal.

- Función onInvalidSubmit:

    - Muestra un snackbar de error indicando: Please fill all required fields.

4. Eventos y comunicación

    - Evento emitido: close → indica al componente padre que el formulario se ha cerrado (ya sea por cancelación o tras guardar con éxito).

5. Funciones internas

- Manejo de Envio (Éxito, envío no válido) → encapsula la validación y envío de datos.

- Guardar → es el disparador principal del botón "Save".
 
- Estados internos gestionados por useForm:

    - valor → datos del formulario.

    - errores → errores de validación.

    - meta → información de estado del formulario.

    - Manejar Restablecer → reinicia el formulario si se desea limpiar los campos.

---

**Integración con la aplicación**

- Se integra dentro de la vista de System Banks Accounts o cualquier módulo que requiera crear o editar cuentas de sistema.

- Funciona con el backend de la API para registrar cuentas de manera centralizada.

- Utiliza el sistema de notificaciones global (snackbar) para informar al usuario sobre éxito o error de la operación.

- Compatible con sistemas de validación definidos en el esquema, asegurando integridad de datos.

---

**Beneficios para el usuario**

1. Organización: todos los campos necesarios para registrar una cuenta se presentan en un solo formulario.

2. Validación automática: evita datos incompletos o incorrectos.

3. Retroalimentación inmediata: notificaciones visuales informan sobre errores o éxito.

4. Integración completa: se comunica con la API y emite eventos para mantener la interfaz reactiva.

5. Seguridad y control: los cambios se realizan solo por usuarios con permisos, evitando modificaciones no autorizadas.

---

