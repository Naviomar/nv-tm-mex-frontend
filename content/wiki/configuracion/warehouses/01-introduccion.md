---
title: Warehouses – Introducción
summary: Catálogo de almacenes (warehouses) utilizados en operaciones logísticas.
order: 6
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-warehouses
roles: [Administrador, Operaciones, Logística]
tags: [configuracion, almacenes, warehouses, catalogos, operaciones, logistica]
---

# Objetivo
Centralizar la gestión de **almacenes** para su uso en operaciones de importación, exportación y distribución, garantizando información consistente y actualizada en todo el sistema.

# Alcance
- Crear, editar, buscar, inhabilitar y reactivar almacenes.
- Validar que no existan nombres duplicados de almacenes.
- Permitir que cada módulo logístico utilice este catálogo como referencia.
- Controlar el acceso a través de permisos específicos.

# Prerrequisitos
- Permisos: `warehouses-manage`
- Catálogo de países y ciudades actualizado (para asociar ubicación, si aplica).

# Navegación
- Menú principal: **Configuration → Warehouses**
- Ruta directa: `/configuration/warehouses`

# Flujo general de uso
1. Ingresar al módulo de Warehouses.
2. Hacer clic en **Nuevo Warehouse**.
3. Completar los campos requeridos (ej. nombre).
4. Guardar el registro.  
   - Si se detecta un nombre duplicado, el sistema notificará error.  
   - En caso exitoso, mostrará mensaje de confirmación.
5. Para editar, seleccionar un registro del listado y modificar los campos.
6. Para inhabilitar, marcar el warehouse como inactivo.

---

## Vistas principales
- **Listado:** Muestra todos los almacenes, con filtros por nombre y estatus.
- **Formulario:** Permite agregar o editar almacenes, con validaciones en tiempo real.
- **Detalle:** Visualiza la información completa del almacén seleccionado.

## Campos y validaciones
- **Nombre:** Obligatorio, único.  
- **Estatus:** Activo/Inactivo.  
*(Campos adicionales pueden configurarse según el proyecto, como dirección, ciudad o país).*

---

## Casos de uso
- **Crear warehouse:** Ingresar nombre y guardar.
- **Editar warehouse:** Actualizar la información de un almacén existente.
- **Inhabilitar warehouse:** Marcarlo como inactivo, manteniendo historial.
- **Reactivar warehouse:** Volver a habilitar un almacén previamente inactivo.
- **Buscar warehouse:** Usar filtros en el listado.

---

## Permisos necesarios
- **Ver warehouses:** `warehouses-view`
- **Crear warehouse:** `warehouses-create`
- **Editar warehouse:** `warehouses-edit`
- **Eliminar/Inhabilitar:** `warehouses-delete`

---

## Errores comunes
- **Nombre duplicado:** Ya existe un almacén con este nombre.
- **Campo vacío:** El campo *Name* es obligatorio.
- **Permisos insuficientes:** No cuentas con acceso para esta acción.
- **Error de servidor:** No fue posible procesar la solicitud.

---

## Auditoría
El sistema registra automáticamente:
- Usuario que creó, editó o inhabilitó cada almacén.
- Fechas de creación, actualización e inhabilitación.
