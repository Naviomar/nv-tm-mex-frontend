---
title: Maritime Export 
summary: Guía detallada para la captura, gestión y seguimiento de referencias de exportación marítima en México.
order: 5
status: stable
version: 1.4.0
updatedAt: 2025-10-01
module: maritime-export
roles: [Administrador, Operaciones, Facturación]
tags: [maritimo, exportacion, catalogos, referencia, bls, contenedores, manual, guia, practico]
---

# Objetivo
Este manual tiene como propósito proporcionar una guía integral para el uso del módulo de **Sea Export**, permitiendo a los usuarios capturar, validar y dar seguimiento a referencias de exportación marítima de manera eficiente y segura.  

**Qué logrará el usuario con este manual**
- Capturar referencias completas y consistentes (desde datos operativos hasta financieros).  
- Ejecutar controles preventivos (alertas de crédito, validaciones de fechas y contenedores).  
- Gestionar BLs, bookings y transbordos manteniendo trazabilidad documental.  
- Conciliar facturación, pagos y notas de crédito/débito vinculadas a cada referencia.  

**Perfiles destinatarios**
- **Operaciones:** creación/editado de referencias, contenedores y BLs.  
- **Facturación / Finanzas:** revisión de tarifas, facturas, pagos y notas.  
- **Administración:** permisos, auditoría y configuración de catálogos.  

**Ejemplo práctico (caso ilustrativo)**
- Crear una referencia para exportar 10 contenedores de café (reefer) desde Veracruz (POL) a Rotterdam (POD). Registrar shipper, consignee, booking con la línea X, crear Master BL y 10 House BLs asociados; verificar crédito del cliente y registrar los cargos (ocean freight, docs, AMS) para calcular margen y programar pagos.

---

# Alcance
El manual cubre todas las operaciones que pueden realizar los usuarios dentro del módulo de Sea Export, incluyendo:

- Captura y edición de referencias de exportación (metadatos, rutas, contenedores, BLs).  
- Gestión de clientes: shipper, consignee, notify party y freight forwarder con verificación de crédito y ejecutivo.  
- Registro de rutas: POL, POD y puertos intermedios (transbordos y escalas).  
- Administración de BLs maestros y house, bookings, contenedores, tipos de carga y posiciones de stuffing.  
- Gestión financiera: registro de rates (buy/sell), detenciones, rebates, notas de crédito/débito, pagos y reembolsos.  
- Integración y relación con módulos de facturación, bancos y proveedores.  
- Procedimientos de auditoría, historial de cambios y control de integridad de la información.  
- Reportes básicos: balance por referencia, estado de pagos, listados de BLs y contenedores.  

**Límites**
- No reemplaza sistemas contables para cierre fiscal: exporta datos para conciliación.  
- No gestiona aduanas (declaraciones legales), pero facilita los datos necesarios para ellas.

---

# Prerrequisitos
Antes de operar el módulo, se recomienda:

- Contar con permisos adecuados según rol (ver, crear, editar, aprobar, generar pagos).  
- Formación básica en procesos de exportación y terminología (BL, POL/POD, TM, FCL/LCL, Incoterms).  
- Catalogar y mantener actualizados: líneas navieras, puertos, tipos de contenedor, códigos de commodity (HS), países y monedas.  
- Contar con datos de crédito actualizados para cada cliente (plazo, límite, ejecutivo asignado).  
- Tener a la mano documentos que se vayan a adjuntar: bookings, facturas, confirmaciones de lineas, certificados especiales (fiche de reefer, certificados de peligro, instrucciones de temperatura).  
- Conocer la política interna de validación (quién aprueba referencias con crédito vencido o operaciones de alto riesgo).  

**Recomendaciones técnicas**
- Navegador soportado (últimas versiones de Chrome/Edge) y conexión segura.  
- Usuarios con roles operativos deben revisar listas de validación antes de guardar (ej. bloqueo si peso/volumen supera límites definidos).

---

# Navegación
- **Menú principal:** Maritime → Sea Export  
- **Ruta directa:** `/maritime/export`  
- **Vistas principales:**  
  - **Listado (Grid):** buscador por referencia, estado, shipper, booking, BL y filtros por fecha.  
  - **Crear / Nuevo:** formulario paso a paso para capturar referencia.  
  - **Detalle:** vista única con pestañas (Información general, Transhipments, Cargo, BLs, Rates, Financials, Documents, Audit).  
  - **Acciones rápidas:** botones para agregar transbordo, contenedor, BL, nota de crédito/débito y cargar documentos PDF.  

> **Consejo de uso:** usar el filtro por fechas de salida y línea naviera para reducir resultados en listados grandes.

---

# Flujo general de uso
A continuación se detallan los pasos con acciones y validaciones típicas.

1. **Acceso y búsqueda previa**  
   - Buscar si la referencia ya existe por número interno, PO o número de booking para evitar duplicados.  
   - Si es nueva, usar “Nuevo” para crear.

2. **Captura de información básica**  
   - Completar campos obligatorios: referencia (o generar automáticamente), POL/POD, fecha estimada de salida, línea y tipo de BL/TM.  
   - Validaciones automáticas: fechas (la fecha de salida no puede ser anterior a la de documentación), puertos válidos y línea activa.

3. **Asignación de clientes**  
   - Seleccionar shipper/consignee/notify/freight forwarder desde catálogo.  
   - Validar crédito del cliente (si está vencido aparece alerta; requiriendo aprobación para continuar).  
   - Confirmar ejecutivo asignado.

4. **Definir ruta y transbordos**  
   - Agregar transbordos (puerto + fecha estimada).  
   - Guardar versión borrador hasta confirmar ruta final.  
   - Mantener historial cuando se replanifique.

5. **Carga y contenedores**  
   - Ingresar commodities, HS codes, embalaje, peso bruto/neto, volumen y número de paquetes.  
   - Seleccionar tipos y cantidades de contenedores. El sistema calcula totales y reserva número de unidades.  
   - Para carga peligrosa o reefer, capturar datos adicionales (IMDG, temperatura, certificado).

6. **BLs y Bookings**  
   - Registrar booking (Booking Line / Booking TM).  
   - Crear Master BL y asociar House BLs por cliente/consignee. Adjuntar PDF del BL cuando esté disponible.

7. **Rates y finanzas**  
   - Ingresar cargos de compra (buy) y venta (sell), indicar moneda, tipo de cálculo (por contenedor/por BL/por servicio) y condiciones (prepaid / collect).  
   - Revisar resumen financiero (Sell vs Buy), verificar profit, pagos y saldos pendientes.

8. **Validación y guardado**  
   - El sistema exige completar campos obligatorios y pasar validaciones (alertas visibles).  
   - Guardar referencia: puede quedar en estado **Draft** o **Confirmed** según permisos.  
   - Registrar auditoría automáticamente.

9. **Seguimiento operativo**  
   - Desde detalle, monitorear BLs, documentos adjuntos, pagos y notas.  
   - Registrar cambios y motivos (campo “motivo de edición” para auditoría).

---

## Secciones detalladas del formulario

### Sea Export Information – Detalle de referencia
Esta sección concentra la **información principal de la referencia marítima**. Aquí se registran todos los datos iniciales y de control que permiten identificar y dar seguimiento a la exportación:

**Campos clave y descripción**
- **Reference ID / Internal ref:** Identificador único generado por el sistema o ingresado por el usuario.  
- **Status:** Draft / Confirmed / Shipped / Closed / Cancelled. Controla acciones permitidas.  
- **Fechas críticas:**  
  - Fecha de creación.  
  - Fecha de cierre de documentación (cut-off docs).  
  - Fecha estimada de salida (ETD) y llegada (ETA).  
- **Tipo de operación (TM):** Nomination to TM o Customer TM — define responsabilidades con la línea y cálculo de cargos.  
- **Tipo de BL:** Master BL (emitido por línea) vs House BL (emitido por forwarder).  
- **PO / Invoice / Contract #:** Referencias contables y comerciales.  
- **Línea naviera / Carrier:** Seleccionar línea responsable. Si la línea tiene EDI, el sistema mostrará compatibilidades.  
- **Región / Route code:** Clasificación para reportes y tarifas regionales.  
- **Prioridad y notas:** Campo libre para instrucciones operativas (ej. “Fragile — handle with care”).

**Validaciones y reglas**
- Fecha de documentación no puede ser posterior al ETD.  
- POL y POD deben pertenecer a catálogos válidos; si la ruta no es directa, se requieren transbordos.  
- Si el cliente tiene crédito vencido, bloquear la confirmación a menos que exista aprobación.  

---

### Transhipment Information
Registro y gestión de **puertos intermedios**:

**Funcionalidad**
- Añadir líneas de transshipment con: puerto, fecha estimada, tiempo de escala y notas (p. ej. costo adicional, documentación requerida).  
- Ordenar por secuencia (primario → secundario → destino).  
- Marcar transbordos como **confirmed** al recibir aviso de la línea.

**Impactos operativos**
- Los transbordos afectan ETD/ETA y posibles costos (detentions, reconsignaciones).  
- Mantener actualizaciones para coordinar pickups en puerto intermedio.

**Historial**
- Cada modificación guarda: usuario, fecha y motivo del cambio (auditable).

---

### Customer Information
Conjunto de datos y controles relativos a clientes implicados.

**Elementos visibles**
- **Shipper:** nombre, RFC (o identificador fiscal), contacto, dirección y notas.  
- **Consignee:** nombre y contacto en destino.  
- **Notify Party:** persona/empresa a notificar en destino (correo/teléfono).  
- **Freight Forwarder:** agente de operaciones local o en destino.

**Controles adicionales**
- **Estado de crédito:** límite, días y saldo disponible. Si el crédito está vencido, se muestra alerta y (según política) se bloquea la confirmación.  
- **Ejecutivo asignado:** responsable comercial; si no existe, se sugiere asignar antes de confirmar.  
- **Documentación requerida:** lista de documentos (factura, packing list, certificados) y campo para adjuntar PDF.

**Buenas prácticas**
- Verificar datos fiscales (RFC/Tax ID y dirección) antes de generar BLs o facturas.  
- Registrar contacto operativo y documentación de exportación en el mismo registro para consultas rápidas.

---

### Cargo Information
Gestión completa de la carga y contenedores asociados a la referencia.

**Campos y datos a cumplimentar**
- **Tipo de carga:** general, peligrosas (hazardous), reefer, breakbulk, etc.  
- **HS Code / Commodity:** código de clasificación y descripción detallada.  
- **Embalaje:** tipo (pallets, cajas, tambores) y cantidad.  
- **Peso:** Neto / Bruto (kg).  
- **Volumen:** m³ (cálculo automático: largo × ancho × alto) y total por contenedor.  
- **Número de paquetes:** cantidad total.  
- **Tipo de contenedor:** 20’, 40’, HC, 40’ Reefer — con número de contenedor y estado.  
- **Posicionamiento (Stuffing):** lugar y fecha de consolidación.  
- **Número de validación:** número único para seguimiento interno (p. ej. QC ID).

**Reglas y validaciones**
- Los totales se suman automáticamente y generan advertencias si superan la capacidad del contenedor.  
- Para reefer: captura de temperatura requerida; para peligrosos: IMDG class, UN number y documentación adjunta.  
- Redondeo y conversiones: el sistema convierte unidades si es necesario (lb ↔ kg) según configuración.

**Consejos operativos**
- Asegurar descripciones claras y HS correctos para evitar rechazos en aduanas o problemas con la naviera.  
- Registrar el peso verificado en el puerto/almacén para conciliar con el BL.

---

## Financial Totals – Sea Export
Resumen financiero automatizado para conocer la rentabilidad y estado de cobros/pagos de la referencia.

### Conceptos y detalle
**Sell (Ingresos)**  
- Within BL: cargos incluidos dentro del BL (por ejemplo: freight, docs incluidos).  
- Out BL: cargos facturados fuera del BL (por ejemplo: servicios adicionales).  
- IVA / Taxes: impuestos aplicables (según jurisdicción).  
- Clasificación: **Prepaid** (pagado por shipper antes del embarque) o **To collect** (cobrar en destino).

**Buy (Costos)**  
- Within BL: costos que la línea o agente factura dentro del BL.  
- Out BL: costos adicionales (terminal handling, storage).  
- IVA / Taxes aplicables.

**Payments & Balances**  
- **Payments:** pagos ya recibidos o realizados.  
- **Pending payment:** montos por cobrar o por pagar.  
- **Refunds:** devoluciones registradas (motivo y folio).

**Profit & Adjustments (fórmula básica)**  
Profit = Total Sell (USD) - Total Buy (USD) - Supplier invoices + Credit notes - Debit notes - Rebates - Pending payments adjustments

- El sistema realiza la conversión de moneda si hay cargos en otras divisas, usando la tasa definida en la referencia o la tasa del día.

**Visualización y alertas**
- Saldos negativos y pendientes se muestran en rojo.  
- Desglose por moneda y conversión con tasa utilizada.  
- Historial de ajustes (quién y cuándo).

> **Nota operativa:** Revisar siempre el desglose (Within/Out BL) antes de cerrar la referencia para evitar errores de costo que afectan la utilidad informada.

---

## Facturación y pagos asociados a referencias

El módulo integra la gestión de facturas y pagos que afectan directamente la rentabilidad y el estado financiero de la referencia.

### Customer invoices & payments
**Funciones**
- Listar y visualizar facturas emitidas a clientes vinculadas a la referencia.  
- Estados de factura: Draft / Issued / Partially Paid / Paid / Overdue.  
- Asociar pagos (parciales o totales) a facturas e imputarlos sobre la referencia.

**Campos principales de la factura**
- Invoice # / Folio, Cliente, Monto, Moneda, Fecha de emisión, Estado, Notas de crédito aplicadas.

**Proceso típico**
1. Emitir factura desde la referencia o importar desde módulo de facturación.  
2. Registrar pago (manual o por conciliación bancaria automática).  
3. Marcar factura como pagada y actualizar estado de la referencia.

**Conciliación**
- El sistema permite conciliación manual/con automática con movimientos bancarios (si está habilitado).

---

### Line invoices & payments
**Propósito**
- Gestionar facturas emitidas por la línea naviera (o cobrar a la línea cuando aplique), registrar cronograma de pagos y marcar como pagadas.

**Elementos**
- Payment schedule: plan de pagos (fecha estimada, monto, usuario programador).  
- Line invoice(s): folio, monto, estado y notas de crédito o débito aplicadas.

**Acciones**
- Marcar invoice como pagada, incluir comprobante y registrar usuario que aprobó el pago.

---

### Supplier invoices & payments
**Propósito**
- Registrar facturas de proveedores (agentes, transportistas, almacenaje) relacionadas a la referencia y gestionar anticipos.

**Campos**
- Proveedor, Folio factura, Monto, Fecha emisión, Estado de pago, Anticipos asociados.

**Procedimiento**
- Registrar factura recibida, emparejar con cargos (rates) correspondientes y crear orden de pago o anotar anticipos.

---

### Refunds
Gestión de devoluciones relacionadas con servicios (p. ej. devolución por overcharge o reembolso por cancelación).

**Datos a capturar**
- Folio de refund, beneficiario, monto, justificante, motivo y fecha.  
- Estado: Pending / Processed / Rejected.

**Control**
- Requiere aprobación de finanzas para procesar reembolsos superiores a un umbral configurable.

---

## Casos de uso (ejemplos paso a paso)
1. **Crear referencia para exportación reefer**  
   - Nuevo → completar POL/POD, shipper, consignee → seleccionar tipo reefer → ingresar temperatura → agregar 5 contenedores reefer con números → crear booking → confirmar.  
   - Validaciones: temperatura obligatoria, HS code, documentos de sanidad.

2. **Conciliar pago de cliente**  
   - Abrir referencia → pestaña Financials → seleccionar factura → registrar pago parcial → actualizar estado de invoice y de referencia.

3. **Aplicar nota de crédito por sobrecobro**  
   - Generar Credit Note → asociar a factura → ajustar Totales Sell y recalcular Profit → registrar motivo y adjuntar comprobante.

4. **Registrar y aprobar pago a línea naviera**  
   - Revisar Line invoice → subir comprobante → marcar como pagada (requiere permiso “approve payments”).

---

## Buenas prácticas y recomendaciones
- **Revisión previa:** antes de confirmar referencias, revisar listado de documentos requeridos (invoice, packing list, certificados).  
- **Consistencia de datos:** usar nomenclaturas y códigos estandarizados (HS codes, puertos, carriers).  
- **Control de crédito:** no confirmar referencias si cliente tiene crédito vencido sin aprobación documentada.  
- **Adjuntar evidencia:** siempre adjuntar PDF de BLs, facturas y notas de crédito/débito para trazabilidad.  
- **Evitar duplicados:** buscar por PO/Booking antes de crear una nueva referencia.  
- **Cierre de periodo:** conciliar todas las facturas y rebates antes de cerrar mensual/trimestralmente.  
- **Manejo de detentions:** registrar días y cálculo para facturar correctamente al cliente si corresponde.

---

## Permisos necesarios (sugerencia de roles y keys)
Para operar correctamente, se recomienda el siguiente esquema de permisos (ejemplos de keys; se pueden adaptar):

- **Ver referencias:** `seaexport-view`  
- **Crear referencia:** `seaexport-create`  
- **Editar referencia:** `seaexport-edit`  
- **Eliminar / Cancelar referencia:** `seaexport-delete`  
- **Gestionar BLs/Bookings:** `seaexport-manage-bl`  
- **Gestionar rates & financials:** `seaexport-finance`  
- **Aprobar pagos / reembolsos:** `seaexport-payments-approve`  
- **Ver auditoría:** `seaexport-audit-view`

> Nota: ajustar permisos a la estructura de roles de tu organización.

---

## Errores comunes y cómo resolverlos
- **Cliente no encontrado:** revisar filtros (por nombre vs RFC) y verificar catálogo. Si no existe, crear cliente con datos fiscales completos.  
- **Crédito vencido:** contactar crédito antes de confirmar; documentar la aprobación si procede.  
- **Campos obligatorios incompletos:** el sistema bloqueará guardado; revisar resaltado de campos y mensajes de validación.  
- **Año próximo no seleccionado:** verificar si la operación cruza al siguiente ejercicio fiscal y marcar la referencia si aplica.  
- **Duplicados de contenedores o BLs:** depurar registros duplicados y reconciliar números de contenedor; usar historial para validar origen del duplicado.  
- **Inconsistencia en pesos/volúmenes:** validar mediciones con báscula/almacén y actualizar datos; si existe diferencia significativa, generar nota de ajuste.

---

## Auditoría
El sistema registra automáticamente información para cumplimiento y control:

**Qué se audita**
- Usuario que creó, editó, canceló o aprobó la referencia.  
- Fecha y hora de cada acción.  
- Campos modificados (antes / después) y motivo de cambio (campo libre obligatorio para cambios críticos).  
- Historial de BLs, contenedores, transbordos, cargos, facturas y notas de crédito/débito.  
- Documentos adjuntos subidos o eliminados (con indicación de usuario y timestamp).  
- Acciones de pago y conciliación financiera (incluye comprobantes).

**Acceso al log**
- Vista de auditoría en la ficha de referencia: filtros por usuario, fecha y tipo de cambio (ej. cambios en rates).  
- Exportación del historial para auditorías externas (CSV / PDF).

**Retención**
- Mantener logs durante el periodo requerido por la política interna y normatividad fiscal (recomendado: mínimo 5 años según jurisdicción).

---

## Anexos útiles (plantillas y checklist rápidas)
**Checklist rápida antes de confirmar referencia**
- [ ] POL y POD correctos.  
- [ ] Ship­per / Consignee / Notify Party completos.  
- [ ] Booking vinculado y booking number validado.  
- [ ] BLs creados y adjuntados (Master/House).  
- [ ] Contenedores registrados con números y tipos.  
- [ ] Weights & volumes verificados.  
- [ ] Rates ingresados y Profit revisado.  
- [ ] Pagos/Anticipos registrados o programados.  
- [ ] Documentación adjunta (invoices, packing list, certificaciones).  
- [ ] Alertas (crédito, año próximo) resueltas o aprobadas con evidencia.

**Ejemplo de nomenclatura de archivo recomendado**
- `REF-2025-000123_MASTERBL.pdf`  
- `REF-2025-000123_INVOICE_CUST-ACME.pdf`

---

> Este manual ampliado provee explicaciones operativas y financieras para garantizar que el módulo de **Sea Export** sea utilizado con rigor, reduciendo errores operativos y mejorando la trazabilidad en todas las etapas de la exportación marítima.

## Información detallada de la interfaz 

La siguiente sección describe con mayor amplitud los campos visibles en el formulario principal de captura de referencias de **Sea Export**, según lo mostrado en la interfaz del sistema.

---

### Información general de la referencia

* **Reference**: Número único de la referencia, clave para la trazabilidad de toda la operación. Puede ser asignado manualmente o autogenerado por el sistema.
* **Type**: Define el tipo de operación (FCL, LCL, consolidados, etc.). Esta selección condiciona qué campos adicionales serán requeridos.
* **Customer**: Cliente principal que contrata el servicio de exportación. Puede vincularse directamente a catálogos.
* **Shipper**: Exportador o embarcador. Información crítica para BLs y trámites aduanales.
* **Consignee**: Consignatario o receptor de la carga en destino, necesario para la documentación y coordinación de entrega.

---

### Fechas importantes

* **Documentation closing date**: Fecha límite de entrega de documentos. Una captura posterior a esta fecha puede generar costos adicionales o impedir el embarque.
* **ETD (Estimated Time of Departure)**: Fecha estimada de salida del buque desde el puerto de origen.
* **ETA (Estimated Time of Arrival)**: Fecha estimada de arribo al puerto de destino. Se utiliza para la planeación y para notificar al consignatario.

---

### Transhipment Information

* **Transhipment port**: Puerto intermedio donde se realizará una escala antes de llegar al destino final.
* **Vessel**: Nombre del buque que transportará la carga.
* **Voyage**: Número o código asignado al viaje del buque.

---

### Customer Information

* **Notify Party**: Parte interesada a la que se debe notificar la llegada de la carga. Puede ser diferente del consignatario.
* **Forwarding Agent**: Agente de carga que actúa como representante en origen o destino.

---

### Cargo Information

* **Commodity**: Descripción de la mercancía transportada. Puede incluirse según catálogo o libremente.
* **HS Code**: Código arancelario de clasificación de la mercancía para efectos aduanales.
* **Package type**: Tipo de embalaje (cajas, pallets, tambores, etc.).
* **Packages**: Número total de bultos incluidos en la referencia.
* **Weight (kg)**: Peso bruto de la mercancía en kilogramos.
* **Volume (m³)**: Volumen total de la carga expresado en metros cúbicos.
* **Container(s)**: Identificación de los contenedores asignados (número, tipo, tamaño).

---

### Totales financieros

* **Freight Charges**: Cargos asociados al flete marítimo.
* **Origin Charges**: Gastos de origen, tales como maniobras en puerto y documentación.
* **Destination Charges**: Gastos en destino, como desconsolidación o almacenaje.
* **Other Charges**: Otros gastos complementarios relacionados con la operación.
* **Total**: Suma consolidada de todos los costos y cargos aplicados.

---

### Conclusión de la sección

Esta información permite que el usuario registre de forma integral todos los aspectos de la referencia marítima: **operativos (clientes, carga, contenedores, rutas)**, **logísticos (fechas, transbordos)** y **financieros (cargos, pagos, totales)**.
Con ello, se asegura un control eficiente y trazable en cada etapa del proceso de exportación.

---
## Release TM / Line – Gestión de liberación de BLs

Esta sección permite registrar, auditar y controlar la liberación de documentos de transporte marítimo, ya sea el House Bill of Lading (HBL) emitido por el forwarder o el Master Bill of Lading (MBL) emitido por la línea naviera. Permite mantener un historial detallado de cada liberación, asegurando trazabilidad y cumplimiento documental en toda la operación de exportación.

# Objetivo

El propósito principal es:

- Registrar de manera precisa el tipo de liberación otorgada a cada BL.

- Mantener un historial auditable de todas las liberaciones.

- Identificar qué usuario realizó la liberación, en qué fecha y bajo qué condiciones.

- Garantizar que las liberaciones se realicen de acuerdo con la política de la empresa y los acuerdos contractuales con clientes y líneas navieras.

Con esto se minimizan errores, retrasos en la entrega y problemas legales por liberaciones indebidas.

# Estructura de la interfaz

La vista del módulo está organizada en dos paneles principales, que reflejan los tipos de BL:

- Release TM (HBL): Aquí se registra la liberación de los House BLs, que son documentos emitidos por el forwarder o agente local. Permite capturar liberaciones parciales o totales de un HBL, así como notas relacionadas con instrucciones específicas del cliente o condiciones especiales.

- Release Line (MBL): Esta sección se encarga de registrar la liberación de los Master BLs, emitidos por la línea naviera. Permite controlar cuándo la línea aprueba la entrega de documentos originales o electrónicos, y coordinar la liberación con el agente en destino.

Ambos paneles permiten ingresar múltiples eventos, manteniendo un registro cronológico que refleja todas las acciones realizadas sobre un BL específico.

# Campos disponibles

- Release Type:
  Selección del tipo de liberación otorgada. Ejemplos de uso:

  - Telex Release: Liberación rápida mediante telex/email; no requiere entrega física de documentos.

  - Express Release: Liberación inmediata bajo solicitud urgente del cliente.

  - Original Issued: Documento original emitido y disponible para entrega.

  - Surrendered: BL entregado al carrier o forwarder para autorización de liberación.

  - Hold: Liberación retenida por algún motivo (falta de pago, documentación incompleta).

  - Pending: Liberación pendiente, aún no autorizada por el responsable.

- Notes:
  Campo libre para agregar observaciones, condiciones de liberación o comentarios internos. Ejemplos prácticos:

  - “Liberado vía telex el 01/10/2025 a solicitud de cliente.”

  - “Documentos originales entregados en oficina de Rotterdam.”

  - “Pendiente de confirmación de pago del flete.”

  - “Liberación parcial de HBL 000123 debido a contenedor dañado; notificar a cliente.”

- Save:
Botón que almacena el registro, asignando automáticamente el usuario, la fecha y la hora del evento. 
Una vez guardado, el evento queda registrado en la tabla de liberaciones para consulta futura. Esta acción es irreversible para mantener la integridad del historial.

# Visualización de eventos registrados

Los eventos registrados se muestran en una tabla de fácil lectura:

- Release Type: Tipo de liberación realizada.

- Notes: Comentarios o contexto ingresado.

- User: Usuario que realizó el registro.

- Date: Fecha y hora exacta de la acción.

Si no se ha registrado ninguna liberación, el sistema muestra: No data.
Esta tabla permite filtrar y ordenar eventos por fecha, tipo de liberación o usuario, facilitando auditorías y consultas operativas.

# Validaciones y reglas de negocio

- Obligatoriedad: El campo Release Type debe completarse para guardar el evento.

- No edición: Los registros existentes no se pueden modificar; cualquier cambio requiere crear un nuevo evento para mantener el historial.

- Permisos: Solo usuarios con permisos seaexport-manage-bl pueden registrar liberaciones.

- Múltiples eventos: Se pueden registrar varias liberaciones para un mismo BL, por ejemplo: liberar parcialmente un HBL y luego el MBL asociado.

- Evidencia documental: Es recomendable adjuntar documentos en la pestaña Documents (correo, PDF, carta firmada) que respalden la liberación.

# Recomendaciones operativas

- Registrar la liberación inmediatamente al recibir confirmación oficial (correo del cliente, carta de la línea naviera o sistema EDI).

- Para liberaciones condicionadas (ej. pendiente de pago), indicar claramente las condiciones y responsabilidades.

- En operaciones de alto valor o alto riesgo, agregar observaciones específicas del ejecutivo responsable.

- Consultar el historial de liberaciones ante auditorías internas o externas para garantizar cumplimiento de políticas.

- Mantener consistencia entre liberaciones de HBL y MBL para evitar conflictos en destino.

# Impacto en el flujo

- La liberación del HBL o MBL condiciona la entrega de la carga en destino, así como la emisión de instrucciones al agente receptor.

- Es un paso clave antes de generar el Delivery Order (DO), documento que autoriza la entrega de contenedores al consignatario.

- Facilita la coordinación con agentes, líneas navieras y clientes, evitando demoras por documentación incompleta o no autorizada.

- Contribuye a la trazabilidad documental, permitiendo identificar de manera clara quién autorizó qué y cuándo.

La correcta gestión de liberaciones aumenta la eficiencia, reduce errores y asegura cumplimiento regulatorio en exportaciones marítimas.

## Release

### Contexto general

La captura pertenece a una interfaz de un sistema logístico o marítimo, específicamente dentro de un módulo llamado “Release”, que parece formar parte de un flujo operativo para la gestión de exportaciones marítimas (Sea Export).

El objetivo principal de esta pantalla es registrar, editar y consultar los tipos de “Release” (liberaciones) tanto para el HBL (House Bill of Lading) como para el MBL (Master Bill of Lading).

Estas liberaciones son pasos administrativos que permiten autorizar el movimiento de mercancías, documentos o embarques dentro de una operación logística.

### Estructura visual y funcional de la interfaz

La interfaz se encuentra organizada en dos secciones principales lado a lado dentro de una misma vista:

1. Release TM (HBL)

Corresponde a la liberación del House Bill of Lading (HBL), documento que representa el contrato de transporte entre el agente de carga y el cliente (exportador/importador).
Esta sección se utiliza para registrar información específica del “Release” a nivel de la referencia TM (posiblemente “Transporte Marítimo”).

- Título visible: “Release TM (HBL)”

- Campo 1: Release typing — un menú desplegable donde se selecciona el tipo de liberación (por ejemplo: “Original”, “Telex Release”, “Express Release”, etc.).

- Campo 2: Notes — un área de texto libre para ingresar comentarios o detalles relevantes sobre la liberación.

   - Ejemplo de uso: anotar quién autorizó, condiciones especiales, documentos pendientes, fechas de entrega, etc.

- Botón “SAVE” (verde): guarda los datos capturados.

- Tabla inferior: “Saved TM releases” — muestra el historial de liberaciones ya guardadas.

   - Columnas:

      - Release type: tipo de liberación.

      - Notes: observaciones registradas.

      - User: usuario que guardó la información.

      - Date: fecha del registro.

   - En la imagen actual, la tabla muestra “No data”, lo que significa que no existen registros previos.

2. Release Line (MBL)

Corresponde al Master Bill of Lading (MBL), el documento maestro que agrupa varias cargas HBL y que representa el contrato entre el agente de carga y la línea naviera.
Esta parte del formulario cumple la misma función que la anterior, pero a nivel de la naviera o transportista principal.

- Título visible: “Release Line (MBL)”

- Campo 1: Release typing — selección del tipo de liberación para el MBL.

- Campo 2: Notes — espacio para observaciones relacionadas con la liberación del documento maestro.

- Botón “SAVE” (azul): guarda los datos del MBL Release.

- Tabla inferior: “Saved Line releases” — listado histórico de liberaciones a nivel de línea naviera.

   - Columnas:

      - Release type

      - Notes

      - User

      - Date

   - Actualmente también aparece vacía (“No data”).

### Aspectos visuales

- El fondo principal del sistema es oscuro (color negro o gris antracita), típico de interfaces modernas con modo oscuro.

- Las tarjetas de contenido de los formularios son de color verde claro, lo que las hace destacar del fondo.

- Los botones SAVE tienen colores distintos:

   - Verde para el bloque TM (HBL)

   - Azul para el bloque Line (MBL)
   Esto ayuda a diferenciar claramente las acciones y evitar confusiones al guardar.

- Los encabezados de las tablas y secciones tienen tipografía en negritas, lo que mejora la legibilidad y organización visual.

### Estructura jerárquica de navegación

En la parte superior hay una barra de navegación que contiene varias pestañas o secciones operativas del sistema, cada una probablemente relacionada con diferentes fases del proceso marítimo. 

Estas pestañas son:

1. Details — para ver los datos generales del embarque.

2. Booking Confirmation — para confirmar o revisar la reserva de espacio con la línea naviera.

3. Release — la pestaña actualmente activa, enfocada en la liberación documental.

4. Print BL — para imprimir los documentos BL (Bills of Lading).

5. Ship Sail Check — para verificar la salida del buque y el estado del embarque.

6. Alerts — posiblemente un módulo de notificaciones o avisos automáticos.

7. Detentions — podría estar relacionado con retenciones, demoras o cargos de almacenamiento de contenedores.

El hecho de que la pestaña “Release” esté resaltada indica que es la sección activa dentro del flujo operativo.

### Flujo de trabajo esperado en esta pantalla

1. El usuario selecciona el tipo de release (por ejemplo, “Telex Release” o “Express”).

2. Escribe las notas o condiciones asociadas.

3. Da clic en SAVE para guardar el registro.

4. El sistema almacena la información y la muestra en la tabla inferior con:

   - El nombre del usuario (quién registró la acción).

   - La fecha y hora del registro.

   - Los comentarios y tipo de release.

5. El usuario puede repetir este proceso tanto para HBL (nivel TM) como para MBL (nivel Line) de manera independiente.

### Interpretación operativa

Este módulo forma parte de un proceso administrativo común en sistemas de exportación marítima.
El “Release” se utiliza para autorizar la entrega o transmisión de documentos de embarque. 
Su objetivo es garantizar que las mercancías o documentos solo se liberen una vez que se cumplan las condiciones contractuales o financieras (como el pago del flete, entrega de originales, o confirmación de la línea naviera).

- En el TM Release (HBL): la agencia o forwarder libera los documentos al cliente.

- En el Line Release (MBL): la línea naviera libera los documentos al forwarder o consignatario.

| Elemento                 | Descripción                                                   |
| ------------------------ | ------------------------------------------------------------- |
| **Módulo**               | Release TM / Line                                             |
| **Objetivo**             | Registrar, consultar y gestionar las liberaciones (HBL y MBL) |
| **Campos principales**   | Release typing, Notes                                         |
| **Acciones disponibles** | Guardar (Save) registros de liberación                        |
| **Datos almacenados**    | Tipo, notas, usuario, fecha                                   |
| **Tablas visibles**      | Historial de liberaciones TM y Line                           |
| **Estado actual**        | Sin datos registrados (No data)                               |
| **Colores principales**  | Fondo oscuro, formularios verdes, botones verde y azul        |
| **Pestaña activa**       | Release                                                       |


## Ship sail status

### Pantalla: Ship Sail Status – Sea Export Information

Esta vista pertenece al módulo de exportación marítima (Sea Export) de un sistema de gestión logística o documental.
Su propósito es registrar, visualizar y actualizar el estado de salida del buque (Ship Sail Status) asociado a una referencia específica de exportación.

El encabezado indica claramente la referencia interna del embarque:

Sea Export information #MXEM25-0029

Esto significa que el sistema está mostrando la información asociada al embarque identificado con ese número único.

### Estructura y contenido de la pantalla

La interfaz está organizada en tres bloques principales dentro del panel de “Ship sail status”, seguidos de una tabla inferior con las referencias vinculadas.

### Bloque 1 – Información de la línea y el buque

Este bloque presenta los datos básicos del transporte marítimo:

- LINE:
COSCO SHIPPING LINES
Indica la línea naviera responsable del embarque. COSCO es una naviera internacional reconocida que opera múltiples rutas de contenedores.

- VESSEL:
KOTA EMERALD
Es el nombre del buque en el que se encuentra asignado el embarque. Cada buque tiene un nombre único, y en este caso “KOTA EMERALD” es el navío utilizado para el transporte de la carga.

### Estado del buque

- Aparece un indicador visual grande y rojo con el texto:
“Ship not sailed” (el barco no ha zarpado).
Este elemento es una alerta visual que muestra que, hasta el momento, el sistema no ha registrado que el buque haya salido del puerto de origen.

- Justo debajo, hay una notificación informativa con el ícono de advertencia y el texto:
“Last updated by Edgar Rodriguez @ 2 Oct 2025 6:15 PM”
Esto indica que la última modificación o actualización en este registro fue realizada por un usuario identificado como Edgar Rodriguez, el día 2 de octubre de 2025 a las 6:15 p.m.
Es un detalle importante para trazabilidad, ya que permite saber quién fue el último responsable de la edición y cuándo ocurrió.

- En la parte inferior de este bloque se muestra un botón azul con el texto:
“MARK AS SAILED”
Su función es registrar manualmente el momento en que el barco efectivamente ha zarpado.
Cuando el usuario presiona este botón, el estado del buque debería cambiar de “Ship not sailed” a “Ship sailed” o un mensaje equivalente, actualizando la información en el sistema.

### Bloque 2 – Información del embarque (Export details)

El segundo bloque contiene los datos del embarque propiamente dicho. 
Está dividido en pequeñas etiquetas descriptivas con sus valores correspondientes:

- EXPORT POL (Port of Loading):
Manzanillo – Mexico
Indica el puerto de carga, es decir, el lugar donde la mercancía fue embarcada. 
En este caso, el embarque sale desde Manzanillo, México, uno de los puertos marítimos más importantes del país.

- ETA (Estimated Time of Arrival):
12 Sep 2025
Es la fecha estimada de llegada del buque a su puerto de destino. 
Sirve para estimar cuándo la mercancía estará disponible en el punto de descarga.

- ATD (Actual Time of Departure):
2025-09-12
Representa la fecha real de salida del buque.
Aunque ya hay una fecha registrada, el estado general sigue indicando “Ship not sailed”, lo cual podría significar que el sistema aún no ha sido actualizado de forma confirmada o que la información está pendiente de validación.

### Bloque 3 – Actualización de ETA

En la parte superior derecha del panel se encuentra un botón pequeño y oscuro con el texto:
“UPDATE ETA”
Este botón permite actualizar la fecha estimada de arribo (ETA) en caso de cambios operativos, retrasos o reprogramaciones del itinerario.
En sistemas logísticos, esta función es crucial porque las fechas de llegada pueden variar por condiciones climáticas, congestión portuaria o cambios de ruta.

### Sección inferior – Linked References (Referencias vinculadas)

Debajo de los tres bloques principales hay una tabla que muestra las referencias relacionadas o vinculadas con este embarque.
Esto permite mantener una trazabilidad entre diferentes registros o documentos del sistema que pertenecen al mismo envío.

La tabla contiene tres columnas principales:

1. Reference # – Número único de referencia asociado al embarque.
En este caso, el valor mostrado es MXEM25-0029, el mismo que aparece en la cabecera principal.

2. Created at – Fecha y hora en que se creó la referencia en el sistema.
Aquí se indica: 2 Oct 2025 5:52 PM.
Es decir, el registro se generó pocos minutos antes de la última actualización del estado.

3. Actions – Columna reservada para posibles botones o enlaces de acción (editar, eliminar, ver detalles, etc.).
En la captura, esta columna está vacía, lo que sugiere que no hay acciones disponibles o que solo se muestran dinámicamente al pasar el cursor.

### Aspectos visuales

- Tema oscuro: el fondo general es negro o gris muy oscuro, típico de un modo nocturno o profesional.

- Los paneles principales están en azul claro, lo que crea contraste con el fondo y resalta la información clave.

- Los botones utilizan una codificación por color:

   - Azul: acciones confirmativas (como Mark as Sailed o Update ETA).

   - Rojo: alertas de estado negativo (Ship not sailed).

- La tipografía es clara y legible, con diferentes pesos (negritas para títulos, texto regular para valores).

- Los bordes y separaciones naranjas ayudan a distinguir secciones dentro del mismo bloque (por ejemplo, el recuadro donde aparece el mensaje “Last updated…”).

### Flujo operativo esperado en esta pantalla

1. El usuario consulta la referencia de exportación (#MXEM25-0029).

2. El sistema muestra los datos actuales del embarque: línea, buque, puerto de carga, ETA y ATD.

3. Si el barco aún no ha salido, el estado aparece como “Ship not sailed”.

4. Cuando el barco zarpa, el usuario responsable debe:

   - Confirmar el evento presionando el botón “Mark as Sailed”.

   - Esto cambiará el estado visual y actualizará la trazabilidad del embarque.

5. Si se recibe una actualización en la fecha estimada de arribo, el usuario puede hacer clic en “Update ETA” para ajustar la información.

6. En todo momento, el sistema mantiene registro de:

- Quién realizó la última modificación.

- Cuándo se hizo.

- Qué referencia está vinculada.

### Interpretación operativa

Esta pantalla es fundamental para el seguimiento del ciclo logístico marítimo, ya que el estado de zarpe del buque (Ship Sail Status) marca un punto de control clave en la cadena documental y operativa:

- Determina el momento en que la carga deja oficialmente el puerto de origen.

- Permite liberar documentos posteriores (como el Bill of Lading o los documentos de destino).

- Facilita la coordinación entre las áreas de operaciones, documentación y tráfico internacional.

- Ayuda al cliente o al agente a prever fechas de llegada, costos y disponibilidad de mercancía.

| Elemento                            | Descripción                                                               |
| ----------------------------------- | ------------------------------------------------------------------------- |
| **Módulo**                          | Ship Sail Status – Sea Export                                             |
| **Propósito**                       | Registrar y monitorear el estado de salida del buque asignado al embarque |
| **Referencia**                      | MXEM25-0029                                                               |
| **Línea naviera**                   | COSCO Shipping Lines                                                      |
| **Buque**                           | KOTA EMERALD                                                              |
| **Puerto de carga (POL)**           | Manzanillo, México                                                        |
| **ETA (Fecha estimada de llegada)** | 12 de septiembre de 2025                                                  |
| **ATD (Fecha real de salida)**      | 12 de septiembre de 2025                                                  |
| **Estado actual**                   | Ship not sailed                                                           |
| **Última actualización por**        | Edgar Rodríguez – 2 de octubre de 2025, 6:15 PM                           |
| **Acciones disponibles**            | Mark as Sailed / Update ETA                                               |
| **Referencias vinculadas**          | MXEM25-0029 (creada el 2 Oct 2025, 5:52 PM)                               |


### Sea Export Information – Alerts Module

El módulo Alerts Module forma parte del sistema de gestión de exportaciones marítimas y su propósito es centralizar y controlar el envío de notificaciones o alertas relacionadas con los documentos de embarque (Bill of Lading, BL). 
Esta sección permite a los usuarios enviar, registrar y dar seguimiento a los diferentes tipos de alertas emitidas durante el proceso logístico, asegurando una comunicación fluida entre las partes involucradas en la exportación.

### Objetivo general del módulo

El objetivo principal del módulo de alertas es mantener un registro claro, ordenado y verificable de las notificaciones enviadas en cada etapa del proceso de exportación. 
Esto garantiza la trazabilidad de la información y permite verificar qué usuario realizó el envío, a qué destinatarios se enviaron los correos electrónicos y en qué fecha ocurrió cada acción.

### Secciones principales del módulo

El módulo está dividido visualmente en tres bloques de registros (logs) y una columna lateral con acciones y configuraciones específicas para el envío de alertas y la carga de archivos.

1. Draft BL Logs

Esta sección recopila el historial de alertas correspondientes al Draft Bill of Lading (borrador del conocimiento de embarque).
Aquí se muestran los registros de todos los envíos realizados, indicando los siguientes datos:

- Sent date: fecha en que fue enviada la alerta del borrador del BL.

- Email(s): direcciones de correo electrónico a las que se envió la notificación.

- User: usuario responsable del envío dentro del sistema.

Cuando no se han generado envíos aún, aparece el mensaje “No data”, indicando que no hay registros disponibles.

Este bloque permite controlar el momento en que se compartió el borrador del BL con los clientes o agentes, lo que es fundamental para confirmar los datos antes de emitir el documento final.

2. First Pre-Alert Logs

El segundo bloque corresponde a las alertas de primer pre-alerta.
Estas notificaciones suelen enviarse una vez que el BL ha sido revisado y se dispone de información preliminar del embarque, como fechas estimadas, buque, número de contenedor o detalles logísticos.

En esta sección también se registran:

- La fecha de envío.

- Los correos electrónicos destinatarios.

- El usuario que realizó el envío.

De igual forma, si aún no existen registros, el sistema muestra “No data”.

Este registro es esencial para monitorear la comunicación anticipada con clientes o agentes antes del envío final del BL, evitando retrasos o malentendidos en la documentación.

3. Final Pre-Alert Logs

El tercer bloque documenta las alertas de pre-alerta final.
Este tipo de notificación se emite cuando todos los documentos están listos y la información final del embarque ha sido confirmada.
Al igual que las secciones anteriores, presenta las mismas columnas:

- Fecha del envío.

- Correos electrónicos involucrados.

- Usuario responsable.

La presencia de estos registros permite garantizar que todos los actores de la cadena logística (clientes, agentes, aduanas, etc.) hayan sido debidamente notificados del estado final del embarque antes de su salida o llegada.

### Columna lateral: Acciones y configuraciones

En el panel lateral derecho se agrupan las acciones disponibles y la configuración de archivos adjuntos para el envío de las alertas.

1. BL Type

La interfaz muestra el tipo de BL activo en el caso, que en este ejemplo es House BL.
Este indicador ayuda a distinguir si el registro corresponde a un Master BL (MBL) o a un House BL (HBL), evitando confusiones entre los distintos niveles del documento.

2. Available Actions

Bajo este encabezado se encuentran tres botones principales de acción, los cuales permiten enviar los distintos tipos de alertas según la etapa del proceso:

- SEND DRAFT BL: envía la alerta con el borrador del Bill of Lading.

- SEND PRE-ALERT: envía la primera pre-alerta con información inicial del embarque.

- SEND FINAL ALERT: envía la alerta final, que contiene los documentos definitivos del envío.

Estos botones están resaltados en color azul brillante, indicando su disponibilidad inmediata para el usuario autorizado. 
Cada acción genera un registro en las tablas correspondientes (logs), actualizando la trazabilidad del proceso.

3. Setup Final BL Attachments

Esta sección permite configurar los archivos adjuntos que acompañarán la alerta final, asegurando que los documentos oficiales estén listos y correctamente vinculados al embarque.
La tabla está compuesta por tres columnas:

- Master BL #: número del Master Bill of Lading principal.

- Attachment: documento adjunto asociado (por ejemplo, un archivo PDF del conocimiento de embarque).

- Actions: opciones para agregar, eliminar o actualizar el archivo.

### Ejemplo en la interfaz:

- Para el Master BL con número COSU6428504760, ya existe un documento adjunto cargado identificado como COSU6428504760_CF.PDF.

- Para el House BL con número TMUL1000292025, el sistema muestra el estado “Pending final BL attachment”, lo que indica que aún no se ha subido el archivo correspondiente.

A la derecha de cada fila se incluye un botón con el ícono de clip para añadir un archivo adjunto, seguido de un botón azul UPLOAD FILE, mediante el cual el usuario puede cargar el documento directamente al sistema.

### Función general del módulo

Este módulo de alertas ofrece una visión integral del estado de comunicación documental dentro del flujo de exportación marítima.

Permite:

- Controlar los momentos en que se envían las diferentes etapas del BL.

- Asegurar que cada documento tenga su respaldo y archivo correspondiente.

- Identificar qué usuario realizó cada acción.

- Mantener trazabilidad y transparencia en el proceso.

Es una herramienta diseñada para profesionalizar la gestión documental y de comunicación dentro de las operaciones de exportación marítima, garantizando precisión, seguimiento y control en todo momento.

### Detentions – Detentions Control

El módulo Detentions Control forma parte del sistema de gestión de exportaciones marítimas y está diseñado para monitorear, registrar y controlar los cargos generados por demoras en la devolución de contenedores marítimos.

Estas demoras, comúnmente conocidas como detentions, representan costos adicionales tanto para la línea naviera como para el cliente, por lo que su control oportuno es esencial para evitar pérdidas económicas o discrepancias contables.

### Propósito del módulo

El propósito del módulo de Detentions Control es ofrecer una vista clara del estado actual de cada contenedor en cuanto a días de demora y montos generados, facilitando la gestión y seguimiento de estos cargos.

Además, sirve como registro histórico de los contenedores involucrados en operaciones de exportación o importación, asegurando transparencia y trazabilidad de la información.

### Funcionamiento general

El sistema permite registrar los datos de contenedores que han excedido su tiempo de estadía permitido (free days) bajo la custodia del cliente. 
Una vez que se determina el monto correspondiente a la demora (detention), el sistema bloquea la posibilidad de editar o alterar el registro para preservar la integridad de la información contable.

El encabezado de la interfaz incluye la indicación:

“Once a container delay amount is recorded it can no longer be modified.”

Esto significa que, una vez asignado un monto de detención a un contenedor, el registro queda bloqueado y solo puede ser consultado, no editado. 
Esta medida busca garantizar la exactitud y confiabilidad de los valores reportados.

### Sección: Pending (Pendientes)

Dentro del módulo se encuentra la categoría Pending, donde se listan los contenedores que tienen detenciones registradas o que se encuentran bajo observación pero aún no han generado cargos definitivos.

Cada registro de contenedor muestra información clave, distribuida en columnas o campos:

1. Container Number

Identifica el número único del contenedor.
En este ejemplo se muestra:
FTAU1895699
Este código alfanumérico permite rastrear el contenedor dentro del sistema logístico, así como relacionarlo con su embarque y cliente correspondiente.

2. Container Type

Indica el tipo y tamaño del contenedor.
En este caso:
20DC, que corresponde a un contenedor Dry Container de 20 pies, el tipo estándar más común en transporte marítimo.
Este dato es relevante porque los tiempos libres y tarifas de detención pueden variar dependiendo del tipo de contenedor (20’, 40’, refrigerado, open top, etc.).

3. Days Passed

Este campo refleja el número de días transcurridos desde que el contenedor superó su periodo libre (free days).
En el ejemplo mostrado, el valor es 0, lo que significa que el contenedor aún se encuentra dentro del periodo libre o que la demora apenas está siendo registrada.
Este indicador se actualiza de forma dinámica conforme pasan los días y sirve para calcular los montos de detención acumulados.

4. Line Amount

El campo Line Amount muestra el monto determinado por la línea naviera como cargo por los días de demora del contenedor.
En este ejemplo, el valor es 0, indicando que todavía no se ha generado un costo por parte de la línea o que la información está pendiente de confirmación.

Este monto puede variar según la política tarifaria de la naviera, la ubicación del contenedor, y el número de días que exceda el plazo libre. Normalmente se calcula multiplicando los días de demora por una tarifa diaria establecida.

5. Customer Amount

El campo Customer Amount refleja el monto que será cobrado o transferido al cliente, en caso de que la responsabilidad de la demora recaiga sobre él.
En el ejemplo, el valor es también 0, lo cual puede indicar que el contenedor aún no ha incurrido en cargos o que el cálculo está pendiente de aprobación interna.

La diferencia entre el Line Amount y el Customer Amount puede existir en algunos casos debido a acuerdos comerciales, descuentos o ajustes internos realizados por la empresa operadora.

Control y trazabilidad

Una de las principales características del módulo es que los registros no son modificables una vez ingresado el monto de detención. 
Esta restricción cumple dos funciones críticas:

1. Evitar alteraciones indebidas o errores contables, garantizando la fiabilidad de los datos registrados.

2. Conservar la trazabilidad del proceso, de modo que cualquier auditoría o revisión futura pueda verificar los valores originales sin riesgo de manipulación.

El sistema puede estar configurado para que únicamente usuarios con ciertos permisos administrativos puedan desbloquear o revisar estos registros, reforzando la seguridad del módulo.

### Importancia operativa

El módulo Detentions Control es esencial para la gestión financiera y logística del área marítima, ya que:

- Permite identificar a tiempo los contenedores que se encuentran en riesgo de generar costos por demora.

- Facilita la comunicación entre las áreas operativas, financieras y de atención al cliente.

- Ayuda a prevenir costos innecesarios y a mantener el flujo de retorno de contenedores en los plazos acordados.

- Sirve como base de control para conciliaciones con líneas navieras y clientes.

El módulo Detentions – Detentions Control ofrece una herramienta clara y estructurada para el seguimiento y control de cargos por demoras en contenedores.

Su diseño busca combinar simplicidad operativa con rigor administrativo, asegurando que los datos registrados sean precisos, verificables y trazables.

Gracias a su política de bloqueo tras el registro de montos, el sistema mantiene la integridad de la información y brinda confianza en los procesos contables y logísticos asociados a la exportación marítima.
