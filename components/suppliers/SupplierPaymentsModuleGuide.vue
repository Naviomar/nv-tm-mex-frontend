<template>
  <div>
      <v-tabs v-model="tab" color="primary" density="compact" class="border-b">
        <v-tab value="flow" prepend-icon="mdi-sitemap-outline">Flujo</v-tab>
        <v-tab value="rules" prepend-icon="mdi-scale-balance">Reglas de negocio</v-tab>
        <v-tab value="status" prepend-icon="mdi-traffic-light-outline">Estados</v-tab>
      </v-tabs>

      <div class="pa-5">
        <v-window v-model="tab">
          <!-- ===== FLOW ===== -->
          <v-window-item value="flow">
            <div v-for="lane in lanes" :key="lane.title" class="lane mb-4">
              <div class="flex items-center gap-2 mb-3">
                <v-chip :color="lane.color" size="small" variant="flat" :prepend-icon="lane.icon">{{ lane.title }}</v-chip>
                <span class="text-caption text-medium-emphasis">{{ lane.subtitle }}</span>
              </div>
              <div class="diagram-row">
                <template v-for="(step, i) in lane.steps" :key="step.title">
                  <FlowCard :icon="step.icon" :color="step.color || lane.color" :title="step.title" :subtitle="step.subtitle" :highlight="step.highlight" />
                  <FlowArrow v-if="i < lane.steps.length - 1" :label="step.arrow" />
                </template>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div v-for="screen in screens" :key="screen.title" class="screen-card">
                <v-icon :color="screen.color" size="22">{{ screen.icon }}</v-icon>
                <div>
                  <div class="font-bold text-sm">{{ screen.title }}</div>
                  <div class="text-caption text-medium-emphasis">{{ screen.text }}</div>
                </div>
              </div>
            </div>
          </v-window-item>

          <!-- ===== RULES ===== -->
          <v-window-item value="rules">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Concept shown in the request -->
              <div class="rule-card md:col-span-2">
                <div class="rule-card__head">
                  <v-icon color="primary">mdi-label-outline</v-icon>
                  <span>¿Qué concepto sale en la solicitud?</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="example example--sell">
                    <div class="example__title"><v-icon size="16">mdi-tag-outline</v-icon> Ligado a venta (sell rate / cargo)</div>
                    <div class="diagram-row">
                      <FlowCard icon="mdi-truck-delivery-outline" color="grey" title="COORD. TERR." subtitle="concepto del proveedor" small />
                      <FlowArrow label="liga a" />
                      <FlowCard icon="mdi-tag" color="primary" title="DEST INLAND" subtitle="venta" small />
                      <FlowArrow label="en solicitud" />
                      <FlowCard icon="mdi-file-document-check-outline" color="success" title="DEST INLAND" small highlight />
                    </div>
                  </div>
                  <div class="example example--ff">
                    <div class="example__title"><v-icon size="16">mdi-note-text-outline</v-icon> Ligado a costo de FF Note</div>
                    <div class="diagram-row">
                      <FlowCard icon="mdi-truck-delivery-outline" color="orange-darken-2" title="COORD. TERR." subtitle="concepto del proveedor" small />
                      <FlowArrow label="liga a" />
                      <FlowCard icon="mdi-note-text" color="grey" title="HANDLING" subtitle="FF Note" small />
                      <FlowArrow label="en solicitud" />
                      <FlowCard icon="mdi-file-document-check-outline" color="success" title="COORD. TERR." small highlight />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Exchange rate -->
              <div class="rule-card">
                <div class="rule-card__head">
                  <v-icon color="blue-grey">mdi-swap-horizontal</v-icon>
                  <span>Tipo de cambio</span>
                </div>
                <div class="diagram-row">
                  <FlowCard icon="mdi-calendar" color="blue-grey" title="Fecha del CFDI" subtitle="TC Banxico" small />
                  <FlowArrow label="=" />
                  <FlowCard icon="mdi-chart-line" color="success" title="Profit en USD" subtitle="de la referencia" small highlight />
                </div>
                <div class="hint-list">
                  <div><v-icon size="14" color="success">mdi-check</v-icon> Captura y liga muestran USD al TC de la fecha del CFDI.</div>
                  <div><v-icon size="14" color="warning">mdi-information-outline</v-icon> La solicitud usa su propio TC (día de creación, editable antes de pagar).</div>
                </div>
              </div>

              <!-- Split by container -->
              <div class="rule-card">
                <div class="rule-card__head">
                  <v-icon color="indigo">mdi-train-car-container</v-icon>
                  <span>Dividir la liga por contenedor</span>
                </div>
                <div class="diagram-row">
                  <FlowCard icon="mdi-tag" color="primary" title="USD 3,800" subtitle="venta · 2 contenedores" small />
                  <FlowArrow label="÷ 2" />
                  <FlowCard icon="mdi-link-variant" color="indigo" title="USD 1,900" subtitle="por cada factura" small highlight />
                </div>
                <div class="hint-list">
                  <div><v-icon size="14" color="indigo">mdi-call-split</v-icon> Botón "Per container" o "Take k of n" en el modal de liga.</div>
                </div>
              </div>

              <!-- Amount per reference -->
              <div class="rule-card">
                <div class="rule-card__head">
                  <v-icon color="teal">mdi-calculator-variant-outline</v-icon>
                  <span>Monto por referencia</span>
                </div>
                <div class="diagram-row">
                  <FlowCard icon="mdi-cash" color="teal" title="$1,000 + IVA" subtitle="por referencia" small />
                  <FlowArrow label="× 3 refs" />
                  <FlowCard icon="mdi-sigma" color="teal" title="$3,480" subtitle="se descuenta del CFDI" small highlight />
                </div>
                <div class="hint-list">
                  <div><v-icon size="14">mdi-percent</v-icon> IVA 16% · Ret. ISR 10% · Ret. IVA %</div>
                  <div><v-icon size="14">mdi-lock-outline</v-icon> No se puede desglosar más que el disponible del CFDI.</div>
                </div>
              </div>

              <!-- One request -->
              <div class="rule-card">
                <div class="rule-card__head">
                  <v-icon color="amber-darken-2">mdi-file-document-multiple-outline</v-icon>
                  <span>Una solicitud = 1 proveedor + 1 moneda</span>
                </div>
                <div class="diagram-row">
                  <FlowCard icon="mdi-invoice-text-plus" color="green" title="Ingreso (I)" subtitle="suma" small />
                  <FlowCard icon="mdi-invoice-text-minus" color="red" title="Egreso (E)" subtitle="resta" small />
                  <FlowCard icon="mdi-cash-refund" color="blue" title="Anticipos" subtitle="pagados, misma moneda" small />
                  <FlowArrow label="=" />
                  <FlowCard icon="mdi-cash-fast" color="amber-darken-2" title="Total a pagar" small highlight />
                </div>
              </div>

              <!-- Blockers -->
              <div class="rule-card md:col-span-2">
                <div class="rule-card__head">
                  <v-icon color="error">mdi-hand-back-left-outline</v-icon>
                  <span>Bloqueos</span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div v-for="block in blockers" :key="block.title" class="blocker">
                    <v-icon :color="block.color" size="20">{{ block.icon }}</v-icon>
                    <div>
                      <div class="text-sm font-bold">{{ block.title }}</div>
                      <div class="text-caption text-medium-emphasis">{{ block.text }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-window-item>

          <!-- ===== STATUS ===== -->
          <v-window-item value="status">
            <div class="text-subtitle-2 font-weight-bold mb-2">Pago de la factura (vista de la referencia)</div>
            <div class="diagram-row mb-6">
              <template v-for="(status, i) in paymentStatuses" :key="status">
                <SupplierPaymentStatusChip :status="status" />
                <FlowArrow v-if="i < paymentStatuses.length - 1" />
              </template>
            </div>

            <div class="text-subtitle-2 font-weight-bold mb-2">CFDI del proveedor</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div v-for="status in cfdiStatuses" :key="status.label" class="blocker">
                <v-chip size="small" :color="status.color" variant="tonal" :prepend-icon="status.icon">{{ status.label }}</v-chip>
                <div class="text-caption text-medium-emphasis">{{ status.text }}</div>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </div>
  </div>
</template>

<script setup lang="ts">
const tab = ref('flow')

const lanes = [
  {
    title: 'Con referencias',
    subtitle: 'el caso normal',
    color: 'primary',
    icon: 'mdi-link-variant',
    steps: [
      { icon: 'mdi-email-arrow-left-outline', title: 'CFDI recibido', subtitle: 'Factra / manual', arrow: 'configurar' },
      { icon: 'mdi-file-search-outline', title: 'Buscar referencias', subtitle: 'IM26-2932 2933 …', arrow: 'capturar' },
      { icon: 'mdi-cash-plus', title: 'Cargo por referencia', subtitle: 'monto + impuestos', arrow: 'ligar' },
      { icon: 'mdi-link-variant', title: 'Liga a venta', subtitle: 'sell rate / FF Note', arrow: 'solicitar' },
      { icon: 'mdi-file-document-check-outline', title: 'Solicitud de pago', subtitle: 'PR-…', arrow: 'pagar', color: 'amber-darken-2' },
      { icon: 'mdi-cash-check', title: 'Pagado', subtitle: 'tesorería', color: 'success', highlight: true },
    ],
  },
  {
    title: 'Formato libre',
    subtitle: 'sin desglose a referencias',
    color: 'deep-purple',
    icon: 'mdi-tag-outline',
    steps: [
      { icon: 'mdi-email-arrow-left-outline', title: 'CFDI recibido', arrow: 'marcar' },
      { icon: 'mdi-tag-outline', title: 'Formato libre', subtitle: 'requiere permiso', arrow: 'capturar' },
      { icon: 'mdi-note-edit-outline', title: 'Cargos + notas', subtitle: 'notas obligatorias', arrow: 'solicitar' },
      { icon: 'mdi-file-document-check-outline', title: 'Solicitud de pago', subtitle: 'toggle "Formato libre"', color: 'amber-darken-2', highlight: true },
    ],
  },
  {
    title: 'Demoras / detenciones a la línea',
    subtitle: 'no es costo del proveedor',
    color: 'indigo',
    icon: 'mdi-train-car-container',
    steps: [
      { icon: 'mdi-email-arrow-left-outline', title: 'CFDI de la línea', arrow: 'concepto de línea' },
      { icon: 'mdi-train-car-container', title: 'Asignar contenedores', subtitle: 'saldo pendiente', arrow: 'se paga en' },
      { icon: 'mdi-file-document-check-outline', title: 'Solicitud demoras / detenciones', color: 'amber-darken-2', highlight: true },
    ],
  },
]

const screens = [
  { icon: 'mdi-invoice-text-outline', color: 'pink', title: 'CFDI Invoices', text: 'Recepción y configuración (desglose) de cada CFDI.' },
  { icon: 'mdi-file-document-multiple-outline', color: 'amber-darken-2', title: 'Request payments', text: 'Busca por folios pegados o por proveedor y genera la solicitud.' },
  { icon: 'mdi-ferry', color: 'light-blue', title: 'Referencia', text: '"Supplier invoices & payments": estado de pago, folio de solicitud y cargos.' },
]

const blockers = [
  { icon: 'mdi-shield-off-outline', color: 'error', title: 'Cancelado en SAT', text: 'No se puede solicitar.' },
  { icon: 'mdi-history', color: 'deep-orange', title: 'Solicitud en TM1', text: 'Ya pedido en el sistema anterior.' },
  { icon: 'mdi-cash-lock', color: 'warning', title: 'Con pagos', text: 'No se modifican facturas ni banco.' },
  { icon: 'mdi-account-lock-outline', color: 'purple', title: 'Cancelar / desligar', text: 'Requiere autorización.' },
]

const paymentStatuses = ['pending_request', 'partially_requested', 'requested', 'partially_paid', 'paid'] as const

const cfdiStatuses = [
  { label: 'Pending breakdown', color: 'warning', icon: 'mdi-progress-clock', text: 'Aún tiene saldo por desglosar.' },
  { label: 'Ready to request payment', color: 'info', icon: 'mdi-check-circle-outline', text: 'Desglosado completo o formato libre.' },
  { label: 'Payment requested', color: 'success', icon: 'mdi-cash-check', text: 'Todos sus conceptos están en una solicitud.' },
  { label: 'Cancelled in SAT', color: 'error', icon: 'mdi-alert-circle', text: 'Bloqueado para pago.' },
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
.screen-card,
.blocker {
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
  margin-bottom: 10px;
}
.example {
  border-radius: 10px;
  padding: 10px 12px;
}
.example--sell {
  background: rgba(var(--v-theme-primary), 0.06);
}
.example--ff {
  background: rgba(251, 140, 0, 0.08);
}
.example__title {
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 8px;
}
.hint-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.78rem;
  margin-top: 10px;
}
</style>
