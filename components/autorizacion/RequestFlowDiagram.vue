<template>
  <div class="rfd-root">
    <!-- Node: Submitted -->
    <div class="rfd-node rfd-node--blue">
      <div class="rfd-node-icon">
        <v-icon size="22" color="blue">mdi-send-circle-outline</v-icon>
      </div>
      <div class="rfd-node-label">Submitted</div>
    </div>

    <div class="rfd-connector">
      <div class="rfd-connector-line" />
      <v-icon size="14" color="medium-emphasis" class="rfd-connector-arrow">mdi-chevron-down</v-icon>
    </div>

    <!-- Node: Pending review -->
    <div class="rfd-node rfd-node--orange">
      <div class="rfd-node-icon">
        <v-icon size="22" color="orange">mdi-timer-sand</v-icon>
      </div>
      <div class="rfd-node-label">Pending review</div>
    </div>

    <!-- Fork: two connectors side by side -->
    <div class="rfd-fork">
      <!-- Left branch: Approved -->
      <div class="rfd-branch rfd-branch--left">
        <div class="rfd-branch-line-v" />
        <div class="rfd-branch-line-h rfd-branch-line-h--left" />
        <div class="rfd-branch-connector-down" />
        <div class="rfd-connector-arrow-down">
          <v-icon size="14" color="medium-emphasis">mdi-chevron-down</v-icon>
        </div>
        <div class="rfd-node rfd-node--green">
          <div class="rfd-node-icon">
            <v-icon size="22" color="green">mdi-check-circle-outline</v-icon>
          </div>
          <div class="rfd-node-label">Approved</div>
        </div>

        <div class="rfd-connector">
          <div class="rfd-connector-line" />
          <v-icon size="14" color="medium-emphasis" class="rfd-connector-arrow">mdi-chevron-down</v-icon>
        </div>

        <!-- Auto-execute or manual action -->
        <div v-if="autoExecute" class="rfd-node rfd-node--teal">
          <div class="rfd-node-icon">
            <v-icon size="22" color="teal">mdi-lightning-bolt-circle</v-icon>
          </div>
          <div class="rfd-node-label">Auto-executed</div>
          <div class="rfd-node-sub">Backend runs automatically</div>
        </div>
        <div v-else class="rfd-node rfd-node--amber">
          <div class="rfd-node-icon">
            <v-icon size="22" color="amber-darken-2">mdi-gesture-tap-button</v-icon>
          </div>
          <div class="rfd-node-label">Action required</div>
          <div class="rfd-node-sub">User acts after approval</div>
        </div>
      </div>

      <!-- Right branch: Denied -->
      <div class="rfd-branch rfd-branch--right">
        <div class="rfd-branch-line-v" />
        <div class="rfd-branch-line-h rfd-branch-line-h--right" />
        <div class="rfd-branch-connector-down" />
        <div class="rfd-connector-arrow-down">
          <v-icon size="14" color="medium-emphasis">mdi-chevron-down</v-icon>
        </div>
        <div class="rfd-node rfd-node--red rfd-node--dim">
          <div class="rfd-node-icon">
            <v-icon size="22" color="red-lighten-1">mdi-close-circle-outline</v-icon>
          </div>
          <div class="rfd-node-label">Denied</div>
          <div class="rfd-node-sub">Request closed</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ autoExecute: boolean }>()
</script>

<style scoped>
/* ── Root ── */
.rfd-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 8px 0 4px;
  font-size: 11px;
  user-select: none;
}

/* ── Nodes ── */
.rfd-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid;
  min-width: 110px;
  text-align: center;
  position: relative;
}

.rfd-node-icon {
  line-height: 1;
}

.rfd-node-label {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
}

.rfd-node-sub {
  font-size: 9px;
  opacity: 0.6;
  line-height: 1.3;
}

/* Node color variants */
.rfd-node--blue   { border-color: rgb(var(--v-theme-info));    background: rgba(var(--v-theme-info), 0.08); }
.rfd-node--orange { border-color: #fb8c00;                      background: rgba(251,140,0, 0.08); }
.rfd-node--green  { border-color: rgb(var(--v-theme-success));  background: rgba(var(--v-theme-success), 0.08); }
.rfd-node--teal   { border-color: #00897b;                      background: rgba(0,137,123, 0.08); }
.rfd-node--amber  { border-color: #f9a825;                      background: rgba(249,168,37, 0.08); }
.rfd-node--red    { border-color: rgb(var(--v-theme-error));    background: rgba(var(--v-theme-error), 0.06); }
.rfd-node--dim    { opacity: 0.55; }

/* ── Straight connector (vertical line + arrow) ── */
.rfd-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.rfd-connector-line {
  width: 1.5px;
  height: 18px;
  background: rgba(var(--v-theme-on-surface), 0.18);
}

.rfd-connector-arrow {
  margin-top: -4px;
  opacity: 0.5;
}

/* ── Fork layout ── */
.rfd-fork {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 24px;
  width: 100%;
  margin-top: 0;
}

.rfd-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Vertical stem from Pending node down to horizontal bar */
.rfd-branch-line-v {
  width: 1.5px;
  height: 14px;
  background: rgba(var(--v-theme-on-surface), 0.18);
}

/* Horizontal bar connecting left & right branch stems — only visible via the fork gap */
.rfd-branch-line-h {
  height: 1.5px;
  width: 50%;
  background: rgba(var(--v-theme-on-surface), 0.18);
  align-self: flex-start;
}

.rfd-branch-line-h--left  { align-self: flex-end; }
.rfd-branch-line-h--right { align-self: flex-start; }

/* Short vertical line after horizontal bar, before arrow */
.rfd-branch-connector-down {
  width: 1.5px;
  height: 12px;
  background: rgba(var(--v-theme-on-surface), 0.18);
}

.rfd-connector-arrow-down {
  margin-top: -4px;
  opacity: 0.5;
  margin-bottom: 2px;
}
</style>
