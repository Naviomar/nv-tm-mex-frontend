<template>
  <div>
    <v-tabs v-model="tab" color="primary" density="compact" class="border-b">
      <v-tab value="flow" prepend-icon="mdi-sitemap-outline">Cómo funciona</v-tab>
      <v-tab value="held" prepend-icon="mdi-pause-circle-outline">Por qué se retiene</v-tab>
      <v-tab value="payments" prepend-icon="mdi-cash-check">Solicitudes de pago</v-tab>
      <v-tab value="access" prepend-icon="mdi-key-chain-variant">Quién puede qué</v-tab>
    </v-tabs>

    <div class="pa-5">
      <v-window v-model="tab">
        <!-- ===== FLOW ===== -->
        <v-window-item value="flow">
          <div class="text-body-2 text-medium-emphasis mb-4">
            Aquí se ve, contenedor por contenedor, qué rebate <strong>ya se puede pagar</strong>, cuál está <strong>retenido</strong> y cuál <strong>ya se pagó</strong>.
            El rebate de la referencia no cambia y sigue restando al profit.
          </div>

          <div class="lane mb-4">
            <div class="d-flex align-center gap-2 mb-3">
              <v-chip color="teal" size="small" variant="flat" prepend-icon="mdi-package-variant-closed">Containers</v-chip>
              <span class="text-caption text-medium-emphasis">Cada contenedor con rebate está disponible o retenido</span>
            </div>
            <div class="diagram-row">
              <FlowCard icon="mdi-ferry" color="primary" title="Referencia con rebate" small />
              <FlowArrow label="se revisa" />
              <FlowCard icon="mdi-check-circle-outline" color="success" title="Disponible" subtitle="se puede solicitar" highlight small />
              <FlowCard icon="mdi-pause-circle-outline" color="warning" title="Retenido" subtitle="aún no se paga" small />
            </div>
          </div>

          <div class="lane mb-4">
            <div class="d-flex align-center gap-2 mb-3">
              <v-chip color="teal" size="small" variant="flat" prepend-icon="mdi-cash-check">Payment requests</v-chip>
              <span class="text-caption text-medium-emphasis">Lo disponible se paga en una solicitud</span>
            </div>
            <div class="diagram-row">
              <FlowCard icon="mdi-email-fast-outline" color="warning" title="Solicitado" small />
              <FlowArrow />
              <FlowCard icon="mdi-check-decagram" color="info" title="Autorizado" small />
              <FlowArrow />
              <FlowCard icon="mdi-progress-clock" color="primary" title="En proceso" small />
              <FlowArrow />
              <FlowCard icon="mdi-cash-check" color="success" title="Pagado" highlight small />
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

        <!-- ===== HELD ===== -->
        <v-window-item value="held">
          <div class="text-body-2 text-medium-emphasis mb-3">
            Un contenedor queda <strong>retenido</strong> mientras exista alguno de estos motivos. Cuando desaparece, pasa solo a disponible.
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="reason in reasons" :key="reason.label" class="screen-card">
              <v-icon :color="reason.color" size="22">{{ reason.icon }}</v-icon>
              <div>
                <div class="font-bold text-sm">{{ reason.label }}</div>
                <div class="text-caption text-medium-emphasis">{{ reason.text }}</div>
              </div>
            </div>
          </div>
        </v-window-item>

        <!-- ===== PAYMENTS ===== -->
        <v-window-item value="payments">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="step in steps" :key="step.title" class="rule-card">
              <div class="rule-card__head"><v-icon :color="step.color">{{ step.icon }}</v-icon><span>{{ step.title }}</span></div>
              <div class="text-body-2 text-medium-emphasis">{{ step.text }}</div>
            </div>
          </div>
        </v-window-item>

        <!-- ===== ACCESS ===== -->
        <v-window-item value="access">
          <v-table density="comfortable">
            <thead><tr><th>Quién</th><th>Qué puede hacer</th></tr></thead>
            <tbody>
              <tr v-for="item in people" :key="item.who"><td class="font-bold">{{ item.who }}</td><td>{{ item.text }}</td></tr>
            </tbody>
          </v-table>
          <v-alert type="info" variant="tonal" density="compact" class="mt-4">
            Cada ejecutivo ve solo lo suyo. Si necesitas otro acceso, pídelo a tu administrador.
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
    if (req?.id !== 'rebate') return
    tab.value = req.tab ?? 'flow'
    pageDocs.request.value = null
  },
  { immediate: true },
)

const notes = [
  { icon: 'mdi-history', color: 'secondary', title: 'Lo anterior ya está entregado', text: 'El rebate de antes de que arrancara el módulo se muestra solo para consulta. Excepción: las referencias de un caso especial cuyo rebate no se entregó (demoras que se cubren con el flete o un adelanto por recuperar) se controlan aunque sean anteriores.' },
  { icon: 'mdi-content-duplicate', color: 'error', title: 'Contenedor repetido', text: 'Se marca «Repeated» si el mismo contenedor aparece en otra referencia con fecha cercana. Es solo un aviso: no lo retiene.' },
  { icon: 'mdi-cash-minus', color: 'warning', title: 'Adelantos', text: 'Si al cliente ya se le adelantó dinero, se descuenta del pago y se ve como «Withheld» en la solicitud.' },
  { icon: 'mdi-lock-outline', color: 'error', title: 'Solo lectura', text: 'El rebate no se puede cambiar en el cliente ni en la referencia.' },
]

const reasons = [
  { icon: 'mdi-cash-remove', color: 'error', label: 'Owes', text: 'El cliente tiene un saldo pendiente de pago.' },
  { icon: 'mdi-calendar-remove-outline', color: 'warning', label: 'No empty date', text: 'A un contenedor de la referencia le falta la fecha de devolución del vacío.' },
  { icon: 'mdi-receipt-text-clock-outline', color: 'warning', label: 'To invoice', text: 'La referencia tiene cargos pendientes de facturar.' },
  { icon: 'mdi-timer-sand', color: 'orange', label: 'Demurrage', text: 'Hay demoras sin facturar o sin pagar.' },
  { icon: 'mdi-folder-star-outline', color: 'primary', label: 'Special case', text: 'La referencia tiene demoras que un caso especial todavía está cubriendo con el flete de referencias nuevas. Su rebate se libera cuando el caso termina de cubrirla. Al pulsarlo se ve cuánto lleva cubierto y cuánto falta; arriba del listado un aviso resume lo retenido y lo ya liberado por el caso.' },
  { icon: 'mdi-alert-circle-outline', color: 'grey', label: 'Check failed', text: 'No se pudo revisar en este momento; se vuelve a intentar solo.' },
]

const steps = [
  { icon: 'mdi-email-fast-outline', color: 'warning', title: '1. Solicitar', text: 'El ejecutivo elige en Containers, con la casilla, los contenedores disponibles (o todos los que cumplen sus filtros) y pulsa «Request payment». Se envía un correo a Contabilidad y el ejecutivo queda en copia.' },
  { icon: 'mdi-check-decagram', color: 'info', title: '2. Autorizar', text: 'Al solicitar se abre un ticket en SIGA para que los directivos autoricen desde ahí (también se puede autorizar en el sistema). Si algún contenedor dejó de cumplir, la autorización se rechaza.' },
  { icon: 'mdi-progress-clock', color: 'primary', title: '3. En proceso', text: 'Contabilidad indica que el pago se está realizando.' },
  { icon: 'mdi-cash-check', color: 'success', title: '4. Pagado', text: 'Contabilidad registra el pago con su referencia. Los ejecutivos ven el estado.' },
  { icon: 'mdi-close-octagon-outline', color: 'error', title: 'Cancelar', text: 'Se puede cancelar antes de pagar; los contenedores vuelven a estar disponibles.' },
  { icon: 'mdi-email-sync-outline', color: 'secondary', title: 'Reenviar', text: 'Mientras esté solicitada, se puede reenviar el correo si no llegó.' },
]

const people = [
  { who: 'Ejecutivos', text: 'Ven sus contenedores, descargan el Excel y solicitan el pago de lo disponible.' },
  { who: 'Contabilidad', text: 'Ve las solicitudes, las pone en proceso y las marca como pagadas.' },
  { who: 'Directivos', text: 'Autorizan la solicitud desde el ticket de SIGA.' },
  { who: 'Super Admin', text: 'Autoriza o cancela solicitudes, y puede hacer también el resto de los pasos.' },
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
