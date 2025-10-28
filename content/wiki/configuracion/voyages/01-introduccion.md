---
title: Voyages – Introducción
summary: Catálogo de viajes (voyages) asociados a buques y operaciones de importación/exportación.
order: 5
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-voyages
roles: [Administrador, Operaciones]
tags: [configuracion, voyages, buques, importacion, exportacion, catalogos, operaciones]
---

# Objetivo
Administrar el catálogo de viajes (**voyages**) asociados a buques, definiendo si corresponden a importación o exportación y registrando los puertos de origen/destino con sus fechas estimadas y reales de arribo.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar viajes.
- Asocia cada viaje a un **buque** registrado en el catálogo de vessels.
- Define si el viaje es de **importación** o **exportación**.
- Permite agregar múltiples destinos (puertos) con fechas ETA y ATA.
- Valida que cada viaje tenga al menos un origen/destino.

# Prerrequisitos
- Permisos: `voyages-manage`
- Catálogo de buques actualizado.
- Catálogo de puertos cargado.

# Navegación
- Menú principal: **Configuration → Voyages**
- Ruta directa: `/configuration/voyages`

# Flujo general de uso
1. Ingresar al módulo de Voyages.
2. Seleccionar un **buque** del catálogo (o crear uno nuevo).
3. Definir el nombre del viaje y si corresponde a importación o exportación.
4. Agregar al menos un puerto de origen/destino con su **ETA** (obligatorio) y **ATA** (opcional).
5. Guardar el registro. El sistema valida que existan destinos antes de crear el viaje.

> **Nota:** Si el viaje es **importación**, se muestran puertos de varios países excepto México.  
> Si es **exportación**, únicamente se muestran puertos de México.

---

## Vistas principales
- **Listado:** Todos los viajes registrados, con filtros por buque, nombre, estatus e import/export.
- **Formulario:** Alta/edición de viajes con selección de buque, import/export y destinos.
- **Detalle:** Información completa con puertos de origen/destino y fechas.

## Campos y validaciones
- **Vessel (Buque):** Obligatorio, seleccionado de catálogo.
- **Nombre del viaje:** Obligatorio.
- **Import/Export:** Obligatorio (I/E).
- **Puertos (destinations):**  
  - **Port:** Obligatorio.  
  - **ETA (Estimated Time of Arrival):** Obligatorio.  
  - **ATA (Actual Time of Arrival):** Opcional.  
- **Estatus:** Activo/Inactivo.

---

## Casos de uso
- **Crear voyage:** Seleccionar buque, indicar import/export, agregar destinos y guardar.
- **Editar voyage:** Modificar información y destinos existentes.
- **Eliminar destino:** Quitar un puerto agregado antes de guardar.
- **Inhabilitar voyage:** Marca el viaje como inactivo sin perder historial.
- **Reactivar voyage:** Permite reutilizar un viaje previamente inactivo.

---

## Permisos necesarios
- **Ver voyages:** `voyages-view`
- **Crear voyage:** `voyages-create`
- **Editar voyage:** `voyages-edit`
- **Eliminar/Inhabilitar:** `voyages-delete`

---

## Errores comunes
- **Sin destinos agregados:** No se puede guardar un viaje sin al menos un puerto.
- **Falta buque:** No se seleccionó un vessel.
- **Falta import/export:** No se indicó si es importación o exportación.
- **Campos incompletos en destinos:** ETA no puede estar vacío.
- **Permisos insuficientes:** Usuario no autorizado.
- **Error de servidor:** No se pudo guardar.

---

## Auditoría
El sistema registra:
- Usuario que creó, editó o inhabilitó cada viaje.
- Fechas de creación, edición e inhabilitación.
- Historial de destinos agregados y eliminados.
