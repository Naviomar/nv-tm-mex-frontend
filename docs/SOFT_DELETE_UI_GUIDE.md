# Guía de Indicadores de Registros Eliminados (Soft Delete)

## Introducción

Esta guía explica cómo mostrar indicadores visuales cuando se trabaja con registros que han sido soft-deleted (eliminados lógicamente) en el sistema.

---

## Componentes Disponibles

### 1. DeletedRecordChip

Componente global que muestra un chip indicando que un registro está eliminado.

#### Uso Básico

```vue
<template>
  <DeletedRecordChip
    :is-deleted="referencia.is_deleted"
    :deleted-at="referencia.deleted_at"
    :deleted-by-name="referencia.deleted_info?.deleted_by_name"
  />
</template>
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isDeleted` | `boolean` | `false` | Indica si el registro está eliminado |
| `deletedAt` | `string \| null` | `null` | Fecha de eliminación |
| `deletedBy` | `number \| null` | `null` | ID del usuario que eliminó |
| `deletedByName` | `string \| null` | `null` | Nombre del usuario que eliminó |
| `color` | `string` | `'error'` | Color del chip |
| `variant` | `string` | `'tonal'` | Variante del chip |
| `size` | `string` | `'small'` | Tamaño del chip |
| `label` | `string` | `'Eliminado'` | Texto del chip |
| `icon` | `string` | `'mdi-delete-alert'` | Icono del chip |
| `iconOnly` | `boolean` | `false` | Mostrar solo icono |

#### Ejemplos

**Chip básico:**
```vue
<DeletedRecordChip :is-deleted="item.is_deleted" />
```

**Chip con información completa:**
```vue
<DeletedRecordChip
  :is-deleted="item.is_deleted"
  :deleted-at="item.deleted_at"
  :deleted-by-name="item.deleted_info?.deleted_by_name"
  color="warning"
  label="Registro Eliminado"
/>
```

**Solo icono (para tablas compactas):**
```vue
<DeletedRecordChip
  :is-deleted="item.is_deleted"
  :deleted-at="item.deleted_at"
  icon-only
/>
```

---

## Composable: useSoftDeleteIndicator

Composable que proporciona utilidades para trabajar con registros eliminados.

### Importación

```typescript
import { useSoftDeleteIndicator } from '~/composables/useSoftDeleteIndicator'

const {
  isDeleted,
  getDeletedAt,
  getDeletedBy,
  getDeletedByName,
  getDeletedClass,
  getRowClass,
  getDeletedMessage,
  showDeletedAlert,
} = useSoftDeleteIndicator()
```

### Funciones Disponibles

#### `isDeleted(record)`
Verifica si un registro está eliminado.

```typescript
if (isDeleted(referencia)) {
  console.log('Esta referencia está eliminada')
}
```

#### `getDeletedAt(record)`
Obtiene la fecha de eliminación.

```typescript
const deletedDate = getDeletedAt(referencia)
// "2026-06-04 13:25:11"
```

#### `getDeletedBy(record)`
Obtiene el ID del usuario que eliminó el registro.

```typescript
const userId = getDeletedBy(referencia)
// 123
```

#### `getDeletedByName(record)`
Obtiene el nombre del usuario que eliminó el registro.

```typescript
const userName = getDeletedByName(referencia)
// "Juan Pérez"
```

#### `getDeletedClass(record)`
Obtiene la clase CSS para aplicar al elemento.

```typescript
<div :class="getDeletedClass(referencia)">
  <!-- Contenido -->
</div>
```

#### `getRowClass(item)`
Obtiene la clase CSS para filas de tabla.

```typescript
<v-data-table
  :items="referencias"
  :item-class="getRowClass"
>
</v-data-table>
```

#### `getDeletedMessage(record)`
Obtiene un mensaje formateado sobre la eliminación.

```typescript
const message = getDeletedMessage(referencia)
// "Este registro ha sido eliminado el 4 de junio de 2026, 13:25 por Juan Pérez."
```

#### `showDeletedAlert(record)`
Verifica si se debe mostrar una alerta de eliminación.

```typescript
<v-alert
  v-if="showDeletedAlert(referencia)"
  type="warning"
  class="deleted-alert"
>
  {{ getDeletedMessage(referencia) }}
</v-alert>
```

---

## Clases CSS Disponibles

### `.deleted-row`
Para filas de tabla eliminadas.

```vue
<v-data-table
  :items="items"
  :item-class="item => item.is_deleted ? 'deleted-row' : ''"
>
</v-data-table>
```

### `.deleted-record`
Para tarjetas o contenedores de registros eliminados.

```vue
<v-card :class="{ 'deleted-record': referencia.is_deleted }">
  <!-- Contenido -->
</v-card>
```

### `.deleted-text`
Para texto tachado de registros eliminados.

```vue
<span :class="{ 'deleted-text': item.is_deleted }">
  {{ item.name }}
</span>
```

### `.deleted-badge`
Para agregar un badge de eliminado.

```vue
<div :class="{ 'deleted-badge': item.is_deleted }">
  <v-avatar>{{ item.initials }}</v-avatar>
</div>
```

### `.deleted-alert`
Para alertas de registros eliminados.

```vue
<v-alert
  v-if="referencia.is_deleted"
  type="warning"
  class="deleted-alert"
>
  Este registro ha sido eliminado
</v-alert>
```

### `.strikethrough-deleted`
Texto tachado simple.

```vue
<span :class="{ 'strikethrough-deleted': item.is_deleted }">
  {{ item.title }}
</span>
```

### `.fade-deleted`
Efecto de desvanecimiento para registros eliminados.

```vue
<div :class="{ 'fade-deleted': item.is_deleted }">
  <!-- Contenido -->
</div>
```

---

## Ejemplos Completos

### Ejemplo 1: Tabla con Registros Eliminados

```vue
<template>
  <v-data-table
    :items="referencias"
    :headers="headers"
    :item-class="getRowClass"
  >
    <template #item.reference_number="{ item }">
      <div class="d-flex align-center gap-2">
        <span :class="{ 'deleted-text': isDeleted(item) }">
          {{ item.reference_number }}
        </span>
        <DeletedRecordChip
          :is-deleted="isDeleted(item)"
          :deleted-at="getDeletedAt(item)"
          :deleted-by-name="getDeletedByName(item)"
          icon-only
        />
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { useSoftDeleteIndicator } from '~/composables/useSoftDeleteIndicator'

const { isDeleted, getDeletedAt, getDeletedByName, getRowClass } = useSoftDeleteIndicator()

const referencias = ref([
  {
    id: 1,
    reference_number: 'REF-001',
    is_deleted: false,
  },
  {
    id: 2,
    reference_number: 'REF-002',
    is_deleted: true,
    deleted_at: '2026-06-04 13:25:11',
    deleted_info: {
      deleted_by_name: 'Juan Pérez',
    },
  },
])
</script>
```

### Ejemplo 2: Formulario con Alerta de Eliminado

```vue
<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Detalles de Referencia</span>
      <DeletedRecordChip
        :is-deleted="referencia.is_deleted"
        :deleted-at="referencia.deleted_at"
        :deleted-by-name="referencia.deleted_info?.deleted_by_name"
      />
    </v-card-title>

    <v-card-text>
      <v-alert
        v-if="showDeletedAlert(referencia)"
        type="warning"
        variant="tonal"
        class="mb-4 deleted-alert"
      >
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-alert</v-icon>
          <div>
            <div class="font-weight-bold">Registro Eliminado</div>
            <div class="text-caption">{{ getDeletedMessage(referencia) }}</div>
          </div>
        </div>
      </v-alert>

      <!-- Formulario -->
      <v-text-field
        v-model="referencia.reference_number"
        label="Número de Referencia"
        :readonly="referencia.is_deleted"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useSoftDeleteIndicator } from '~/composables/useSoftDeleteIndicator'

const { showDeletedAlert, getDeletedMessage } = useSoftDeleteIndicator()

const referencia = ref({
  id: 1,
  reference_number: 'REF-001',
  is_deleted: true,
  deleted_at: '2026-06-04 13:25:11',
  deleted_info: {
    deleted_by_name: 'Juan Pérez',
  },
})
</script>
```

### Ejemplo 3: Lista con Registros Eliminados

```vue
<template>
  <v-list>
    <v-list-item
      v-for="item in items"
      :key="item.id"
      :class="getDeletedClass(item)"
    >
      <template #prepend>
        <v-avatar :class="{ 'deleted-badge': isDeleted(item) }">
          <v-icon>mdi-file-document</v-icon>
        </v-avatar>
      </template>

      <v-list-item-title :class="{ 'strikethrough-deleted': isDeleted(item) }">
        {{ item.title }}
      </v-list-item-title>

      <v-list-item-subtitle>
        {{ item.description }}
      </v-list-item-subtitle>

      <template #append>
        <DeletedRecordChip
          :is-deleted="isDeleted(item)"
          :deleted-at="getDeletedAt(item)"
          size="x-small"
        />
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { useSoftDeleteIndicator } from '~/composables/useSoftDeleteIndicator'

const { isDeleted, getDeletedAt, getDeletedClass } = useSoftDeleteIndicator()
</script>
```

---

## Integración con Backend

### Estructura de Datos Esperada

El backend debe incluir la siguiente información en las respuestas:

```json
{
  "id": 260,
  "reference_number": "REF-001",
  "is_deleted": true,
  "deleted_at": "2026-06-04T13:25:11.000000Z",
  "deleted_by": 123,
  "deleted_info": {
    "deleted_at": "2026-06-04 13:25:11",
    "deleted_by": 123,
    "deleted_by_name": "Juan Pérez"
  }
}
```

### Trait de Backend

El backend incluye el trait `IncludesSoftDeleteInfo` que agrega automáticamente esta información:

```php
use App\Traits\Mexico\IncludesSoftDeleteInfo;

class ReferenciaController extends Controller
{
    use IncludesSoftDeleteInfo;

    public function show($id)
    {
        $referencia = Referencia::withTrashed()->findOrFail($id);
        
        return $this->responseWithSoftDeleteInfo($referencia);
    }
}
```

---

## Mejores Prácticas

### 1. Siempre Mostrar Indicador en Consultas
Cuando se muestre un registro que puede estar eliminado, siempre incluir el chip:

```vue
<DeletedRecordChip :is-deleted="item.is_deleted" />
```

### 2. Usar Clases CSS para Filas de Tabla
Para tablas, usar `item-class` para aplicar estilos automáticamente:

```vue
<v-data-table :item-class="getRowClass" />
```

### 3. Mostrar Alerta en Formularios
En formularios de edición, mostrar alerta prominente:

```vue
<v-alert v-if="showDeletedAlert(record)" type="warning">
  {{ getDeletedMessage(record) }}
</v-alert>
```

### 4. Deshabilitar Edición de Registros Eliminados
Hacer campos de solo lectura si el registro está eliminado:

```vue
<v-text-field :readonly="referencia.is_deleted" />
```

### 5. Usar Tooltip para Información Adicional
El chip ya incluye tooltip con información detallada, aprovecharlo:

```vue
<!-- El tooltip se muestra automáticamente al pasar el mouse -->
<DeletedRecordChip :is-deleted="true" :deleted-at="..." />
```

---

## Checklist de Implementación

Al agregar soporte para registros eliminados en un módulo:

- [ ] Verificar que el backend incluye `is_deleted` y `deleted_info`
- [ ] Importar `useSoftDeleteIndicator` composable
- [ ] Agregar `DeletedRecordChip` en vistas de detalle
- [ ] Aplicar `getRowClass` en tablas
- [ ] Mostrar alerta con `showDeletedAlert` en formularios
- [ ] Aplicar clases CSS apropiadas (`.deleted-text`, etc.)
- [ ] Deshabilitar edición si `is_deleted === true`
- [ ] Probar con registros eliminados y activos
- [ ] Verificar que tooltips muestran información correcta

---

## Soporte

Para dudas o problemas:
- Revisar ejemplos en esta guía
- Consultar `SOFT_DELETE_BEST_PRACTICES.md` en backend
- Preguntar en canal #frontend-dev

---

**Última Actualización:** 2026-06-04  
**Mantenido Por:** Equipo de Desarrollo
