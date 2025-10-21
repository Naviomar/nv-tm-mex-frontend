---
title: Shippers – Introducción
summary: Catálogo de shippers (remitentes) y consignees.
order: 3
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-shippers
roles: [Administrador, Operaciones]
tags: [configuracion, shippers, consignees, catalogos, operaciones]
---

# Objetivo
Centralizar la gestión de shippers y consignees, permitiendo registrar direcciones y datos básicos de cada entidad para utilizarlos en operaciones logísticas y documentos.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar shippers.
- Identifica si el registro corresponde a **shipper** y/o **consignee**.
- Valida duplicados mediante búsqueda previa por nombre.
- Registra país, dirección, ciudad, estado y código postal.

# Prerrequisitos
- Permisos: `shippers-manage`
- Catálogo de países actualizado.

# Navegación
- Menú principal: **Configuration → Shippers**
- Ruta directa: `/configuration/shippers`

# Flujo general de uso
1. Ingresar al módulo de Shippers.
2. Registrar un nuevo shipper con nombre, país y dirección.
3. El sistema valida duplicados por nombre antes de guardar.
4. Definir si el registro es shipper, consignee o ambos.
5. Guardar y usar en operaciones (clientes, proveedores, documentos de embarque).

> **Nota:** Siempre buscar antes de crear un shipper para evitar duplicados.

---

## Vistas principales
- **Listado:** Shippers con filtros por nombre, país y estatus.
- **Formulario:** Alta/edición con validación en tiempo real.
- **Detalle:** Datos completos con relaciones en operaciones.

## Campos y validaciones
- **Nombre:** Obligatorio, único.
- **¿Es shipper? / ¿Es consignee?:** Obligatorio seleccionar al menos uno.
- **País:** Obligatorio.
- **Dirección:** Opcional, pero recomendable.
- **Ciudad, Estado, Código Postal:** Opcionales.
- **Estatus:** Activo/Inactivo.

---

## Casos de uso
- **Crear shipper:** Completar datos básicos y marcar roles.
- **Editar shipper:** Actualizar datos, respetando validaciones.
- **Inhabilitar:** El registro queda inactivo sin perder historial.
- **Reactivar:** Se puede reusar en operaciones.
- **Buscar:** Filtros por nombre y país.

---

## Permisos necesarios
- **Ver shippers:** `shippers-view`
- **Crear shipper:** `shippers-create`
- **Editar shipper:** `shippers-edit`
- **Eliminar/Inhabilitar:** `shippers-delete`

---

## Errores comunes
- **Nombre duplicado:** Ya existe un shipper con ese nombre.
- **Falta país:** No se seleccionó país.
- **Permisos insuficientes:** El usuario no tiene acceso.
- **Error de validación:** No se seleccionó shipper/consignee.
- **Error de servidor:** No se pudo guardar.

---

## Auditoría
El sistema registra:
- Usuario que creó, editó o inhabilitó.
- Fechas de creación, edición e inhabilitación.
