---
title: Tracking Events – Introducción
summary: Catálogo de eventos de tracking para operaciones marítimas y aéreas.
order: 1
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-tracking-events
roles: [Administrador, Operaciones]
tags: [configuracion, tracking, eventos, catalogos, permisos]
---

# Objetivo
Centralizar los distintos eventos de tracking que pueden ocurrir en los embarques (marítimos y aéreos), asegurando un estándar en la nomenclatura, descripción y uso en el sistema. Esto permite dar seguimiento consistente a los envíos y facilitar la comunicación con clientes.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar eventos de tracking.
- Valida que no existan eventos duplicados.
- Los eventos pueden clasificarse por tipo de transporte (**marítimo** o **aéreo**).
- El acceso a las funciones está controlado por permisos específicos.
- Se registra quién crea, edita o elimina cada evento para mayor trazabilidad.

# Prerrequisitos
- Contar con permisos de acceso al sistema.
- Tener definidas las tipologías de transporte (marítimo, aéreo).

# Navegación
- Menú principal: **Configuration → Tracking Events**
- Ruta directa: `/configuration/tracking-events`

# Flujo general de uso
1. Ingresa al módulo de Tracking Events.
2. Para agregar un evento, haz clic en "Nuevo evento" y completa los campos obligatorios.
3. Antes de guardar, el sistema validará si existe un evento con nombre similar.
4. Puedes buscar eventos existentes por nombre o tipo.
5. Edita, inhabilita o reactiva un evento según lo necesites.

---

## Vistas principales
- **Listado:** Muestra todos los eventos registrados, con filtros por nombre y tipo.
- **Formulario:** Permite agregar o editar eventos, con validaciones en tiempo real.
- **Detalle:** Visualiza la información completa de un evento.

## Campos y validaciones
- **Tipo:** Obligatorio (Marítimo / Aéreo).
- **Nombre:** Obligatorio, único y no puede repetirse.
- **Descripción:** Opcional.

---

## Casos de uso
- **Crear evento:** Ingresa tipo, nombre y descripción (opcional).
- **Editar evento:** Actualiza datos existentes con validaciones.
- **Inhabilitar evento:** Desactiva un evento sin perder su historial.
- **Reactivar evento:** Vuelve a habilitar un evento previamente inhabilitado.
- **Buscar evento:** Localiza por nombre o tipo.

---

## Permisos necesarios
- **Ver eventos:** `tracking-events-view`
- **Crear evento:** `tracking-events-create`
- **Editar evento:** `tracking-events-edit`
- **Eliminar o restaurar evento:** `tracking-events-delete`

---

## Errores comunes
- **Nombre duplicado:** Ya existe un evento con este nombre.
- **Campos obligatorios vacíos:** Debes completar los campos requeridos.
- **Permisos insuficientes:** No puedes realizar esta acción.
- **Error de servidor:** Vuelve a intentarlo más tarde.

---

## Auditoría
El sistema registra automáticamente:
- Usuario que creó, editó o inhabilitó un evento.
- Fechas de creación, modificación e inhabilitación.
