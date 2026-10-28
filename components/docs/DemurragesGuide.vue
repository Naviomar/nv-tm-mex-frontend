<template>
  <div>
    <v-tabs v-model="tab" color="primary" density="compact" class="border-b" show-arrows>
      <v-tab value="flow" prepend-icon="mdi-sitemap-outline">Cómo funciona</v-tab>
      <v-tab value="init" prepend-icon="mdi-calendar-start">Inicio de días libres</v-tab>
      <v-tab value="calc" prepend-icon="mdi-calculator-variant-outline">Cálculo</v-tab>
      <v-tab value="cut" prepend-icon="mdi-email-fast-outline">Corte al cliente</v-tab>
      <v-tab value="line" prepend-icon="mdi-ferry">Pago a la naviera</v-tab>
      <v-tab value="alerts" prepend-icon="mdi-bell-outline">Alertas y reportes</v-tab>
      <v-tab value="access" prepend-icon="mdi-key-chain-variant">Quién puede qué</v-tab>
    </v-tabs>

    <div class="pa-5">
      <v-window v-model="tab">
        <!-- ===== FLOW ===== -->
        <v-window-item value="flow">
          <div class="text-body-2 text-medium-emphasis mb-4">
            Las demoras son lo que la naviera cobra por tener el contenedor fuera de su patio más allá de los <strong>días libres</strong>.
            El sistema calcula, contenedor por contenedor, cuánto se le <strong>cobra al cliente</strong> y registra cuánto
            <strong>se le paga a la naviera</strong>. Solo aplica a <strong>Sea Import FCL</strong>.
          </div>

          <div class="lane mb-4">
            <div class="d-flex align-center gap-2 mb-3">
              <v-chip color="primary" size="small" variant="flat" prepend-icon="mdi-account-cash-outline">Venta (cliente)</v-chip>
              <span class="text-caption text-medium-emphasis">Desde la referencia de importación</span>
            </div>
            <div class="diagram-row">
              <FlowCard icon="mdi-ferry" color="primary" title="ATA del barco" subtitle="llegada confirmada" small />
              <FlowArrow />
              <FlowCard icon="mdi-calendar-start" color="warning" title="Día de inicio" subtitle="se registra por barco" highlight small />
              <FlowArrow label="arrancan los contenedores" />
              <FlowCard icon="mdi-calendar-check-outline" color="info" title="Fecha de retorno del vacío" small />
              <FlowArrow />
              <FlowCard icon="mdi-calculator-variant-outline" color="primary" title="Calcular" subtitle="Parcial o Total" small />
              <FlowArrow />
              <FlowCard icon="mdi-email-fast-outline" color="success" title="Enviar corte" subtitle="correo + PDF al cliente" small />
              <FlowArrow />
              <FlowCard icon="mdi-receipt-text-outline" color="success" title="Facturar" subtitle="conceptos de demoras" small />
            </div>
          </div>

          <div class="lane mb-4">
            <div class="d-flex align-center gap-2 mb-3">
              <v-chip color="teal" size="small" variant="flat" prepend-icon="mdi-cash-check">Costo (naviera)</v-chip>
              <span class="text-caption text-medium-emphasis">Desde Demurrage &amp; Detentions request payments</span>
            </div>
            <div class="diagram-row">
              <FlowCard icon="mdi-cash-edit" color="secondary" title="Monto de la naviera" subtitle="line cost por contenedor" small />
              <FlowArrow />
              <FlowCard icon="mdi-file-sign" color="purple" title="CFDI del proveedor" small />
              <FlowArrow />
              <FlowCard icon="mdi-cash-fast" color="warning" title="Solicitud de pago a la línea" small />
              <FlowArrow />
              <FlowCard icon="mdi-email-send-outline" color="success" title="Notificación a la naviera" small />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="note in notes" :key="note.title" class="screen-card">
              <v-icon :color="note.color" size="22">{{ note.icon }}</v-icon>
              <div>
                <div class="font-bold text-sm">{{ note.title }}</div>
                <div class="text-caption text-medium-emphasis">{{ note.text }}</div>
              </div>
            </div>
          </div>
        </v-window-item>

        <!-- ===== INIT ===== -->
        <v-window-item value="init">
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            <div class="font-bold">«Vessel / Voyage destination does not have demurrage init day»</div>
            <div class="text-body-2">
              Este aviso sale en la pantalla de demoras de una referencia cuando <strong>al destino del viaje (barco) no se le ha registrado el día de inicio</strong>.
              Mientras no exista, la referencia no puede calcular nada. No es un error de la referencia: se resuelve una sola vez por barco/destino
              y con eso se destraban <strong>todas</strong> las referencias de ese viaje.
            </div>
          </v-alert>

          <div class="text-subtitle-1 font-bold mb-2">Cómo registrar el día de inicio</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div v-for="step in initSteps" :key="step.title" class="rule-card">
              <div class="rule-card__head"><v-icon :color="step.color">{{ step.icon }}</v-icon><span>{{ step.title }}</span></div>
              <div class="text-body-2 text-medium-emphasis" v-html="step.text" />
            </div>
          </div>

          <div class="text-subtitle-1 font-bold mb-2">Qué pasa al registrarlo</div>
          <div class="text-body-2 text-medium-emphasis mb-3">
            Para cada referencia del destino que cumpla <strong>todo</strong> lo siguiente se crea la demora de cada contenedor
            (con fecha de inicio = día registrado y los días libres de la referencia). Las que no cumplen se quedan sin demoras y no hay aviso.
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div v-for="req in initRequirements" :key="req.label" class="screen-card">
              <v-icon :color="req.color" size="22">{{ req.icon }}</v-icon>
              <div>
                <div class="font-bold text-sm">{{ req.label }}</div>
                <div class="text-caption text-medium-emphasis">{{ req.text }}</div>
              </div>
            </div>
          </div>

          <v-alert type="info" variant="tonal" density="compact" class="mb-2">
            Un contenedor que ya tenía demoras no se toca. Y el día de inicio <strong>no se puede volver a registrar</strong> desde la pantalla
            («Ya se ha registrado el inicio de demoras»); si fue un error de captura hay que pedirlo a Sistemas.
          </v-alert>
          <v-alert type="warning" variant="tonal" density="compact">
            Una referencia que se asigna a un cliente <strong>después</strong> de registrado el día de inicio no recibe las demoras automáticamente
            (las referencias sin cliente se saltan). Si pasa, revisa con Sistemas.
          </v-alert>
        </v-window-item>

        <!-- ===== CALC ===== -->
        <v-window-item value="calc">
          <div class="text-body-2 text-medium-emphasis mb-4">
            Se hace en la pantalla de demoras de la referencia (<em>Demurrages &amp; Detentions → Search Import References → botón de demoras de la referencia</em>).
            Cada contenedor tiene su propia fila, con sus fechas, días libres y tarifas.
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div v-for="rule in calcRules" :key="rule.title" class="rule-card">
              <div class="rule-card__head"><v-icon :color="rule.color">{{ rule.icon }}</v-icon><span>{{ rule.title }}</span></div>
              <div class="text-body-2 text-medium-emphasis" v-html="rule.text" />
            </div>
          </div>

          <div class="lane mb-4">
            <div class="font-bold mb-2">Ejemplo</div>
            <div class="text-body-2">
              Inicio 1 de octubre, retorno del vacío 14 de octubre, 7 días libres, Rate 1 = $100, Rate 2 = $150.<br />
              Días totales = 14 (del 1 al 14, ambos incluidos) − 7 libres = <strong>7 días cobrables</strong>.<br />
              3 días × $100 + 4 días × $150 = <strong>$900</strong> + IVA 16% ($144) = <strong>$1,044 USD</strong>.
            </div>
          </div>

          <div class="text-subtitle-1 font-bold mb-2">Parcial vs Total</div>
          <v-table density="comfortable" class="mb-4">
            <thead><tr><th>Tipo</th><th>Cuándo usarlo</th></tr></thead>
            <tbody>
              <tr>
                <td class="font-bold">Parcial</td>
                <td>El contenedor aún no regresa vacío: se calcula «a hoy» como estimado. Se puede recalcular las veces necesarias.</td>
              </tr>
              <tr>
                <td class="font-bold">Total</td>
                <td>Ya tiene fecha real de retorno y el monto es el definitivo para cobrar.</td>
              </tr>
            </tbody>
          </v-table>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            Regresar un contenedor de <strong>Total</strong> a <strong>Parcial</strong> pide autorización (botón «Request authorization to return to partial»).
            Quien tenga el permiso <code>maritime-demurrages-bypass-revert-authorization</code> no la necesita.
          </v-alert>

          <div class="text-subtitle-1 font-bold mb-2">Qué ajusta los montos</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="item in adjustments" :key="item.label" class="screen-card">
              <v-icon :color="item.color" size="22">{{ item.icon }}</v-icon>
              <div>
                <div class="font-bold text-sm">{{ item.label }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.text }}</div>
              </div>
            </div>
          </div>
        </v-window-item>

        <!-- ===== CUT ===== -->
        <v-window-item value="cut">
          <div class="text-body-2 text-medium-emphasis mb-4">
            El <strong>corte</strong> es el correo con PDF que le informa al cliente cuánto debe de demoras al momento. Cada vez que se envía queda un registro por contenedor.
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div v-for="step in cutSteps" :key="step.title" class="rule-card">
              <div class="rule-card__head"><v-icon :color="step.color">{{ step.icon }}</v-icon><span>{{ step.title }}</span></div>
              <div class="text-body-2 text-medium-emphasis" v-html="step.text" />
            </div>
          </div>
          <div class="text-subtitle-1 font-bold mb-2">Estado del corte por contenedor</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div v-for="s in cutStates" :key="s.label" class="screen-card">
              <v-icon :color="s.color" size="22">{{ s.icon }}</v-icon>
              <div>
                <div class="font-bold text-sm">{{ s.label }}</div>
                <div class="text-caption text-medium-emphasis">{{ s.text }}</div>
              </div>
            </div>
          </div>
        </v-window-item>

        <!-- ===== LINE ===== -->
        <v-window-item value="line">
          <div class="text-body-2 text-medium-emphasis mb-4">
            Lo que se le <strong>paga a la naviera</strong> es independiente de lo que se le cobra al cliente.
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div v-for="step in lineSteps" :key="step.title" class="rule-card">
              <div class="rule-card__head"><v-icon :color="step.color">{{ step.icon }}</v-icon><span>{{ step.title }}</span></div>
              <div class="text-body-2 text-medium-emphasis" v-html="step.text" />
            </div>
          </div>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-2">
            Los conceptos «Pago demoras linea naviera» / «Pago detenciones linea naviera» <strong>no se desglosan</strong> como conceptos de proveedor:
            el costo ya cuenta en el profit desde el monto de la naviera, y desglosarlo lo restaría dos veces y habilitaría un segundo pago.
          </v-alert>
          <v-alert type="info" variant="tonal" density="compact">
            Las solicitudes y facturas de la línea también se ven dentro de la referencia marítima, en la sección de pagos a la línea
            (requiere <code>line-dem-det-payments-view</code>).
          </v-alert>
        </v-window-item>

        <!-- ===== ALERTS ===== -->
        <v-window-item value="alerts">
          <div class="text-subtitle-1 font-bold mb-2">Correos automáticos (diarios, hora de Ciudad de México)</div>
          <v-table density="comfortable" class="mb-4">
            <thead><tr><th>Hora</th><th>Qué avisa</th><th>A quién</th></tr></thead>
            <tbody>
              <tr v-for="a in alertRows" :key="a.hour">
                <td class="font-bold text-no-wrap">{{ a.hour }}</td>
                <td>{{ a.text }}</td>
                <td>{{ a.to }}</td>
              </tr>
            </tbody>
          </v-table>
          <div class="text-caption text-medium-emphasis mb-4">
            Los avisos al cliente usan los correos TO/CC del catálogo de notificaciones del cliente. Si no hay correos configurados, no se envía y queda en el log del servidor.
          </div>

          <div class="text-subtitle-1 font-bold mb-2">Reportes y consulta</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="r in reportItems" :key="r.label" class="screen-card">
              <v-icon :color="r.color" size="22">{{ r.icon }}</v-icon>
              <div>
                <div class="font-bold text-sm">{{ r.label }}</div>
                <div class="text-caption text-medium-emphasis">{{ r.text }}</div>
              </div>
            </div>
          </div>
        </v-window-item>

        <!-- ===== ACCESS ===== -->
        <v-window-item value="access">
          <v-table density="comfortable">
            <thead><tr><th>Permiso</th><th>Qué permite</th></tr></thead>
            <tbody>
              <tr v-for="p in permissionRows" :key="p.key">
                <td class="text-no-wrap"><code>{{ p.key }}</code></td>
                <td>{{ p.text }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-alert type="info" variant="tonal" density="compact" class="mt-4">
            Si una pantalla o botón no te aparece, te falta el permiso. Pídelo a tu administrador (Roles y permisos).
          </v-alert>
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
const tab = ref('flow')
const pageDocs = usePageDocs()

// Links elsewhere in the module open this guide on a given tab.
watch(
  () => pageDocs.request.value,
  (req) => {
    if (req?.id !== 'demurrages') return
    tab.value = req.tab ?? 'flow'
    pageDocs.request.value = null
  },
  { immediate: true },
)

const notes = [
  { icon: 'mdi-account-check-outline', color: 'primary', title: 'Solo referencias con cliente', text: 'Una referencia sin cliente (pendiente) no tiene días libres ni demoras, y todas las acciones de demoras están bloqueadas hasta asignarlo.' },
  { icon: 'mdi-cash-sync', color: 'warning', title: 'Cada cálculo actualiza los cargos', text: 'Al calcular se crea o ajusta el concepto de demoras de la referencia (moneda USD). Si ya se facturó, solo se agrega la diferencia.' },
  { icon: 'mdi-history', color: 'secondary', title: 'Todo queda en bitácora', text: 'Fechas, cálculos, descuentos, días libres, tarifas y cortes se registran por contenedor con usuario y fecha.' },
  { icon: 'mdi-truck-delivery-outline', color: 'info', title: 'Retorno del vacío en tracking', text: 'Al guardar la fecha de retorno se genera el movimiento «Empty Container» en el tracking de la referencia.' },
]

const initSteps = [
  { icon: 'mdi-calendar-search', color: 'primary', title: '1. Confirma el ATA', text: 'El destino del viaje debe tener <strong>ATA</strong> (fecha de llegada). Sin ATA no se puede registrar el inicio. Se captura en Configuration → Voyages → destino.' },
  { icon: 'mdi-magnify', color: 'primary', title: '2. Busca el barco', text: 'Abre <code>/maritime/import/demurrages/register-day</code> («Search vessels (destinations)»). Filtra por ATA y busca el barco/destino en la lista; ahí se ven línea, barco, ATA, # de referencias y # de contenedores.' },
  { icon: 'mdi-calendar-plus', color: 'warning', title: '3. Registra el día', text: 'Si el destino aún no tiene día de inicio y tiene ATA, aparece <strong>Register init day</strong>. Captura la fecha (normalmente el día que corren los días libres con la naviera) y pulsa Register. Requiere el permiso <code>demurrages-free-days-init</code>.' },
  { icon: 'mdi-check-decagram', color: 'success', title: '4. Verifica', text: 'En esa misma pantalla, los contenedores pasan de rojo a verde «demurrages set». Regresa a la referencia: ya debe cargar el cálculo.' },
]

const initRequirements = [
  { icon: 'mdi-account-outline', color: 'primary', label: 'Tiene cliente', text: 'Sin cliente no hay días libres: se inicializa cuando se asigne.' },
  { icon: 'mdi-package-variant-closed', color: 'primary', label: 'Carga FCL', text: 'LCL u otros tipos no generan demoras.' },
  { icon: 'mdi-file-document-check-outline', color: 'warning', label: 'MBL con «Init demurrages?» activo', text: 'En el catálogo de Consignee MBL debe estar activo. En la pantalla de registro el MBL se ve azul si aplica y rojo si no.' },
  { icon: 'mdi-ferry', color: 'info', label: 'Ligada al destino', text: 'La referencia debe tener ese destino de viaje como Voyage discharge.' },
]

const calcRules = [
  { icon: 'mdi-calendar-range', color: 'primary', title: 'Días cobrables', text: 'Días entre inicio y retorno del vacío <strong>contando ambos</strong>, menos los días libres. Nunca baja de 0. Sin fecha de retorno se toma hoy.' },
  { icon: 'mdi-numeric-3-box-outline', color: 'primary', title: 'Dos tarifas', text: 'Los <strong>primeros 3 días cobrables</strong> van a Rate 1 y del cuarto en adelante a Rate 2. Tarifas en USD por día.' },
  { icon: 'mdi-gift-open-outline', color: 'success', title: 'Días libres', text: 'Vienen de la configuración del cliente (por región si existe, si no el valor global del cliente). Pueden cambiarse por referencia o solo por contenedores seleccionados.' },
  { icon: 'mdi-percent-outline', color: 'warning', title: 'IVA', text: 'Casilla «+ IVA»: suma 16% al monto. Desmárcala si las demoras no llevan IVA.' },
]

const adjustments = [
  { icon: 'mdi-table-large', color: 'primary', label: 'Tarifas del catálogo', text: 'Configuration → Container DnD Rates: tarifa por línea, tipo de contenedor y rango de vigencia. Se toma la vigente a la fecha de inicio del contenedor. Si no hay tarifa cargada, se usa 185 por defecto: revísalo.' },
  { icon: 'mdi-swap-horizontal-bold', color: 'warning', label: 'Override de tarifas', text: 'Tarifa especial solo para esa referencia con vigencia (sin traslapes). Gana sobre el catálogo; un Rate vacío usa el del catálogo. Requiere permisos demurrages-rate-override-*.' },
  { icon: 'mdi-pencil-lock-outline', color: 'secondary', label: 'Edición manual de Rate 1/2', text: 'Los campos son de solo lectura sin el permiso demurrages-sell-update-rates.' },
  { icon: 'mdi-sale-outline', color: 'error', label: 'Descuento', text: 'Se solicita con «Request a discount» (monto máx. $10,000 o % máx. 99, con motivo) y pasa por autorización. Al aprobarse queda pendiente; se aplica en el siguiente cálculo marcando «Apply available discount». Solo uno pendiente a la vez. El monto se reparte entre los contenedores calculados.' },
]

const cutSteps = [
  { icon: 'mdi-calculator-variant-outline', color: 'primary', title: '1. Calcular', text: 'Solo contenedores con demoras calculadas pueden ir en un corte.' },
  { icon: 'mdi-eye-outline', color: 'info', title: '2. Vista previa', text: 'Botón de preview: muestra asunto, destinatarios, cuerpo y el PDF antes de enviar.' },
  { icon: 'mdi-email-fast-outline', color: 'success', title: '3. Send cut', text: 'Elige los contenedores y escribe correos adicionales. Van como TO los que captures, tu correo y los TO del catálogo del cliente; CC los del catálogo. Requiere permiso <code>demurrages-cut-totalize</code>.' },
  { icon: 'mdi-history', color: 'secondary', title: '4. Historial', text: 'El historial muestra cada envío con fecha, usuario, destinatarios y contenedores.' },
  { icon: 'mdi-alert-circle-outline', color: 'warning', title: 'Bloqueos', text: 'No se envía si la referencia no tiene destino de viaje, ATA confirmado o día de inicio registrado.' },
  { icon: 'mdi-note-edit-outline', color: 'secondary', title: 'Notas', text: '«Demurrage Notes» deja comentarios internos de la referencia (fecha, usuario, texto).' },
]

const cutStates = [
  { icon: 'mdi-send-clock-outline', color: 'warning', label: 'Pending', text: 'Nunca se ha enviado corte de este contenedor.' },
  { icon: 'mdi-send-alert-outline', color: 'error', label: 'Outdated', text: 'Cambió (fechas, tarifas, monto) después del último corte: conviene reenviar.' },
  { icon: 'mdi-check', color: 'success', label: 'Sent', text: 'El último corte enviado coincide con lo calculado.' },
]

const lineSteps = [
  { icon: 'mdi-cash-edit', color: 'secondary', title: '1. Monto de la naviera', text: 'En la pantalla de demoras de la referencia, sección de pago a la línea, captura por contenedor el <strong>costo de la naviera</strong> y si lleva IVA.' },
  { icon: 'mdi-file-sign', color: 'purple', title: '2. CFDI del proveedor', text: 'Se captura con «Add new supplier CFDI» (tipo Ingreso). Puede pre-asignarse a contenedores con adeudo a la línea; el monto de cada contenedor no puede exceder lo pendiente ni el total del CFDI, y moneda igual.' },
  { icon: 'mdi-cash-fast', color: 'warning', title: '3. Solicitud de pago', text: 'En <em>Demurrage &amp; Detentions request payments → Request demurrages payment</em> busca por referencia/contenedor, elige línea, tipo de factura y correos de notificación. Se genera una solicitud con folio.' },
  { icon: 'mdi-link-variant', color: 'info', title: '4. Vincular facturas', text: 'En el detalle de la solicitud liga el CFDI del proveedor (por folio) a sus contenedores. También puedes editar banco destino/origen, adjuntos y notas.' },
  { icon: 'mdi-email-send-outline', color: 'success', title: '5. Notify to pay', text: 'Con CFDI ligado, «Send notification to pay» envía el correo a la naviera, crea la factura de la solicitud y los pagos de los CFDI. Solo se puede hacer una vez por solicitud.' },
  { icon: 'mdi-close-octagon-outline', color: 'error', title: 'Cancelar', text: 'Cancelar la solicitud pasa por autorización y libera los contenedores.' },
]

const alertRows = [
  { hour: '7:00', text: 'Contenedores sin fecha de retorno del vacío a 4 días de agotar sus días libres.', to: 'Cliente (TO/CC del catálogo)' },
  { hour: '7:10', text: 'Mismo caso, resumen interno de referencias a 4 días de generar demoras.', to: 'Equipo interno (Impo/Doc)' },
  { hour: '7:20', text: 'Referencias con demoras en Parcial que ya están generando costo (días libres vencidos).', to: 'Equipo interno (Impo/Doc)' },
]

const reportItems = [
  { icon: 'mdi-magnify', color: 'primary', label: 'Search Import References', text: 'Lista de referencias con filtros (cliente, naviera, barco, contenedor, ETA, «Demurrages generated», estado de factura). Muestra estado de corte por contenedor.' },
  { icon: 'mdi-chart-bell-curve', color: 'lime', label: 'Demurrage Reports → Estatus', text: 'Reporte de estatus por grupo de clientes, estatus y rango de fechas.' },
  { icon: 'mdi-file-chart-outline', color: 'teal', label: 'Reporte demoras TM1 + TM2', text: 'Reports → Demurrage Detention. Cada ejecutivo ve lo suyo y de su equipo; los totales y lo ganado dependen de permisos.' },
  { icon: 'mdi-microsoft-excel', color: 'success', label: 'Excel por barco', text: 'En Search vessels, «Export details» baja el Excel de referencias y contenedores de ese destino.' },
]

const permissionRows = [
  { key: 'menu-maritime-import-demurrages-search', text: 'Ver Search Import References en el menú y entrar a la pantalla.' },
  { key: 'demurrages-free-days-init', text: 'Registrar el día de inicio por barco, cambiar y sincronizar días libres de la referencia.' },
  { key: 'demurrages-sell-update-rates', text: 'Modificar manualmente Rate 1 / Rate 2 en el cálculo.' },
  { key: 'demurrages-rate-override-view / create / edit / delete', text: 'Ver y administrar el override de tarifas por referencia.' },
  { key: 'demurrages-cut-totalize', text: 'Preview, PDF y envío del corte al cliente.' },
  { key: 'maritime-demurrages-bypass-revert-authorization', text: 'Regresar de Total a Parcial sin pedir autorización.' },
  { key: 'container-delay-rates-*', text: 'Ver y editar el catálogo Container DnD Rates.' },
  { key: 'maritime-demurrages-index / view / create / edit', text: 'Solicitudes de pago a la naviera: listado, detalle, crearlas y editarlas.' },
  { key: 'line-dem-det-payments-view', text: 'Ver pagos a la línea dentro de la referencia.' },
  { key: 'menu-maritime-import-demurrages-reports', text: 'Entrar a Demurrage Reports.' },
  { key: 'reports-demurrage-detention-view', text: 'Reporte de demoras TM1 + TM2.' },
]
</script>

<style scoped>
.lane {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  padding: 14px 16px;
  overflow-x: auto;
}
.diagram-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.screen-card {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 10px;
  padding: 10px 12px;
}
.rule-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 12px;
  padding: 14px 16px;
}
.rule-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  margin-bottom: 8px;
}
</style>
