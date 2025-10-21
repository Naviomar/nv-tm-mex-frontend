---
title: Suppliers – Introducción
summary: Catálogo de proveedores.
order: 4
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-suppliers
roles: [Administrador, Finanzas, Operaciones]
tags: [configuracion, suppliers, proveedores, catalogos, finanzas]
---

# Objetivo
Mantener un catálogo centralizado de proveedores, incluyendo tipo de proveedor, condiciones de crédito, RFC y datos relacionados. Este catálogo se utiliza en operaciones financieras y logísticas.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar proveedores.
- Valida duplicados por nombre.
- Integra formularios relacionados: cuentas bancarias, direcciones y correos electrónicos.
- Registra plazos de crédito y RFC.

# Prerrequisitos
- Permisos: `suppliers-manage`
- Catálogos auxiliares cargados (tipos de proveedores, países).

# Navegación
- Menú principal: **Configuration → Suppliers**
- Ruta directa: `/configuration/suppliers`

# Flujo general de uso
1. Ingresar al módulo de Suppliers.
2. Registrar proveedor con nombre, tipo, días de crédito y RFC.
3. Validar duplicados por nombre antes de guardar.
4. Asociar cuentas bancarias, direcciones y correos electrónicos.
5. Guardar y habilitar para uso en órdenes y pagos.

> **Recomendación:** Usa los catálogos de tipos de proveedor antes de dar de alta nuevos.

---

## Vistas principales
- **Listado:** Todos los proveedores, con filtros por nombre, tipo y RFC.
- **Formulario:** Alta/edición con validación en tiempo real.
- **Detalle:** Información completa más relaciones (bancos, direcciones, emails).

## Campos y validaciones
- **Nombre:** Obligatorio, único.
- **Tipo de proveedor:** Obligatorio (selección de catálogo).
- **Días de crédito:** Obligatorio, valor numérico.
- **RFC / Tax number:** Obligatorio.
- **Cuentas bancarias:** Opcionales, gestionadas en formulario relacionado.
- **Direcciones:** Opcionales, gestionadas en formulario relacionado.
- **Correos electrónicos:** Opcionales, gestionados en formulario relacionado.
- **Estatus:** Activo/Inactivo.

---

## Casos de uso
- **Crear proveedor:** Completar datos básicos y opcionales.
- **Editar proveedor:** Actualizar datos con validaciones.
- **Inhabilitar proveedor:** Inactivo, pero mantiene historial.
- **Reactivar proveedor:** Puede volver a usarse.
- **Buscar proveedor:** Por nombre, tipo o RFC.

---

## Permisos necesarios
- **Ver proveedores:** `suppliers-view`
- **Crear proveedor:** `suppliers-create`
- **Editar proveedor:** `suppliers-edit`
- **Eliminar/Inhabilitar:** `suppliers-delete`

---

## Errores comunes
- **Nombre duplicado:** Ya existe un proveedor con este nombre.
- **RFC inválido:** No cumple formato requerido.
- **Crédito inválido:** Días de crédito no numéricos o negativos.
- **Permisos insuficientes:** No autorizado.
- **Error de servidor:** No se pudo guardar.

---

## Auditoría
El sistema registra:
- Usuario que creó, editó o inhabilitó.
- Fechas de creación, edición e inhabilitación.
- Relación con formularios vinculados (bancos, direcciones, correos).
