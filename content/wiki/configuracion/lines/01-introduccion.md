---
title: Lines – Introducción
summary: Catálogo de líneas y agentes de carga (Freight Lines y Freight Agents).
order: 6
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-lines
roles: [Administrador, Operaciones, Comercial]
tags: [configuracion, lines, freight, catalogos, permisos]
---

# Objetivo
Contar con un catálogo centralizado de líneas y agentes de carga, que permita registrar, buscar y gestionar la información de cada línea de manera organizada.  
Este catálogo asegura consistencia de datos para operaciones comerciales y logísticas.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar líneas o agentes de carga.
- Incluye validaciones contra registros duplicados mediante búsqueda de nombres similares.
- El acceso está controlado por permisos de usuario.
- Registra automáticamente todas las acciones para auditoría.

# Prerrequisitos
- Contar con permisos de acceso al sistema.
- Tener el catálogo de países actualizado (para asociar cada línea a un país).

# Navegación
- Menú principal: **Configuration → Lines**
- Ruta directa: `/configuration/lines`

# Flujo general de uso
1. Ingresa al módulo de Lines.
2. Selecciona **Nuevo line** para crear un registro.
3. Completa los campos requeridos (tipo, nombre, nombre comercial).
4. El sistema validará nombres similares antes de confirmar el guardado.
5. Guarda el registro. Si ya existe un nombre parecido, el sistema mostrará coincidencias.
6. Para editar o inhabilitar un registro, usa las opciones en el listado.
7. Los registros inhabilitados pueden reactivarse en cualquier momento.

> **Recomendación:** Antes de crear una línea nueva, usa la función **Search similar** para evitar duplicados.

---

## Vistas principales
- **Listado:** Muestra todas las líneas registradas con filtros de búsqueda.
- **Formulario:** Permite crear o editar registros con validación en tiempo real.
- **Detalle:** Presenta información ampliada de la línea.

## Campos y validaciones
- **Type:** Obligatorio. Selección entre `Freight Lines` o `Freight Agents`.
- **Name:** Obligatorio. Texto único.
- **Commercial name:** Obligatorio. Texto.
- **Contact name:** Opcional.
- **Country:** Opcional, catálogo desplegable.
- **Address:** Opcional.
- **Zip code:** Opcional.
- **Amacarga Code:** Opcional. Uso exclusivo para fines de Amacarga.

---

## Casos de uso
- **Crear line:** Completa los campos obligatorios y valida duplicados antes de guardar.
- **Editar line:** Permite modificar la información existente.
- **Inhabilitar line:** Desactiva un registro, conservando historial.
- **Reactivar line:** Vuelve a habilitar un registro previamente inhabilitado.
- **Buscar line:** Por tipo, nombre, país o coincidencias similares.

---

## Permisos necesarios
- **Ver lines:** `lines-view`
- **Crear line:** `lines-create`
- **Editar line:** `lines-edit`
- **Eliminar o restaurar line:** `lines-delete`

---

## Errores comunes
- **Nombre requerido:** El campo `Name` no puede estar vacío.
- **Nombre duplicado:** Ya existe una línea con nombre similar.
- **Permisos insuficientes:** No tienes autorización para la acción.
- **Error de servidor:** No se pudo procesar la solicitud.

---

## Auditoría
El sistema registra:
- Usuario que creó, editó o inhabilitó el registro.
- Fechas de creación, actualización e inhabilitación.
