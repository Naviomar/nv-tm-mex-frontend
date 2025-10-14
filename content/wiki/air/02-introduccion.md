---
title: Air Import 
summary: Formulario para crear y administrar una referencia de importación aérea. Incluye datos de guía aérea, consignatarios, rutas de vuelo, carga, proceso de liberación y gestión de cargos.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-10-02
module: air-import
---

### Air Import Information
Esta sección concentra la **información principal de la importación aérea**. Todos los campos son obligatorios salvo que se indique lo contrario.

- **Año de referencia (Next Year)**  
  - Cuando el sistema detecta que falta menos de 180 días para finalizar el año, se muestra una alerta azul.  
  - El usuario puede seleccionar si desea que la referencia se cree automáticamente con el **año siguiente**.  
  - Campo relacionado: `next_year`.

- **Master AWB (Air Waybill)**  
  - Número único de guía aérea madre.  
  - Formato estándar IATA de 11 dígitos.  
  - Ejemplo: `123-45678901`.

- **House AWB**  
  - Número de guía aérea hija.  
  - Se usa en envíos consolidados.  
  - Campo obligatorio cuando el embarque no es directo.

- **Origin / Destination**  
  - Código IATA del aeropuerto de origen y de destino.  
  - Ejemplo: `MEX` → Ciudad de México, `LAX` → Los Ángeles.

- **Airline**  
  - Selección de la aerolínea a través del catálogo de aerolíneas.  
  - Campo obligatorio.

- **Consignee (consignatario)**  
  - Cliente final que recibe la mercancía.  
  - Campo con **búsqueda global** que conecta con el catálogo de clientes.  
  - Al seleccionarlo, el sistema carga automáticamente el **ejecutivo asignado**.  
  - Validación: debe existir en catálogo y tener relación activa.

- **Executive**  
  - Ejecutivo asignado al consignatario.  
  - Se muestra en formato: `Nombre (Valid to: fecha)` o `Indefinite`.  
  - Solo lectura.

- **Shipper (embarcardor)**  
  - Empresa o persona que envía la mercancía desde origen.  
  - Campo obligatorio.

- **Origin Freight Forwarder**  
  - Agente de carga en el país de origen.  
  - Seleccionado mediante búsqueda global en el catálogo de freight forwarders.

---

### Routes
La sección de **Rutas** permite detallar el trayecto del embarque aéreo, contemplando **múltiples tramos** (ejemplo: MEX → JFK → FRA).  
El sistema genera un listado dinámico donde se pueden **agregar** o **eliminar** rutas.

Cada ruta incluye:

- **Departure Country / Airport / Date**  
  - País de salida, aeropuerto de salida y fecha de salida del vuelo.  
  - Seleccionados de catálogos dinámicos filtrados (el listado de aeropuertos depende del país).  
  - La fecha usa formato calendario con ícono de avión despegando.

- **Arrival Country / Airport / Date**  
  - País de llegada, aeropuerto de llegada y fecha de arribo.  
  - La fecha usa formato calendario con ícono de avión aterrizando.

- **Flight number**  
  - Número de vuelo (ejemplo: `AM1234`).  
  - Puede repetirse en caso de conexiones.

- **Destination (solo último tramo)**  
  - Campo opcional para especificar el destino final del embarque en la última ruta.

- **Transit days**  
  - Se calcula automáticamente a partir de la **fecha de salida del primer tramo** y la **fecha de llegada del último tramo**.  
  - Incluye el día de salida en el cálculo.  
  - Ejemplo: salida 01/01/2025, llegada 05/01/2025 → Transit days = 5.

---

### Cargo Information
Sección para capturar los detalles de la mercancía transportada. Se divide en dos bloques:

#### CBM (Cubic Meters)
Permite calcular automáticamente el **peso cobrable** y el **volumen de la carga**.  
Cada registro incluye:

- **Packages** → Número de bultos/paquetes.  
- **Gross weight** → Peso bruto de los bultos en kilogramos.  
- **Length / Width / Height** → Dimensiones en centímetros.  
- **Acción** → Posibilidad de eliminar el registro.

El sistema calcula automáticamente:
- **Chargeable weight (peso cobrable)** → (Largo × Ancho × Alto) / 6000 × Paquetes.  
- **CBM total** → Resultado de la suma de todos los registros.  
- **Totales**: paquetes, peso bruto y peso cobrable.

#### Cargo
Información comercial de la carga:
- **Commodity** → Descripción del tipo de mercancía.  
- **Rate** → Tarifa asociada (validada como valor numérico).  

---

### Release Information
Sección enfocada en la **liberación de la mercancía** una vez llegada al destino. Incluye:

- **Release date** → Fecha en la que se libera la carga.  
- **Release airline** → Fecha en la que la aerolínea libera formalmente la carga.  
- **Customs Agent (A.A.)** → Selección de agente aduanal desde el catálogo.  
- **Handler** → Encargado o representante en el aeropuerto.  
- **Warehouse** → Almacén donde se recibirá la carga.  
- **Notes** → Campo de texto libre para observaciones adicionales.  
- **Release who** → Responsable que autoriza la liberación.  

Adicionalmente, el usuario cuenta con **atajos directos** para refrescar catálogos de Handlers y Warehouses.

---

### Charges – Buy / Sell charges
Este apartado está diseñado para administrar los **cargos financieros** de la operación. Permite establecer la diferencia entre lo que la empresa paga (Buy Rate) y lo que cobra al cliente (Sell Rate).  

#### Bloques principales
- **Buy Rate (tarifa de compra, bloque azul):**  
  Aquí se configuran los costos que la empresa paga a proveedores o aerolíneas. El botón **View Breakdown** despliega un desglose detallado. El usuario selecciona el código de tarifa (ejemplo: PPCC) y guarda con el botón azul **Save**.

- **Sell Rate (tarifa de venta, bloque verde):**  
  Corresponde a lo que se factura al cliente. Tiene la misma dinámica: botón **View Breakdown**, menú desplegable para elegir la tarifa y botón verde **Save**.  

Estos dos bloques permiten comparar de manera inmediata los costos vs ingresos, asegurando márgenes de ganancia claros.

#### Charge details
Debajo se encuentra una tabla que lista todos los cargos registrados en la operación con sus respectivos detalles:

- **Actions:** íconos para editar (lápiz), eliminar (bote de basura) y acceder a vistas adicionales (botón “wm”).  
- **Charge:** nombre del cargo. Ejemplos comunes: **AMS** (Automated Manifest System) y **Desconsolidación**.  
- **F/D AWB:** indica si el cargo está dentro o fuera de la guía aérea. En el ejemplo se muestra *Fuera de AWB*.  
- **Buy amount:** monto de compra registrado para ese cargo.  
- **Sell amount:** monto de venta al cliente. Ejemplo: AMS = $15 USD, Desconsolidación = $135 USD.  
- **Created at:** fecha y hora de creación. Incluye ícono de usuario para identificar quién lo registró.  

#### Acciones adicionales
- **New Charge:** permite agregar un nuevo cargo.  
- **View Proformas:** muestra proformas generadas con base en los cargos ingresados, útiles como pre-factura para clientes.

En conjunto, esta sección brinda control financiero y transparencia operativa, asegurando que cada cargo esté claramente definido, trazado y relacionado con la operación.

---

### Acciones del formulario
En la parte inferior se encuentran los botones principales:

- **Save** →  
  - Guarda la referencia completa en el sistema.  
  - Los datos enviados incluyen: información general, rutas, CBM, cargos, notas de crédito/débito.  
  - Tras el guardado, el sistema redirige automáticamente a la operación creada.

- **Cancel** →  
  - Cancela la creación de la referencia.  
  - Redirige al listado de importaciones aéreas.

---

## Validaciones generales
- Todos los campos marcados con `*` son obligatorios.  
- El campo **Rate** debe contener un valor numérico válido.  
- Las fechas deben estar en formato ISO (`YYYY-MM-DD`).  
- Los cálculos de CBM y Transit Days se generan automáticamente.  
- Al no validar el formulario, aparece un **snackbar de error**: *“Validate form before submit”*.  

---

## Sección: Cargo Information – CBM
Esta sección se enfoca en capturar y visualizar los datos relacionados con la cantidad, peso y volumen de la carga, que son críticos para calcular fletes y planificar la logística marítima.

### Encabezado de sección
- **AGL25090259 – cargo information**  
  Indica que se está visualizando la información de carga asociada a la referencia AGL25090259, que es el identificador único de esta operación o embarque.

### Sub-sección: CBM
CBM significa Cubic Meters, o metros cúbicos, que es la unidad de volumen utilizada en transporte aéreo y marítimo para calcular espacio ocupado y peso facturable.

#### Campos visibles
- **Packages:** número de bultos.  
- **Gross weight:** peso bruto total (kg).  
- **Length / Width / Height:** dimensiones de la carga.  

#### Botones
- **+ (verde):** agregar nuevo paquete o línea.  
- **🗑️ (rojo):** eliminar paquete.

### Sub-sección: Totales
Presenta los totales calculados:
- Total packages  
- Total gross weight  
- Total chargeable weight  

Botón: **SAVE CBM CHANGES**, que guarda los registros y actualiza totales.

### Sub-sección: Cargo general
Incluye:
- **Commodity:** tipo de mercancía.  
- **Rate:** tarifa aplicada a la carga.  

### Resumen operativo
- Permite capturar bultos y dimensiones.  
- Calcula automáticamente CBM y peso facturable.  
- Presenta totales para verificación.  
- Integra la carga física con la tarifa comercial, asegurando coherencia entre logística y facturación.

---

## Sección: Credit / Debit Notes, Invoices & Payments
Además de la gestión de carga y rutas, el sistema integra un módulo financiero para controlar notas de crédito/débito, facturas y pagos asociados.

### Credit / Debit Note(s)
- **Formulario principal**:  
  - Campo desplegable obligatorio: *Credit / Debit Form – Select F.F. note type*.  
- **Leyenda de referencia**:  
  - *From agent*: Nota de crédito/débito de un agente hacia nosotros.  
  - *From TM*: Nota de crédito/débito de nosotros hacia un agente.  

**Tabla asociada** (actualmente vacía):  
- Encabezados: Actions, Type, Credit/Debit, Folio, Agente F.F., Amount, in USD, File/PDF, Status, Req. payment status, Actions.

### Customer invoices 
- Encabezados de tabla:  
  - Pay status, Invoice #, Credit notes, Customer, Amount, Invoice date.  
- Estado: sin registros cargados.

### Customer payments 
- Encabezados de tabla:  
  - Payment, Amount, Created at, By.  
- Mensaje: *No payments found*.  

### Observaciones funcionales
- Cada tabla incluye botones de **refresh 🔄** para recargar información.  
- El diseño en modo oscuro resalta encabezados y secciones.  
- El sistema diferencia claramente la interacción con **agentes (F.F.)** y con **clientes**.  
- Permite centralizar tanto la parte operativa (importación aérea) como la parte financiera (facturación y cobros), garantizando trazabilidad integral.

---

## Sección: Supplier invoices, Payments, Refunds & Air Service Totals
El sistema de **Air Import** también incorpora una sección financiera dedicada a la relación con proveedores, reembolsos y el resumen total del servicio aéreo. Esto asegura un control integral de costos, pagos y utilidades.

### Supplier invoices & payments
Esta área gestiona las facturas y pagos relacionados con los proveedores del servicio.

- **Supplier invoices (Facturas de proveedor)**  
  - Tabla con encabezados: Payment, Folio, Supplier, Amount, Invoice date.  
  - Permite registrar y visualizar facturas emitidas por los proveedores.  
  - Estado actual: sin registros cargados.  

- **Supplier Advance Payments (Pagos anticipados a proveedores)**  
  - Tabla con encabezados: Status, Folio, Supplier, Amount, Created.  
  - Muestra pagos anticipados aplicados a proveedores antes de recibir la factura.  
  - Estado actual: sin registros cargados.  

### Refunds
Sección destinada a capturar reembolsos vinculados al servicio.

- **Refunds in service**  
  - Tabla con encabezados: Payment, Folio, Beneficiary, Amount, Invoice date.  
  - Permite identificar devoluciones de dinero asociadas a operaciones específicas.  
  - Estado actual: *No refunds linked to service*.  

### Air Service – Totals
Este bloque es crítico para evaluar la rentabilidad del embarque aéreo, diferenciando ventas (sell) y compras (buy), tanto en modalidad **prepaid** como **to collect**.

####   Sell (Ventas)
- **Within AWB:** Prepaid USD 0.00 | To collect USD 0.00  
- **Out AWB:** Prepaid USD 0.00 | To collect **USD 150.00**  
- **IVA:** Prepaid USD 0.00 | To collect USD 0.00  
- **Total ventas:** Prepaid USD 0.00 | To collect **USD 150.00**  

#### Buy (Compras)
- **Within AWB:** Prepaid USD 0.00 | To collect USD 0.00  
- **Out AWB:** Prepaid USD 0.00 | To collect USD 0.00  
- **IVA:** Prepaid USD 0.00 | To collect USD 0.00  
- **Total compras:** Prepaid USD 0.00 | To collect USD 0.00  

#### Resumen financiero
- **Payments (USD):** 0.00  
- **Pending payment (USD):** 150.00  
- **Refunds (USD):** 0.00  

#### Cálculos finales
- **Total sell:** USD 150.00  
- **Total buy:** USD 0.00  
- **Credit notes:** USD 0.00  
- **Debit notes:** USD -0.00  
- **(-) Supplier invoice:** USD 0.00  
- **Profit (USD):** USD 150.00  
- **(-) Pending payment:** USD 150.00  

### Observaciones funcionales
- El sistema refleja una operación con **ingreso pendiente de cobro por USD 150.00** (Out AWB).  
- No existen costos de compra asociados, por lo que la **utilidad bruta calculada es USD 150.00**.  
- Al estar pendiente de cobro, la utilidad aún no está realizada, lo que da visibilidad de ingresos proyectados vs ingresos confirmados.  
- Cada bloque incluye íconos de **información (ℹ️)** y **refresh (🔄)** para consulta y actualización en tiempo real.  

---
### Release Information
Esta sección está diseñada para centralizar el **proceso de liberación y revalidación de la carga** al llegar al destino. Aquí se controla la validación por parte de la aerolínea, la coordinación con el agente aduanal y el manejo físico de la mercancía en el almacén. Su función es evitar retrasos y garantizar trazabilidad documental.

#### Campos principales

- **Release date**  
  Fecha en que la carga es liberada físicamente para su disposición en destino. Este campo es crítico porque determina el inicio de procesos aduanales, facturación de almacenaje y tiempos de entrega.  
  - Impacto: si se retrasa, se generan costos adicionales por demoras.

- **Release airline**  
  Fecha oficial de validación de la liberación por parte de la aerolínea. Puede diferir de la *Release date*, ya que primero la carga puede estar físicamente disponible pero pendiente de validación documental.  
  - Importancia: asegura que el embarque fue aprobado formalmente y que no existen bloqueos o incidencias.

- **Customs Agent (A.A.)**  
  Selección del **agente aduanal** responsable de gestionar el despacho en aduana.  
  - El catálogo garantiza que solo agentes autorizados puedan ser asignados.  
  - Asociar un A.A. facilita que todos los documentos (pedimentos, facturas, permisos) se vinculen con el embarque en cuestión.

- **Handler**  
  Persona encargada de la operación en el aeropuerto (ejemplo: personal de maniobras o representante asignado).  
  - Botón **ADD HANDLER**: permite crear un nuevo contacto en caso de que no exista en el catálogo.  
  - Valor operativo: da seguimiento físico y confirma que la carga se encuentra en la ubicación asignada.

- **Warehouse**  
  Almacén donde la carga será resguardada tras su llegada.  
  - Incluye opción de **ADD WAREHOUSE** para registrar un nuevo almacén directamente.  
  - Importancia: relacionar un almacén asegura control de inventario y reduce riesgos de extravío.

- **Notes**  
  Campo abierto para observaciones: incidencias, solicitudes especiales del cliente, instrucciones internas (ejemplo: “Liberar solo contra pago” o “Revisar por mercancía peligrosa”).

- **Attachment(s)**  
  Sección para subir documentos asociados al proceso de liberación, como cartas de revalidación, recibos de almacén o comprobantes de liberación aduanal.  
  - Estado inicial: *No attachments*.  
  - Una vez cargados, se listan con opción de descarga o eliminación.  
  - Garantiza trazabilidad documental y respaldo legal.

---

#### Acciones disponibles

- **SAVE REVALIDATION CHANGES**  
  Guarda los cambios en modo borrador sin enviar la revalidación aún.  
  - Uso: cuando faltan documentos o confirmaciones.  
  - Previene envíos incompletos.

- **SEND REVALIDATION**  
  Envía formalmente la revalidación a la aerolínea o al área correspondiente.  
  - Uso: cuando ya se han verificado todos los campos y documentos.  
  - Impacto: marca la liberación como **formalmente gestionada**.

---

#### Observaciones funcionales y de control

- **Distinción operativa vs. documental**:  
  - *Release date* representa la disponibilidad operativa.  
  - *Release airline* valida la parte documental.  
  Tener ambos campos permite medir retrasos atribuibles a aerolínea o aduana.

- **Trazabilidad completa**:  
  Al unir datos de consignatario, agente aduanal, handler y almacén, se obtiene un registro integral que respalda auditorías y reclamos.

- **Prevención de costos ocultos**:  
  Controlar la fecha de liberación y de revalidación evita gastos extra por almacenaje, demoras en aduanas o recargos de aerolínea.

- **Flexibilidad en gestión**:  
  - Botones **ADD HANDLER** y **ADD WAREHOUSE** facilitan la captura rápida cuando se trabaja con nuevos contactos.  
  - Permite ampliar la red operativa sin interrumpir el flujo.

- **Valor agregado para el cliente**:  
  Al contar con registros claros y documentos adjuntos, el cliente puede recibir reportes de liberación con fechas exactas y responsables designados.

---

### Ejemplo práctico del flujo
1. La carga llega al aeropuerto → se asigna almacén y handler.  
2. El agente aduanal recibe notificación de liberación.  
3. La aerolínea emite la confirmación de **Release airline**.  
4. El ejecutivo revisa que no haya incidencias y adjunta los documentos.  
5. Se guarda en borrador (*SAVE REVALIDATION CHANGES*) o se envía oficialmente (*SEND REVALIDATION*).  

---

## Búsqueda de Freight Forwarders (Agentes de carga)

En el sistema existe una herramienta de búsqueda diseñada para localizar freight forwarders (también llamados agentes de carga o transitarios). 
Esta funcionalidad está pensada para que el usuario pueda encontrar de forma rápida y sencilla a los proveedores o socios logísticos con los que se trabaja, evitando tener que desplazarse manualmente por listados extensos.

### Funcionamiento general

1. Campo de búsqueda principal

En la pantalla encontrarás un campo que dice “Search freight forwarders”. 

Aquí debes escribir el nombre del agente de carga que estás buscando.

2. Requisito mínimo

Para que el sistema empiece a buscar, es necesario escribir al menos 3 caracteres. 

Esto evita que el buscador muestre demasiados resultados irrelevantes.

  - Ejemplo:

    - Si buscas “DHL”, al escribir DHL ya aparecerá en la lista.

    - Si escribes solo “D”, no mostrará nada.

3. Resultados dinámicos

A medida que escribes, el sistema consulta automáticamente la base de datos y te muestra los freight forwarders que coinciden con tu búsqueda.

4. Selección del resultado

Una vez encuentres el agente de carga correcto, haz clic sobre su nombre en la lista desplegable. El sistema lo marcará como seleccionado.

5. Opción de limpiar selección

Si te equivocaste o deseas reiniciar la búsqueda, existe un botón Clear. Este borra la selección actual y limpia la lista de resultados.

6. Indicadores de carga y errores

  - Mientras el sistema busca, aparece un indicador de proceso (cargando).

  - Si ocurre un error, el sistema mostrará un aviso tipo “Error fetching data”.

  - Si no se encuentra ningún agente, simplemente no aparecerán resultados.

### Casos de uso y ejemplos prácticos

- Ejemplo 1: Buscar un agente conocido
    Supongamos que trabajas con la empresa Kuehne + Nagel.

    - Escribes “Kuehne” en el campo de búsqueda.

    - El sistema mostrará: “Kuehne + Nagel”.

    - Seleccionas la opción y queda guardada en el formulario.

- Ejemplo 2: Buscar por parte del nombre

  Si solo recuerdas parte del nombre, por ejemplo “Expeditors”, basta con escribir “Exped” y el sistema te devolverá el resultado correcto.

- Ejemplo 3: Reiniciar búsqueda

Si seleccionaste un agente equivocado, por ejemplo “DHL Global Forwarding”, puedes hacer clic en Clear para limpiar la selección y buscar de nuevo.

### Beneficios para el usuario

- Rapidez: no es necesario recorrer manualmente listados largos.

- Precisión: solo se muestran coincidencias relevantes según lo que escribes.

- Flexibilidad: puedes limpiar tu selección y volver a empezar.

- Usabilidad: el buscador está diseñado para ser intuitivo y familiar, similar a otros motores de búsqueda modernos.

Este buscador de freight forwarders es una herramienta ágil que facilita la gestión de agentes logísticos dentro del sistema, mejorando la productividad y reduciendo errores al momento de seleccionar proveedores.

## Búsqueda de Aerolíneas

El sistema cuenta con un buscador dinámico de aerolíneas, diseñado para facilitar la selección de compañías aéreas en operaciones de importación, exportación o gestión de vuelos. 
Este módulo permite encontrar rápidamente aerolíneas registradas en el catálogo, evitando errores de digitación y agilizando el flujo de trabajo.

### Funcionamiento general

1. Campo de búsqueda principal

El usuario encuentra un campo titulado “Search airlines”, donde puede escribir el nombre de la aerolínea que desea seleccionar.

2. Búsqueda mínima

Para que el buscador funcione, es necesario introducir al menos 3 caracteres. 
Esto asegura que los resultados sean precisos y evita que el sistema cargue listados extensos sin relevancia.

 - Ejemplo:

    - Escribir “AM” no generará resultados.

    - Escribir “AMX” o “Aero” sí activará la búsqueda.

3. Resultados dinámicos

A medida que escribes, el sistema consulta el catálogo de aerolíneas y muestra coincidencias relevantes en un desplegable. 
Cada resultado incluye el nombre completo de la aerolínea y se puede seleccionar directamente desde la lista.

4. Selección del resultado

Al hacer clic en el nombre de la aerolínea correcta:

  - Se marca como seleccionada en el formulario.

  - El sistema guarda automáticamente el ID de la aerolínea, lo que asegura consistencia de datos.

  - Se activa la posibilidad de continuar con otras secciones del formulario, como rutas, vuelos y cargos asociados.

5. Opciones de limpieza y reinicio

  - Existe un botón Clear que permite eliminar la selección actual y reiniciar la búsqueda.

  - Esto es útil si se seleccionó la aerolínea incorrecta o si el usuario desea cambiar de compañía antes de guardar la operación.

6. Indicadores de proceso

  - Durante la búsqueda, aparece un indicador de carga mientras se consulta la base de datos.

  - En caso de error de conexión o problemas en la búsqueda, se mostrará un aviso tipo “Error fetching data” para que el usuario pueda reintentar.

  - Si no se encuentran aerolíneas que coincidan, el desplegable permanece vacío.

7. Mensajes de ayuda

  - Se muestra un mensaje guía: “Type at least 3 characters to search”, recordando al usuario cómo activar la búsqueda.

### Casos de uso y ejemplos prácticos

  - Ejemplo 1: Selección de aerolínea conocida
 
    Supongamos que deseas registrar un vuelo con Aeroméxico.

    - Escribes “Aero” en el campo de búsqueda.

    - Aparece “Aeroméxico” en el listado.

    - Haces clic sobre el resultado y queda seleccionado.

  - Ejemplo 2: Buscar aerolínea internacional

    Deseas registrar un vuelo de carga con Lufthansa Cargo.

    - Escribes “Luft” o “Cargo”.

    - El sistema devuelve “Lufthansa Cargo”.

    - Seleccionas la aerolínea y continúas con la captura de datos.

  - Ejemplo 3: Cambio de aerolínea

    Seleccionaste inicialmente “American Airlines” pero te das cuenta de que el vuelo será con “Delta Airlines”.

    - Haces clic en Clear para eliminar la selección actual.

    - Escribes “Delta” y seleccionas la aerolínea correcta.

  - Ejemplo 4: No hay resultados

    Buscas una aerolínea inexistente, por ejemplo “XYZ Airlines”.

    - El sistema no devuelve resultados y muestra un mensaje indicativo.

    - Esto evita errores al registrar aerolíneas no autorizadas o inexistentes.

### Beneficios para el usuario

- Precisión y consistencia:

  Evita errores de digitación y asegura que solo se seleccionen aerolíneas existentes en el catálogo oficial.

- Rapidez y eficiencia:

  Permite buscar y seleccionar aerolíneas en segundos, sin tener que revisar listas extensas.

- Flexibilidad:
  Se puede limpiar la selección y reiniciar la búsqueda tantas veces como sea necesario.

- Integración con otros módulos:

  - Una vez seleccionada la aerolínea, se puede usar para asignar vuelos, generar rutas y calcular tarifas.

  - Facilita la vinculación con otros datos del sistema, como agentes de carga, consignatarios o cargos asociados.

- Usabilidad:

- La interfaz es intuitiva y similar a motores de búsqueda modernos.

- Muestra mensajes de guía claros y retroalimentación inmediata si no hay resultados o ocurre un error.

### Recomendaciones de uso

1. Siempre escribir al menos 3 caracteres para activar la búsqueda.

2. Seleccionar solo aerolíneas del listado para evitar inconsistencias.

3. Usar el botón Clear si necesitas cambiar de aerolínea antes de guardar la operación.

4. Verificar que la aerolínea seleccionada corresponda al vuelo antes de continuar con el llenado de rutas y cargos.

5. Reintentar la búsqueda si aparece un mensaje de error de sistema o si la conexión falla temporalmente.

El buscador de aerolíneas es un componente clave dentro del sistema de gestión de operaciones aéreas. 

Permite:

- Localizar rápidamente aerolíneas registradas.

- Asegurar consistencia en la captura de datos.

- Reducir errores y tiempo en la selección de la compañía aérea.

- Integrar la información con otros módulos operativos (rutas, cargas, consignatarios).

Su diseño intuitivo y sus funcionalidades de búsqueda dinámica lo hacen esencial para la eficiencia y exactitud de las operaciones logísticas.

## Módulo de Gestión de Referencias de Air Import

Este módulo permite a los usuarios buscar, filtrar y administrar referencias de importación aérea de manera rápida, precisa y centralizada. 

Está diseñado para operadores logísticos, agentes de carga y personal administrativo que necesita acceder a información detallada de cada referencia aérea, incluyendo AWBs, aerolíneas, consignatarios y estados de envío.

### Sección de filtros

El sistema cuenta con un panel de filtros avanzado que permite refinar la búsqueda de referencias mediante múltiples criterios:

1. Año

- Campo tipo lista desplegable (Year).

- Permite seleccionar el año de la referencia para filtrar operaciones por periodo.

- Mejora la rapidez al limitar resultados a un rango temporal específico.

2. Número de referencia

- Campo de texto (Add reference #).

- Permite ingresar uno o varios números de referencia separados por comas.

- Al presionar Enter, los números se agregan automáticamente al filtro activo.

- Se muestran como chips debajo del campo para indicar qué referencias se están filtrando actualmente.

- Se pueden eliminar individualmente haciendo clic en el icono de cierre.

3. Master AWB

- Campo de texto para filtrar por el número de Master Air Waybill (AWB).

- Presionar Enter ejecuta la búsqueda.

4. House AWB

- Campo de texto para filtrar por House AWB.

- Permite encontrar referencias específicas dentro de un Master AWB.

5. Consignatario

- Componente de búsqueda avanzada (ACustomerSearch).

- Permite seleccionar consignatarios existentes del catálogo.

- Mejora la consistencia de datos evitando errores de digitación.

6. Freight Forwarder de origen

- Componente de búsqueda avanzada (AFreightForwarderSearch).

- Permite seleccionar el agente de carga de origen de manera precisa.

7. Aerolínea

- Componente de búsqueda avanzada (AAirlineSearch).

- Permite seleccionar la aerolínea que transporta la carga.

8. Número de vuelo

- Campo de texto para filtrar referencias por Flight number.

9. Sistema de origen

- Lista desplegable (Source system).

- Permite seleccionar el sistema desde el cual se generó la referencia.

10. Notificación de llegada

- Lista desplegable (Has arrival noty).

- Opciones: Yes / No.

- Permite filtrar referencias según si la notificación de llegada ha sido enviada o está pendiente.

11. Tracker Ref

- Campo de texto para ingresar referencias de seguimiento, separadas por comas.

12. Estado eliminado

- Lista desplegable (Status).

- Permite filtrar referencias marcadas como eliminadas o activas.

### Acciones rápidas de filtro

- Clear: Limpia todos los filtros y reinicia la búsqueda.

- Export Air Report: Genera un archivo Excel con los resultados filtrados, con nombre dinámico que incluye la fecha y hora.

- Search: Ejecuta la búsqueda de referencias según los filtros activos.

### Visualización de resultados

Los resultados se presentan en una tabla con paginación y acciones rápidas. 
Cada fila representa una referencia de importación aérea.

### Columnas principales:

1. Actions:

  - Iconos para editar o ver la referencia completa.

  - Permite abrir el detalle o la operación completa de la referencia.

2. # Reference: Número de referencia de la operación.

3. Master AWB / House AWB:

  - Se muestran con chips de colores para resaltar la información.

4. Origin F.F. / Consignee:

  - Muestra el agente de carga de origen y el consignatario.

  - Incluye iconos para destacar referencias provenientes de un sistema tracker.

5. Origin / Destination:

  - Aeropuertos de salida y destino de la referencia.

6. Arrival Noty / Revalidation:

  - Muestra si la notificación de llegada o la revalidación ha sido enviada.

  - Si está pendiente, se indica con un chip rojo; si ha sido enviada, con un chip verde con fecha y hora.

7. Airline / Flight number / Departure:

  - Aerolínea y número de vuelo.

  - Aeropuerto de salida de la primera ruta asociada.

### Paginación

- La tabla incluye paginación superior e inferior, mostrando la cantidad de registros por página y la navegación entre páginas.

- La información también muestra un resumen: “Showing X to Y from Z total records”, indicando el rango de registros visibles y el total.

### Funcionalidades avanzadas

1. Filtrado combinado:

  - Se pueden aplicar múltiples filtros simultáneamente, por ejemplo: año + aerolínea + consignatario, para refinar resultados.

2. Referencia múltiple:

  - Permite agregar varias referencias en un solo campo, separadas por comas.

  - Los filtros eliminan duplicados automáticamente y los muestran como chips interactivos.

3. Exportación de datos:

  - Permite generar reportes Excel completos de las referencias filtradas.

  - Incluye información de AWBs, aerolínea, consignatario, vuelos y notificaciones.

4. Acceso rápido a detalles:

  - Desde los botones de acción, se puede acceder directamente a la operación completa o a la vista de detalles de cada referencia.

5. Indicadores visuales:

  - Colores y chips identifican referencias especiales, eliminadas o pendientes.

  - Facilita la rápida identificación de casos críticos o acciones pendientes.

### Beneficios del módulo

  - Eficiencia: Permite localizar referencias de manera rápida y precisa.

  - Centralización: Todos los datos clave de cada referencia están en un solo lugar.

  - Integridad: Al usar componentes de búsqueda de clientes, agentes de carga y aerolíneas, se evita ingresar datos incorrectos.

  - Flexibilidad: Permite filtros combinados, referencias múltiples y exportación de reportes.

  - Control: Resalta referencias pendientes, eliminadas o provenientes de sistemas especiales para priorizar acciones.

### Recomendaciones de uso

1. Agregar filtros progresivamente para acotar los resultados y mejorar el rendimiento.

2. Usar el Enter para confirmar búsquedas o agregar referencias.

3. Aprovechar la función de exportación para generar reportes periódicos de seguimiento.

4. Verificar el estado de notificaciones y revalidaciones para gestionar correctamente el flujo operativo.

5. Limpiar filtros después de cada operación importante para evitar confusiones.

## Información general del formulario de Importación Aérea

Este formulario permite registrar y administrar todos los datos clave de una referencia de importación aérea. 
Está dividido en varias secciones organizadas en tarjetas (cards), con campos obligatorios y opcionales.

1. Air Import Information (Información general de la referencia)

- Año de la referencia:

El sistema detecta automáticamente si el siguiente año está cerca y permite decidir si la referencia se generará para el año actual o para el próximo.

- Campos principales:

  - Master AWB (Guía aérea principal) → Número obligatorio de la guía aérea principal.

  - House AWB (Guía aérea hija) → Número obligatorio de la guía aérea secundaria.

  - Origen y Destino → Ciudades o aeropuertos de salida y llegada.

  - Aerolínea → Selección de la aerolínea que opera el vuelo.

- Consignee (Consignatario):

Se puede buscar al consignatario mediante un buscador inteligente. 
Al seleccionarlo, el sistema muestra automáticamente el ejecutivo responsable asignado a ese cliente.

- Shipper (Remitente): Campo para registrar quién envía la mercancía.

- Origin Freight Forwarder: Permite seleccionar el agente de carga en origen.

2. Routes (Rutas de vuelo)

Esta sección permite registrar los segmentos de vuelo que componen la ruta de la carga.

  - Campos por cada ruta:

    - País y aeropuerto de salida.

    - Fecha de salida.

    - País y aeropuerto de llegada.

    - Fecha de llegada.

    - Número de vuelo.

    - Destino (en la última ruta).

- Se pueden agregar múltiples rutas (por ejemplo, vuelos con conexión).

- El sistema calcula automáticamente los días totales de tránsito desde la primera salida hasta la última llegada.

3. Cargo Information (Información de la carga)

CBM (Dimensiones y peso de la carga)

Aquí se detallan las medidas de los paquetes:

- Número de bultos (packages).

- Peso bruto (gross weight).

- Largo, ancho y alto.

- El sistema calcula automáticamente:

  - Peso cobrable (Chargeable weight).

  - CBM total (volumen).

  - Totales de paquetes y peso bruto.

Se pueden añadir múltiples registros CBM, uno por cada lote de carga con medidas distintas.

Cargo (Carga general)

- Commodity: Descripción del tipo de mercancía.

- Rate: Tarifa aplicada. El sistema valida que este valor sea numérico.

4. Release Information (Información de liberación)

Sección para registrar los detalles de liberación en aduana y almacén:

- Release date: Fecha de liberación.

- Release airline date: Fecha en que la aerolínea liberó la carga.

- A.A. (Agente Aduanal): Selección del agente aduanal responsable.

- Handler: Empresa o persona que manipula la carga.

- Warehouse: Almacén donde se resguarda la mercancía.

- Notas: Campo de texto libre para observaciones o comentarios.

- Release who: Indica quién realizó la liberación (campo informativo).

Además, se puede actualizar el catálogo de Handlers y Warehouses desde esta misma vista con los botones inteligentes integrados.

5. Acciones finales

En la parte inferior, el formulario incluye:

- Botón Cancelar: Regresa al listado de importaciones aéreas sin guardar cambios.

- Botón Guardar: Valida la información y crea la referencia. Si hay errores, el sistema mostrará alertas para corregirlos.

### Funcionalidades automáticas y validaciones importantes

- Validación de campos obligatorios: El formulario no permite guardar si faltan datos esenciales como guías, aerolínea, consignatario o rutas.

- Cálculo automático: Totales de paquetes, pesos y volúmenes se generan automáticamente a partir de lo ingresado.

- Selección dinámica: Aeropuertos, países, aerolíneas, agentes y almacenes se cargan desde catálogos del sistema.

- Consignatario y ejecutivo: Cuando se elige un consignatario, se asigna automáticamente el ejecutivo comercial responsable y se muestra su vigencia.

- Alertas visuales: El sistema muestra mensajes claros cuando hay errores, como tarifas inválidas o datos incompletos.

Este formulario es la herramienta principal para registrar toda la información logística, aduanal y comercial de una importación aérea. 

Reúne en un solo flujo desde la guía aérea, el consignatario, la ruta del vuelo, la carga (peso, volumen, tarifas), hasta la liberación en aduanas y almacén.

## Vista de Notificaciones – Air Import

Esta sección está diseñada para enviar y consultar notificaciones asociadas a una referencia de importación aérea. 
Se divide en dos grandes bloques:

1. Historial de notificaciones enviadas.

2. Formulario para generar y enviar nuevas notificaciones.

1. Historial de notificaciones (Past notifications)

En la parte superior aparece una tabla con las notificaciones previamente enviadas desde el sistema. 
Esta tabla contiene tres columnas principales:

- Sent date (Fecha de envío): Muestra cuándo se envió la notificación.

- Sent by (Enviado por): Indica el usuario o responsable que ejecutó el envío.

- Email(s) copied (Correos copiados): Lista los correos electrónicos a los que se envió copia de la notificación.

En la imagen no se muestran registros, por lo que aparece el mensaje “No data”. 
Esto indica que todavía no se ha generado ninguna notificación para la referencia en cuestión.

2. Envío de notificación (Send notification)

Debajo del historial se encuentra el formulario para enviar nuevas notificaciones. 
Este apartado está diseñado para centralizar la comunicación con agentes, clientes u otros actores relacionados con el embarque.

a) Mensaje de advertencia

El sistema muestra un recordatorio que dice:

“Review the form to proceed. Notification will include all the information about the shipment and the booking.”

Esto significa que antes de enviar, el usuario debe verificar los datos, ya que la notificación incluirá toda la información registrada en la referencia de importación y en la reserva.

b) Emails

Campo para ingresar los correos electrónicos de los destinatarios de la notificación.

- Se pueden seleccionar correos ya registrados en el sistema.

- Existe la opción de añadir manualmente otros correos mediante el botón “Add Custom Agent Email(s)”.

c) Additional notes (Notas adicionales)

Espacio de texto libre para que el usuario escriba comentarios, instrucciones o información complementaria que se enviará junto con la notificación. 

Este campo es útil para personalizar el mensaje y agregar detalles específicos para los destinatarios.

d) Attachments (Archivos adjuntos)

Sección para adjuntar documentos relacionados con la referencia, por ejemplo:

- Copia del AWB.

- Facturas.

- Documentos de aduana.

- Reportes internos.

Esto permite que la notificación sea más completa al integrar los documentos clave para el seguimiento de la operación.

3. Acción principal – Enviar notificación

En la parte inferior aparece el botón “Send Notification”, que ejecuta el envío del correo a los destinatarios seleccionados.

- Una vez enviado, el registro aparece en el historial de notificaciones con la fecha, el usuario remitente y los correos copiados.

- El envío incluye automáticamente la información de la carga, la guía aérea, consignatarios, aerolínea, rutas y cualquier detalle registrado en la referencia.

### Funcionalidad general de esta sección

- Centralización de comunicación: Facilita que toda la información relevante de una importación aérea se envíe de manera estructurada y desde el mismo sistema.

- Trazabilidad: Cada notificación queda registrada en el historial, lo que permite saber quién la envió, cuándo y a qué destinatarios.

- Flexibilidad: Se pueden incluir correos adicionales que no estén en el sistema y añadir documentos de soporte.

- Transparencia: Todos los involucrados reciben la misma información en un formato estándar generado por la plataforma.

Esta sección de notificaciones en Air Import es un módulo para gestionar la comunicación electrónica sobre embarques. 

Permite enviar correos a agentes, clientes o colaboradores, adjuntar documentos, añadir notas personalizadas y tener un historial claro de todos los envíos realizados.
