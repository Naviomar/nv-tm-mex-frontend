<template>
  <v-card class="preview-shell" variant="outlined" rounded="lg">
    <!-- Title bar mock -->
    <v-card-title class="d-flex align-center justify-space-between preview-titlebar py-2 px-4">
      <span class="text-body-2 font-weight-semibold">{{ template.title || '(no title)' }}</span>
      <v-icon size="18" color="medium-emphasis">mdi-close</v-icon>
    </v-card-title>

    <v-divider />

    <v-card-text class="preview-body pa-4 d-flex flex-column" style="gap: 10px">
      <!-- Subtitle/instructions -->
      <p v-if="template.subtitle" class="text-caption text-medium-emphasis mb-0">
        {{ template.subtitle }}
      </p>

      <!-- Elements in order -->
      <template v-for="el in template.elements" :key="el.id">
        <!-- alert_block -->
        <v-alert
          v-if="el.type === 'alert_block'"
          :type="(el as any).alert_type"
          variant="tonal"
          density="compact"
          class="text-caption"
        >
          {{ (el as any).alert_text }}
        </v-alert>

        <!-- text_block -->
        <p v-else-if="el.type === 'text_block'" class="text-caption text-medium-emphasis mb-0">
          {{ (el as any).text }}
        </p>

        <!-- section header -->
        <div v-else-if="el.type === 'section'" class="text-caption text-uppercase font-weight-bold text-disabled preview-section-divider">
          {{ (el as any).title }}
        </div>

        <!-- charge_builder: code-driven widget mockup -->
        <div v-else-if="el.type === 'charge_builder'" class="preview-charge-builder">
          <div class="preview-charge-builder-label">
            <v-icon size="12" color="teal">mdi-layers-plus</v-icon>
            Charge builder
            <v-chip size="x-small" color="teal" variant="tonal" class="ml-1" style="font-size:9px">code-driven</v-chip>
          </div>
          <div class="preview-charge-builder-body">
            <div class="preview-input mb-1" style="height:22px;width:60%" />
            <div class="d-flex gap-1">
              <div class="preview-input" style="height:22px;flex:1" />
              <div class="preview-input" style="height:22px;flex:1" />
            </div>
          </div>
        </div>

        <!-- invoice_charge_builder: code-driven invoice search widget mockup -->
        <div v-else-if="el.type === 'invoice_charge_builder'" class="preview-charge-builder" style="border-color: rgba(var(--v-theme-info), 0.5)">
          <div class="preview-charge-builder-label" style="color: rgb(0,188,212); background: rgba(0,188,212,0.08)">
            <v-icon size="12" color="cyan">mdi-receipt-text-plus-outline</v-icon>
            Invoice charge builder
            <v-chip size="x-small" color="cyan" variant="tonal" class="ml-1" style="font-size:9px">code-driven</v-chip>
          </div>
          <div class="preview-charge-builder-body">
            <div class="d-flex gap-1 mb-1">
              <div class="preview-input" style="height:22px;flex:1" />
              <div class="preview-input" style="height:22px;width:28px;background:rgba(var(--v-theme-info),0.1)" />
            </div>
            <div class="d-flex gap-1">
              <div class="preview-input" style="height:22px;flex:2" />
              <div class="preview-input" style="height:22px;flex:1" />
            </div>
          </div>
        </div>

        <!-- file_upload: code-driven drag & drop zone mockup -->
        <div v-else-if="el.type === 'file_upload'" class="preview-charge-builder" style="border-color: rgba(63,81,181,0.5)">
          <div class="preview-charge-builder-label" style="color: rgb(63,81,181); background: rgba(63,81,181,0.08)">
            <v-icon size="12" color="indigo">mdi-cloud-upload-outline</v-icon>
            {{ (el as any).label ?? 'Supporting documents' }}
            <v-chip size="x-small" color="indigo" variant="tonal" class="ml-1" style="font-size:9px">code-driven</v-chip>
          </div>
          <div class="preview-charge-builder-body text-center py-2" style="border:1.5px dashed rgba(63,81,181,0.4); border-radius:6px">
            <v-icon size="16" color="indigo">mdi-cloud-upload-outline</v-icon>
            <div class="text-caption text-disabled" style="font-size:9px">Drag &amp; drop files here or browse</div>
          </div>
        </div>

        <!-- form_field -->
        <div v-else-if="el.type === 'form_field'" class="preview-field">
          <label class="text-caption text-medium-emphasis d-block mb-1">
            {{ (el as any).field.label }}
            <span v-if="(el as any).field.required" class="text-error">*</span>
          </label>

          <!-- textarea -->
          <div v-if="(el as any).field.type === 'textarea'" class="preview-input preview-textarea" />

          <!-- radio -->
          <div v-else-if="(el as any).field.type === 'radio'" class="d-flex flex-column" style="gap:4px">
            <div
              v-for="opt in ((el as any).field.options ?? [])"
              :key="opt.value"
              class="d-flex align-center gap-1"
            >
              <div class="preview-radio-circle" />
              <span class="text-caption">{{ opt.label }}</span>
            </div>
          </div>

          <!-- select -->
          <div v-else-if="(el as any).field.type === 'select'" class="preview-input preview-select d-flex align-center justify-space-between px-2">
            <span class="text-caption text-disabled">{{ (el as any).field.options?.[0]?.label ?? 'Select...' }}</span>
            <v-icon size="14" color="medium-emphasis">mdi-chevron-down</v-icon>
          </div>

          <!-- checkbox -->
          <div v-else-if="(el as any).field.type === 'checkbox'" class="d-flex align-center gap-1">
            <div class="preview-checkbox-box" />
            <span class="text-caption">{{ (el as any).field.label }}</span>
          </div>

          <!-- text / number default -->
          <div v-else class="preview-input" />
        </div>
      </template>

      <!-- Reason field -->
      <div v-if="template.reason.show" class="preview-field">
        <label class="text-caption text-medium-emphasis d-block mb-1">
          {{ template.reason.label }}
          <span v-if="template.reason.required" class="text-error">*</span>
        </label>
        <div
          class="preview-input preview-textarea"
          :style="{ height: `${(template.reason.rows ?? 3) * 20}px` }"
        />
      </div>
    </v-card-text>

    <v-divider />

    <!-- Actions bar -->
    <v-card-actions class="px-4 py-2 d-flex justify-end gap-2">
      <v-btn size="x-small" variant="text">{{ template.buttons.cancel }}</v-btn>
      <v-btn size="x-small" variant="flat" color="primary">{{ template.buttons.submit }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { IRequestTemplate } from '~/repository/modules/catalogs/authRequestTypes'

defineProps<{ template: IRequestTemplate }>()
</script>

<style scoped>
.preview-shell {
  font-size: 12px;
}

.preview-titlebar {
  min-height: 44px;
}

.preview-body {
  min-height: 80px;
}

.preview-section-divider {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding-bottom: 4px;
}

/* Generic input mock */
.preview-input {
  height: 28px;
  border-radius: 4px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface-variant), 0.4);
}
.preview-textarea {
  height: 60px;
}
.preview-select {
  height: 28px;
  cursor: default;
}
.preview-radio-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 2));
  flex-shrink: 0;
}
.preview-checkbox-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 2px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 2));
  flex-shrink: 0;
}
.preview-charge-builder {
  border: 1px dashed rgba(var(--v-theme-info), 0.5);
  border-radius: 6px;
  overflow: hidden;
}
.preview-charge-builder-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-info));
  padding: 4px 8px;
  background: rgba(var(--v-theme-info), 0.08);
  display: flex;
  align-items: center;
  gap: 4px;
}
.preview-charge-builder-body {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
