---
title: Ports – Introducción
summary: Catálogo de puertos.
order: 7
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-ports
roles: [Administrador, Operaciones]
tags: [configuracion, ports, catalogos, operaciones, permisos]
---

# Objetivo
Contar con un catálogo de puertos centralizado, que permita registrar y administrar información estandarizada de los puertos para operaciones de transporte y logística.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar puertos.
- Cada puerto se asocia a un país y puede incluir datos adicionales como ciudad o código.
- Acceso y acciones controladas por permisos de usuario.

# Prerrequisitos
- Contar con permisos de acceso al sistema.
- Tener el catálogo de países actualizado.

# Navegación
- Menú principal: **Configuration → Ports**
- Ruta directa: `/configuration/ports`

# Flujo general de uso
1. Ingresa al módulo de Ports.
2. Haz clic en **Nuevo port** para crear uno nuevo.
3. Completa los campos obligatorios: nombre, código y país.
4. Guarda el registro. El sistema validará que no haya duplicados.
5. Para editar o inhabilitar un puerto, selecciona la acción correspondiente en el listado.
6. Los puertos inhabilitados pueden reactivarse en cualquier momento.

> **Recomendación:** Mantén actualizada la información del puerto para evitar inconsistencias en operaciones posteriores.

---

## Vistas principales
- **Listado:** Todos los puertos registrados, con filtros de búsqueda.
- **Formulario:** Crear o editar puertos con validación en tiempo real.
- **Detalle:** Información completa de un puerto.

## Campos y validaciones
- **Country:** Obligatorio. Seleccionado de catálogo.
- **Port name (Name):** Obligatorio. Texto único.
- **Code:** Obligatorio. Texto, máximo 10 caracteres.
- **City:** Opcional.
- **Address:** Opcional (si aplica).

---

## Casos de uso
- **Crear port:** Completar los campos obligatorios y guardar.
- **Editar port:** Modificar datos de un puerto existente.
- **Inhabilitar port:** Marcar un puerto como inactivo.
- **Reactivar port:** Recuperar un puerto previamente inhabilitado.
- **Buscar port:** Filtrar por nombre, país o código.

---

## Permisos necesarios
- **Ver ports:** `ports-view`
- **Crear port:** `ports-create`
- **Editar port:** `ports-edit`
- **Eliminar o restaurar port:** `ports-delete`

---

## Errores comunes
- **Nombre o código vacío:** Campos obligatorios faltantes.
- **Duplicado:** Ya existe un puerto con el mismo nombre o código.
- **Permisos insuficientes:** El usuario no tiene autorización.
- **Error de servidor:** No se pudo procesar la solicitud.

---

## Auditoría
El sistema registra:
- Usuario que creó, editó o inhabilitó el puerto.
- Fechas de creación, actualización e inhabilitación.
