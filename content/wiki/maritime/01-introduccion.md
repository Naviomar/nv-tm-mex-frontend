---
title: Maritime Import 
summary: Proceso para crear, gestionar y cancelar una referencia de importación marítima en el sistema.
order: 12
status: stable
version: 1.3.0
updatedAt: 2025-10-03
module: maritime-imports
roles: [Operaciones, Documentación, Finanzas, Supervisión]
tags: [importaciones, marítimo, referencias, clientes, carga, intermodal, cancelación, validaciones, procesos, auditoría]
---

# Objetivo
Proporcionar una guía completa para la **creación, gestión y cancelación de referencias de importación marítima**, asegurando información precisa, cumplimiento de políticas internas y trazabilidad total del proceso.  

Sirve como manual de capacitación, referencia para auditorías internas y guía de buenas prácticas operativas.

---

# Alcance
Aplica a los siguientes perfiles:  
- **Operaciones marítimas**: captura, seguimiento, coordinación con agentes y transporte intermodal.  
- **Finanzas**: validación de facturación, créditos y garantías, supervisión de cancelaciones.  
- **Documentación**: gestión de BLs, arrival notifications, cartas de garantía y reportes.  
- **Supervisión**: verificación de políticas, autorización en casos especiales y seguimiento de incidentes.  

Incluye actividades:  
- Captura de naviera, buque y viaje.  
- Configuración de puertos, consignatarios y clientes.  
- Registro de carga, contenedores, embalajes y commodities.  
- Validación de créditos, garantías y días libres.  
- Configuración de transporte intermodal.  
- Cancelación de referencias cumpliendo con requisitos contables y financieros.  
- Registro de incidencias y notas internas.  

> ⚠️ Excepciones fuera del alcance deben escalarse a Supervisión.

---

# Flujo general
1. Abrir **Maritime → Imports → New Reference** (con permisos activos).  
2. Seleccionar año, línea, buque y viaje; el sistema asigna un folio único.  
3. Capturar puertos de origen, POL y POD; validar que POL ≠ POD.  
4. Ingresar clientes (Consignee, Shipper, Notify) y validar crédito y garantías.  
5. Agregar información de carga: contenedores, embalajes, commodities, peso y volumen.  
6. Revisar documentos, contratos y condiciones especiales de la naviera.  
7. Configurar intermodalidad (Rail, Truck o combinación) según itinerario y tipo de carga.  
8. Guardar la referencia; se activa flujo financiero y logístico.  
9. Registrar cualquier incidente o desviación durante el proceso.  
10. Ejecutar cancelación únicamente si todos los requisitos contables están cumplidos.

---

# Secciones principales

## Incidentes
Registrar situaciones extraordinarias:  
- **Damaged**: daños en contenedores o mercancía.  
- **Lost**: pérdida de carga.  
- **Abandon**: consignatario no reclamó.  
- **Stolen**: robo confirmado.  

> Registrar inmediatamente para trazabilidad y coordinación con seguros, naviera y clientes.

### Buenas prácticas
- Documentar evidencia fotográfica cuando sea necesario.  
- Notificar a todas las áreas involucradas (operaciones, seguros, finanzas).  
- Registrar en auditoría interna el seguimiento y resolución del incidente.

---

## Datos básicos
- **Línea responsable, Buque y Viaje**: validados contra catálogos internos.  
- **ETD/ETA**: fechas estimadas de salida y llegada; afectan cálculo de días libres.  
- **Freight Forwarder**: opcional, si aplica.  

### Buenas prácticas
- Revisar cambios de itinerario y actualizar ETD/ETA.  
- Mantener contacto con el agente de puerto para confirmar datos en tiempo real.

---

## Viajes y contratos
- Cada referencia debe estar respaldada por un contrato vigente con la naviera.  
- Se registran número de contrato, vigencia, tarifas, rebates y free days.  

### Alertas
- Si no hay contrato vigente, el sistema bloquea el guardado de la referencia.  
- Los cambios en tarifas o free days deben actualizarse antes de guardar.

---

## Puertos
- **Origen**, **POL**, **POD**, **Destino**.  
- Validación obligatoria: POL ≠ POD.  

### Caso práctico
- Origen: Shanghái, China  
- POL: Shanghái  
- POD: Manzanillo, México  
- Destino: Guadalajara, México (vía intermodal)  

### Buenas prácticas
- Verificar que puertos estén activos en catálogo antes de guardar.  
- Coordinar con transporte terrestre para destinos finales.

---

## Documentos
- **BLs**: Master y House, PO Number, Booking Number.  
- Archivos obligatorios: PDF, escaneos de documentos legales y comerciales.  
- **Notas internas**: Sea Service Notes para auditoría y seguimiento.

---

## Información del cliente
- **Consignee**: obligatorio, busca en catálogo activo.  
- **Shipper/Notify**: opcionales, pueden coincidir con Consignee.  
- Selección de agente de liberación y tipo de liberación (Original, Copy, Console).  
- **Arrival Notifications** automáticas según condición de pago (Prepaid/Collect).  

### Buenas prácticas
- Validar crédito disponible y días libres antes de guardar.  
- Bloqueo automático si cliente tiene crédito vencido.

---

## Información intermodal
- Rail, Truck, o Rail & Truck.  
- No modificable si **arrival notification** o **revalidación** incompletas.  
- Define costos, tiempos de tránsito y coordinación logística posterior.  

### Restricciones
- Mensaje de bloqueo: *“Intermodal information cannot be modified. Arrival notification and revalidation process must be completed.”*

---

## Cancelación de referencias
- Requiere: facturas cliente, naviera y proveedor cerradas.  
- Botón de cancelación activo solo cuando todos los requisitos se cumplen.  
- Una vez cancelada, la referencia no puede reabrirse.  

### Mensajes y alertas
- “In order to cancel a reference, all requirements must be met.”  
- Revisión doble en fase 2 para asegurar consistencia contable.

---

## Validaciones
- Campos obligatorios: POL, POD, Consignee, ETD.  
- Crédito vigente del cliente.  
- Bloqueos automáticos si revalidación o viaje cerrado no completados.  
- Todas las validaciones quedan registradas en auditoría.

---

## Guardado
- **Save changes**: guarda y asigna número único.  
- **Return**: salir sin guardar.  
- Confirmación: *“Reference successfully created. REF#IMP-2025-000123”*

---

## Importación de referencias
- Permite automatizar la carga desde CSV/XLSX/JSON.  
- Validaciones: duplicados, campos obligatorios completos, formatos correctos.  
- Mensajes de error: duplicado, formato incorrecto, catálogo inválido, codificación errónea.  

### Recomendaciones
- Verificar archivo fuente antes de importación.  
- Mantener respaldo de datos originales.  
- Revisar log de importación para corregir errores.

---

## Selección de clientes (Autocomplete)
- Búsqueda dinámica de Consignees activos.  
- Sugerencias mientras se escribe (mínimo 3 caracteres).  
- Clientes eliminados aparecen deshabilitados.  
- Permite limpiar selección mediante botón Clear.

---

## Auditoría y seguimiento
- Registro automático de todas las acciones: creación, edición, cancelación y revalidación.  
- Fechas, usuario responsable y cambios realizados quedan almacenados.  
- Permite trazabilidad completa para auditorías internas y externas.

---

## Referencias cruzadas
- **Air Import**: para operaciones multimodales con importación aérea.  
- **Finance Module**: validación de facturas y créditos.  
- **Documentation Module**: gestión de BLs y cartas de garantía.

### Componente – Autocomplete de Clientes (Consignees)

## Propósito general

Este componente permite buscar y seleccionar clientes de manera dinámica desde un catálogo remoto (por ejemplo, una API de consignees). Su objetivo principal es:

- Facilitar la selección rápida de un cliente mediante búsqueda de texto.

- Evitar sobrecargar el formulario con listas grandes cargadas al inicio.

- Integrar validación y control de selección.

- Proporcionar retroalimentación al usuario sobre resultados, errores o elementos no disponibles.

Es especialmente útil en formularios de logística o transporte donde se manejan múltiples clientes.

---

## Selección de clientes (Autocomplete)
Este componente permite buscar y seleccionar clientes de manera dinámica desde un catálogo remoto de **consignees**, integrado en la creación de referencias de importación.  

### Propósito
- Facilitar la selección rápida de un cliente mediante búsqueda de texto.  
- Evitar sobrecargar el formulario con listas grandes cargadas al inicio.  
- Integrar validación y control de selección.  
- Proporcionar retroalimentación al usuario sobre resultados, errores o elementos no disponibles.  
- Especialmente útil para operaciones logísticas con múltiples clientes.

### Funcionamiento
1. **Búsqueda dinámica:**  
   - El usuario escribe en el input del autocomplete.  
   - La búsqueda se activa después de al menos 3 caracteres.  
   - Se realiza una llamada a la API para consultar clientes coincidentes.  

2. **Sugerencias de clientes:**  
   - Se muestran los clientes encontrados en tiempo real.  
   - Si un cliente está marcado como eliminado (`deleted_at`), aparece deshabilitado y con la etiqueta `(Eliminado)`.  
   - Si no se encuentran resultados, se muestra un mensaje informativo: *“No customers found”*.  

3. **Selección automática:**  
   - Si se encuentra un único cliente, se selecciona automáticamente.  
   - La selección emite el valor del cliente (`id`) al formulario principal.  

4. **Limpieza de selección:**  
   - Botón **Clear** permite reiniciar el campo y eliminar la selección.  
   - Limita errores por selección incorrecta o cambios de cliente.

### Validaciones y restricciones
- Solo clientes activos pueden seleccionarse.  
- Bloquea la edición si el cliente está eliminado.  
- La búsqueda se ejecuta con un retraso de 500 ms para optimizar consultas a la API.  
- Cada acción queda registrada en la interacción del formulario para trazabilidad.

### Interacción con el flujo de referencia
- Integrado en la sección **Información del cliente** del módulo de Sea Import.  
- Selección correcta del Consignee asegura:  
  - Validación de crédito disponible.  
  - Cálculo correcto de días libres.  
  - Activación de notificaciones de arribo (**Arrival Notifications**).  
- Permite mantener consistencia y evitar errores de captura manual.

### Mensajes al usuario
- *Type at least 3 characters to search*: indica la longitud mínima de búsqueda.  
- *No customers found*: no se encontraron resultados.  
- *Error fetching customers*: falla al consultar la API.  

### Buenas prácticas
- Ingresar al menos 3 caracteres para iniciar búsqueda.  
- Confirmar que el cliente seleccionado es correcto antes de guardar la referencia.  
- Utilizar el botón **Clear** si se necesita cambiar la selección.  
- Mantener sincronizado el catálogo de clientes para asegurar consistencia.

## Selección de Freight Forwarders (Autocomplete)
Este componente permite buscar y seleccionar **Freight Forwarders** (agentes de carga) de manera dinámica desde un catálogo remoto. Se utiliza en el módulo de **Sea Import** para asignar el agente encargado de la referencia marítima.

### Propósito
- Facilitar la selección rápida de un Freight Forwarder mediante búsqueda de texto.  
- Evitar sobrecargar el formulario con listas grandes cargadas al inicio.  
- Integrar validación y control de selección en tiempo real.  
- Garantizar consistencia en la asignación de agentes de transporte para cada referencia.

### Funcionamiento
1. **Búsqueda dinámica:**  
   - El usuario escribe en el input del autocomplete.  
   - La búsqueda se activa después de al menos 3 caracteres.  
   - Se realiza una llamada a la API para consultar Freight Forwarders coincidentes.  

2. **Sugerencias de agentes:**  
   - Se muestran los agentes encontrados en tiempo real.  
   - Si no se encuentran resultados, no se muestra sugerencia (no hay alerta por defecto).  

3. **Selección automática:**  
   - Al seleccionar un Freight Forwarder, se emite el valor (`id`) al formulario principal.  
   - La selección queda asociada directamente a la referencia marítima.

4. **Limpieza de selección:**  
   - Botón **Clear** permite reiniciar el campo y eliminar la selección.  
   - Esto previene errores por selección incorrecta o cambios de agente.

### Validaciones y restricciones
- Solo agentes activos pueden seleccionarse (filtrados por la API si aplica).  
- La búsqueda se ejecuta con un retraso de 500 ms para optimizar consultas.  
- Cada acción queda registrada en la interacción del formulario para trazabilidad.

### Interacción con el flujo de referencia
- Integrado en la sección de **Información de transporte / Freight Forwarders**.  
- Selección correcta asegura:  
  - Coordinación eficiente del transporte terrestre y marítimo.  
  - Activación de procesos de liberación documental y logística.  
  - Registro correcto en auditoría interna.

### Mensajes al usuario
- *Type at least 3 characters to search*: indica la longitud mínima de búsqueda.  
- *Error fetching data*: falla al consultar la API de Freight Forwarders.  

### Buenas prácticas
- Ingresar al menos 3 caracteres para iniciar búsqueda.  
- Confirmar que el Freight Forwarder seleccionado es el correcto antes de guardar la referencia.  
- Utilizar el botón **Clear** si se necesita cambiar la selección.  
- Mantener actualizado el catálogo de Freight Forwarders para asegurar consistencia.

## Componente – Autocomplete de Airlines

En los procesos de importación y exportación, tanto marítimos como aéreos, la correcta selección de aerolíneas, agentes de carga (Freight Forwarders) y clientes es fundamental para garantizar la eficiencia operativa, la precisión de la información y la trazabilidad de cada referencia o registro. 
El sistema proporciona componentes de búsqueda dinámica tipo autocomplete, que permiten realizar esta selección de manera rápida, confiable y con mínima intervención manual.

### Objetivo de los componentes de selección

El propósito principal de estos componentes es facilitar la búsqueda y selección dinámica de elementos en catálogos extensos, como aerolíneas, clientes y agentes de transporte. 
Esto permite que los formularios de referencia:

- No se vean sobrecargados con listas completas de cientos o miles de registros.

- Eviten errores de captura manual, como nombres mal escritos o registros duplicados.

- Mantengan consistencia y control de la información para fines operativos, financieros y de auditoría.

- Proporcionen retroalimentación inmediata al usuario sobre disponibilidad, estado o errores al consultar el catálogo.

Además, estos componentes ayudan a integrar validaciones automáticas como bloqueo de selección de elementos eliminados o inactivos, control de crédito del cliente y validaciones de contratos o disponibilidad de vuelos.

### Propósito general

Este componente de Vue 3 con Vuetify permite buscar y seleccionar aerolíneas (Airlines) de manera dinámica desde un catálogo remoto. 

Su objetivo principal es:

- Facilitar la selección rápida de una aerolínea sin necesidad de cargar un listado completo.

- Evitar errores de captura manual en formularios con catálogos extensos.

- Proporcionar retroalimentación al usuario sobre resultados encontrados, errores o elementos no disponibles.
 
- Mantener consistencia y trazabilidad de la selección dentro del flujo de referencia (por ejemplo, importaciones aéreas o marítimas).

Este componente es especialmente útil en formularios logísticos y de transporte aéreo, donde se requiere seleccionar aerolíneas activas para registrar referencias, vuelos, contratos o transportistas.

### Funcionamiento detallado

1. Búsqueda dinámica

Los usuarios pueden escribir el nombre de la aerolínea, cliente o Freight Forwarder directamente en un campo de búsqueda. 
La búsqueda se activa automáticamente una vez que se ingresan al menos tres caracteres, para optimizar las consultas al servidor y evitar sobrecargar la base de datos. 
Esto garantiza que las sugerencias presentadas sean relevantes y actualizadas en tiempo real.

2. Visualización de resultados
Los resultados de búsqueda se muestran inmediatamente debajo del campo de texto, con los nombres visibles y la posibilidad de distinguir si algún registro está deshabilitado o ha sido eliminado. Por ejemplo, si un cliente fue marcado como inactivo, aparecerá deshabilitado con una etiqueta que indique su estado, evitando que sea seleccionado por error.

3. Selección automática o manual
Si la búsqueda arroja un único resultado, el sistema puede seleccionarlo automáticamente para agilizar el flujo. 
En caso de múltiples coincidencias, el usuario puede elegir manualmente el registro correcto. 
Esta selección queda vinculada al formulario principal y asegura que los datos ingresados sean consistentes con los catálogos oficiales del sistema.

4. Limpieza y cambio de selección
Cada componente ofrece un mecanismo para limpiar la selección, lo que permite al usuario corregir errores o cambiar de elección sin afectar los datos existentes. 
Esto es particularmente útil cuando se actualizan referencias o cuando los datos originales cambian en el catálogo.

### Beneficios operativos

La implementación de estos componentes trae múltiples beneficios para los distintos roles involucrados en el proceso de importación y exportación:

   - Para Operaciones: permite capturar rápidamente los datos correctos de aerolíneas y agentes de carga, evitando retrasos por errores de captura o inconsistencias en la información.

   - Para Documentación: asegura que los contratos, BLs y documentos legales se registren con la información correcta de clientes y transportistas.

   - Para Finanzas: garantiza que los registros estén asociados a clientes activos, con crédito vigente, lo que evita problemas en la facturación y autorizaciones de cancelación.

   - Para Supervisión: proporciona trazabilidad completa de todas las acciones de selección, permitiendo auditorías y revisiones operativas confiables.


### Mensajes y retroalimentación al usuario

Estos componentes están diseñados para guiar al usuario durante la selección mediante mensajes claros y oportunos:

   - Indicaciones de búsqueda: se muestra un mensaje que indica que se deben ingresar al menos tres caracteres para iniciar la búsqueda. Esto evita consultas prematuras e innecesarias.

   - Resultados vacíos: si no se encuentra coincidencia alguna, se informa al usuario que no existen registros que coincidan con la búsqueda, permitiendo corregir la ortografía o registrar un nuevo elemento en el catálogo si es necesario.

   - Errores de conexión o API: cuando falla la consulta al servidor, se muestra un mensaje de error, alertando al usuario para que verifique su conexión o reporte el incidente a soporte.

### Buenas prácticas de uso

1. Ingresar al menos tres caracteres para iniciar la búsqueda y asegurar que los resultados sean relevantes.

2. Confirmar que el registro seleccionado es el correcto antes de guardar cualquier referencia o documento.

3. Utilizar el botón de limpieza para cambiar la selección cuando sea necesario, evitando errores de registro.

4. Mantener los catálogos actualizados, asegurando que la búsqueda siempre devuelva información vigente.

5. Registrar todas las acciones para mantener un historial de auditoría, permitiendo seguimiento de cambios y responsabilidad sobre la selección.

### Integración en flujos de referencia

Estos componentes se integran directamente en formularios de creación o gestión de referencias, como:

- Sea Import: selección de Freight Forwarders y clientes para asignar agentes de transporte y consignatarios.

- Air Import: selección de aerolíneas y clientes, asegurando rutas válidas y contratos activos.

- Gestión documental: vinculación automática de aerolíneas y clientes con BLs, cartas de garantía y Arrival Notifications.

Al usar estos componentes correctamente, el sistema garantiza:

- Validación automática de crédito y días libres de los clientes.

- Coordinación eficiente con agentes de transporte y aerolíneas.

- Registro completo y auditable de cada selección para operaciones internas y auditorías externas.

### Consideraciones finales

La correcta selección de aerolíneas, Freight Forwarders y clientes no solo agiliza los procesos, sino que también previene errores operativos y financieros, asegura el cumplimiento de contratos y políticas internas, y proporciona trazabilidad completa en todos los niveles del flujo de referencia.

Al implementar buenas prácticas y mantener los catálogos actualizados, los usuarios pueden aprovechar al máximo la funcionalidad de búsqueda dinámica, logrando procesos más eficientes, confiables y fáciles de auditar.

## Componente – Autocomplete de Clientes (Consignees)

### Propósito general

Este componente permite buscar y seleccionar clientes de manera dinámica desde un catálogo remoto (por ejemplo, una API de consignees). Su objetivo principal es:

- Facilitar la selección rápida de un cliente mediante búsqueda de texto.

- Evitar sobrecargar el formulario con listas grandes cargadas al inicio.

- Integrar validación y control de selección.

- Proporcionar retroalimentación al usuario sobre resultados, errores o elementos no disponibles.

Es especialmente útil en formularios de logística o transporte donde se manejan múltiples clientes.

### Estructura visual

1. Campo Autocomplete

   - Input donde el usuario puede escribir el nombre del cliente.

   - Se muestran sugerencias a medida que escribe (autocompletado).

   - Permite ícono al inicio del input (lupa) para indicar búsqueda.

   - Muestra un mensaje de ayuda indicando que se debe escribir al menos 3 caracteres para iniciar la búsqueda.

   - Permite borrar el contenido mediante un botón Clear.

2. Lista de resultados

   - Despliega los clientes que coinciden con el texto de búsqueda.

   - Cada ítem puede mostrar si el cliente está eliminado (por ejemplo, con la etiqueta “(Eliminado)”).

   - Los clientes eliminados aparecen deshabilitados, evitando su selección.

3. Botón de Clear

   - Aparece cuando hay un cliente seleccionado.

   - Permite limpiar la selección y reiniciar la búsqueda.


### Estados y reactividad

1. selectedCustomer

   - Valor actual seleccionado, puede ser nulo si no hay selección.

2. searchQuery

   - Texto que el usuario escribe en el input para buscar clientes.

   - Cambios en este estado disparan la búsqueda remota si se cumplen condiciones mínimas.

3. customers

   - Lista reactiva que contiene los clientes devueltos por la búsqueda.

   - Se actualiza con cada respuesta de la API.

4. hasData

   - Booleano que indica si hay un cliente seleccionado, usado para mostrar el botón Clear.

### Comportamiento

1. Búsqueda dinámica

   - Se activa solo si el texto ingresado tiene al menos 3 caracteres y no hay un cliente ya seleccionado.

   - Se utiliza un debounce para evitar realizar llamadas excesivas al servidor mientras el usuario escribe rápido.

   - Los resultados se muestran en la lista de autocompletado.

2. Selección automática

   - Si la búsqueda devuelve un único cliente:

      - Se selecciona automáticamente.

      - Si no está eliminado, se actualiza el valor del componente y se emite el evento correspondiente.

3. Limpieza del campo

   - El botón Clear o la acción de limpiar borra la selección actual y los resultados de búsqueda.

4. Gestión de resultados

   - Mensaje informativo si no se encuentra ningún cliente.

   - Mensaje de error si falla la llamada a la API.

   - Los clientes eliminados se muestran con etiqueta y no son seleccionables.

### Flujo conceptual

1. El usuario escribe en el input.

2. Después de 3 caracteres, se llama a la función de búsqueda remota.

3. La API devuelve los clientes coincidentes.

4. La lista de resultados se muestra en el dropdown:

   - Clientes activos → seleccionables.

   - Clientes eliminados → deshabilitados y etiquetados.

5. Si se selecciona un cliente, el valor se guarda y se emite un evento hacia el formulario padre.

6. El usuario puede limpiar la selección usando el botón Clear.

### Mensajes y retroalimentación

- Info: “No customers found” cuando no hay coincidencias.

- Error: “Error fetching customers” si la búsqueda falla.

- La UI también deshabilita la selección de clientes eliminados, evitando errores al enviar el formulario.

### Ejemplos de uso

1. Búsqueda de cliente por nombre parcial

   - Usuario escribe “Juan” → se muestran todos los clientes que contienen “Juan”.

2. Selección automática si hay un solo resultado

   - Solo hay un cliente llamado “Maria López” → se selecciona automáticamente.

3. Cliente eliminado

   - Aparece en la lista como “Carlos Pérez (Eliminado)” → no se puede seleccionar.

4. Limpiar selección

   - Usuario selecciona un cliente, luego hace clic en Clear → el campo queda vacío y la lista se reinicia.

### Resumen

Este componente es un autocomplete avanzado para clientes que combina:

- Búsqueda remota eficiente con debounce.

- Selección controlada y emisión de eventos.

- Manejo de clientes eliminados.

- Retroalimentación al usuario sobre resultados y errores.

- Integración con stores de carga y notificaciones.

Es ideal para formularios que requieren selección rápida de clientes de catálogos grandes, manteniendo seguridad y facilidad de uso.

## Módulo: Búsqueda y Gestión de Referencias – Importación Aérea

Este módulo permite a los usuarios consultar, filtrar, exportar y visualizar referencias de importación aérea dentro del sistema. 
Su objetivo es centralizar la información clave de cada referencia y dar herramientas para trabajar con los datos de manera ágil, precisa y organizada.

### Objetivos principales del módulo

- Filtrar referencias de importación aérea con múltiples criterios (año, número de guía, aerolínea, cliente, etc.).

- Visualizar resultados en una tabla detallada, con paginación y navegación intuitiva.

- Acceder rápidamente a las acciones disponibles sobre cada referencia (visualizar, editar, ver detalles).

- Exportar reportes completos en Excel, para análisis externo o compartir con otras áreas.

- Dar seguimiento al estatus de notificaciones de llegada, revalidaciones, aerolíneas y vuelos.

### Estructura general del módulo

El módulo se divide en 3 grandes bloques:

1. Barra de filtros avanzados

   - Permite al usuario ingresar uno o varios criterios de búsqueda.

   - Cada campo corresponde a un dato clave de la referencia aérea.

2. Tabla de resultados

   - Muestra las referencias encontradas según los filtros.

   - Incluye información detallada de cada referencia (consignatario, AWBs, aerolínea, vuelos, notificaciones, etc.).

3. Acciones y herramientas adicionales

   - Paginación de resultados.

   - Exportación de reportes en Excel.

   - Acceso a edición y detalle de cada registro.

### Barra de filtros avanzados

La barra de filtros es la herramienta más importante, ya que permite buscar referencias de manera precisa.

### Filtros disponibles

1. Año (Year)

   - Se selecciona el año al que pertenece la referencia.

   - Ejemplo: Si buscas referencias del año 2024, eliges "2024" y solo se mostrarán esos registros.

2. Número de referencia (Reference #)

   - Permite ingresar un número de referencia exacto o varios separados por comas.

   - Los números ingresados se agregan como chips (etiquetas) y se pueden eliminar individualmente.

   - Ejemplo: Ingresar AIR123, AIR456 mostrará solo esas referencias.

3. Master AWB

   - Número de guía aérea principal.

   - Ejemplo: Buscar 074-56789012 mostrará todas las referencias asociadas a esa guía.

4. House AWB

   - Número de guía aérea secundaria (relacionada al Master).

   - Ejemplo: Si un envío consolidado tiene varios House, puedes buscar directamente con el número HWB-9988.

5. Consignee (Consignatario)

   - Se busca al cliente/consignatario relacionado a la importación.

   - Ejemplo: Escribir “Logística Global S.A.” mostrará todas las referencias importadas por ese cliente.

6. Freight Forwarder Origin (Agente de carga en origen)

   - Permite seleccionar el freight forwarder que organizó el embarque en origen.

   - Ejemplo: Seleccionar “DHL” mostrará todas las referencias gestionadas por esa empresa en origen.

7. Aerolínea (Airline)

   - Filtra las referencias por la aerolínea responsable del transporte.

   - Ejemplo: Buscar “Lufthansa” listará solo las referencias enviadas por esa aerolínea.

8. Número de vuelo (Flight Number)

   - Filtra por el número de vuelo en el que viajó la carga.

   - Ejemplo: Escribir “LH456” mostrará las referencias que viajaron en ese vuelo específico.

9. Source System (Sistema origen)

   - Identifica de qué sistema proviene la información (si hay integraciones con otros sistemas).

   - Ejemplo: Seleccionar “Sistema Tracker” mostrará referencias importadas automáticamente de ese sistema.

10. Arrival Noty (Notificación de llegada)

   - Filtro para saber si las referencias tienen notificación de llegada enviada o no.

   - Ejemplo: Seleccionar “Yes” mostrará referencias donde ya se envió notificación al cliente.

11. Tracker Ref (Referencia de rastreador)

   - Permite ingresar referencias ligadas al sistema de tracking.

   - Se pueden escribir varias, separadas por comas.

12. Status (Estatus del registro)

   - Define si se incluyen registros eliminados o activos.

   - Ejemplo: Seleccionar “Eliminados” ayuda a consultar referencias dadas de baja por error o por cierre.

### Tabla de resultados 

La tabla muestra todas las referencias encontradas.

### Columnas principales

1. Acciones

   - Botones para editar, ver o gestionar cada referencia.

2. Número de referencia

   - Identificador único de la referencia.

3. Master AWB y House AWB

   - Números de guía aérea principal y secundaria.

   - Se muestran en chips de color para resaltarlos.

4. Origin Freight Forwarder (F.F.)

   - Nombre del freight forwarder de origen.

5. Consignee (Consignatario)

   - Cliente receptor de la mercancía.

   - Si la referencia proviene del sistema Tracker, aparece un ícono adicional en color rosa.

6. Origen y Destino

   - Ciudad o aeropuerto de origen y destino final de la carga.

7. Arrival Noty (Notificación de llegada)

   - Muestra si se enviaron notificaciones de llegada al consignatario.

   - Ejemplo:

      - Verde: “Sent @ 2025-05-01” → ya enviada.

      - Rojo: “Pending” → pendiente de enviar.

8. Revalidation (Revalidación de guías)

   - Muestra si ya se enviaron revalidaciones.

   - Ejemplo:

      - Verde: “Sent @ 2025-06-15”.

      - Rojo: “Pending”.

9. Airline (Aerolínea)

   - Aerolínea asignada.

10. Flight Number (Número de vuelo)

   - Número del vuelo registrado en la primera ruta.

11. Departure (Salida)

   - Aeropuerto de salida del vuelo.

### Herramientas adicionales

1. Paginación

   - Permite navegar entre páginas de resultados cuando hay muchos registros.

   - Indica cuántos registros se muestran y el total de referencias.

   - Ejemplo: “Mostrando 1 a 50 de 320 registros”.

2. Exportación a Excel

   - Botón para exportar todos los resultados filtrados en un archivo .xlsx.

   - El archivo incluye timestamp para identificar cuándo fue generado.

   - Ejemplo: air-import-report-20251003.xlsx.

3. Botones de acción rápida

   - Clear: limpia todos los filtros.

   - Search: aplica los filtros seleccionados.

   - Export: descarga el reporte en Excel.

## Ejemplos prácticos

### Ejemplo 1 – Búsqueda por referencia y año

- Año: 2025

- Referencia: AIR-12345

- Resultado: Muestra únicamente la referencia con ese número dentro del año 2025.

### Ejemplo 2 – Listado de un cliente específico

- Consignee: Comercializadora Global S.A.

- Resultado: Todas las importaciones aéreas asociadas a ese consignatario, sin importar aerolínea o vuelo.

### Ejemplo 3 – Referencias con notificación pendiente

- Arrival Noty: No

- Resultado: Lista solo las referencias donde aún no se ha enviado la notificación de llegada.

### Ejemplo 4 – Exportar todas las referencias de Lufthansa en 2024

- Año: 2024

- Airline: Lufthansa

- Acción: Exportar Excel.

- Resultado: Se descarga un archivo con todas las referencias de Lufthansa en 2024.

### Beneficios del módulo

- Ahorro de tiempo: búsquedas rápidas y precisas.

- Flexibilidad: múltiples criterios de filtrado combinados.

- Trazabilidad: ver qué notificaciones y revalidaciones ya fueron enviadas.

- Integración: referencias sincronizadas con sistemas externos.

- Control total: exportar y compartir reportes detallados.

Este módulo es una herramienta clave para operaciones aéreas de importación, ya que permite controlar todas las referencias de manera centralizada, eficiente y clara.

## Formulario Import 

1. Estado inicial

### Validación de fecha de inicio de demurrage:

- Si el viaje (Vessel/Voyage) no tiene definida la fecha de inicio de demurrages (init_demurrage_at), se muestra un alerta de advertencia y un botón para volver atrás.

- Si sí existe esa fecha, se carga todo el módulo completo de cálculo y seguimiento.

2. Información general de la referencia

Dentro de una tarjeta principal se muestra:

- Número de referencia (ejemplo: Ref #12345).

- Botón para ver los detalles del servicio asociados a esa referencia.

- Datos clave:

   - Línea naviera.

   - Buque.

   - Viaje/destino.

   - POL (Puerto de Origen).

   - POD (Puerto de Destino).

   - Consignatario.

   - ATA (fecha estimada de arribo).

   - Master BLs asociados (con chips identificativos).

   - Fecha oficial de inicio de demurrage.

También aquí se ofrece:

Solicitud de descuento: mediante un componente de autorización se puede pedir aplicar un descuento sobre los cargos de demoras.

3. Panel de acciones

Tarjeta lateral con accesos a:

- Enviar correos (abrir un diálogo donde se ingresan destinatarios y se envía el corte de demurrages).

- Vista previa de cortes de demurrages (componente específico).

Incluye también:

- Notas sobre demurrages: expansión con historial de notas (fecha, usuario, descripción).

- Campo de texto y botón para agregar nuevas notas manualmente.

4. Cálculos de demurrages

Sección central donde se gestionan todos los cálculos relacionados a contenedores:

- Datos generales:

   - Fecha inicio de días libres.

   - Días libres disponibles (editable).

- Gestión masiva de contenedores:

   - Fecha de inicio de contenedores.

   - Fecha de devolución de vacíos.

   - Botones para aplicar fechas a todos los contenedores.

   - Selección múltiple de contenedores.

- Tabla de contenedores con demoras:

   - Número y tipo de contenedor.

   - Cálculo parcial o total.

   - Fechas de inicio y retorno.

   - Intervalo de días libres.

   - Días calculados hasta la fecha.

   - Tarifas (Rate 1 y Rate 2).

Al seleccionar contenedores:

- Se muestran totales calculados:

   - Subtotal, IVA, descuentos aplicables, total final.

- Se define si el cálculo lleva IVA, si se aplica descuento, y si es cálculo parcial o total.

- Botón para crear los registros de demurrages calculados.

5. Descuentos

Tabla con el historial de descuentos aplicados o solicitados:

- Tipo de descuento (por monto o porcentaje).

- Motivo.

- Estado (aplicado o pendiente).

- Usuario y fecha de creación.

Incluye un diálogo especial para solicitar descuentos, donde se elige entre monto fijo en USD o porcentaje, se llena la cantidad y se explica el motivo.

6. Cálculos anteriores (historial)

Panel expandible que muestra el historial de cálculos por contenedor:

- Fechas de inicio y fin.

- Días libres.

- Tarifas aplicadas.

- Subtotal, IVA y total final.

- Si hubo descuentos aplicados.

- Usuario que hizo el cálculo y fecha de registro.

Esto permite ver toda la trazabilidad de cálculos pasados.

7. Costos de línea (pagos a la naviera)

Tabla por contenedor que muestra:

- Subtotal, IVA y total actual.

- Campo para actualizar el costo de la naviera (line cost) con opción de indicar si aplica IVA.

- Botón para guardar el costo actualizado.

8. Logs (bitácora de acciones)

Registro detallado de todas las acciones realizadas en la referencia:

- Fecha.

- Usuario.

- Acción.

- Descripción.

Se puede mostrar u ocultar según el usuario lo requiera.

9. Diálogo de solicitud de descuento

Un formulario flotante que permite:

- Seleccionar tipo de descuento (monto o porcentaje).

- Ingresar cantidad.

- Justificar con un motivo.

- Confirmar o cancelar la solicitud.

Este módulo no es solo un formulario, sino un centro de control de demurrages marítimos. 
Permite consultar la referencia, calcular días libres y cargos, aplicar descuentos, registrar costos, enviar notificaciones por correo, guardar notas, revisar cálculos pasados y auditar todas las acciones.

