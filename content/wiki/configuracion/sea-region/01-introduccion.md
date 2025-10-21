---
title: Sea Regions – Introducción
summary: Catálogo de regiones marítimas para organización de rutas y operaciones.
order: 8
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-sea-regions
roles: [Administrador, Operaciones, Logística]
tags: [configuracion, sea-regions, catalogos, rutas, permisos]
---

# Objetivo
Contar con un catálogo de regiones marítimas estandarizadas que facilite la clasificación, búsqueda y gestión de rutas en operaciones logísticas internacionales.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar regiones marítimas.
- Incluye validaciones para evitar duplicados mediante comparación de nombres similares.
- El acceso está regulado mediante permisos específicos.
- Se mantiene un historial de auditoría de todas las acciones realizadas.

# Prerrequisitos
- Contar con permisos para acceder al módulo de regiones marítimas.

# Navegación
- Menú principal: **Configuration → Sea Regions**
- Ruta directa: `/configuration/sea-regions`

# Flujo general de uso
1. Ingresa al módulo de Sea Regions.
2. Haz clic en **Nueva región** para crear un registro.
3. Completa los campos requeridos: nombre y código.
4. Antes de guardar, el sistema buscará posibles coincidencias.
5. Si no hay duplicados, confirma y guarda el registro.
6. Edita o inhabilita regiones desde el listado según necesidad.
7. Las regiones inhabilitadas pueden reactivarse en cualquier momento.

> **Recomendación:** Antes de crear una región nueva, utiliza la búsqueda de similares para evitar duplicados.

---

## Vistas principales
- **Listado:** Todas las regiones registradas, con filtros de búsqueda.
- **Formulario:** Crear o editar regiones con validación en tiempo real.
- **Detalle:** Muestra información completa y asociaciones relevantes.

## Campos y validaciones
- **Name:** Obligatorio. Texto único.
- **Code:** Obligatorio. Alfanumérico corto.

---

## Casos de uso
- **Crear región:** Completar campos requeridos y validar duplicados.
- **Editar región:** Modificar datos de una región existente.
- **Inhabilitar región:** Marcarla como inactiva sin perder historial.
- **Reactivar región:** Recuperar una región previamente inhabilitada.
- **Buscar región:** Filtrar por nombre o código.

---

## Permisos necesarios
- **Ver regiones:** `sea-regions-view`
- **Crear región:** `sea-regions-create`
- **Editar región:** `sea-regions-edit`
- **Eliminar o restaurar región:** `sea-regions-delete`

---

## Errores comunes
- **Nombre requerido:** Campo obligatorio vacío.
- **Duplicado:** Existe otra región con el mismo nombre.
- **Permisos insuficientes:** El usuario no tiene acceso.
- **Error de servidor:** No se pudo procesar la solicitud.

---

## Auditoría
El sistema registra:
- Usuario que creó, editó o inhabilitó cada región.
- Fechas de creación, actualización e inhabilitación.
