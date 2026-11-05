<template>
  <v-dialog v-model="model" max-width="980" scrollable>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center gap-2 bg-primary text-white py-3">
        <v-icon icon="mdi-sitemap-outline" />
        <div>
          <div class="text-subtitle-1 font-weight-bold">How to register a new Request Type</div>
          <div class="text-caption" style="opacity: 0.85">Dynamic (DB-driven) vs. Static (code) parts of the system</div>
        </div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" density="comfortable" @click="model = false" />
      </v-card-title>

      <v-card-text class="pa-5" style="max-height: 75vh">
        <v-alert type="info" variant="tonal" density="compact" class="mb-5">
          A request type has <strong>two halves</strong>: a <strong>dynamic</strong> half stored in the
          <code>auth_request_types</code> table (editable from this screen, no deploy needed) and a
          <strong>static</strong> half that lives in the codebase (requires a code change + deploy). Both
          halves must reference the exact same <code>code</code> string, or the request will silently fall
          back to generic defaults.
        </v-alert>

        <!-- Step flow -->
        <div class="rtg-flow">
          <div v-for="(step, i) in steps" :key="step.title" class="rtg-step-wrapper">
            <div class="rtg-step" :class="`rtg-step--${step.tone}`">
              <div class="rtg-step-header">
                <div class="rtg-step-icon">
                  <v-icon :icon="step.icon" size="22" />
                </div>
                <div>
                  <div class="rtg-step-title">{{ step.title }}</div>
                  <v-chip size="x-small" :color="step.tone === 'dynamic' ? 'success' : 'orange-darken-2'" variant="flat" class="mt-1">
                    {{ step.tone === 'dynamic' ? 'DYNAMIC — DB / UI' : 'STATIC — code + deploy' }}
                  </v-chip>
                </div>
              </div>

              <p class="text-body-2 mt-2 mb-2">{{ step.description }}</p>

              <div v-if="step.files?.length" class="rtg-file-list">
                <div v-for="f in step.files" :key="f.path" class="rtg-file-item">
                  <v-icon size="14" color="medium-emphasis">mdi-file-code-outline</v-icon>
                  <code class="text-caption">{{ f.path }}</code>
                  <span v-if="f.note" class="text-caption text-medium-emphasis ml-1">— {{ f.note }}</span>
                </div>
              </div>
            </div>

            <div v-if="i < steps.length - 1" class="rtg-connector">
              <div class="rtg-connector-line" />
              <v-icon size="16" color="medium-emphasis">mdi-chevron-down</v-icon>
            </div>
          </div>
        </div>

        <v-divider class="my-5" />

        <div class="text-subtitle-2 font-weight-bold mb-2">
          <v-icon size="18" color="amber-darken-2">mdi-lightbulb-on-outline</v-icon>
          Keeping dynamic &amp; static in sync
        </div>
        <ul class="rtg-tips">
          <li>The <code>code</code> string (e.g. <code>credit-note.add-charge</code>) must match <strong>exactly</strong> in all 4 places above — DB row, template seeder, frontend component prop, and backend switch/handler.</li>
          <li>If a row is missing from <code>auth_request_types</code>, <code>useRequestTypeCatalog().getTemplate()</code> silently returns a generic default template — no error is thrown, so this is easy to miss.</li>
          <li>If a row exists but has no <code>template</code>, the default template applies (plain reason box, no custom fields/alerts).</li>
          <li>For auto-executed processes (no manual approval action), add the code to <code>AUTO_EXECUTE_PROCESS_CODES</code> in this page's script AND to the <code>$handlers</code> map in <code>AuthProcessRequestRepository::applyGrantedRequest</code> (backend).</li>
          <li>Dynamic catalog options in form fields (e.g. charges, currencies) use <code>field.catalog</code> + the <code>field-catalogs</code> prop on <code>ProcessAuthorizationWrapper</code> — these are supplied by the parent component at render time, not stored in the DB.</li>
        </ul>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ default: false })

const steps = [
  {
    tone: 'dynamic',
    icon: 'mdi-database-plus-outline',
    title: '1. Create the catalog row',
    description:
      'Register the code, kind (authorization / process / support), description, key label, icon/color and default CC users / approvers. Do this from the "New Type" button on this page, or via a migration if you need it to exist in every environment automatically.',
    files: [
      { path: 'database/migrations/mysql_mex/*_seed_missing_*_auth_request_types.php', note: 'pattern for seeding new codes via migration' },
      { path: 'app/Http/Controllers/V1/Mexico/AuthRequestTypesController.php', note: 'CRUD used by this page' },
    ],
  },
  {
    tone: 'dynamic',
    icon: 'mdi-file-tree-outline',
    title: '2. Design the request template',
    description:
      'Open the Template Editor (pencil icon on the type card) to define the modal title/subtitle, alert/text/section blocks, reason field config, and form_field elements the user fills in before submitting. All stored as JSON on the row — editable live, no deploy.',
    files: [
      { path: 'database/seeders/mexico/AuthRequestTypeTemplatesSeeder.php', note: 'baseline templates applied on fresh installs / re-seed' },
      { path: 'components/autorizacion/RequestTemplateEditor.vue', note: 'visual editor (if present) or direct JSON edit' },
    ],
  },
  {
    tone: 'static',
    icon: 'mdi-vuejs',
    title: '3. Trigger it from the frontend',
    description:
      'Drop <ProcessAuthorizationWrapper> (for auto-executed processes) or <AuthorizeProcessSmart> (for manual authorization flows) into the relevant component, passing process-name/resource = the same code plus request-key, process-data, and field-catalogs for any dynamic select/autocomplete options.',
    files: [
      { path: 'components/autorizacion/ProcessAuthorizationWrapper.vue', note: 'generic process request UI, template-driven' },
      { path: 'components/autorizacion/AuthorizeProcessSmart.vue', note: 'generic authorization request UI' },
      { path: 'utils/data/system.ts', note: 'processResources / authorizeResources — fallback display-name map' },
      { path: 'pages/system/auth-request-types/index.vue', note: '"When approved" and "Validity of an approval" for the type' },
    ],
  },
  {
    tone: 'static',
    icon: 'mdi-server-outline',
    title: '4. Handle approval on the backend',
    description:
      'Approvals from TM2 and SIGA go through one engine (RequestDecisionService). If the server should apply the change, add a handler in AutoExecuteDispatcher and set "When approved" to "applied automatically"; if the requester acts later, use "requester acts" and set its validity (working hours of the requester\'s office). Add a RequestSummary presenter so approvers read what they authorize (names, not IDs), and a DecisionProfile only if it needs several ways to approve (e.g. with/without rebilling).',
    files: [
      { path: 'app/Services/V1/Mexico/AutoExecuteDispatcher.php', note: '$handlers map — runs the action on approval; a failure keeps the request pending and tells the approver why' },
      { path: 'app/Services/V1/Mexico/RequestSummary/RequestSummaryService.php', note: 'presenters: what the approver sees in TM2 and SIGA' },
      { path: 'app/Services/V1/Mexico/Approval/RequestDecisionService.php', note: 'decision profiles (options per type) and the decide() flow' },
      { path: 'app/Models/Mexico/ProcessRequest.php', note: 'getResolvedDisplayAttribute() switch — display label per process_name' },
    ],
  },
]
</script>

<style scoped>
.rtg-flow {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

.rtg-step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rtg-step {
  width: 100%;
  border-radius: 12px;
  border: 1.5px solid;
  padding: 14px 18px;
}

.rtg-step--dynamic {
  border-color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.06);
}

.rtg-step--static {
  border-color: #fb8c00;
  background: rgba(251, 140, 0, 0.06);
}

.rtg-step-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.rtg-step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  flex-shrink: 0;
}

.rtg-step-title {
  font-weight: 700;
  font-size: 0.95rem;
}

.rtg-file-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}

.rtg-file-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.rtg-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 0;
}

.rtg-connector-line {
  width: 1.5px;
  height: 14px;
  background: rgba(var(--v-theme-on-surface), 0.18);
}

.rtg-tips {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
}
</style>
