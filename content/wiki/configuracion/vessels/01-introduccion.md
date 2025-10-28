---
title: Vessels – Introducción
summary: Catálogo de embarcaciones utilizadas en los servicios marítimos.
order: 2
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-vessels
roles: [Administrador, Operaciones]
tags: [configuracion, vessels, barcos, catalogos, permisos]
---

# Objetivo
Contar con un catálogo centralizado de embarcaciones (vessels) asociadas a líneas navieras. Esto facilita la gestión de viajes (voyages) y asegura que los registros de embarques estén vinculados a barcos válidos y actualizados.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar vessels.
- Cada vessel debe estar asociado a una línea naviera.
- Opción de crear un viaje (voyage) inmediatamente después de registrar el vessel.
- El acceso a las funciones está controlado por permisos.
- Se registra quién crea, edita o elimina cada vessel.

# Prerrequisitos
- Contar con permisos de acceso.
- Tener configurado previamente el catálogo de líneas navieras.

# Navegación
- Menú principal: **Configuration → Vessels**
- Ruta directa: `/configuration/vessels`

# Flujo general de uso
1. Ingresa al módulo de Vessels.
2. Para agregar un nuevo vessel, selecciona la línea naviera y el nombre del barco.
3. Antes de guardar, puedes optar por crear directamente un viaje (voyage).
4. Usa los filtros para localizar un vessel por nombre o línea.
5. Edita, inhabilita o reactiva un vessel según lo necesites.

---

## Vistas principales
- **Listado:** Muestra todas las embarcaciones registradas.
- **Formulario:** Permite crear o editar un vessel.
- **Detalle:** Visualiza la información completa del barco y sus viajes relacionados.

## Campos y validaciones
- **Línea naviera:** Obligatorio, seleccionada del catálogo.
- **Nombre del vessel:** Obligatorio, único por línea naviera.

---

## Casos de uso
- **Crear vessel:** Ingresa línea y nombre, con validaciones.
- **Crear vessel y voyage:** Opción para enlazar viaje desde la creación del barco.
- **Editar vessel:** Actualiza la información asociada.
- **Inhabilitar vessel:** Marca como inactivo, manteniendo historial.
- **Reactivar vessel:** Habilita un barco inactivo.
- **Buscar vessel:** Filtra por nombre o línea.

---

## Permisos necesarios
- **Ver vessels:** `vessels-view`
- **Crear vessel:** `vessels-create`
- **Editar vessel:** `vessels-edit`
- **Eliminar o restaurar vessel:** `vessels-delete`

---

## Errores comunes
- **Nombre duplicado:** Ya existe un vessel con este nombre en la misma línea.
- **Línea no seleccionada:** Campo obligatorio.
- **Permisos insuficientes:** Acción no autorizada.
- **Error de servidor:** Inténtalo más tarde.

---

## Auditoría
El sistema registra:
- Usuario que creó, editó o inhabilitó cada vessel.
- Fechas de creación, actualización e inhabilitación.
