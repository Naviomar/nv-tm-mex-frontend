---
title: Air Export 
summary: Documentación wiki del componente de lista y filtros para referencias de Air Export. Incluye explicación de la UI, flujo de datos, funciones clave, contrato API, validaciones, optimización, seguridad y pruebas.
order: 2
status: draft
version: 1.0.0
updatedAt: 2025-10-03
module: air-export
---

# Air Export 

> Documento técnico y funcional para el componente de **lista de referencias de Air Export**.  
> Dirigido a desarrolladores, QA y usuarios avanzados que necesiten comprender, mantener o extender el módulo.

---

## Tabla de contenidos

1. [Propósito y alcance](#propósito-y-alcance)  
2. [Resumen de la UI](#resumen-de-la-ui)  
3. [Estructura del archivo / Flujo de ejecución](#estructura-del-archivo--flujo-de-ejecución)  
4. [Campos de filtro](#campos-de-filtro)  
5. [Interacciones y atajos UX](#interacciones-y-atajos-ux)  
6. [Tabla de resultados — columnas](#tabla-de-resultados--columnas)  
7. [Funciones y lógica del script](#funciones-y-lógica-del-script)  
8. [Contrato API esperado](#contrato-api-esperado)  
9. [Validaciones y manejo de errores](#validaciones-y-manejo-de-errores)  
10. [Casos límite e integridad de datos](#casos-límite-e-integridad-de-datos)  
11. [Mejoras y refactors sugeridos](#mejoras-y-refactors-sugeridos)  
12. [Rendimiento y optimización](#rendimiento-y-optimización)  
13. [Seguridad y buenas prácticas](#seguridad-y-buenas-prácticas)  
14. [Accesibilidad (a11y) e internacionalización (i18n)](#accesibilidad-a11y-e-internacionalización-i18n)  
15. [Pruebas (unitarias, integración, E2E)](#pruebas-unitarias-integración-e2e)  
16. [Debugging y troubleshooting](#debugging-y-troubleshooting)  
17. [Apéndice: datos y snippets](#apéndice-datos-y-snippets)  
18. [Apéndice: Air Import – Formulario de servicio](#apéndice-air-import--formulario-de-servicio)  
19. [Apéndice: Air Import – Notificaciones](#apéndice-air-import--notificaciones)  

---

## 1. Propósito y alcance

El componente provee una **interfaz de búsqueda, filtrado, listado paginado y exportación** de referencias de **Air Export**.  

Permite a usuarios comerciales y operativos localizar referencias por año, número, AWB, cliente, agentes y estatus; revisar los resultados en una tabla con acciones rápidas (ver/editar/detalles) y exportarlos a Excel.

Usuarios objetivo:

- **Operaciones** (sourcing, despacho)  
- **Ejecutivos comerciales**  
- **Finanzas** (revisión de reportes)  
- **Desarrolladores / QA** (integración y mantenimiento técnico)  

---

## 2. Resumen de la UI

La interfaz se divide en dos bloques principales:

1. **Panel de filtros (superior)**  
   - Disposición en grid de 12 columnas.  
   - Campos: `v-autocomplete`, `v-text-field`, y componentes de búsqueda (`ACustomerSearch`, `AFreightForwarderSearch`, `AAirlineSearch`).  
   - Soporte para múltiples referencias con chips dinámicos.  
   - Búsqueda con tecla Enter o botón **Search**.  

2. **Listado (tabla dentro de card)**  
   - Columnas: acciones, referencia, AWB (master/house), freight forwarders, cliente, origen/destino, aerolínea, vuelo y salida.  
   - Paginación arriba y abajo, con resumen de rango mostrado.  

**Acciones disponibles:**  
- Limpiar filtros  
- Buscar  
- Exportar a XLSX  
- Ver referencia (✏️)  
- Ir a detalles (👁️)  

---

## 3. Estructura del archivo / Flujo de ejecución

### Estructura resumida

La vista está organizada con un layout que contiene los filtros y la tabla principal de resultados. 
La lógica del componente se basa en programación reactiva, con composables y funciones específicas para manejar datos y eventos. 
Se utilizan imports de utilidades como la lista de años, el estado de eliminados y un helper para convertir arrays a cadenas separadas por comas. 
También se apoyan stores globales como el acceso a la aplicación, el enrutador, el store de carga y el de notificaciones tipo snackbar.

### Flujo de ejecución
1. Carga catálogos iniciales (clientes, aerolíneas, FFs).  
2. Consulta referencias según filtros y página.  
3. Render de resultados en tabla.  
4. Usuario interactúa con filtros / exporta / navega a detalle.  

---

## 4. Campos de filtro

Cada campo en el formulario corresponde a un parámetro de búsqueda (query param) que se envía al endpoint.

- Year: año en formato numérico (YYYY).

- Referencia: campo libre que admite varias referencias separadas por coma.

- Referencias: colección mostrada como chips, serializada como texto separado por comas.

- Master AWB / House AWB: campos de texto que deben cumplir con el formato IATA.

- Consignee ID: identificador numérico de un cliente, seleccionado desde un buscador de consignatarios.

- Origin y Destination Freight Forwarders: identificadores de los agentes de carga origen y destino.

- Airline ID: identificador de la aerolínea, tomado de un buscador de aerolíneas.

- Flight Number: se normaliza convirtiéndolo a mayúsculas y eliminando espacios.

- Deleted Status: permite filtrar por registros activos, eliminados o ambos. 

Convenciones recomendadas:

- Los campos de texto deben escribirse como nombre.

- Los identificadores como identificador.

- Las colecciones como identificadores.

---

## 5. Interacciones y atajos UX

El sistema contempla varios atajos para mejorar la experiencia de usuario:

- Presionar la tecla Enter de forma global ejecuta la búsqueda completa.

- Presionar Enter dentro de campos individuales dispara acciones específicas, como agregar referencias.

- Se pueden ingresar varias referencias separadas por coma, que se transforman en chips dinámicos en pantalla.

- Los chips son eliminables individualmente mediante un botón asociado.

- Existe una opción de exportar, que descarga un archivo Excel con el nombre air-export-report seguido de un timestamp.

Recomendación UX: incluir tooltips que expliquen el formato esperado de referencias y AWBs para reducir errores del usuario.  

---

## 6. Tabla de resultados — columnas

La tabla presenta varias columnas con información clave:

- Acciones: incluyen ver detalle de una referencia o confirmar su eliminación (se sugiere renombrar la acción de ver detalle para mayor claridad).

- Número de referencia: mostrado junto con un badge de usuario.

- Master y House AWB: representados como chips.

- Agentes de carga (origen y destino): nombres completos.

- Cliente: nombre del consignatario.

- Origen y destino: mostrados como códigos IATA o nombres.

- Aerolínea: nombre de la aerolínea.

- Vuelo y salida: calculados con funciones auxiliares que procesan la primera ruta registrada.

Estilos condicionales:

- Si un registro proviene de un sistema externo, se resalta en color rosa.

- Si está marcado como eliminado, se muestra en rojo.

---

## Funciones principales del manejo de cargos

Además de la lógica de búsqueda y tabla, el sistema cuenta con un módulo para el manejo de cargos. Sus funciones más importantes son:

- Abrir o cerrar formulario de cargo: el formulario principal se abre o se limpia cuando se cierra.

- Editar cargo existente: se carga la información completa de un cargo en el formulario para modificarlo.

- Guardar o actualizar cargos: tanto cargos generales como específicos de tipo Buy o Sell.

- Eliminar cargo: elimina un registro tras la confirmación del usuario.

- Abrir modales de desglose: permiten visualizar y editar desgloses Buy o Sell de un cargo.

- Inicializar formularios de cargos Buy y Sell: prepara la vista para ingresar nuevos cargos de cada tipo.

- Editar cargos específicos dentro de un AWB: ajusta la información de cargos particulares en la guía aérea.

- Asignar color visual según propietario: cada cargo Buy se marca con un color distinto dependiendo del dueño.

- Mostrar nombre o código de moneda y formatear valores numéricos como montos de divisas.

- Formatear fechas para que se muestren de manera clara.

- Indicar vínculo con factura: marca visualmente si un cargo ya está asociado a una factura.

---

## Ejemplo de interacción

- Un usuario hace clic en “Nuevo Cargo”, el formulario se abre y queda listo para captura.

- Al editar un cargo, la información completa se carga en el formulario para modificarla.

- Al guardar, los datos se envían a la base vía API.

- Al eliminar, aparece un mensaje de confirmación antes de borrar el cargo.

- Si se abre el modal de desglose de cargos Buy, se muestran todos los registros asociados a la referencia.

- Si un cargo pertenece a un cliente específico, el cuadro que lo representa puede aparecer en azul o verde dependiendo del propietario. 

---

8. Contrato API esperado

El sistema depende de un conjunto de endpoints que definen la comunicación con el backend. Estos son:

1. El endpoint para obtener los catálogos iniciales de filtros.

2. El endpoint que devuelve las referencias filtradas, con soporte de paginación.

3. El endpoint que genera un reporte en formato Excel basado en los filtros aplicados.

En la versión extendida del wiki se incluyen ejemplos de respuestas en formato JSON.

## 9. Validaciones y manejo de errores
Se aplican varias reglas de validación antes de procesar los datos:

- El año debe ser siempre numérico y estar en el formato correcto.

- Los números AWB deben cumplir el estándar IATA, es decir, once dígitos.

- Los identificadores de clientes, aerolíneas o freight forwarders deben ser valores numéricos válidos.

- Si una búsqueda no produce resultados, se muestra un mensaje emergente (snackbar) al usuario.

- En caso de errores de red, el sistema debe atraparlos y ofrecer la opción de reintentar o mostrar una alerta clara.

---

## 10. Casos límite e integridad de datos
Existen situaciones especiales que se deben manejar para preservar la coherencia de la información:

- Cuando los filtros están vacíos, la búsqueda debe devolver todos los registros disponibles.

- Si el usuario ingresa referencias duplicadas, estas se deben eliminar desde el frontend para no repetir datos.

- Cuando falte información clave, como aerolínea o consignatario, en la tabla se debe mostrar un guion largo como valor por defecto.

- Si la paginación apunta a una página inexistente, el sistema debe reiniciar el listado en la página número uno.

---

## 11. Mejoras y refactors sugeridos
Se proponen algunos ajustes para optimizar la mantenibilidad del código:

- Renombrar la función de confirmación de eliminación, dándole un nombre más claro que indique que lleva a la vista de detalle.

- Centralizar los helpers en un archivo o módulo global para evitar duplicidad de lógica.

- Añadir pruebas unitarias para validar el correcto funcionamiento de los filtros.

---

## 12. Rendimiento y optimización
Para garantizar un mejor desempeño se recomiendan las siguientes acciones:

- Implementar cache de catálogos, de modo que no sea necesario solicitarlos cada vez.

- Utilizar un mecanismo de espera (debounce) en los campos de búsqueda por texto para evitar llamadas innecesarias.

- Emplear la opción de mantener la tabla activa en memoria (keep-alive) cuando se navega de forma recurrente entre vistas.

---

## 13. Seguridad y buenas prácticas
La seguridad es fundamental y se deben aplicar medidas básicas:

- Limpiar y sanitizar toda entrada de datos antes de enviarla al backend.

- Restringir la posibilidad de exportar reportes en Excel únicamente a usuarios con los permisos correspondientes.

- Validar siempre los identificadores en el backend para evitar intentos de inyección o manipulación de datos.

---

## 14. Accesibilidad e internacionalización
El sistema debe ser accesible e internacionalizable:

- Incluir etiquetas y atributos de accesibilidad (aria-*) en los campos de entrada.

- Permitir la interacción con teclado, por ejemplo, usar tabulación y enter para añadir chips.

- Asegurar que todos los textos de la interfaz sean traducibles mediante un sistema de internacionalización.

---

## 15. Pruebas (unitarias, integración, E2E)
El plan de pruebas se divide en tres niveles:

- Unitarias: validan funciones auxiliares como la que procesa referencias o la que detecta registros externos.

- Integración: prueban el flujo completo de búsqueda y la renderización de la tabla.

- End-to-End (E2E): verifican escenarios completos, desde la búsqueda hasta la exportación de resultados.

---

## 16. Debugging y troubleshooting
Para la resolución de problemas se recomiendan las siguientes prácticas:

- Revisar el contenido del payload que se envía al endpoint de referencias.

- Confirmar que los parámetros de búsqueda estén correctamente serializados.

- En caso de errores con la exportación Excel, utilizar las herramientas de desarrollo (devtools) para inspeccionar la respuesta de red. 

---

## 17. Apéndice: datos y snippets
Como complemento, se incluyen recursos de apoyo:

- Ejemplos de payload de filtros para comprender cómo se construye la petición.

- Mock de datos en formato JSON para simular respuestas de referencias.

- Un helper que facilita la descarga de archivos Excel a partir de blobs de datos binarios. 

---

## 18. Apéndice: Air Import – Formulario de servicio

Este formulario permite **crear, consultar y actualizar una referencia de importación aérea**. Contiene varias secciones organizadas para capturar información clave sobre la guía aérea, consignatarios, rutas de vuelo, carga, gastos y procesos de liberación.

### Encabezado del servicio
- Número de servicio  
- Ejecutivo asignado y consignatario  

### Incidencias
- Damaged, Pama, Abandon, Stolen  

### Información de la guía aérea
- Master AWB / House AWB  
- Origen / destino  
- Aerolínea  

### Consignatario y ejecutivo
- Consignee (cliente)  
- Ejecutivo asignado  
- Ejecutivo actual del cliente  

### Embarcador y Freight Forwarder
- Shipper  
- Origin Freight Forwarder  
- Credit days  

### Información de rastreo
- Órdenes de compra  
- Alertas de sincronización  

### Rutas de vuelo
- País, aeropuerto, fechas de salida/llegada, vuelo  
- Días totales de tránsito  

### Información de la carga
- Commodity  
- Rate  

### Gastos y cargos
- Charges  
- Notas de FF  
- Facturas de clientes y proveedores  
- Reembolsos  
- Profit Overview  

### Información de liberación
- Release date  
- Release airline  
- Agente aduanal, handler, warehouse  
- Notas y archivos adjuntos  
- Revalidaciones enviadas y nueva revalidación  

### Notas del servicio
- Comentarios generales  

### Acciones finales
- Guardar cambios  
- Enviar revalidación  
- Regresar a lista de importaciones aéreas  

---

## Apéndice: Air Import – Notificaciones

Este módulo permite **consultar el historial de notificaciones enviadas** y **enviar nuevas notificaciones** relacionadas con la referencia de importación aérea.

### Historial de notificaciones
- Tabla de notificaciones previas:  
  - **Sent date**: Fecha en que se envió la notificación.  
  - **Sent by**: Usuario que envió la notificación.  
  - **Email(s) copied**: Correos a los que se envió.  
- Mensaje **“No data”** si aún no se han enviado notificaciones.

### Restricciones para enviar notificaciones
- Si no se ha definido un **agente aduanal** en la información de liberación, **no se puede enviar notificaciones**.  
- Se muestra un aviso de advertencia y un botón **“Refresh”** para actualizar la información una vez que se complete el agente.

### Enviar nueva notificación
Formulario disponible cuando la notificación sea cierta:

- **Encabezado:**  
  - Título: **Send notification**  
  - Subtítulo: **Review the form to proceed**  

- **Campos y acciones:**  
  - **Emails**: Ingresar uno o varios correos separados por comas.  
  - **Add custom agent email(s)**: Botón para agregar automáticamente los correos del agente aduanal seleccionado.  
  - **Notes**: Espacio para comentarios o instrucciones adicionales.  
  - **Attachments**: Adjuntar archivos relacionados con la referencia.  

- **Botón de acción:**  
  - **Send notification**: Envía la notificación con la información completa del embarque y la reserva.

### Confirmación y actualizaciones
- Mensaje de éxito al enviar la notificación.  
- Limpieza automática del formulario (`emails`, `notes`, `attachments`).  
- Actualización inmediata de la tabla de historial de notificaciones.

### Beneficios
- Permite **trazabilidad** de todas las notificaciones enviadas.  
- Facilita la gestión de notificaciones con información completa del embarque y documentos adjuntos.  
- Mejora la **eficiencia operativa** evitando envíos manuales de correos.

### Componente: Buy / Sell Charges

## Resumen

Este componente administra los cargos asociados a una referencia aérea (airReference) en un sistema de import/export. Permite visualizar, crear, editar y eliminar cargos de compra y venta, desglosados por tipo (Prepaid / Collect) y moneda, tanto dentro como fuera del AWB.

Incluye:

- Totales por tipo de cargo.

- Totales por moneda (Buy/Sell).

- Formularios dinámicos para agregar/editar cargos.

- Desglose detallado de Buy y Sell rates.

- Integración con notificaciones, confirmaciones y API de backend.

- Validaciones de formulario.

- Visualización de estado de edición según permisos (canEdit).

## Flujo de trabajo

- Usuario abre la vista de referencia.

- Se muestran los cargos existentes y los totales.

- Puede:
    - Agregar cargo nuevo (New Charge).

    - Editar cargo existente. 

    - Eliminar cargo (con confirmación).

- Puede abrir Buy/Sell Breakdown para detalles y desglose por moneda.

- Todos los cambios se sincronizan con backend vía API.

## Estructura de Datos

El sistema maneja un objeto principal llamado FormCharge, que representa el formulario de cargos dentro de una referencia aérea. Este objeto es reactivo y contiene toda la información necesaria para crear, editar o visualizar un cargo. Dentro del mismo, se incluyen atributos como el identificador del cargo, si tiene compra o venta activa, tipo de factura, monto, moneda, PP/CC (Prepaid/Collect), si incluye IVA, y el propietario del cargo.

Existen formularios específicos para desgloses de compra y venta llamados FormBuyCharge y FormSellCharge, que contienen una estructura similar al formulario principal, pero enfocada exclusivamente en la sección Buy o Sell respectivamente.

Ejemplo:

Imagina que estás creando un cargo para una referencia aérea de envío de mercancía. El formulario principal (FormCharge) contendrá:

- ID del cargo: 101

- Compra activa (has_buy): sí

- Venta activa (has_sell): sí

- Tipo de factura: Prepaid (PP)

- Fuera del AWB: sí

- Monto de compra: 100 USD

- Monto de venta: 150 USD

- Moneda: USD

- Propietario de compra: Cliente A

Este objeto refleja todo lo que necesitas para guardar y mostrar un cargo completo dentro de la referencia.

## Variables Reactivas Principales

El sistema define un conjunto de variables que controlan la interacción con los formularios y la visualización de información relacionada con los cargos de una referencia.

- Lista de cargos: representa todos los cargos asociados a una referencia determinada.

- Indicadores de visibilidad de modales: permiten mostrar u ocultar los desgloses de compra (Buy) y venta (Sell).

- Tipo de cargo (Buy o Sell): almacena el valor seleccionado por el usuario, por ejemplo, si el cargo es Prepaid (PP) o Collect (CC).

- Catálogo de cargos: contiene todas las opciones de cargos disponibles que se pueden seleccionar.

- Ubicación dentro o fuera del AWB: define si el cargo corresponde a un concepto dentro o fuera de la guía aérea.

- Opciones PP/CC: ofrecen al usuario la posibilidad de indicar si el cargo es Prepaid o Collect.

Estas variables permiten manejar dinámicamente el estado de los formularios y las tablas, garantizando que la información se actualice en tiempo real conforme a las interacciones del usuario.

### Ejemplo de uso práctico:

- La lista de cargos puede mostrar, por ejemplo, Cargo 101, Cargo 102 y Cargo 103.

- Si el usuario abre el modal de desglose de compras, la variable correspondiente cambia a verdadero.

- Al seleccionar “PP” en una compra, la variable de tipo de cargo almacena este valor.

- El campo de ubicación permite elegir entre “Dentro del AWB” o “Fuera del AWB”.

- Las opciones de tipo PP o CC se presentan para que el usuario seleccione cómo registrar el cargo.

## Propiedades Computadas

Además de las variables reactivas, el sistema calcula automáticamente propiedades que ayudan a validar y presentar los datos de manera coherente:

- Existencia de cargos: indica si hay cargos registrados fuera del AWB.

- Cargos fuera del AWB: filtra y muestra solo aquellos que no están ligados directamente a la guía aérea.

- Totales de cargos: suma los montos de compra y venta, y calcula las ganancias según se trate de PP o CC.

- Totales por moneda: agrupa los cargos por tipo de moneda, diferenciando compras y ventas.

- Totales específicos de compra: muestran la relación entre los cargos Buy y sus ventas asociadas.

- Listados de cargos Buy y Sell: muestran en tablas separadas los cargos correspondientes a cada categoría.

- Validación de formularios: verifica que los formularios (general, de compra o de venta) tengan todos los campos obligatorios antes de guardar.

- Etiquetas dinámicas de botones: modifican el texto de las acciones según se trate de guardar un cargo nuevo o de actualizar uno existente.

Estas propiedades automáticas aseguran consistencia, ayudan a mostrar totales sin cálculos manuales y previenen errores de validación.

## Funciones Principales

La gestión de cargos se realiza mediante funciones que controlan la apertura de formularios, edición, guardado y validaciones. 

Entre las más importantes se encuentran:

- Apertura o cierre del formulario principal: limpia los datos cuando se cierra para evitar inconsistencias.

- Edición de cargo existente: carga toda la información de un cargo en el formulario para modificarlo.

- Guardado o actualización: permite registrar nuevos cargos o actualizar existentes, tanto en modalidad general como en desgloses de compra o venta.

- Eliminación de cargo: borra un registro previa confirmación del usuario.

- Apertura o cierre de modales de desglose: muestran u ocultan los cargos Buy o Sell de manera detallada.

- Inicialización de formularios de desglose: prepara los campos para capturar un nuevo cargo en Buy o Sell.

- Edición de cargos dentro del AWB: permite ajustar registros específicos relacionados con la guía aérea.

- Asignación de colores por propietario: los cargos Buy se resaltan con colores distintos según el cliente al que pertenezcan.

- Gestión de monedas: muestra el nombre o código de la moneda y convierte montos numéricos al formato correspondiente.

- Formato de fechas: transforma valores de fecha en un formato legible.

- Vinculación con factura: indica visualmente si un cargo ya está asociado a una factura.

### Ejemplo de interacción:

- El usuario hace clic en “Nuevo Cargo” y el formulario principal se abre.

- Si selecciona “Editar” sobre el Cargo 101, el formulario se llena automáticamente con su información.

- Al hacer clic en “Guardar”, el sistema envía el cargo a la base de datos.

- Si el usuario decide eliminar el Cargo 102, aparece un mensaje de confirmación antes de proceder.

- En caso de abrir el modal de desglose de compras, el sistema muestra todos los cargos Buy asociados a la referencia.

- Si el propietario de un cargo es el Cliente A, el recuadro se pinta de azul; si corresponde al Cliente B, se muestra en verde.

## Layout del Componente

El componente principal se organiza visualmente en secciones con tarjetas y tablas que agrupan los cargos y su información.

- La tarjeta principal incluye el título “Buy / Sell Charges” y, en su diseño previsto, los totales de los cargos (aunque actualmente estos se encuentran ocultos).

- La sección de compra (Buy Rate) se presenta en una tarjeta azul, donde se agrupan todos los cargos de tipo compra.

- La sección de venta (Sell Rate) se muestra en una tarjeta verde, dedicada a los cargos de tipo venta.

- La tabla de cargos lista todos los cargos registrados tanto dentro como fuera del AWB, mostrando columnas con información clave: acciones disponibles (editar o eliminar), tipo de factura, modalidad del cargo (PP o CC), su ubicación dentro o fuera del AWB, montos de compra y venta, además de la fecha de creación.

Los formularios de cargo permiten capturar o editar datos, incluyendo la selección del cargo desde un catálogo, tipo de factura, ubicación en el AWB, así como los detalles de compra y venta: monto, moneda, modalidad (PP/CC) y aplicación de IVA.

Los modales de Buy y Sell Rate ocupan toda la pantalla, ofreciendo una vista completa de los cargos de cada tipo. 

En ellos, el usuario puede ver, agregar o editar registros. 

Los botones principales que acompañan a estos modales son: Cancelar, Guardar y Nuevo cargo.

### Ejemplo de visualización:

- Los elementos de la interfaz, como botones, tarjetas, tablas y modales, se construyen con componentes de la librería Vuetify.

- Los cargos se almacenan y consultan a través de la API, utilizando un servicio centralizado que conecta con el backend.

- Cuando se elimina un cargo, el sistema muestra un mensaje de confirmación que pregunta si el usuario está seguro de proceder.

- Durante la operación de guardado, se activa un indicador visual de carga (spinner) para informar al usuario que el proceso está en curso.

- Los cargos pueden incluir información adicional, como el usuario que los creó y la fecha en la que fueron registrados; por ejemplo, un cargo puede aparecer como creado por el usuario administrador en una fecha específica.

## Alertas y Validaciones

- Cuando un usuario no tiene permisos de edición, se muestra un mensaje de alerta.

- Para guardar un cargo se requiere que tenga al menos Buy o Sell activo.

- Campos obligatorios: charge_id, inv_type, fuera_dentro_awb.

- Si el cargo tiene Buy activo, también son obligatorios buy_amount y buy_ppcc.

- Si el cargo tiene Sell activo, se requieren sell_amount y sell_ppcc.

Estas validaciones aseguran que la información de los cargos sea consistente y completa.

### Ejemplo:

- Si un usuario intenta guardar un cargo sin monto de Buy ni Sell → se muestra alerta: “Debe tener al menos Buy o Sell activo”.

- Si intenta guardar un cargo sin charge_id o sin tipo de factura → se muestra alerta indicando que el campo es obligatorio.

- Si tiene Buy activo pero no indica monto o PP/CC → no permite guardar.


## Componente – Información de Referencias y Tracker

### Propósito general

Este componente sirve para mostrar información de referencias relacionadas a un servicio, incluyendo:

- El número principal de referencia de la operación.

- Referencias alternativas o relacionadas (origen de la referencia, trackers, referencias cliente).

- Indicadores visuales para alertar o resaltar cambios o relaciones entre referencias.

Es un componente de visualización compacta, útil para dashboards, tablas o detalles de servicio.

### Estructura visual

### 1. Contenedor principal

- Organiza los elementos de manera vertical (flex-col).

- Cada referencia o tracker se muestra en su propio recuadro, uno debajo de otro.

- Mantiene un espaciado pequeño entre cada elemento para legibilidad.

### 2. Número de referencia principal

- Siempre se muestra.

- Representa la referencia oficial o primaria del servicio.

- Ejemplo: REF-12345.

### 3. Referencia de origen

- Se muestra solo si la referencia principal es diferente de la referencia de origen.

- Visualmente se resalta con un fondo gris y un icono de flecha para indicar que proviene de otra referencia.

- Ejemplo:
    - Referencia principal: REF-12345

    - Referencia de origen: REF-54321 → se muestra debajo con el icono.

### 4. Tracker

- Se muestra si existe un tracker asociado al servicio.

- Fondo rosado para resaltar la información de tracking.

- Incluye un icono de flecha y el número de tracker.

- Ejemplo: Tracker #TR-98765.

- Permite a los usuarios identificar rápidamente que esta referencia tiene seguimiento activo.

### 5. Referencia de cliente

- Se muestra si existe una referencia asignada por el cliente.

- Fondo gris oscuro o claro según el modo (claro/oscuro).

- Incluye un icono de flecha y el número de referencia del cliente.

- Ejemplo: REF-CLIENT-001.

### Comportamiento y condiciones

1. Referencia de origen:

- Se activa solo cuando el número de referencia principal difiere del número de origen.

- Esto permite visualizar que la referencia principal fue generada a partir de otra.

2. Tracker:

- Se activa solo si existe información de tracker asociada al servicio.

- Proporciona un enlace visual para identificar que el servicio tiene seguimiento.

3. Referencia cliente:

- Se activa solo si existe una referencia del cliente vinculada al servicio.

- Útil para operaciones donde el cliente asigna su propio número de seguimiento o referencia interna.

### Indicadores visuales

- Colores de fondo: ayudan a distinguir cada tipo de información:

    - Gris → referencia de origen o cliente

    - Rosa → tracker

- Icono de flecha: indica relación o vinculación entre referencias.

- Texto pequeño: ayuda a mantener un diseño compacto y no recargado.

### Ejemplos de uso

1. Servicio sin tracker ni referencia cliente:

    - Se ve solo el número de referencia principal: REF-12345.

2. Servicio con referencia de origen distinta:

- Número principal: REF-12345

- Referencia de origen: REF-54321 (fondo gris, icono flecha)

3. Servicio con tracker:

- Número principal: REF-12345

- Tracker: Tracker #TR-98765 (fondo rosa, icono flecha)

4. Servicio con referencia cliente:

- Número principal: REF-12345

- Referencia cliente: REF-CLIENT-001 (fondo gris, icono flecha)

5. Combinación completa:

- Número principal: REF-12345

- Referencia de origen: REF-54321

- Tracker: Tracker #TR-98765

- Referencia cliente: REF-CLIENT-001

- Todos los elementos se apilan verticalmente con sus respectivos colores y iconos.

### Resumen

Este componente es un resumen visual compacto de todas las referencias asociadas a un servicio, con:

- Jerarquía clara: referencia principal arriba, otras referencias debajo.

- Colores e iconos para distinguir tipos de información.

- Condicionalidad para no mostrar información innecesaria si no existe.

- Ideal para dashboards, listas de servicios o vistas de detalle.

## Componente – Información de Usuario con Tooltip y Modal

### Propósito general

Este componente está diseñado para mostrar información detallada de los usuarios que crearon, actualizaron o eliminaron un registro en el sistema, de forma contextual y accesible.

- Permite un acceso rápido a los datos del usuario sin ocupar demasiado espacio en la interfaz.

- Utiliza tooltip flotante para acciones rápidas y un modal para información detallada.

- Es ideal para sistemas administrativos o dashboards donde es importante auditar cambios de registros.

### Estructura visual y funcional

1. Contenedor principal

    - Organiza los elementos en fila horizontal con espacio entre ellos.

    - Contiene dos secciones principales: el slot de contenido y el botón flotante de información del usuario.

2. Slot de contenido

    - Permite que cualquier contenido personalizado se inserte dentro del componente.

    - Es útil para mostrar, por ejemplo, un nombre de registro, número de referencia o cualquier información que quieras contextualizar con los datos de usuario.

    - Ejemplo: si se muestra un pedido, el slot podría contener “Pedido #12345”.

3. Botón flotante / Tooltip

    - Es un icono interactivo, generalmente un signo de interrogación sobre un usuario (mdi-account-question).

    - Al pasar el cursor o hacer clic, despliega un tooltip con información resumida, por ejemplo: “User details”.

    - Función principal: dar acceso rápido a información sobre el usuario que realizó la acción.

4. Modal de detalles

    - Se activa al hacer clic en el botón flotante.

    - Contiene un tarjeta (card) con título y cuerpo estructurado.

    - Título incluye icono de usuario (mdi-account-details) y texto “Users Information”.

    - Cuerpo (card-text) contiene una lista detallada de usuarios relacionados con el registro: creador, actualizador y eliminador.

## Tipos de usuarios mostrados

1. Created By (creado por)

- Se muestra si existe información sobre el usuario que creó el registro.

- Incluye:

    - Nombre del usuario

    - Correo electrónico

    - Fecha de creación

- Visualmente se acompaña de:

    - Icono dentro de un avatar verde (mdi-creation-outline)

    - Tooltip indicando “Created by”

- Ejemplo: “Juan Pérez – juan@empresa.com @ 2025-10-03”.

2. Updated By (actualizado por)

    - Se muestra si el registro ha sido modificado.

    - Incluye:

        - Nombre del usuario

        - Correo electrónico

        - Fecha de última actualización

    - Icono dentro de avatar color ámbar (mdi-update)

    - Tooltip: “Last updated by”

    - Ejemplo: “Ana López – ana@empresa.com @ 2025-10-05”.

3. Deleted By (eliminado por) 

    - Se muestra si el registro ha sido eliminado y existe información de usuario.

    - Incluye:

        - Nombre del usuario

        - Correo electrónico

        - Fecha de eliminación

    - Icono dentro de avatar rojo (mdi-delete-outline)

    - Tooltip: “Deleted by”

    - Ejemplo: “Carlos Martínez – carlos@empresa.com @ 2025-10-07”.

### Comportamiento 

- Tooltip: aparece al pasar el cursor sobre el icono flotante, proporciona información rápida sin abrir el modal.

- Modal / diálogo: se abre al hacer clic en el icono flotante, mostrando información detallada de todos los usuarios relevantes.

- Condicionalidad:

    - Cada sección de usuario solo se muestra si existe información asociada.

    - Por ejemplo, si un registro no fue eliminado, la sección “Deleted By” no se renderiza.

- Fechas: se muestran formateadas para ser legibles por el usuario.

### Estados y reactividad

El funcionamiento dinámico del componente se logra a través de variables reactivas que controlan tanto las búsquedas como la selección de elementos.

1. Texto de búsqueda (searchQuery)

    - Contiene lo que escribe el usuario en el campo de búsqueda.

    - Si el texto cumple ciertas condiciones mínimas (al menos tres caracteres y sin valor seleccionado), se activa automáticamente la búsqueda.

2. Lista de resultados (items)

    - Es una lista reactiva que se llena con las coincidencias obtenidas en cada búsqueda.

    - Se actualiza de manera inmediata cada vez que llega una respuesta desde la función de consulta.

3. Valor seleccionado (value)

    - Representa el elemento elegido actualmente por el usuario.

    - Puede guardarse como un identificador numérico o como un objeto completo, según la configuración establecida.

4. Control de limpieza (canClear)

    - Es un valor booleano que define si se debe mostrar el botón de limpiar búsqueda.

    - Cuando está activo, el usuario puede borrar fácilmente su selección para iniciar una nueva búsqueda.

### Diseño y estilo

- Botón flotante:

    - Posicionado de forma relativa o fija según necesidad.

    - Color distintivo, circular y con animación para resaltar interactividad.

- Tooltip:

    - Fondo oscuro, texto claro y pequeño, se muestra sobre el botón para indicar su función.

- Modal / Card:

    - Compacto, máximo ancho de 400px.

    - Título con icono y texto en negrita.

    - Cuerpo con lista de usuarios, separando nombre, correo y fecha.

    - Botón de cerrar visible y accesible.

### Ejemplos de uso

1. Registro creado pero nunca actualizado ni eliminado

    - Solo aparece “Creado por”.

    - Ejemplo: “Juan Pérez – juan@empresa.com @ 2025-10-03”.

2. Registro creado y actualizado

    - Aparecen “Creado por” y “Editado por”.

    - Ejemplo:

        - Creado: Juan Pérez – juan@empresa.com @ 2025-10-03

        - Actualizado: Ana López – ana@empresa.com @ 2025-10-05

3. Registro eliminado después de actualizaciones

    - Aparecen las tres secciones: Created By, Updated By, Deleted By.

    - Ejemplo:

        - Creado: Juan Pérez – juan@empresa.com @ 2025-10-03

        - Actualizado: Ana López – ana@empresa.com @ 2025-10-05

        - Eliminado: Carlos Martínez – carlos@empresa.com @ 2025-10-07

### Resumen

Este componente proporciona un acceso rápido y visual a la información de auditoría de usuarios de un registro:

- Resalta quién creó, actualizó y eliminó un registro.

- Usa tooltip para información resumida y modal para detalles completos.

- Es condicional y flexible, mostrando solo los datos disponibles.

- Permite una interfaz limpia, compacta y visualmente diferenciada por colores e iconos.

## Componente – Autocomplete de búsqueda con validación y resultados remotos

### Propósito general

Este componente sirve para permitir al usuario buscar y seleccionar elementos de un catálogo o lista de forma dinámica, con soporte para:

    - Búsqueda remota mediante API.

    - Autocompletado que muestra resultados a medida que se escribe.

    - Validación de campos y control de selección.

    - Gestión de elementos eliminados, lectura de datos y retorno de objeto completo o solo el ID.

    - Acciones adicionales como limpiar selección y mostrar mensajes.

Es ideal para formularios donde los datos dependen de un catálogo grande y no se quiere cargar toda la lista al inicio.

### Estructura visual

1. Input Autocomplete

    - Campo de búsqueda con sugerencias que aparecen al escribir.

    - Permite mostrar el título de cada ítem (configurable), así como deshabilitar elementos eliminados.

    - Incluye íconos opcionales dentro del input (prepend o append).

    - Texto de ayuda indica que se debe escribir al menos 3 caracteres para iniciar la búsqueda.

2. Lista de resultados

    - Muestra los elementos que coinciden con la búsqueda.

    - Cada ítem puede:

        - Mostrar si ha sido eliminado (por ejemplo, con etiqueta “(Eliminado)”).

        - Estar deshabilitado si fue eliminado.

    - Permite selección única, retornando el objeto completo o solo el ID según configuración.

3. Botón de limpieza 

    - Visible solo si hay un valor seleccionado y el campo no es de solo lectura.

    - Permite limpiar la selección y resetear la búsqueda.

### Estados y reactividad

1. consulta

    - Almacena el texto que el usuario escribe.

    - Su cambio dispara la búsqueda si se cumplen condiciones mínimas (3 caracteres y no hay valor seleccionado).

2. elementos

    - Lista reactiva con resultados de búsqueda.

    - Se actualiza cada vez que llega una respuesta de la función de búsqueda.

3. valor

    - Valor seleccionado actualmente.

    - Puede ser ID o objeto completo según configuración.

4. borrar/limpiar

    - Booleano que determina si se puede mostrar el botón de limpiar.

### Comportamiento

1. Búsqueda dinámica

    - La búsqueda se realiza solo después de 3 caracteres para reducir llamadas innecesarias.

    - Se usa un debounce para esperar un tiempo antes de disparar la búsqueda.

    - Si no hay resultados, se muestra un mensaje informativo.

2. Selección automática

    - Si la búsqueda retorna un solo resultado:

        - Si el ítem está eliminado, se muestra advertencia.

        - Si no, se selecciona automáticamente según configuración (ID u objeto completo).

3. Limpieza del campo

    - El botón “Limpiar” o la acción de limpiar borra el valor y los resultados.

4. Validación

    - Integra validación reactiva a través de un sistema de campos (useField).

    - Permite mostrar mensajes de error dinámicos si el valor es inválido.

5. Inicialización con ID

    - Si se proporciona un ID inicial, realiza búsqueda para llenar el valor correspondiente automáticamente.

6. Observadores / watchers

    - Vigila cambios en:

        - Texto de búsqueda

        - Valor externo del campo (modelValue)

        - ID inicial 

    - Ajusta la selección y resultados de forma reactiva.

### Mensajes y notificaciones

- Info: cuando no se encuentran resultados.

- Warning: cuando el ítem encontrado está eliminado.

- Error: cuando falla la búsqueda (por ejemplo, fallo de API).

Esto mejora la experiencia de usuario al informar de forma clara lo que ocurre en cada acción.

### Funcionalidades clave

- Retorno configurable: puede devolver solo el ID o el objeto completo.

- Deshabilitar ítems eliminados: evita seleccionar elementos que ya no son válidos.

- Integración con stores: puede usar un store de loading o un snackbar para mostrar mensajes.

- Debounce: evita llamadas excesivas mientras el usuario escribe rápido.

- Slot de item: permite personalizar cómo se muestra cada resultado de la búsqueda.

### Ejemplos de uso

1. Seleccionar un cliente por nombre

    - Escribe “María”, se muestran coincidencias de la base de datos.

    - Si hay un solo resultado no eliminado, se selecciona automáticamente.

2. Campo solo lectura

    - El usuario no puede cambiar la selección, solo visualizarla.

    - No se muestra el botón Clear.

3. Elemento eliminado

    - Aparece en la lista con la etiqueta “(Eliminado)”.

    - No se puede seleccionar y muestra advertencia si se intenta.

4. Inicializar con ID

    - Si se conoce el ID de un cliente, se hace la búsqueda automática para rellenar el campo con el valor correcto.

### Resumen

Este componente proporciona un autocomplete avanzado y seguro con soporte para:

- Búsqueda remota y dinámica

- Validación y mensajes de error

- Retorno flexible (ID u objeto completo)

- Gestión de elementos eliminados

- Limpieza y selección automática

- Integración con UI moderna (Vuetify)

Es muy útil en formularios administrativos donde se manejan catálogos grandes y se necesita eficiencia y control en la selección de datos.

