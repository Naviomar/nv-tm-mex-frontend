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

---

# Maritime Import Reference – Demurrages

**Descripción general**

Esta sección permite consultar y calcular las demoras (demurrages) asociadas a una referencia de importación marítima.
El objetivo es ofrecer al usuario una vista clara y sencilla donde pueda visualizar si existen demoras en los contenedores vinculados a una referencia específica, y calcular los días y costos adicionales que puedan generarse por exceder el tiempo libre otorgado por la línea naviera.

---

**Ubicación en el sistema**

El apartado de Demurrages forma parte del módulo de Importación marítima (Sea Import), dentro del detalle de cada referencia.
El usuario accede a esta vista al seleccionar una referencia marítima y luego ingresar al subapartado de Demurrages dentro del menú de opciones disponibles.

---

**Propósito de la vista**

- Mostrar información relacionada con las demoras portuarias (demurrages) de una referencia de importación.

- Permitir calcular automáticamente los días de demora con base en las fechas reales de arribo, liberación o retiro del contenedor.

- Facilitar la evaluación de costos adicionales generados por exceder el tiempo libre establecido (Free Time) por la naviera.

---

**Información principal de la referencia**

- **Ref:** Número de referencia de la operación (ejemplo: #MXIM25-1926).

- **Línea naviera:** Nombre de la línea marítima (ejemplo: EVERGREEN MARINE CORP).

- **Vessel / Viaje:** Nombre del barco y viaje (ejemplo: EVER LIBERAL - 0749-067E - Manzanillo).

- **POL / POD:** Puerto de origen y destino (ejemplo: Ningbo / Manzanillo).
 
- **Consignee:** Nombre del consignatario (ejemplo: KAPTON ELECTRONICS S.A. DE C.V.).

- **ATA:** Fecha de llegada estimada del buque (ejemplo: 2025-10-20).

- **Master BL(s):** Lista de BL maestros asociados a la referencia (ejemplo: EGLV143555496521 Transporte Multimodal).

- **Demurrage init day:** Fecha de inicio de los días libres para la referencia (ejemplo: 2025-10-20).

---

**Acciones disponibles**

- **View PDF:** Visualizar el corte de demurrage en formato PDF.

- **Send Email:** Enviar información de la referencia por correo electrónico.

- **Request Authorization:** Solicitar autorización para aplicar descuentos o cambios especiales.

**Notas de Demurrage**

- Campo donde los usuarios pueden agregar notas o comentarios relevantes a la referencia.

- Botón **Add Note** para guardar las anotaciones.

**Cálculos de Demurrage**

- Permite ver y actualizar la fecha de inicio de días libres y la fecha de retorno de contenedores vacíos.

- Presenta un resumen de los contenedores asociados con columnas como:

   - Contenedor
 
   - Tipo

   - Start date / Return empty

   - Start & end date with free days

   - Days with empty current date

   - Tarifas (Rate 1 y Rate 2)

- **Set Start Date / Set Return Date to All:** Aplica fechas a todos los contenedores listados.

- **Select All:** Selección múltiple para aplicar acciones a todos los contenedores.

---

**Descuentos**

- Sección para visualizar descuentos aplicados, con detalles de:

   - Porcentaje o monto

   - Razón

   - Estado (Aplicado o no)

   - Fecha de creación

---

**Cálculos pasados (Past calculations)**

- Muestra un historial de cálculos realizados por contenedor.
 
- Indica si no se ha realizado ningún cálculo, como en el caso del contenedor TIIU5818334 - 40HC.

**Costos por línea (Line cost(s))**

- Permite actualizar o agregar pagos por cada contenedor:

   - Subtotal

   - IVA

   - Total

- Campo para ingresar un nuevo monto y opción de incluir IVA.

- Botón Save para guardar cambios.

---

**Logs**

- Sección colapsable para ver historial de acciones y eventos relacionados con la referencia.

---

**Información visual adicional**

- Indicadores de días libres y días vacíos actuales permiten identificar rápidamente si hay demurrage acumulado.

- Columnas de tarifas muestran los costos aplicables a cada contenedor según tipo y periodo.

- El diseño incluye botones y colores para estados de autorización y notas, facilitando la interacción.

---

**Elementos principales de la pantalla**

**1. Botón “Back” (Regresar)**

En la parte superior se muestra un botón que permite volver a la pantalla anterior o al listado de referencias.
Es útil para navegar de forma rápida sin perder el contexto del proceso.

**2. Título y descripción**

Debajo del botón se presenta el título “Maritime Import Reference – Demurrages” junto con una breve explicación sobre el propósito de la vista.
Este encabezado informa al usuario que el apartado está diseñado para consultar y calcular las demoras disponibles.

**3. Área de cálculo y visualización de demurrages**

El área principal de la pantalla muestra el contenido funcional donde el usuario puede:

- Visualizar los detalles de demurrage asociados a la referencia seleccionada.

- Identificar contenedores involucrados, fechas clave (arribo, retiro, liberación) y tarifas aplicables.
 
- Realizar un cálculo automático de los días de demora excedentes al tiempo libre otorgado.

- Observar los resultados de los cálculos, incluyendo los costos estimados o confirmados según la información disponible.

---

**Flujo de uso típico**

1. El usuario ingresa a la sección de **Importación marítima** y selecciona una referencia específica del listado.

2. Dentro de la referencia, elige la opción **“Demurrages”**.

3. El sistema muestra esta pantalla, identificando automáticamente la referencia seleccionada.

4. El usuario puede:

- Revisar si existen contenedores con demoras.

- Consultar los días de free time y los días excedentes.

- Calcular los días y costos de demora de forma automática.

5. Finalmente, puede regresar al detalle general de la referencia o continuar con otros apartados relacionados (Documentos, Contenedores, Cargos, etc.).

---

**Información que puede visualizar el usuario**

Dependiendo de los datos registrados en el sistema, el usuario podrá consultar:

- Número de contenedor y línea naviera.

- Fechas de arribo y liberación.

- Tiempo libre asignado (Free Time).

- Días utilizados y días excedentes.

- Monto estimado o confirmado de demurrage.

- Observaciones o notas sobre la demora.

---

**Beneficios para el usuario** 

- Permite tener control y visibilidad sobre las demoras portuarias.

- Facilita el seguimiento de contenedores y el cumplimiento de tiempos de retorno.

- Ayuda a evitar cargos adicionales por excedentes no detectados.

- Centraliza la información dentro de la misma referencia marítima, sin necesidad de buscar en otros módulos.

---

**Consideraciones**

La información de demurrages depende de los datos ingresados en el sistema por el área operativa o de tráfico.

Si una referencia no tiene demoras registradas, la vista puede mostrarse vacía o indicar que no existen demurrages disponibles.

El cálculo de días se basa en las fechas reales y los parámetros configurados por la empresa (por ejemplo, días libres otorgados por cada línea).

En caso de errores o ausencia de datos, se recomienda verificar la información de contenedores en el detalle de la referencia.

---

# Módulo: Gestión de Demurrages por Referencia Marítima

**Descripción general**

Este módulo permite visualizar, calcular y administrar los demurrages (cargos por uso extendido de contenedores) asociados a una referencia marítima específica. 
Está diseñado para que el usuario pueda gestionar fechas de inicio y retorno, aplicar descuentos, agregar notas, revisar cálculos históricos y actualizar costos de línea.

**Casos en los que no hay día de inicio**

Si la referencia no tiene configurado un día de inicio de demurrages (Demurrage Init Day), el sistema mostrará una alerta indicando que la información no está disponible.
El usuario podrá regresar al listado principal utilizando el botón “Return”.

---

**Detalle de la referencia** 

Cuando sí existe un día de inicio configurado, se muestra un panel completo con toda la información relacionada con la referencia, incluyendo:

- Número de referencia: Identificador principal del embarque.

- Línea naviera: Empresa que maneja el transporte marítimo.

- Buque: Nombre del barco asociado.

- Viaje de destino (Voyage Discharge): Nombre abreviado del trayecto.

- Puertos: POL (Puerto de carga) y POD (Puerto de descarga).

- Consignatario: Cliente final o receptor de la mercancía.

- Fecha de arribo (ATA): Fecha de llegada del buque.

- Master BL(s): Listado de documentos de embarque vinculados.

- Día de inicio de demurrages: Fecha exacta desde la cual comienzan a contar los días libres.

Además, se puede acceder al detalle completo de la referencia desde el botón “View reference”.

---

**Solicitud de descuento**

El sistema permite iniciar un proceso de autorización para solicitar descuentos en los cargos por demurrages.
El usuario puede presionar el botón **“Request a discount”** o **“Set discount”** y llenar un formulario donde especifica:

- Tipo de descuento: monto fijo o porcentaje.

- Valor del descuento.

- Motivo o justificación.

La solicitud será enviada al flujo de autorización correspondiente para su revisión.

---

**Acciones disponibles**

Dentro del panel principal se ofrecen varias acciones:

- **Enviar correo:** Permite enviar por correo electrónico el corte de demurrages a una o varias direcciones ingresadas por el usuario.

- **Vista previa del corte:** Mediante un componente adicional se puede visualizar el detalle antes de enviarlo.

- **Agregar notas:** Sección para registrar observaciones o comentarios sobre los demurrages asociados a la referencia. Cada nota guarda la fecha, el usuario y la descripción.

---

**Cálculos de demurrages**

La sección de Calculations permite visualizar y modificar parámetros clave relacionados con el cálculo de los días de demora y sus costos.

**Datos configurables:**

- Fecha de inicio de días libres.

- Días libres asignados a la referencia.

- Fecha de inicio y de retorno de contenedores (vacíos).

- Fechas individuales por contenedor.

- Tarifas por día (Rate 1 y Rate 2).

**Funciones principales:**

- Aplicar una misma fecha de inicio o retorno a todos los contenedores.

- Seleccionar contenedores específicos para cálculo.

- Activar o desactivar el cálculo con IVA.

- Aplicar descuentos disponibles.

- Calcular automáticamente los montos totales por contenedor y generar los cargos correspondientes.

El sistema muestra los valores de subtotal, IVA, total calculado y descuentos aplicados, además de permitir definir si el cálculo es total o parcial.

---

**Sección de descuentos**

Esta tabla muestra todos los descuentos relacionados con la referencia, incluyendo:

- Tipo de descuento: porcentaje o monto.

- Motivo del descuento.

- Estado: aplicado o pendiente.

- Fecha y usuario que lo creó.

Permite una visión clara de la trazabilidad de descuentos por referencia.

---

**Cálculos anteriores**

El apartado Past Calculations muestra el historial de cálculos previos realizados para cada contenedor.
Cada cálculo incluye:

Fecha de inicio y fin.

Días libres considerados.

Tarifas aplicadas (Rate 1 y Rate 2).

Subtotal, descuento, IVA y total calculado.

Usuario que realizó el cálculo y fecha de creación.

Esto facilita la auditoría y control de todos los movimientos realizados.

---

**Costos de línea**

En la sección Line cost(s) el usuario puede revisar y actualizar los pagos correspondientes a la línea naviera por concepto de demurrages.

Para cada contenedor se muestran:

- Subtotal.

- IVA (si aplica).

- Total en USD.

El usuario puede ingresar nuevos valores y definir si el costo incluye IVA, guardando los cambios con el botón **“Save”**.

---

**Registro de acciones (Logs)**

Finalmente, la sección de **Logs** permite consultar todas las acciones registradas dentro del módulo, ofreciendo una trazabilidad completa.

Cada registro incluye:

- Fecha y hora.

- Usuario que ejecutó la acción.

- Tipo de acción.

- Descripción detallada de lo realizado.

El usuario puede alternar la visibilidad del registro mediante el botón de **mostrar/ocultar logs**.

---

**Ventajas del módulo**

Centraliza toda la gestión de demurrages en un solo lugar.

Facilita la comunicación con clientes mediante envío directo de correos.

Controla el historial de cálculos, notas y descuentos.

Permite transparencia y trazabilidad total de las operaciones.

Simplifica el proceso de actualización de costos y cálculo de días libres.

---

# Componente: Información de Usuarios (User Details)

**Descripción general**

Este componente tiene como función mostrar de manera rápida y visual quién **creó**, **actualizó** o **eliminó** un registro dentro del sistema.
Se presenta como un **ícono informativo** que el usuario puede pulsar para desplegar una ventana con los datos de los usuarios relacionados con la acción ejecutada sobre un elemento (por ejemplo, una referencia, documento o registro).

Está diseñado para mejorar la **trazabilidad** de los movimientos en el sistema, permitiendo conocer con claridad qué usuario realizó cada acción.

---

**Ubicación en la interfaz**

El componente se muestra normalmente junto a un elemento o bloque de información dentro de una vista (por ejemplo, un encabezado, una tabla o un formulario).
Aparece representado por un ícono de interrogación de usuario (figura de persona con signo de pregunta), acompañado de un tooltip (mensaje flotante) que indica “User details” al pasar el cursor.

---

**Elementos principales**

**1. Contenedor de contenido**

- El componente puede incluir otro contenido principal (por ejemplo, un texto, botón o valor) que se muestra junto al ícono de información del usuario.
 
- Este espacio actúa como un “slot” o área donde se ubica el contenido que acompaña al botón flotante.

**2. Botón de información (ícono de usuario)**

- Es un ícono pequeño que aparece al lado del contenido principal.

- Al colocar el cursor sobre él, muestra un mensaje de ayuda con el texto “User details”.

- Al hacer clic, abre una ventana emergente (modal) con toda la información de los usuarios asociados al registro.

**3. Ventana emergente de detalles (modal de usuarios)**

Cuando se activa, aparece una ventana centrada en la pantalla que contiene tres posibles secciones:

**a. Usuario que creó el registro (Created by)**

- Muestra el nombre y correo electrónico del usuario que originalmente creó el registro.

- Se acompaña de un ícono verde que representa la acción de creación.

- Incluye la fecha y hora exactas en que se realizó la creación.

**b. Usuario que actualizó el registro (Last updated by)**

- Presenta los datos del usuario que realizó la última modificación en el registro.

- Se representa con un ícono color ámbar (amarillo).

- También incluye la fecha y hora de la última actualización.

**c. Usuario que eliminó el registro (Deleted by)**

- Aparece únicamente si el registro ha sido eliminado.

- Muestra el nombre, correo electrónico y fecha de eliminación.

- El ícono correspondiente es de color rojo, indicando una acción de borrado.

Cada una de estas secciones incluye un tooltip descriptivo que indica el tipo de acción (“Created by”, “Last updated by”, “Deleted by”).

**4. Botón de cierre**

- Dentro del modal se incluye un pequeño botón “Close” que permite cerrar la ventana de información.

---

**Comportamiento general**

- Al hacer clic en el ícono del usuario, se abre la ventana con la información disponible.

- Si el registro solo tiene datos de creación, únicamente se muestra esa parte.

- Si también cuenta con actualizaciones o eliminaciones, se presentan las secciones correspondientes.

- En caso de que el registro aún no haya sido modificado o eliminado, solo aparecerá el creador original.

---

**Información mostrada al usuario**

- Cada registro dentro de la ventana muestra:

- Nombre completo del usuario.

- Correo electrónico corporativo o registrado.

- Fecha y hora de la acción.

- Tipo de acción: creación, actualización o eliminación.

- Ícono y color distintivo según la acción:
 
- Verde → Creación.
 
- Ámbar → Actualización.

- Rojo → Eliminación.

---

**Finalidad del componente**

- Proporcionar transparencia y trazabilidad dentro del sistema.

- Permitir que cualquier usuario con acceso pueda verificar quién realizó acciones importantes sobre un registro.

- Facilitar la auditoría interna y el seguimiento de cambios sin necesidad de acceder directamente a los logs técnicos o bases de datos.

---

**Ventajas**

- Mejora la confianza y control sobre la gestión de datos.

- Reduce la necesidad de solicitar información al equipo técnico para saber quién modificó algo.

- Facilita la comunicación entre departamentos, al poder identificar de inmediato al usuario responsable de cada acción.

- Aumenta la eficiencia en los procesos de revisión y validación documental.

---

**Consideraciones**

- El componente obtiene la información de los usuarios desde el sistema interno, por lo que requiere que la información de los usuarios (nombre, correo, ID) esté actualizada en la base de datos.

- Si alguno de los usuarios ya no existe o fue eliminado, los datos podrían no mostrarse completamente.

- Los permisos de visualización pueden depender del rol del usuario: algunos perfiles podrían no ver ciertos datos sensibles.

- Este componente no permite editar información; su función es únicamente informativa.

---

**Resumen funcional**

| Elemento               | Función principal                                             | Visualización                |
| ---------------------- | ------------------------------------------------------------- | ---------------------------- |
| Ícono de usuario       | Abre la ventana de detalles de usuario                        | Ícono “mdi-account-question” |
| Tooltip “User details” | Indica al usuario la función del ícono                        | Aparece al pasar el cursor   |
| Ventana modal          | Muestra la información del creador, actualizador y eliminador | Diálogo emergente centrado   |
| Botón “Close”          | Cierra la ventana de información                              | Disponible dentro del modal  |

---

**Uso recomendado**

Este componente se utiliza comúnmente en:

- Tablas de registros (ejemplo: facturas, referencias, órdenes de compra, documentos).

- Formularios de detalle o vistas de edición.

- Secciones donde se requiera consultar el historial de acciones de usuario de un registro específico.

---

# Componente: Solicitud de Autorización de Recursos (Authorization Request)

**Descripción general**

Este componente permite a los usuarios **solicitar autorización para acceder o modificar recursos específicos** dentro del sistema.

Su función principal es controlar el **acceso a recursos críticos** y asegurar que cualquier acción sobre un elemento (por ejemplo, documentos, registros, módulos) esté previamente autorizada por el personal responsable.

El componente proporciona un flujo completo:

1. Solicitud de autorización.

2. Visualización de solicitudes pendientes.

3. Confirmación de autorizaciones concedidas.

---

**Ubicación en la interfaz**

- Generalmente se integra en vistas donde los usuarios interactúan con recursos sensibles.

- Se presenta como un bloque visual que incluye:

   - El nombre o etiqueta del recurso.

   - Botones para solicitar autorización o información sobre el estado de la autorización.

   - Indicadores de estado de la solicitud.

---

**Elementos principales**

**1. Contenedor principal** 

- Bloque visual con fondo claro y bordes redondeados.

- Contiene la etiqueta del recurso y la información adicional opcional (por ejemplo, el ID del recurso).

- Da visibilidad clara del recurso sobre el cual se está gestionando la autorización.

**2. Botón de solicitud de autorización**

- Se muestra si no existe ninguna solicitud pendiente ni autorización concedida.

- Texto: “Request Authorization” acompañado de un ícono de escudo (mdi-shield-lock-outline).

- Al pulsarlo, se abre un diálogo de confirmación para realizar la solicitud.

- Es de color amarillo, destacando que es una acción disponible pero no crítica.

**3. Estado de autorización pendiente**

- Si el usuario ya realizó una solicitud y esta no ha sido aprobada aún, se muestra un mensaje:

   - Texto: “Authorization Pending”.

   - Ícono: escudo amarillo.

- Indica que la solicitud está en proceso y que el usuario debe esperar la aprobación.

**4. Estado de autorización concedida**

- Si la solicitud fue aprobada, se muestra un bloque con:

   - Mensaje indicando que el recurso está autorizado.

   - Fecha de expiración de la autorización.

   - Ícono de escudo verde (mdi-shield-check).

- Permite incluir contenido adicional mediante un slot, para mostrar información o acciones específicas autorizadas para ese recurso.

**5. Diálogo de confirmación (modal)**

Cuando se solicita autorización:

- Aparece un diálogo que solicita al usuario **confirmar la acción**.

- Contiene:

   - Mensaje de confirmación: “Are you sure you want to request authorization for this resource?”

   - **Campo de texto** para ingresar la razón de la solicitud.

   - **Opcional:** subir documentos de soporte que justifiquen la solicitud.

   - Botones para **Cancelar** o **Solicitar autorización**.

Este flujo asegura que el usuario proporcione información suficiente para que el responsable pueda evaluar la solicitud.

---

**Comportamiento general**

- El componente **consulta el estado actual de autorizaciones** cuando se carga y cada vez que se actualiza la información.

- Dependiendo del estado, muestra:

   - Botón de solicitud (si no hay solicitudes pendientes).

   - Mensaje de “pendiente” (si existe una solicitud en proceso).

   - Mensaje de “autorizado” con fecha de expiración (si la solicitud fue aprobada).

- Las solicitudes se registran en el sistema y se asocian al **usuario que realiza la solicitud** y al **recurso específico**.

- La autorización puede tener una **fecha de expiración**, tras la cual el acceso deja de estar vigente.

---

**Información mostrada al usuario**

Cada estado muestra información clara:

| Estado        | Visualización                      | Detalles                                                                                   |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Sin solicitud | Botón “Request Authorization”      | Permite iniciar el proceso de autorización                                                 |
| Pendiente     | Mensaje “Authorization Pending”    | Indica que la solicitud está en proceso de revisión                                        |
| Concedida     | Mensaje “Authorized until [fecha]” | Indica el período de autorización vigente y permite mostrar contenido adicional autorizado |

---

**Finalidad del componente**

- Garantizar control y seguridad sobre recursos críticos del sistema.

- Permitir que los usuarios soliciten acceso formal en caso de necesitar realizar acciones restringidas.

- Registrar y rastrear todas las solicitudes de autorización, facilitando auditorías internas.

- Informar al usuario sobre el estado de sus solicitudes y las autorizaciones vigentes.

---

**Ventajas**

- Mejora la **seguridad** y cumplimiento de permisos.

- Aumenta la **transparencia** sobre quién puede realizar qué acciones y cuándo.

- Permite gestionar documentación de soporte para justificar la solicitud.

- Facilita el seguimiento de solicitudes pendientes y expiradas.

**Consideraciones**

La autorización depende de la **aprobación del personal autorizado**; solicitarla no garantiza acceso inmediato.

La fecha de expiración define el tiempo durante el cual la acción está permitida.

Los documentos de soporte son opcionales pero recomendables para agilizar la aprobación.

Los permisos y visibilidad de botones pueden variar según rol del usuario.

---

**Resumen funcional**

| Elemento                      | Función principal                             | Visualización                                     |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------- |
| Etiqueta del recurso          | Identificar claramente el recurso a autorizar | Texto destacado en bloque                         |
| Botón “Request Authorization” | Permite iniciar la solicitud                  | Botón amarillo con ícono de escudo                |
| Estado “Pending”              | Indica solicitud en revisión                  | Texto amarillo con ícono                          |
| Estado “Authorized”           | Indica autorización aprobada                  | Texto verde con ícono y fecha de expiración       |
| Modal de confirmación         | Solicitar confirmación y motivo               | Diálogo con campos de razón y archivos de soporte |
| Slot “auth”                   | Contenido adicional autorizado                | Bloque interno visible solo si está autorizado    |

---

**Uso recomendado**

- Se integra en módulos donde los recursos son **sensibles o críticos**, como:

   - Documentos internos.

   - Procesos administrativos que requieren aprobación.

   - Recursos que requieren seguimiento de accesos.

- Ideal para sistemas que manejan **roles y permisos** de manera granular.

- Garantiza que los usuarios comprendan el **estado de sus solicitudes** y las acciones que pueden realizar sobre cada recurso.

---

# Componente: Visualizador de PDF de Demurrage Cut

**Descripción general**

Este componente permite a los usuarios **visualizar documentos PDF generados para cortes de demurrage** directamente en la aplicación. 
Está diseñado para que los usuarios puedan **revisar rápidamente los cortes de demurrage** antes de imprimir o compartir los documentos, sin necesidad de descargarlos.

**Ubicación en la interfaz**

Se integra en vistas relacionadas con los cortes de demurrage, generalmente junto a la información de la referencia o registro correspondiente.

---

**Elementos principales**

**1. Botón “View PDF”**

- Permite generar y abrir el PDF del corte de demurrage.

- Incluye un ícono que identifica el archivo como PDF.

- Mientras se genera el PDF, el botón muestra un indicador de carga y queda deshabilitado.

- El tamaño del botón es configurable para adaptarse a la interfaz.

2. Modal de visualización

- Se abre a pantalla completa para mostrar el PDF.

- Contiene una barra superior con el título “Demurrage Cut Viewer” y un botón para cerrar el modal.

- El PDF se visualiza dentro del modal para que el usuario pueda revisarlo directamente desde la aplicación.

3. Funcionalidad de cierre

- Un botón de cierre en la barra superior permite al usuario salir del modal cuando lo desee.

---

**Comportamiento general**

- Al hacer clic en “View PDF”, se inicia la generación del PDF asociado a la referencia seleccionada.

- Mientras se genera el documento, se muestra un indicador de carga y el botón queda deshabilitado.

- Una vez generado, el PDF se carga en el modal para su visualización.

- El usuario recibe un mensaje indicando que el corte de demurrage se ha generado correctamente.

- El modal se puede cerrar en cualquier momento, regresando al flujo normal de la aplicación.

---

**Información mostrada al usuario**

- El PDF generado del corte de demurrage correspondiente a la referencia seleccionada.

- Mensaje de éxito al generar el PDF.

- No se muestra información adicional; el componente está enfocado exclusivamente en la visualización del documento.

---

**Finalidad**

- Facilitar la revisión inmediata de los cortes de demurrage.

- Evitar la necesidad de descargar archivos para verificaciones rápidas.

- Mejorar la experiencia del usuario con un flujo ágil y directo dentro de la aplicación.

---

**Ventajas**

Acceso rápido a documentos PDF sin salir de la interfaz.

Confirmación visual inmediata de los cortes de demurrage.

Indicadores claros del estado de generación del PDF.

Mantiene la seguridad y control dentro de la aplicación, sin depender de descargas externas.

---

**Consideraciones**

- La generación del PDF se realiza dinámicamente en el sistema.

- La visualización ocupa toda la pantalla para facilitar la lectura.

- Depende de la compatibilidad del navegador con la visualización de PDFs en línea.

- Si ocurre un error durante la generación del PDF, se notifica mediante un mensaje y el usuario puede intentar nuevamente.

---

**Resumen funcional**

- **Botón “View PDF”:** Genera y visualiza el PDF.

- **Modal de visualización:** Muestra el PDF a pantalla completa.

- **Botón de cierre:** Permite cerrar el modal.

- **Indicador de carga:** Informa al usuario que el PDF se está generando.

---

# Visualización de Última Cálculo de Demurrage

**Descripción general**

Este componente permite a los usuarios ver la información del último cálculo de demurrage para un contenedor específico. 
Está diseñado para ofrecer un resumen claro de los costos asociados al tiempo de permanencia del contenedor, incluyendo días libres, subtotal, impuestos y total calculado.

**Ubicación en la interfaz**

Se integra dentro de la sección de demurrage del contenedor, proporcionando un historial rápido del cálculo más reciente sin necesidad de consultar reportes externos.

---

**Comportamiento general**

- Si no hay cálculos previos, se muestra un mensaje indicando “No calculation yet”.
 
- Si existe un cálculo, se muestra una sección resaltada con información estructurada en columnas:

   1. Fecha de inicio del cálculo.

   2. Fecha de finalización.

   3. Días libres asignados.

   4. Subtotal del cálculo.

   5. IVA correspondiente.

   6. Total calculado (subtotal + IVA).

- Si se aplicó algún descuento, este se muestra en la misma fila del subtotal, destacándolo visualmente con un indicador (chip o etiqueta) y la cantidad descontada.

---

**Información mostrada**

1. Start date / End date: Fechas de inicio y fin del período del cálculo.

2. Free days: Número de días libres antes de que apliquen cargos de demurrage.

3. Subtotal: Monto calculado por los días de demurrage antes de impuestos.

4. IVA: Impuesto al valor agregado aplicado al subtotal.

5. Total calculated: Suma del subtotal más IVA, reflejando el monto total a pagar.

6. Descuento (si aplica): Monto descontado, resaltado para mayor visibilidad.

---

**Finalidad**

- Facilitar la verificación rápida de los cálculos de demurrage más recientes.

- Permitir a los usuarios identificar descuentos aplicados y montos totales sin necesidad de cálculos adicionales.

- Servir como resumen visual inmediato del estado financiero relacionado con la permanencia de contenedores.

---

**Ventajas**

- Presentación clara y estructurada en columnas.

- Destaca descuentos y totales calculados.

- Permite identificar rápidamente si aún no se ha realizado ningún cálculo.

- Compatible con temas claros y oscuros (visualización adaptativa).

---

**Consideraciones**

- Solo se muestra el último cálculo disponible. Si se requiere un historial completo, se debe consultar otro módulo o sección.

- Los valores monetarios están formateados para facilitar la lectura.

- Las fechas se muestran en un formato amigable, solo con día, mes y año.

- En caso de no existir cálculos, el usuario recibe un mensaje indicativo, evitando confusión.

---

**Resumen funcional**

- **No calculation yet:** Mensaje cuando no existen cálculos.

- **Último cálculo:** Información completa del período, días libres, subtotal, IVA, total y descuentos.

- **Formato claro y estructurado:** Columnas para cada tipo de información relevante.

- **Indicador de descuento:** Destacado en rojo si aplica.

---

# Visualización de Referencias Marítimas – Detalles Generales

**Descripción general**

Esta sección permite al usuario consultar todos los detalles asociados a una referencia marítima de importación. 
Se trata de una vista de tipo “detalle”, donde se centraliza la información completa de la referencia seleccionada desde la lista principal o desde otra sección del sistema.

Su principal objetivo es ofrecer una visión detallada y organizada de los datos relacionados con la importación, sin necesidad de editar o modificar registros directamente.

---

**Elementos de la interfaz**

**1. Botón “Back”**

- Permite regresar fácilmente a la pantalla anterior desde donde se accedió a esta vista.

- Se utiliza principalmente cuando el usuario desea volver al listado de referencias marítimas o a otra sección del sistema.

- Ahorra tiempo al evitar búsquedas manuales.

2. Tarjeta principal (Panel de información)

- Dentro de la tarjeta se muestra el componente de detalle de referencia marítima.

- El panel central contiene información clave del embarque, como:

   - Línea naviera y nombre del buque.

   - Número de viaje y puertos de origen/destino.

   - Consignatario, número de BL, fechas y estado de la referencia.

   - Detalles de contenedores, tarifas, agentes y documentación asociada.

- El diseño en formato de tarjeta permite una lectura clara y estructurada.

3. Título y navegación

- La vista identifica el contenido con el encabezado “View Maritime Reference #”, indicando que el usuario está dentro de la sección de visualización (no edición).

- El sistema asigna dinámicamente el número de referencia que se está consultando, ayudando al usuario a saber qué registro está revisando.

---

**Comportamiento de la vista**

- Al acceder a esta página, el sistema recupera automáticamente el identificador (ID) de la referencia seleccionada para mostrar sus datos completos.

- Los detalles se obtienen desde el componente Sea Import View Details, que se encarga de desplegar toda la información del embarque marítimo de manera visual y segmentada.

- Es una vista informativa y no editable, enfocada únicamente en la consulta de datos.

---

**Casos de uso comunes**

- Consulta de información completa sobre una referencia marítima de importación.

- Verificación de datos previos a generar reportes o cálculos de demurrage.

- Acceso rápido a detalles específicos desde módulos relacionados (por ejemplo, desde Demurrages o Documentos).

- Revisión de información antes de realizar acciones administrativas o validaciones operativas.

---

**Beneficios para el usuario**

- Navegación rápida y clara con un solo clic para regresar.

- Visualización completa y estructurada de la información de una referencia.

- Mayor control operativo y trazabilidad sobre los embarques.

- Interfaz simple y coherente con el resto de módulos del sistema.

---

# Módulo: Sea Import Reference – Full Detail View

**Descripción general**

Este apartado muestra la vista completa de los detalles de una referencia marítima de importación, centralizando toda la información relacionada con el embarque, documentos, tarifas, cargos, facturas y pagos.
Su objetivo es ofrecer una visión integral y jerarquizada de cada referencia, permitiendo al usuario analizar todos los datos operativos y financieros asociados a la importación marítima.

La estructura del módulo está organizada en tarjetas seccionales, cada una con una función y propósito específicos.

---

**1. Información general del embarque**

**Bloque:** Sea Import Information

Contiene los datos principales del embarque:

- Número de referencia y booking.

- Línea naviera, buque y viaje, puertos de origen y destino, POD (Puerto de Descarga) y POL (Puerto de Carga).

- Destino final y P.O. (Purchase Order).

También incluye un botón que permite acceder directamente al cálculo de demurrage asociado a esta referencia, facilitando la gestión de días libres, tarifas y penalizaciones por retención de contenedores.

---

**2. Información del cliente**

**Bloque:** Customer Info

Muestra los datos comerciales del cliente asociado:

- Consignee (consignatario), ejecutivo asignado, días de crédito y fecha de vencimiento del crédito (calculada automáticamente).

- Información adicional como shipper, notify, release type y release agent.

- Fecha de creación de la referencia para control de antigüedad.

Este bloque permite al usuario visualizar las condiciones comerciales y validar aspectos financieros previos a la facturación o liberación de carga.

---

**3. Documentos principales del embarque** 

**Bloques:** Master BLs y House BLs

Cada sección despliega las listas de documentos Bill of Lading asociados:

- Master BL (MBL): documentos emitidos por la línea naviera o agente principal.

- House BL (HBL): documentos emitidos por el freight forwarder o agente secundario.

Cada registro muestra:

- Número del BL.

- Consignatario correspondiente.

- Tipo de documento.

- Archivo adjunto descargable (mediante un botón de descarga).

- Usuario creador del registro.

Esto facilita el control documental y trazabilidad de los embarques, con acceso directo a cada archivo desde el sistema.

---

**4. Detalles de carga**

**Bloque:** Sea Cargo Details

Presenta información específica sobre los contenedores, tipos de carga, dimensiones, y demás detalles logísticos asociados a la referencia.
Es clave para verificar el número de unidades, tipo de contenedor (20HC, 40HC, etc.) y relacionar la información operativa con las tarifas aplicadas.

---

**5. Tarifas de compra y venta**

**Bloque:** Rates

Esta sección agrupa dos tablas principales:

- Buy Rate Breakdown:
Desglose de tarifas de compra (costos hacia la línea o proveedor).
Muestra concepto, monto, divisa, Master BL relacionado y usuario creador.

- Sell Rate Breakdown:
Desglose de tarifas de venta (cargos facturados al cliente).
Incluye información sobre IVA, tipo de facturación (TM/WM) y montos por concepto.

Cuando no existen tarifas registradas, el sistema muestra alertas informativas.
Este bloque permite comparar márgenes de ganancia y revisar los costos por cada embarque.

---

**6. Cargos operativos**

**Bloque:** Charges

Lista los cargos adicionales asociados al servicio, con campos como:

- Concepto, monto, divisa.

- Si aplica IVA o no.

- Clasificación del cargo (fuera o dentro del BL).

- Usuario creador.

Sirve para auditar cargos manuales o automáticos que complementan las tarifas principales.

---

**7. Cargos por demurrage**

**Bloque:** Demurrage Charges

Si la referencia tiene cargos por demurrage (retención de contenedores), estos se muestran aquí mediante el componente especializado SeaImportDemurragesSmart.
Permite visualizar el detalle de cálculos, tarifas aplicadas, fechas, días libres y costos totales.
En caso de no existir registros, se muestra un aviso informativo.

---

**8. Notas de crédito y débito**

**Bloque:** Credit / Debit Note(s)

Muestra las notas financieras (credit/debit notes) asociadas a la referencia, a través del componente FfNotesViewDetails.
Estas notas reflejan ajustes contables o correcciones aplicadas a facturas emitidas, garantizando un control financiero transparente.

---

**9. Facturas y pagos del cliente**

**Bloque:** Customer Invoices & Payments

Despliega las facturas generadas al cliente y sus correspondientes pagos.
Incluye el total por moneda, conceptos y estatus de cobro.
Permite validar que las facturas estén liquidadas antes del cierre del embarque.

---

**10. Facturas y pagos con la línea naviera**

**Bloque:** Line Invoices & Payments

Muestra las facturas emitidas o recibidas de parte de la línea naviera, incluyendo pagos realizados, totales y conceptos.
Facilita la conciliación financiera entre la empresa y la naviera.

---

**11. Facturas y pagos de proveedores**

**Bloque:** Supplier Invoices & Payments

Muestra facturación y pagos a proveedores externos que participaron en el servicio (por ejemplo, agentes, transportistas o almacenistas).
Permite mantener la trazabilidad de todos los costos indirectos relacionados con la referencia.

---

**12. Reembolsos**

**Bloque:** Refunds

Contiene la información sobre reembolsos asociados a la referencia, en caso de devoluciones de pago, ajustes o correcciones de facturación.
Permite un seguimiento financiero detallado y transparente.

---

**13. Funcionalidad general del módulo**

- Carga automática de datos según el ID de referencia.

- Actualización de totales y fechas dinámicas (como la expiración de crédito).

- Validaciones visuales (alertas informativas cuando no existen registros).

- Navegación hacia submódulos como demurrages, facturas o notas.

- Visualización limpia y estructurada de todos los datos operativos y financieros.

---

**14. Beneficios para el usuario**

- Visión 360° de la referencia marítima en una sola pantalla.

- Reducción de tiempo en consultas y validaciones.

- Acceso directo a documentos y comprobantes financieros.

- Mayor control sobre los costos, ingresos y márgenes.

- Integración visual con otros módulos del sistema.

---

# Módulo: Refunds in Service – Reembolsos del servicio marítimo

**Descripción general**

El apartado Refunds in Service permite visualizar todos los reembolsos asociados a una referencia marítima de importación.
Estos reembolsos corresponden a operaciones donde, por distintos motivos (ajustes contables, pagos duplicados, correcciones o devoluciones de saldo), se ha emitido una solicitud de reembolso vinculada a un pago o factura de proveedor o cliente.

El módulo ofrece una vista consolidada de todos los registros de reembolso generados dentro del servicio, junto con información sobre su estado, beneficiario, monto y fecha de emisión.

---

**Objetivo del módulo**

- Proporcionar una visión centralizada de los reembolsos generados durante el proceso de importación marítima.

- Facilitar la verificación del estatus de pago (pagado o pendiente).

- Permitir un acceso rápido al detalle de cada solicitud de reembolso desde la tabla principal.

- Asegurar la trazabilidad financiera completa de las operaciones relacionadas con la referencia.

**Estructura de la vista**

*Encabezado principal*

En la parte superior se muestra el título “Refunds in Service”, acompañado de un botón de actualización.

- El botón con el icono de recarga (refresh) permite actualizar la información y consultar los datos más recientes desde el sistema.

- Al hacer clic, el módulo recarga los reembolsos asociados al servicio en curso.

Este encabezado facilita al usuario mantener los datos sincronizados con la base actualizada del sistema.

---

**Tabla de reembolsos**

La tabla principal despliega los reembolsos en formato compacto, organizados por columnas con la siguiente información:

| Campo            | Descripción                                                                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Payment**      | Muestra el estatus de pago del reembolso mediante un distintivo de color: <br>• **Verde:** el reembolso ya fue pagado. <br>• **Rojo:** el reembolso está pendiente de pago.         |
| **Folio**        | Indica el número o identificador de la solicitud de reembolso. Incluye un botón que permite abrir la vista detallada del reembolso correspondiente.                                 |
| **Beneficiary**  | Nombre de la persona o entidad beneficiaria del reembolso.                                                                                                                          |
| **Amount**       | Monto total del reembolso, acompañado de la divisa en la que fue emitido. El formato monetario se muestra con separadores y decimales para facilitar la lectura.                    |
| **Invoice date** | Fecha en la que se generó la solicitud de reembolso. Se acompaña de la información del usuario responsable que registró el movimiento, presentada mediante una insignia de usuario. |

---

**Casos sin registros**

Si no existen reembolsos asociados a la referencia, el sistema muestra un mensaje informativo centrado:

*“No refunds linked to service”*

Esto permite al usuario confirmar rápidamente que no se han registrado operaciones de reembolso para esa referencia en particular.

---

**Navegación y acciones**

- Al hacer clic en el botón “Req. refund #”, el sistema redirige automáticamente a la vista detallada del reembolso seleccionado.

- Desde allí, el usuario puede consultar toda la información del requerimiento, incluyendo sus documentos, historial de aprobación y registros contables.

- Esta navegación fluida permite revisar cada caso de manera individual sin salir del contexto de la referencia marítima.

---

**Actualización de datos**

El módulo incluye un proceso de recarga de información en tiempo real.
Cuando el usuario presiona el botón de actualización:

- Se limpia temporalmente la lista de reembolsos.
 
- Se realiza una consulta al sistema para obtener los datos más recientes.

- Se muestra un indicador visual de carga para señalar que el sistema está procesando la solicitud.

- Al finalizar, la tabla se repuebla automáticamente con la información actualizada.

De esta forma se garantiza que el usuario siempre consulte los datos más recientes disponibles en el sistema.

---

**Beneficios para el usuario**

- Visibilidad completa de todos los reembolsos asociados al servicio.

- Identificación rápida del estatus de pago mediante indicadores visuales.

- Acceso directo al detalle de cada solicitud desde la misma pantalla.

- Ahorro de tiempo al evitar búsquedas manuales en otros apartados.

- Transparencia contable y trazabilidad de todas las operaciones financieras vinculadas al servicio marítimo.

---

**Contexto operativo**

El componente Refunds in Service forma parte del flujo de información financiera dentro del módulo de Sea Import References.
Trabaja en conjunto con otros apartados como:

- Supplier Invoices & Payments,

- Line Invoices & Payments, y

- Customer Invoices & Payments,

para ofrecer una visión financiera integral de cada referencia marítima, incluyendo cobros, pagos y devoluciones.

---

# Supplier Invoices – Facturas de proveedor
**Descripción general**

El apartado Supplier Invoices muestra todas las facturas emitidas por los proveedores relacionadas con una referencia marítima específica.
Desde esta vista, los usuarios pueden consultar el estado de pago de cada factura, verificar importes con desglose de impuestos, y acceder directamente a las solicitudes de pago o anticipos asociados a cada proveedor.

Este módulo también incluye la sección Supplier Advance Payments, donde se listan los pagos anticipados pendientes de aplicar a las facturas de los proveedores.

---

**Objetivo del módulo**

El propósito de este apartado es ofrecer a los usuarios una visión completa y actualizada de todas las obligaciones financieras del servicio hacia los proveedores, incluyendo tanto facturas como anticipos, para facilitar la gestión de pagos, control contable y conciliación.

---

**Estructura de la vista**

🧾 Sección 1: Supplier Invoices

Esta sección muestra una tabla con todas las facturas registradas para los proveedores que participaron en el servicio marítimo de importación.

Cada registro contiene la siguiente información:

| Campo            | Descripción                                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Payment**      | Indica el estado actual del pago. Puede mostrar tres posibles situaciones:<br>• **Pending request** – La factura aún no tiene una solicitud de pago generada.<br>• **Pending payment** – La solicitud de pago ya existe pero aún no ha sido liquidada.<br>• **Paid @ [fecha]** – La factura ha sido pagada y muestra la fecha en la que se registró el pago.                                                 |
| **Folio**        | Muestra el número de folio o identificador de la factura. Al hacer clic sobre el folio, el sistema redirige al usuario a la vista detallada de la <br>**solicitud de pago al proveedor (Supplier Request Payment)** correspondiente.                                                                                                                                                                              |
| **Supplier**     | Indica el nombre del proveedor asociado a la factura.                                                                                                                                       |
| **Amount**       | Desglosa el monto total de la factura y permite ver un tooltip con el detalle de impuestos y retenciones. Al pasar el cursor sobre el icono de información, <br>se despliega una ventana con el siguiente desglose:<br>• **Amount:** monto base de la factura.<br>• **IVA:** impuesto al valor agregado aplicado.<br>• **ISR:** retención del impuesto sobre la renta.<br>• **IVA Ret:** retención de IVA.<br>Finalmente, se muestra el **total neto** con su respectiva moneda. |
| **Invoice date** | Fecha en la que fue registrada la factura dentro del sistema.    |

---

Estados visuales

Los estados se representan con etiquetas de color (chips) que facilitan la interpretación rápida:

- 🟡 Pending request: factura aún no enviada a solicitud de pago.

- 🟠 Pending payment: solicitud de pago creada, pero pendiente de liquidación.

- 🟢 Paid: factura completamente pagada (se muestra la fecha del pago).

Esto permite al usuario conocer el estatus financiero de cada proveedor de un solo vistazo.

---

**Funciones adicionales**

Además del listado principal, el módulo calcula automáticamente los totales e impuestos a partir de las facturas asociadas.
Los montos se muestran en formato monetario, e incluyen el tipo de moneda (por ejemplo, USD o MXN), asegurando precisión contable y transparencia.

---

# Sección 2: Supplier Advance Payments

Esta tabla muestra los pagos anticipados realizados a proveedores que aún no se han aplicado a facturas específicas.

Cada registro contiene los siguientes campos:

| Campo        | Descripción                                                                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**   | Indica el estado del anticipo. Normalmente aparece como “Pending to apply”, es decir, pendiente de ser aplicado a una factura.                                        |
| **Folio**    | Identificador único del pago anticipado. Incluye un botón que permite abrir directamente la vista del **requerimiento de pago anticipado** (Advance Payment Request). |
| **Supplier** | Nombre del proveedor que recibió el anticipo.                                                                                                                         |
| **Amount**   | Monto del anticipo, con su moneda correspondiente.                                                                                                                    |
| **Created**  | Fecha en la que se registró el pago anticipado en el sistema.                                                                                                         |

---

**Navegación**

- Al hacer clic sobre el folio de una factura, el sistema abre la página de detalle del Supplier Request Payment, donde el usuario puede consultar documentos, historial de aprobación y comprobantes de pago.

- Al hacer clic en un folio de anticipo, se accede al detalle del Advance Payment Request, con información sobre el monto, estatus, proveedor y fecha.

Esta navegación interconectada permite consultar fácilmente la información financiera completa de cada proveedor sin necesidad de salir del flujo de la referencia marítima.

---

**Actualización de información**

Cada vez que el usuario accede al apartado o recarga la vista:

- El sistema consulta las facturas de proveedor vinculadas a la referencia actual.

- También obtiene los anticipos asociados (si existen).

- Durante la carga, se muestra un indicador visual (loading) que informa que el sistema está procesando la solicitud.

Esto asegura que los datos mostrados sean precisos y actualizados en tiempo real.

---

**Beneficios para el usuario**

- Control centralizado de facturas y anticipos de proveedor.

- Identificación inmediata del estatus de pago de cada documento.

- Desglose automático de impuestos y retenciones.

- Acceso directo a vistas detalladas de solicitudes y pagos.

- Reducción de errores contables y mayor transparencia en los procesos financieros.

- Integración con otros módulos del sistema de importación marítima (como Customer Invoices y Refunds).

---

**Contexto operativo**

El módulo Supplier Invoices forma parte del flujo financiero dentro del sistema de Sea Import References, y se complementa con:

- Customer Invoices – para el control de facturas emitidas a clientes.

- Refunds in Service – para el seguimiento de reembolsos relacionados con pagos de proveedores.

- Demurrages – para los cargos adicionales por días de retención de contenedores.

De esta manera, se garantiza una visión integral de los movimientos económicos del servicio marítimo.

---

# Sea Import – Payment Schedule & Line Invoices

**Gestión de pagos programados y facturas asociadas por línea**

Este componente muestra la información relacionada con el calendario de pagos (Payment schedule) y las facturas de línea (Line invoice(s)) vinculadas a una referencia marítima de importación.
Su propósito es ofrecer una visión consolidada del estado de los pagos, montos, usuarios responsables, fechas de creación, notas de crédito asociadas y estatus de envío de los pagos programados.

La vista se divide en dos secciones principales:

1. Payment Schedule – Pagos pendientes o enviados, con detalles de usuario, monto, divisa y fechas.

2. Line Invoice(s) – Facturas vinculadas a líneas marítimas, su estatus de pago, notas de crédito asociadas y detalles de facturación.

---

**Estructura general**

El componente está diseñado con un layout en dos columnas, usando tablas compactas para facilitar la lectura.
Cada tabla incluye encabezados personalizados, indicadores de estado y acciones rápidas con botones que permiten abrir vistas relacionadas (por ejemplo, notas de crédito).

---

**1. Sección: Payment Schedule**

Muestra los pagos programados asociados a la referencia marítima.

**Campos principales:**

- Payment: Indica el estado actual del pago.

- Amount: Monto del pago con su respectiva divisa.

- User: Usuario responsable de la creación del pago.

- Sent: Muestra si el pago fue enviado o aún está pendiente.

- Created: Fecha de creación del registro de pago.

---

**2. Sección: Line Invoice(s)**

Esta tabla presenta todas las facturas de línea vinculadas al proceso marítimo, junto con su estado, monto, notas de crédito y detalles del proveedor o línea logística.

**Campos principales:**

- Link as paid: Muestra si la factura está pagada o pendiente.

- Folio/Serie: Identificador de la factura.

- Amount: Monto total facturado en su divisa.

- Credit Notes: Lista de notas de crédito vinculadas a la factura, con acceso directo a cada nota.

- Line: Nombre de la línea naviera o proveedor.

- Invoice date: Fecha de emisión de la factura, con información del usuario que creó el registro.

---

**Funciones principales**

- Obtener detalles de pagos y facturas: Llama a la API para cargar los datos asociados a la referencia seleccionada.
 
- Visualizar notas de crédito: Permite abrir la vista detallada de cada nota en una nueva pestaña.

- Formateo de fechas y divisas: Funciones auxiliares para presentar la información de manera legible para el usuario.

---

**Datos reactivos y propiedades**

- Referencia marítima: Contiene los datos de la referencia seleccionada.

- Pagos y facturas: Objeto que almacena los resultados de la API con dos listas principales: pagos y facturas asociadas.

---

**Ciclo de vida**

- Al cargar el componente, se realiza una llamada inmediata a la API para obtener los datos relacionados.

- Mientras los datos se obtienen, se activa un indicador de carga global que muestra al usuario que la información está siendo procesada.

---

**Detalles visuales**

- Tablas compactas y responsivas.

- Estados de color:

   - 🟡 Pendiente

   - 🟢 Pagado o enviado

- Botones secundarios para acciones rápidas.

- Indicadores de usuario y fecha para contextualizar cada registro.

---

**Beneficios operativos**

- Visualiza en un mismo espacio la programación de pagos y las facturas vinculadas.

- Facilita la detección de pagos pendientes y notas de crédito aplicadas.

- Mejora la trazabilidad contable y operativa del flujo financiero por referencia marítima.

- Refuerza la transparencia entre los departamentos de finanzas, compras y logística.

---

# Sea Service – Customer Invoices & Payments

**Gestión de facturas y pagos de clientes por servicio marítimo**

Este componente permite visualizar y gestionar la información relacionada con facturas de clientes (Customer invoices) y pagos asociados (Customer payments) en un servicio marítimo de importación o exportación.
Su propósito es ofrecer una vista integral de los estados de pago, montos, clientes, notas de crédito y fechas de creación, facilitando la trazabilidad y seguimiento financiero de cada referencia marítima.

La vista se divide en dos secciones principales:

1. Customer Invoices – Lista de facturas emitidas a clientes, mostrando su estado de pago, notas de crédito asociadas, montos, cliente y fecha de emisión.

2. Customer Payments – Historial de pagos realizados por el cliente, indicando concepto, monto, divisa y fecha de creación.

---

**1. Sección: Customer Invoices**

Presenta una tabla con todas las facturas de clientes asociadas a la referencia marítima.

**Campos principales:**

- Pay status: Indica el estado de la factura:

   - Cancelada si la factura fue eliminada o anulada.

   - Pending si aún no ha sido pagada.

   - Paid si la factura fue saldada.

- Invoice #: Número de factura emitida, con vistas de previsualización dependiendo del tipo de factura (Sea Tm o Sea Wm).

- Credit notes: Lista de notas de crédito vinculadas a la factura. Cada nota incluye información del usuario y el monto, accesible directamente.

- Customer: Nombre del cliente o consignatario.

- Amount: Monto total de la factura en su divisa, incluyendo impuestos.

- Invoice date: Fecha de emisión de la factura, contextualizada con información del usuario que la generó.

**Características adicionales:**

- Facturas eliminadas se resaltan visualmente para indicar su estado.

- Indicadores visuales (chips) muestran claramente el estado de cada factura.

- Previsualización de facturas según el tipo de servicio, para rápida verificación.

---

**2. Sección: Customer Payments**

Muestra un historial de los pagos realizados por el cliente asociados a la referencia marítima.

**Campos principales:**

- **Payment:** Concepto o cargo del pago realizado.

- **Amount:** Monto pagado en la divisa correspondiente.

- **Created at**: Fecha de creación del pago, acompañada de información del usuario que registró el movimiento.

**Características adicionales:**

- Permite un acceso rápido a la información de cada pago, facilitando la conciliación financiera.

- La tabla es compacta y responsiva para una lectura eficiente de grandes volúmenes de datos.

---

**Funciones principales**

- Obtener facturas y pagos: Llama a la API para cargar todas las facturas y pagos asociados a la referencia seleccionada.

- Identificación de tipos de factura: Determina si la factura pertenece a Sea Tm o Sea Wm para mostrar previsualizaciones adecuadas.

- Cálculo de montos totales: Suma los cargos e impuestos, considerando facturas canceladas o activas.

- Recarga de información: Botones de actualización permiten volver a cargar los datos en tiempo real.

---

**Datos reactivos y propiedades**

- Referencia marítima: Identificador de la referencia para la cual se consultan las facturas y pagos.

- Información de clientes: Objeto que almacena dos listas principales: invoices (facturas) y service_payments (pagos).

---

**Ciclo de vida**

- Al cargar el componente, se realiza una llamada automática a la API para obtener todas las facturas y pagos de la referencia.

- Se activa un indicador global de carga para mostrar al usuario que la información está siendo procesada.

- Se pueden actualizar los datos manualmente mediante los botones de sincronización.

---

**Detalles visuales**

- Tablas compactas y responsivas.

- Indicadores de estado mediante colores:

   - 🔴 Cancelada

   - 🟡 Pending

   - 🟢 Paid

- Previsualización de facturas integrada según tipo de documento.

- Uso de badges o etiquetas para contextualizar usuario y fecha de creación.

---

**Beneficios operativos**

- Consolida en un mismo espacio las facturas de clientes y sus pagos, facilitando el seguimiento financiero.

- Permite identificar rápidamente facturas pendientes, pagadas o canceladas.

- Mejora la trazabilidad y transparencia entre los departamentos de finanzas y operaciones.

- Reduce errores en conciliaciones y auditorías al mostrar información confiable y actualizada en tiempo real.

---

# F.F. Agent Notes – Gestión de notas de agentes de freight forwarding

**Visualización y gestión de notas de crédito y débito de agentes F.F.**

Este componente permite visualizar y gestionar las notas de agentes de freight forwarding (F.F. Agent Notes), incluyendo créditos, débitos y sus detalles financieros asociados.
Su objetivo es ofrecer una visión completa y consolidada de cada nota, sus conceptos, montos, estados, archivos adjuntos y solicitudes de pago, facilitando la trazabilidad y control contable dentro del sistema.

La vista principal se organiza en una tabla compacta que muestra todas las notas de F.F., y permite acceder a detalles adicionales mediante diálogos emergentes o previsualizaciones de PDF.

---

**Sección principal: F.F. Agent Notes**

**Campos principales:**

- Type: Tipo de nota, indicando su origen (desde TM o desde el agente).

- Credit/Debit: Indica si la nota es un crédito o un débito. Además, señala si la nota se ha generado como factura.

- Folio: Identificador o número de la nota del servicio.

- Agente F.F.: Nombre del agente de freight forwarding responsable.

- Amount: Monto total de la nota en la moneda local. Incluye acceso rápido a detalles de los conceptos que la componen.

- in USD: Conversión del monto total a dólares estadounidenses, para referencia internacional.

- File / PDF: Archivos asociados a la nota, incluyendo previsualización PDF y descarga desde S3 si aplica.

- Status: Indica si la nota está activa o cancelada, con colores que facilitan la identificación visual.

- Req. payment status: Estado de la solicitud de pago asociada a la nota, mostrando si está pendiente o pagada.

- Actions: Información del usuario que creó o modificó la nota y, si fue cancelada, la razón de la cancelación.

**Características adicionales:**

- Filas resaltadas si la nota está cancelada para facilitar la detección rápida.

- Botones para abrir detalles de la nota, ver previsualizaciones de PDF o descargar archivos adjuntos.

- Uso de indicadores de color y badges para reflejar estados de manera intuitiva.

---

**Detalles de los conceptos de la nota**

Cada nota contiene un desglose de los conceptos y cargos asociados, incluyendo:

- **Charge:** Nombre del cargo o concepto facturado.

- **Amount:** Monto correspondiente al cargo en la moneda de la nota.

- **Total:** Suma de todos los cargos para la nota, presentada de manera clara y legible.

Los detalles se muestran en un diálogo emergente, permitiendo al usuario consultar la información sin salir de la tabla principal.

---

**Funciones principales**

- **Cálculo de totales:** Suma los cargos de cada nota para mostrar el monto total correctamente.

- **Identificación de tipo de nota:** Determina si es crédito o débito y su origen (TM o agente).

- **Visualización de solicitudes de pago:** Permite acceder a la información de pago asociada y su estado (pendiente o pagada).

- **Gestión de archivos:** Previsualización PDF de notas y descarga de documentos almacenados en S3.

- **Diálogos de detalles:** Muestra un desglose completo de conceptos sin recargar la página.

---

**Datos reactivos y propiedades**

- **ffNotes:** Lista de notas de agentes F.F. que se van a mostrar en la tabla, incluyendo toda la información financiera, archivos adjuntos y estado de pago.

- ffNoteDetails: Objeto reactivo para manejar la visualización de los detalles de cada nota en un diálogo emergente.

- showPdfDialog: Controla la apertura y cierre de la previsualización de archivos PDF.

---

**Ciclo de vida**

Al cargar el componente, se muestran todas las notas proporcionadas a través de la propiedad ffNotes.

Los detalles y previsualizaciones se cargan bajo demanda al hacer clic en cada nota o archivo.

La información se puede actualizar dinámicamente según la interacción del usuario, manteniendo los datos sincronizados con el sistema.

---

**Detalles visuales**

- Tablas compactas y responsivas.

- Indicadores de estado mediante colores:

   - 🔴 Cancelada

   - 🟢 Activa

   - 🟠 Pendiente de pago

   - 🟣 Como factura

- Filas con estilo diferenciado si la nota fue cancelada.

- Badges y chips para mostrar información contextual de manera clara.

---

**Beneficios operativos**

- Facilita la gestión y seguimiento de notas de F.F., con acceso rápido a montos, estados y archivos asociados.

- Mejora la trazabilidad contable y la conciliación de pagos.

- Permite verificar el estado de solicitudes de pago vinculadas, asegurando que no queden pendientes sin control.

- Optimiza la revisión de información detallada de cada nota sin saturar la interfaz principal.

---

# AmountConversionUSD - Conversión de importe en USD

El componente AmountConversionUSD muestra el monto total convertido a dólares estadounidenses (USD), acompañado del tipo de cambio utilizado para la conversión.
Su objetivo es facilitar la visualización del valor en USD de los registros financieros, asegurando transparencia en la conversión y claridad en los reportes.

---

**Funcionalidad**

- Toma como entrada un registro que contiene un monto original y un tipo de cambio.

- Calcula automáticamente el valor equivalente en USD aplicando el tipo de cambio correspondiente.

- Muestra un ícono informativo que al pasar el cursor revela el tipo de cambio exacto mediante un tooltip.

- Si el tipo de cambio es menor a 1, el sistema lo invierte para reflejar correctamente la equivalencia (por ejemplo, de 0.056 a 17.85).

- Si no existe monto o tipo de cambio válido, se muestra “N/A”.

---

***Elementos visuales**

- Un ícono de dólar ($) que permite visualizar el tipo de cambio al colocar el cursor sobre él.

- El valor convertido en USD mostrado junto al ícono, con formato numérico estándar de moneda (dos decimales y separador de miles).

- Un diseño limpio y compacto que se adapta fácilmente dentro de tablas o filas de datos financieros.

---

**Propósito**

Este componente se utiliza principalmente en módulos de finanzas o logística internacional, donde los valores pueden expresarse en diferentes monedas.
Permite al usuario entender de forma inmediata el valor equivalente en dólares sin necesidad de realizar cálculos manuales.

---

**Casos de uso comunes**

- Visualización del monto en USD en tablas de notas de crédito o débito.

- Reportes de pagos a agentes de carga o proveedores internacionales.

- Secciones donde se comparan valores locales y conversiones a divisas extranjeras.

---

**Beneficios**

- Brinda claridad financiera al mostrar la equivalencia en USD.

- Reduce errores de interpretación sobre los montos reales.

- Mejora la experiencia del usuario al incluir información contextual sobre el tipo de cambio.

- Mantiene un formato visual uniforme con el resto del sistema.

---

# Componente: DemurrageCharges
Descripción general

El componente DemurrageCharges muestra un resumen detallado de los cargos por demurrage (demoras en la devolución de contenedores) asociados a una referencia marítima.
Su función principal es permitir al usuario visualizar de manera rápida los cargos generados, su monto, el tipo de cálculo aplicado y el estado de facturación correspondiente.

---

**Funcionalidad**

- Muestra una tabla compacta con la lista de cargos por demurrage asociados a los contenedores de una referencia.

- Cada registro contiene información sobre:

   - Número de contenedor al que pertenece el cargo.

   - Monto total del cargo (con o sin IVA).

   - Tipo de cálculo aplicado (Parcial o Total).

   - Fecha de la última actualización o recálculo del demurrage.

   - Estado de la factura, indicando si el cargo ya fue vinculado a una factura o si sigue pendiente.

- El componente identifica si el cargo fue generado de forma parcial o total, dependiendo de la configuración del contenedor en la referencia.

- Si el cargo está vinculado a una factura, se muestra con un indicador verde (Linked invoice); en caso contrario, aparece un indicador ámbar (Pending).

---

**Elementos visuales**

- **Tarjeta principal (card)** con encabezado “Demurrage charge(s)” y subtítulo “Demurrages in reference”.

- **Tabla compacta** organizada por columnas:

   - **Charge** → muestra el tipo de cargo y el contenedor relacionado.

   - **Amount** → indica el monto total y la moneda utilizada, además de si incluye IVA.

   - **Last calculation** → muestra si el cálculo fue parcial o total, junto con la fecha de la última actualización.

   - **Invoice status** → indica si el cargo está vinculado a una factura o pendiente.

- **Chips de estado visuales** (colores verde y ámbar) que permiten identificar de un vistazo la situación de facturación.

---

**Propósito**

El componente facilita la gestión y monitoreo de los cargos por demurrage dentro de una referencia marítima.
Permite a los usuarios del sistema:

- Ver el historial de cálculos de demurrage.

- Detectar rápidamente qué cargos aún no han sido facturados.

- Supervisar la aplicación de cálculos parciales o totales.

---

**Casos de uso comunes**

- Módulos de referencias marítimas o exportaciones.

- Sección de cargos adicionales o demoras de contenedores.

- Visualización de datos dentro de reportes o paneles financieros relacionados con logística portuaria.

---

**Beneficios**

- Proporciona una vista organizada y resumida de los cargos de demurrage.

- Mejora la trazabilidad de facturación al mostrar qué cargos ya están vinculados a facturas.

- Facilita la verificación de cálculos (parciales o totales) sin necesidad de revisar cada contenedor individualmente.

- Se integra de forma limpia con otras secciones del sistema que manejan información de referencia o contenedores.

---

# Componente: CargoDetails - Detalles de la carga

**Descripción general**

El componente CargoDetails presenta un resumen completo de la información del cargamento (cargo) asociado a una referencia marítima o de exportación.
Incluye tanto los datos generales del embarque (tipo de carga, embalaje y descripción del producto) como el detalle de los contenedores involucrados, con sus características físicas y observaciones.

---

**Funcionalidad**

- Muestra los datos generales del cargamento, tales como:

   - Tipo de condición de carga (Condition type): indica si se trata de carga suelta, consolidada, contenedor completo, etc.

   - Tipo de embalaje (Packaging type): muestra el tipo de material o método de embalaje utilizado.

   - Descripción del producto (Commodity description): detalla la mercancía o tipo de producto transportado.

- Despliega una tabla detallada de contenedores, donde cada fila representa un contenedor asociado a la referencia.
En cada registro se muestran los siguientes campos:

   - Número de contenedor.

   - Tipo de contenedor (ej. 20DC, 40HC, Reefer, etc.).

   - Volumen (m³) y peso (kgs).

   - Número de paquetes contenidos.

   - Notas u observaciones adicionales.

   - Usuario creador del registro, mostrado mediante un identificador visual.

Si un contenedor tiene cargos de demurrage asociados, se muestra un ícono indicador (reloj) con un tooltip informativo que advierte sobre la existencia de estos cargos.

---

**Elementos visuales**

- Una tarjeta principal (card) con el encabezado “Cargo details”.

- Bloques informativos con los datos del cargamento general.

- Una tabla compacta y organizada para listar los contenedores.

- Íconos y tooltips para mejorar la identificación de contenedores con demoras (demurrage).

- Insignias de usuario (UserInfoBadge) para mostrar de manera visual quién registró cada contenedor.

---

**Propósito**

El componente CargoDetails permite visualizar de forma clara y estructurada toda la información logística y física del cargamento asociado a una referencia.
Facilita la revisión operativa y documental de los embarques, tanto para equipos de logística como para departamentos financieros o administrativos.

---

**Casos de uso comunes**

- Referencias marítimas o expedientes de exportación/importación.

- Módulos de seguimiento logístico donde se requiere validar los contenedores asociados a un embarque.

- Auditorías internas de carga, verificaciones de peso, volumen o embalaje.

- Revisión de demurrages vinculados a contenedores específicos.

---

**Beneficios**

- Ofrece una visión completa y estructurada de la información del cargamento.

- Mejora la eficiencia en la revisión logística al incluir datos técnicos y operativos en un solo lugar.

- Identifica de manera rápida los contenedores con cargos por demurrage, facilitando la toma de decisiones.

- Mantiene la trazabilidad de quién creó cada registro de contenedor.

- Presenta un formato ordenado, compacto y visualmente limpio, optimizado para pantallas de gestión o reportes.

---

# Componente: UserInfoPin - Información de usuarioPin

El componente UserInfoPin tiene como propósito mostrar información detallada sobre los usuarios que han creado, actualizado o eliminado un registro dentro del sistema.
Proporciona una interfaz compacta y accesible que permite visualizar rápidamente los datos de auditoría sin sobrecargar la vista principal.

---

**Funcionalidad principal**

- **Visualización contextual:**
El componente se integra junto al contenido principal mediante un pequeño ícono (generalmente un ícono de usuario o pregunta).
Al hacer clic sobre él, el sistema despliega un cuadro modal que contiene la información de los usuarios relacionados con el registro.

- **Modal informativo:**
El cuadro de diálogo presenta, de forma ordenada, los datos del usuario que:

- Creó el registro.

- Lo actualizó por última vez.

- Lo eliminó (en caso de que el registro esté marcado como eliminado).

Cada entrada muestra:

- Nombre completo del usuario.

- Correo electrónico asociado.

- Fecha y hora exacta de la acción correspondiente.

- Un ícono e indicador de color para identificar el tipo de acción:

   - Verde: creación del registro.

   - Ámbar: última actualización.

   - Rojo: eliminación.

- **Indicaciones visuales:**
El componente utiliza tooltips (descripciones emergentes) sobre cada ícono, los cuales muestran el tipo de acción (por ejemplo, “Created by”, “Last updated by”, “Deleted by”).
Esto facilita la comprensión inmediata del contexto sin necesidad de abrir el modal.

---

**Estructura y comportamiento**

1. **Contenido principal (slot):**
Permite insertar cualquier elemento o componente relacionado con el registro que se esté mostrando, manteniendo la información de usuario como una extensión complementaria.

2. **Botón flotante de información:**
Se muestra como un ícono pequeño junto al contenido.
Su función es activar el modal donde se despliega la información de usuarios.

3. **Ventana modal de detalles:**
Contiene una lista estructurada que presenta la información de cada usuario involucrado en el ciclo de vida del registro (creación, actualización, eliminación).

4. **Cierre del modal:**
Se realiza mediante un botón con estilo primario, que restaura el estado visual del componente.

---

**Interacción y experiencia del usuario**

- Accesibilidad: la información de auditoría está disponible bajo demanda, sin interferir con la visualización principal de los datos.

- Claridad visual: los colores y los íconos permiten identificar rápidamente la acción asociada.

- Consistencia: el componente se adapta fácilmente a cualquier módulo del sistema donde se requiera mostrar quién realizó una acción específica sobre un registro.

---

**Casos de uso**

- Tablas de registros: para mostrar quién creó o modificó cada elemento listado.

- Detalles de documentos o transacciones: cuando es necesario auditar cambios y responsables.

- Paneles administrativos: como parte del control de trazabilidad y responsabilidad de los usuarios.

---

# Componente: FileViewer / S3 File Handler
Resumen

Este componente permite a los usuarios descargar y visualizar archivos PDF que se encuentran almacenados en Amazon S3.
Ofrece una experiencia de usuario sencilla y directa, mostrando un botón de descarga cuando el archivo está disponible y un visor de PDF en pantalla completa para previsualización.

---

**Funcionalidad principal**

- **Descarga de archivos:**
Cuando el archivo existe en S3, se habilita un botón que permite al usuario descargarlo localmente.
El nombre del archivo se obtiene automáticamente desde la ruta de S3.

- **Visualización previa en PDF:**
Permite abrir un visor de PDF en pantalla completa mediante un diálogo modal.
Esto facilita revisar el contenido del archivo sin necesidad de descargarlo primero.

- **Control de carga:**
Mientras se realiza la descarga o la preparación del archivo para visualización, se activa un indicador de carga global que informa al usuario sobre el proceso en curso.

---

**Elementos visuales y de interacción**

1. **Botón de descarga:**

   - Se muestra solo si existe una ruta válida (s3Path).

   - Incluye un ícono que indica acción de descarga y el nombre del archivo.

2. **Modal de previsualización:**

   - Contiene un toolbar con botón de cierre y título.

   - El contenido principal es un objeto PDF que muestra el archivo seleccionado.

   - El modal ocupa toda la pantalla para facilitar la lectura.

3. **Indicadores de estado:**

   - Cuando se realiza la descarga o la carga del PDF, se utiliza un loading state global para informar al usuario de la operación.

---

**Comportamiento y flujo de usuario**

1. Si existe un archivo disponible:

   - El botón de descarga se habilita automáticamente.

   - Al hacer clic en él, el archivo se descarga al equipo del usuario con su nombre original.

2. Para previsualizar el archivo:

   - El usuario puede abrir un modal en pantalla completa que permite revisar el PDF.

   - El modal se puede cerrar con un botón que restaura el estado visual normal.

3. Si no existe un archivo (ruta vacía o nula):

   - El botón de descarga no se muestra, evitando errores o acciones inválidas.

---

**Beneficios operativos**

- Facilita la gestión y descarga de documentos sin salir del sistema.

- Mejora la experiencia de usuario al permitir previsualizar PDFs antes de descargarlos.

- Incrementa la seguridad y control al centralizar la interacción con archivos almacenados en S3.

- Mantiene la trazabilidad visual, mostrando de manera clara cuándo un archivo está disponible y listo para uso.

---

# Componente: ReferenceInfo / Servicio – Información de Referencias
Resumen

Este componente muestra de manera clara y compacta las referencias asociadas a un servicio marítimo.
Permite visualizar la referencia principal, referencias fuente, referencias de seguimiento (tracker) y referencias relacionadas a clientes, en un formato fácil de leer con indicadores visuales.

---

**Funcionalidad principal**

- **Referencia principal:**
Muestra el número de referencia asociado directamente al servicio.

- **Referencia fuente:**
Si la referencia principal difiere de la referencia original (ref_num_source), se muestra un aviso visual indicando la relación entre ambas.

- **Referencia de seguimiento (Tracker):**
Si existe un tracker asociado, se visualiza con un distintivo que incluye el número de tracker correspondiente.

- **Referencia cliente (CL):**
Cuando el servicio está vinculado a una referencia de cliente, se presenta esta información para facilitar la trazabilidad.

---

**Elementos visuales y de interacción**

1. **Indicadores de relación:**

   - Cada referencia adicional se presenta con un fondo distintivo y un ícono de flecha, indicando que está relacionada con la referencia principal.

2. **Codificación por color:**

   - Las referencias fuente y de cliente se diferencian mediante colores de fondo claros/oscuro, lo que facilita su rápida identificación.

3. **Formato compacto y jerárquico:**

   - La referencia principal se destaca visualmente, mientras que las referencias relacionadas se muestran como subelementos, en un diseño limpio y vertical.

---

**Beneficios operativos**

- Permite a los usuarios identificar rápidamente la referencia principal y sus relaciones.

- Mejora la trazabilidad de servicios al mostrar referencias fuente, de seguimiento y de cliente en un solo lugar.

- Facilita la verificación cruzada de datos entre diferentes sistemas o registros relacionados con la misma referencia.

- Proporciona un formato visual intuitivo, que ayuda a reducir errores al revisar referencias vinculadas a un servicio.

---

# TM – Demurrages & Detentions
Descripción general

Esta sección del sistema marítimo permite gestionar demurrages y detentions, así como crear y administrar CFDIs de proveedores relacionados con estos cargos. La interfaz está diseñada para proporcionar un flujo claro desde la solicitud de pagos hasta la visualización y seguimiento de las solicitudes existentes. Está dirigida principalmente a usuarios del área de finanzas, logística y operaciones marítimas.

La página se divide en tres bloques principales:

1. **Navegación y acciones principales**

2. **Botones de acción rápida**

3. **Panel de pestañas para solicitudes**

---

**1. Navegación y control**

- **Botón Back / Retroceso:**
Situado en la parte superior izquierda, permite al usuario regresar a la página anterior dentro del módulo marítimo. Esto facilita la navegación sin perder contexto.

---

**2. Acciones rápidas**

En la parte superior de la sección principal se encuentran botones de acción destacados que permiten al usuario iniciar rápidamente tareas clave:

1. **Request demurrages payment**

   - Color: Verde oscuro (green-darken-4).

   - Función: Dirige al usuario al formulario para solicitar el pago de demurrages.

   - Uso: Se utiliza cuando un contenedor ha permanecido más tiempo del permitido en puerto o terminal, generando un cargo adicional.

2. **Request detentions payment**

   - Color: Verde oscuro (green-darken-4).

   - Función: Permite crear una solicitud de pago de detentions, relacionados con retención prolongada de contenedores fuera del puerto.

3. **Add new supplier CFDI**

   - Color: Azul primario (primary).

   - Función: Permite crear un CFDI de proveedor asociado a demurrages o detentions.

   - Uso: Facilita la gestión fiscal de los cargos generados por demurrages y detentions, asegurando que todos los documentos estén correctamente registrados.

---

**3. Panel de solicitudes (RequestDemurragesDetentionsTabs)**

La sección principal está organizada mediante un componente de pestañas que permite separar visualmente las solicitudes de demurrages y detentions:

- Cada tab muestra una lista de solicitudes existentes, con información resumida y acciones disponibles para cada registro.

- Las pestañas permiten al usuario:

   - Consultar solicitudes activas.

   - Visualizar el estado de aprobación o pago.

   - Acceder a detalles adicionales según sea necesario.

---

**Elementos visuales y UX**

1. **Botones de acción destacados**

   - Los botones son grandes y fácilmente reconocibles por color y posición.

   - Se ubican en la parte superior de la tarjeta principal para visibilidad inmediata.

2. **Tarjeta principal**

   - Contiene el título de la sección: “Maritime – Demurrages & Detentions”.

   - Alojamiento de los botones de acción y del componente de pestañas.

3. **Pestañas dinámicas**

   - Permiten cambiar entre Demurrages y Detentions sin recargar la página.

   - Cada tab es interactivo y contiene listado de solicitudes con filtros y acciones.

4. **Diseño responsivo**

   - La estructura utiliza un layout fluido que se adapta a pantallas de escritorio y dispositivos móviles.

   - Mantiene la visibilidad de los botones y tablas en todos los tamaños de pantalla.

---

**Flujo de trabajo recomendado**

1. **Revisión inicial:**

   - Accede a la sección TM – Demurrages & Detentions.

   - Revisa las solicitudes existentes en el panel de pestañas.

2. **Crear nueva solicitud de pago:**

   - Selecciona Request demurrages payment o Request detentions payment según corresponda.

   - Completa los campos requeridos en el formulario (referencia, contenedor, monto, fecha, etc.).

   - Guarda la solicitud para que aparezca en la lista del tab correspondiente.

3. **Generar CFDI de proveedor:**

   - Haz clic en Add new supplier CFDI.

   - Completa los datos fiscales del proveedor y adjunta información relacionada con el cargo.

   - Confirma la creación para que quede registrado en el sistema.

4. **Seguimiento de solicitudes:**

   - Accede a cada tab para revisar el estado de las solicitudes de pago.

   - Visualiza detalles como monto, contenedor, tipo de cargo y estado de pago.

   - Realiza acciones adicionales como impresión o descarga de documentos si están disponibles.

---

**Beneficios operativos**

- Centraliza toda la información de demurrages y detentions en un solo panel.

- Facilita la gestión rápida de solicitudes de pago, reduciendo errores administrativos.

- Permite crear CFDIs de proveedores asociados, asegurando cumplimiento fiscal.

- Mejora la trazabilidad y seguimiento de pagos, con visibilidad clara del estado de cada solicitud.

- Optimiza la experiencia del usuario mediante diseño intuitivo y responsivo.

---

# Pestañas de solicitudes – Demurrages y Detentions

**Descripción general**

Esta sección permite al usuario gestionar y consultar solicitudes de pago de demurrages y detentions a través de un sistema de pestañas dinámicas, ofreciendo una visualización clara y segmentada por tipo de cargo. Está diseñada para usuarios de finanzas, logística y operaciones marítimas.

El componente principal organiza la información en dos pestañas:

1. **Demurrage payment requests**

2. **Detentions payment requests**

Cada pestaña contiene una tabla específica con todas las solicitudes correspondientes, permitiendo acceso rápido a detalles, estados y acciones disponibles.

---

**1. Navegación mediante pestañas**

- **Ubicación:** Parte superior de la sección, justo debajo de los botones de acción de la vista principal.

- **Diseño visual:**

   - Fondo azul claro (blue-lighten-4) para diferenciación.

   - Íconos de navegación (mdi-ship-wheel) para cada pestaña, facilitando la identificación visual de los tipos de cargo.

   - Pestañas fijas que permiten un cambio rápido sin afectar la vista global de la página.

- **Comportamiento:**

   - El usuario puede cambiar de una pestaña a otra con un solo clic.

   - La pestaña activa queda resaltada visualmente para indicar en qué sección se encuentra el usuario.

---

**2. Pestaña “Demurrage payment requests”**

- **Contenido:**

   - Tabla de solicitudes de pago de demurrages, cargadas mediante el componente RequestDemurragesTable.

   - Cada fila representa una solicitud individual y muestra información clave, como:

      - Número de referencia o contenedor.

      -  Fecha de solicitud.

      - Monto del cargo.

      - Estado del pago.

      - Acciones disponibles (ver detalles, aprobar, generar CFDI, etc.).

- **Funciones principales:**

1. Visualización rápida: Permite ver todas las solicitudes de demurrages registradas.

2. Acciones directas: Desde la tabla, el usuario puede ejecutar acciones relacionadas con la gestión de la solicitud.

3. Filtrado y ordenamiento: Posibilita organizar la información según diferentes criterios (si está implementado en el componente de tabla).

---

**3. Pestaña “Detentions payment requests”**

- **Contenido:**

   - Tabla de solicitudes de pago de detentions, cargadas mediante el componente RequestDetentionsTable.

   - Al igual que la pestaña de demurrages, cada fila representa una solicitud con información clave y acciones disponibles.

- **Funciones principales:**

   1. Consulta de solicitudes: Permite revisar todas las solicitudes de detentions registradas.

   2. Seguimiento de estado: Facilita verificar si la solicitud fue aprobada, pagada o está pendiente.

   3. Acciones desde la tabla: El usuario puede realizar operaciones relacionadas, como generar documentos o revisar detalles de pago.

---

**4. Beneficios y ventajas**

- Organización clara: Separar demurrages y detentions en pestañas permite al usuario encontrar rápidamente la información relevante sin confusión.

- Eficiencia operativa: Cambiar entre pestañas no requiere recargar la página, optimizando la experiencia de usuario.

- Centralización de información: Toda la información de solicitudes de pago de cargos marítimos queda accesible desde un único punto.

- Interactividad: Las tablas permiten acciones directas, reduciendo pasos administrativos y mejorando la productividad.

---

**Flujo recomendado de uso**

1. Acceder a la sección de Demurrages & Detentions desde la vista principal.

2. Seleccionar la pestaña deseada según el tipo de solicitud que se desea revisar:

   - Demurrage payment requests para solicitudes de demurrages.

   - Detentions payment requests para solicitudes de detentions.

3. Revisar la tabla correspondiente y utilizar las acciones disponibles para gestionar cada solicitud:

   - Visualizar detalles de la solicitud.

   - Aprobar o rechazar pagos.

   - Descargar documentos asociados.

4. Cambiar a la otra pestaña si se desea revisar solicitudes de otro tipo, manteniendo la información organizada y actualizada.

---

# Sección: Solicitudes de pago de Detentions

**Descripción general**

Esta sección permite a los usuarios visualizar, filtrar y gestionar solicitudes de pago de detentions (retenciones de contenedores por tiempo extra) de manera centralizada. 
Es una herramienta clave para áreas de logística, operaciones marítimas y finanzas, que necesitan controlar el estado de los pagos y mantener un registro detallado de cada solicitud.

La interfaz combina filtros dinámicos, tabla de resultados, paginación y indicadores de estado, lo que permite una gestión rápida y eficiente.

---

**1. Filtros de búsqueda**

Los filtros permiten refinar la lista de solicitudes de detentions según distintos criterios:

- **Fecha de inicio y fin:**

   - Campos "Date from" y "Date to".

   - Permite seleccionar un rango de fechas para filtrar solicitudes creadas en ese periodo.

- **Número de solicitud:**

   - Campo "Request number".

   - Permite buscar solicitudes por su ID único.

- **Consignee:**

   - Componente de búsqueda ACustomerSearch.

   - Filtra por consignatario asociado a la solicitud.

- **Master BL (Bill of Lading):**

   - Campo de texto que permite filtrar por número de BL principal asociado a la solicitud.

- **Estado de la solicitud:**

   - Selector desplegable para filtrar por estado de eliminación o vigencia de la solicitud (activo, cancelado, pendiente).

- **Botones de acción de filtros:**

   - **Search / Buscar:** Aplica los filtros seleccionados y actualiza la tabla.

   - **Clear / Limpiar:** Restablece todos los filtros a sus valores iniciales.

**Nota:** Se puede presionar Enter en los campos de filtros para ejecutar la búsqueda de manera rápida.

---

**2. Tabla de solicitudes**

La tabla presenta todas las solicitudes de detentions que cumplen con los filtros aplicados:

- **Columnas principales:**

   1. **Actions / Acciones:**

      - Botón para visualizar la solicitud completa y acceder a detalles.

   2. **Req #:** Número de la solicitud.

   3. **Freight line / Línea de transporte:** Nombre de la naviera asociada a la solicitud.

   4. **Service(s) #:** Referencias de servicios asociados a la solicitud. Cada referencia se muestra como una etiqueta (chip) para fácil visualización.

   5. **MBL:** Master Bill of Lading asociado a cada contenedor, mostrado también como etiquetas.

   6. **Containers / Contenedores:** Lista de contenedores incluidos en la solicitud, mostrando número y tipo de contenedor.

   7. **Status / Estado:** Indica si la solicitud está pendiente, pagada o cancelada.

      - Si se canceló, se muestra "Cancelled".

      - Si la factura asociada está pagada, se muestra "Paid" con fecha de pago.

      - Si aún está pendiente, se muestra "Pending".

   8. **Total:** Suma de los cargos asociados a todos los contenedores, incluyendo IVA si aplica.

   9. **Currency / Moneda:** Moneda utilizada en la solicitud.

   10. **Created at / Fecha de creación:** Fecha en que se creó la solicitud, junto con información del usuario que la generó.

- **Filas de la tabla:**

   - Colores indicativos:

      - Rojo: Solicitudes canceladas.

      - Gris claro: Proformas o solicitudes preliminares.

      - Normal: Solicitudes activas.

   - Cada fila agrupa contenedores y BLs mediante etiquetas (chips) para mantener la información organizada y clara.

---

**3. Paginación**

- Ubicada arriba y debajo de la tabla, permite navegar entre páginas de resultados.

- El usuario puede cambiar de página haciendo clic en los números o flechas de navegación.

- La tabla y la paginación se actualizan automáticamente según los filtros aplicados o la página seleccionada.

---

**4. Funcionalidades adicionales**

- **Visualizar solicitud:**

   - Cada fila tiene un botón que permite abrir la vista detallada de la solicitud de detentions.

   - Desde allí, se pueden consultar todos los datos asociados, como contenedores, cargos, BLs, estado de pago y notas del consignatario.

- **Indicadores de estado de pago:**

   - Proporciona información inmediata sobre si la factura relacionada con la solicitud está pendiente o ya fue pagada, con la fecha de pago si aplica.

- **Actualización dinámica:**

   - La tabla se actualiza automáticamente al aplicar filtros, limpiar filtros o cambiar de página, garantizando que la información siempre esté actualizada.

---

**5. Flujo recomendado de uso**

1. Acceder a la pestaña Detentions payment requests.

2. Aplicar filtros según la necesidad: rango de fechas, número de solicitud, consignatario, BL o estado.

3. Revisar la tabla con las solicitudes filtradas:

   - Verificar el estado de cada solicitud.

   - Consultar contenedores y BLs asociados mediante las etiquetas.

4. Hacer clic en el botón de acción de cada solicitud para abrir la vista detallada y ejecutar acciones adicionales si es necesario.

5. Utilizar la paginación para recorrer todas las solicitudes disponibles.

---

**6. Beneficios y ventajas**

- Gestión eficiente: Centraliza todas las solicitudes de detentions en una sola vista interactiva.

- Visualización clara: La combinación de etiquetas, colores y columnas facilita identificar rápidamente contenedores, BLs y estado de pago.

- Flexibilidad de búsqueda: Permite aplicar filtros múltiples y combinados para encontrar solicitudes específicas de forma rápida.

- Control operativo y financiero: Proporciona información actualizada sobre pagos, estado de facturas y solicitudes canceladas.

---

# Componente: Botón “View” para solicitudes
Descripción general

Este elemento se utiliza dentro de la tabla de solicitudes de detentions o demurrages para permitir al usuario visualizar los detalles completos de una solicitud específica. Cada fila de la tabla incluye este botón, generalmente en la columna de acciones.

---

**1. Funcionalidad**

- **Tooltip informativo:**

   - Al pasar el cursor sobre el botón, se muestra un mensaje flotante con el texto "View" para indicar su propósito.

- **Acción al hacer clic:**

   - Cuando el usuario hace clic en el botón, se dispara un evento que notifica al componente padre.

   - El componente padre recibe la solicitud correspondiente y puede abrir la vista detallada de la solicitud, mostrando todos los contenedores, BLs, cargos, estado de pago y notas asociadas.

- **Visualización:**

Botón pequeño y elevado, con ícono de ojo (eye-outline) para indicar claramente que es una acción de “ver detalles”.

Color verde para diferenciarlo de otras acciones y destacar que es una acción positiva o de consulta.

---

**2. Ubicación en la interfaz**

- Este botón se encuentra en la columna “Actions / Acciones” de la tabla de solicitudes de detentions.

- Cada fila de la tabla tiene su propio botón asociado a la solicitud representada en esa fila.

---

**3. Beneficios**

- **Interactividad intuitiva:** Los usuarios pueden identificar rápidamente dónde hacer clic para ver más información.

- **Integración con tablas dinámicas:** Funciona con cualquier fila de solicitudes filtradas o paginadas.

- **Claridad visual:** Ícono de ojo y tooltip garantizan que la función del botón sea evidente.

- **Modularidad:** Al emitir un evento, el componente es reutilizable y permite que el flujo de apertura de detalles se controle desde el componente padre.

---

Este botón completa la funcionalidad de la tabla de solicitudes, facilitando que cada solicitud pueda abrirse en detalle de manera rápida, clara y estandarizada dentro de la interfaz de **Detentions y Demurrages**.

---

# Componente: User Info / Información de usuario

**1. Propósito y funcionalidad**

Este componente sirve para mostrar de manera rápida y clara quién creó, modificó o eliminó un registro dentro del sistema, incluyendo:

- Creado por 

- Última actualización 

- Eliminado por 

Se utiliza generalmente junto a elementos de tabla o detalles de solicitudes para ofrecer contexto completo del historial de un registro.

---

**2. Elementos visuales y comportamiento**

1. **Slot de contenido principal**

   - Permite colocar cualquier contenido dentro del componente (por ejemplo, un número de referencia o identificador de solicitud).

   - Mantiene el componente flexible y reutilizable, integrándose dentro de tablas o listas.

2. **Botón flotante**

   - Ícono de interrogación que indica “detalles de usuario”.

   - Al pasar el cursor muestra un tooltip con la leyenda "User details".

   - Al hacer clic, abre un modal con información completa del usuario.

3. **Modal de detalles de usuario**

   - Se despliega sobre la interfaz con un ancho máximo de 400px para mostrar información compacta pero clara.

   - Contiene un listado de usuarios:

      - Creado por: nombre, correo y fecha de creación.

      - Actualizado por: nombre, correo y fecha de última modificación.
 
      - Eliminado por: nombre, correo y fecha de eliminación (solo si aplica).

   - Cada usuario tiene un avatar con ícono representativo (verde para creado, ámbar para actualizado, rojo para eliminado).

   - Tooltip en los íconos para reforzar visualmente la acción de cada usuario.

4. **Cierre del modal**

   - Botón de cerrar sencillo que permite al usuario volver al contexto principal.

---

**3. Datos y lógica**

- Se obtiene la información de los usuarios mediante un store centralizado, garantizando que todos los datos de usuario estén sincronizados en la aplicación.

- El componente recibe un objeto item, que contiene los campos creado por, actualizado por y eliminado por.

- Las fechas asociadas (creado por, actualizado por y eliminado por) se formatean para mostrar un historial legible y completo.

- Permite que cualquier campo pueda personalizarse mediante createdByKey si la clave de creación tiene otro nombre en el objeto.

**4. Beneficios**

- **Transparencia total:** el usuario siempre puede ver quién intervino en cada registro y cuándo.

- **Reutilizable y modular:** funciona con cualquier objeto que tenga campos de usuario, por lo que puede integrarse en tablas, formularios o vistas de detalle.

- **Interfaz clara y moderna:** botones flotantes, tooltips y modal compacto aseguran que la información no interrumpa la navegación principal.

- **Integración con el sistema de usuarios:** centraliza la información y evita duplicación de datos o inconsistencias.

---

**5. Casos de uso**

- Mostrar historial de creación/modificación en solicitudes de pago de Demurrages y Detentions.

- Integrar en tablas de registros, agregando un botón discreto para ver detalles sin recargar la página.

- Monitorear acciones de los usuarios para auditoría y control interno.


Este componente completa el módulo de gestión de solicitudes aportando un historial de usuarios completo, visualmente intuitivo y accesible, complementando la tabla de solicitudes y los botones de acción como “View”.

---

# Componente: Solicitudes de Pago de Demurrages

**1. Propósito y funcionalidad general**

Este componente es la interfaz principal para gestionar las solicitudes de pago de demurrages en el sistema marítimo. Permite a los usuarios:

- Filtrar solicitudes según múltiples criterios.

- Visualizar todas las solicitudes en formato de tabla.

- Navegar por páginas con paginación.

- Ver detalles completos de cada solicitud mediante botones de acción.

- Consultar la información de usuarios asociados (creador, actualizador, eliminador).

- El objetivo es proporcionar control total sobre la búsqueda, visualización y seguimiento de las solicitudes.

---

**2. Filtros**

La sección superior del componente contiene filtros interactivos para acotar los resultados:

1. **Fechas**

   - Date from y Date to: filtra las solicitudes según rango de fechas.

2. **Número de solicitud**

   - Campo de texto que permite buscar solicitudes por su ID.

3. **Freight Line**

   - Buscador global (AGlobalSearch) que devuelve líneas de transporte marítimo.

   - Permite autocompletar y seleccionar la línea de interés.

4. **Master BL**

   - Campo de texto para filtrar por Master Bill of Lading.

5. **Estado**

   - Selector (v-autocompletar) con estados posibles (eliminar_estado) para identificar solicitudes activas, canceladas, etc.

6. **Botones de acción**

   - **Clear:** limpia todos los filtros y recarga los datos.

   - **Search:** aplica los filtros y realiza la consulta.

---

**3. Tabla de solicitudes**

La tabla principal presenta todas las solicitudes paginadas, con columnas:

1. **Actions**

   - Botón ViewButton que permite abrir la solicitud completa en otra vista (viewReqDemurrage).

2. **Req #**

   - Número de la solicitud.

3. **Freight line**

   - Nombre de la línea marítima asociada a la solicitud.

4. **Service(s) #**

   - Lista de referencias de servicios contenidas en la solicitud, con v-chip para cada contenedor.

5. **MBL**

   - Lista de Master Bills of Lading asociadas a cada contenedor, mostrando tanto nombre del BL como nombre del consignee.

6. **Containers**

   - Número y tipo de cada contenedor involucrado.

7. **Status**

   - Indica si la solicitud está Pending, Paid o Cancelled.

   - Usa la función getInvoicePaidStatus para determinar el estado según si la factura existe, está pagada o si la solicitud fue eliminada.

8. **Total**

   - Muestra el total monetario de la solicitud sumando el amount y amount_iva de cada contenedor.

   - Formateado mediante formatToCurrency.

9. **Currency**

   - Muestra la moneda asociada a la solicitud.

10. **Created at**

   - Fecha de creación de la solicitud.

   - Incluye componente UserInfoBadge para mostrar quién creó la solicitud, integrando el historial de usuarios.

---

**4. Paginación**

- La tabla incluye paginación superior e inferior, usando v-paginación.

- Permite navegar entre páginas de resultados.

- La función Paginación al hacer clic actualiza la página y recarga los datos.

---

**5. Funciones y lógica**

1. **rowClass**

   - Cambia el color de fondo según el estado:

      - Eliminadas → rojo.

      - Proforma → gris claro.

      - Activas → normal.

2. **getData**

   - Función principal que realiza la consulta al backend ($api.maritimeDemurrages.getPaged) usando filtros y paginación.

   - Muestra snackbar si no hay datos.

3. **getInvoicePaidStatus**

   - Determina el estado de la solicitud: Cancelled, Pending o Paid @ fecha.

4. **clearFilters**

   - Restablece todos los filtros a valores vacíos y recarga los datos.

5. **searchLines**

   - Función que consulta las freight lines desde el API para el autocompletado.

6. **viewReqDemurrage**

   - Navega a la vista de detalle de la solicitud (req-pay-view-<id>).

7. **getCurrenciesTotal**

   - Calcula y devuelve los totales por moneda si la factura está disponible.

---

**6. Integración con otros componentes**

- **AGlobalSearch**

   - Para seleccionar líneas marítimas con búsqueda avanzada.

- **ViewButton**

   - Para abrir los detalles de la solicitud.

- **UserInfoBadge**

   - Muestra quién creó, actualizó o eliminó la solicitud.

- **v-chip**

   - Visualiza listas de contenedores, referencias y BLs.

---

7. Experiencia de usuario

- Filtros y búsqueda rápida: permite filtrar por cualquier criterio relevante, con soporte para Enter en campos de texto.

- Tabla compacta y clara: cada dato clave se muestra con chips, íconos y colores que facilitan la lectura.

- Paginación amigable: evita que la tabla se vuelva demasiado larga.

- Visualización de totales y monedas: ayuda al control financiero de la solicitud.

- Historial de usuario visible: mediante UserInfoBadge se mantiene transparencia y trazabilidad.

---

**8. Beneficios del componente**

- Control completo sobre las solicitudes de Demurrages.

- Integración con datos de usuarios, líneas marítimas y contenedores.

- Interfaz moderna, compacta y profesional.

- Reutilizable en cualquier sección de gestión de facturas o solicitudes.

- Facilita auditorías, seguimiento y gestión de pagos.

---

Búsqueda global (AGlobalSearch) es un componente de búsqueda avanzada que permite al usuario localizar rápidamente elementos como líneas de carga, clientes o proveedores dentro del sistema. 

Su objetivo principal es facilitar la selección precisa de un registro desde grandes volúmenes de datos, integrándose con cualquier API de búsqueda.

---

**2. Funcionalidades clave**

1. **Búsqueda dinámica**

   - Permite que los resultados aparezcan mientras el usuario escribe.

   - Incluye un retraso (debounce) para evitar saturar la API con demasiadas solicitudes.

2. **Selección de resultados**

   - El usuario puede elegir un elemento de la lista de resultados.

   - La selección puede devolver solo el identificador del elemento o el objeto completo, según la configuración.

3. **Precarga de elementos**

   - Se puede establecer un elemento por su ID antes de mostrar el componente.

   - Si se proporciona un ID, el componente busca automáticamente el elemento correspondiente.

4. **Gestión de elementos eliminados**

   - Los registros que fueron eliminados se muestran como deshabilitados y se indica visualmente que están eliminados.

   - Si se intenta seleccionar un elemento eliminado, se muestra un mensaje de advertencia.

5. **Limpieza del campo**

   - El componente permite borrar la selección actual rápidamente mediante un botón dedicado.

   - Esta acción también notifica al componente padre que el valor ha sido limpiado.

6. **Validación y mensajes de error**

   - Integra validaciones, permitiendo mostrar mensajes de error si el campo es obligatorio o no cumple ciertas condiciones.

   - También puede mostrar mensajes informativos, por ejemplo si no se encontraron resultados en la búsqueda.

7. **Configuración flexible**

   - Se puede personalizar la etiqueta del campo, los iconos, el color de fondo, la capacidad de edición y si se deben mostrar detalles adicionales.

   - Permite usar funciones o propiedades de los elementos para determinar cómo se muestran los títulos en la lista de resultados.

---

**3. Comportamiento en tiempo de ejecución**

- Cuando el usuario empieza a escribir, si el texto supera cierto número de caracteres, se activa la búsqueda en el backend.

- Los resultados se muestran en un desplegable interactivo.

- Si solo hay un resultado válido, se selecciona automáticamente.

- Cuando el usuario selecciona un elemento, se comunica con el componente padre para actualizar el modelo de datos.

- El usuario puede limpiar la selección y reiniciar la búsqueda en cualquier momento.

---

**4. Beneficios**

- **Reutilizable:** Puede usarse para cualquier tipo de búsqueda en el sistema, desde líneas de carga hasta clientes o proveedores.

- **Eficiente:** La búsqueda con debounce evita sobrecargar el backend y mejora el rendimiento.

- **Amigable con el usuario:** Facilita la selección rápida, muestra advertencias claras y permite limpiar o corregir la selección de forma sencilla.

- **Flexible:** Compatible con múltiples configuraciones visuales y tipos de datos.

- **Integrable:** Se conecta fácilmente con tablas, filtros y formularios del sistema, como los módulos de Demurrages y Detentions.

Búsqueda global (AGlobalSearch) es un componente central para la búsqueda interactiva y controlada de datos, pensado para optimizar la experiencia del usuario en formularios complejos y garantizar precisión en la selección de registros.

---

# Solicitud de pago de demurrages a línea de carga

1. **Sección de búsqueda de BLs o contenedores**

   - Permite seleccionar si se busca por Master BL o número de contenedor.

   - Campo de texto multilinea para ingresar varios números de BL o contenedor.

   - Botón para agregar los números a la búsqueda y un botón de “Start Search”.

   - Muestra la cantidad de Master BLs agregados para buscar.

2. **Sección de resultados: Service containers found**

   - Tabla con los contenedores de los servicios encontrados.

   - Columnas principales:

      - MBL

      - Container

      - Freight line demurrages (resaltado en naranja)

      - Vessel

      - Service #

      - Customer

      - ETD

      - ATA

   - Botón “Select All” para seleccionar todos los contenedores disponibles.

--- 

# Demurrage Reports – Estatus

Esta sección del sistema permite generar reportes de demurrage (tiempos de demora en contenedores o embarques) de acuerdo con distintos filtros, para posteriormente exportarlos a un archivo Excel. 
Su objetivo es facilitar el seguimiento, análisis y control de los estatus de demurrage asociados a clientes y grupos de clientes.

---

**Descripción general**

El módulo Demurrage Estatus Report forma parte del submenú Demurrage Reports, y permite obtener información detallada sobre los estatus de las operaciones que implican demurrage.
A través de una serie de campos y filtros, el usuario puede seleccionar los criterios de búsqueda y descargar el resultado en formato Excel.

---

**Search customers**

Permite buscar y seleccionar un cliente específico dentro del sistema.

- Se utiliza para filtrar los resultados únicamente a los movimientos o reportes relacionados con ese cliente.

- El campo es desplegable y cuenta con función de búsqueda interna.

---

**Search Customer group**

Permite filtrar por grupo de clientes previamente definido en el sistema.

- Es útil cuando varios clientes pertenecen a un mismo grupo corporativo o comparten operaciones logísticas.

- También posee búsqueda asistida para localizar rápidamente el grupo deseado.

---

**Estatus**

Campo obligatorio que define el estado actual del demurrage que se desea consultar.

- Ejemplos de estatus comunes pueden incluir: Pendiente, En proceso, Liquidado, Cerrado, etc.

- Este filtro es esencial para limitar los resultados al tipo de operación o seguimiento deseado.

---

**Rango de fechas**

Incluye dos campos de selección:

- Start date (Fecha de inicio): fecha a partir de la cual se desea consultar la información.

- End date (Fecha final): fecha límite del periodo de búsqueda.

Estos filtros permiten obtener reportes dentro de un intervalo de tiempo específico, facilitando el análisis histórico o mensual.

---

**Exportar a Excel**

Botón que genera y descarga un archivo Excel con los datos filtrados según los criterios seleccionados.

- El reporte incluirá toda la información de demurrage correspondiente al cliente, grupo y estatus elegidos dentro del rango de fechas indicado.

- Permite compartir, analizar o presentar los resultados de forma externa.

---

**Ejemplo de uso**

1. Seleccionar un cliente o grupo de clientes.

2. Elegir el estatus de los movimientos de demurrage a consultar.

3. Definir el rango de fechas que se desea analizar.

4. Presionar “Exportar a Excel” para generar el reporte.

El sistema procesará la información y descargará un archivo Excel con los resultados detallados.

---

**Objetivo del módulo**

- Este módulo busca ofrecer una herramienta práctica para:

- Controlar los tiempos y costos de demurrage por cliente o grupo.

- Identificar demoras recurrentes y optimizar procesos logísticos.

- Facilitar la gestión administrativa mediante reportes exportables.
