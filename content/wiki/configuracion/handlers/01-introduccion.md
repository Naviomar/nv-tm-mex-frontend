---
title: Handlers – Introducción
summary: Catálogo de handlers (air handlers).
order: 5
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-handlers
roles: [Administrador, Operaciones]
tags: [configuracion, handlers, catalogos, operaciones, permisos]
---

# Objetivo
Contar con un catálogo centralizado de handlers, que permita registrar y administrar a los responsables de manejo (air handlers) dentro del sistema. Este catálogo facilita la gestión de operaciones y asegura que la información de los handlers esté estandarizada y disponible en todos los módulos donde se requiera.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar handlers.
- Valida que no existan duplicados en los campos obligatorios.
- El acceso a las funciones está controlado mediante permisos específicos.
- Se registra quién crea, edita o elimina cada handler para control y trazabilidad.

# Prerrequisitos
- Contar con permisos de acceso al sistema.
- Tener configurados los catálogos relacionados (ej. países, si aplica asociación futura).

# Navegación
- Menú principal: **Configuration → Handlers**
- Ruta directa: `/configuration/handlers`

# Flujo general de uso
1. Ingresa al módulo de Handlers desde el menú de configuración.
2. Haz clic en "Nuevo handler" para registrar uno nuevo.
3. Completa los campos obligatorios:
   - Nombre
   - Gaffette
4. Guarda el registro. El sistema validará que los campos requeridos estén completos y que no existan duplicados.
5. Para editar o inhabilitar un handler existente, selecciona la opción correspondiente en la lista.
6. Los handlers inhabilitados pueden reactivarse en cualquier momento.

> **Recomendación:** Antes de crear un nuevo handler, utiliza la búsqueda para evitar duplicados.

---

## Vistas principales
- **Listado:** Muestra todos los handlers registrados, con opciones de búsqueda y filtros.
- **Formulario:** Permite agregar o editar handlers con validaciones en tiempo real.
- **Detalle:** Presenta la información completa del handler seleccionado.

## Campos y validaciones
- **Nombre (Name):** Obligatorio, texto, debe ser único.
- **Gaffette:** Obligatorio, texto, máximo 50 caracteres.

---

## Casos de uso
- **Crear handler:** Ingresa nombre y gaffette. El sistema valida antes de guardar.
- **Editar handler:** Permite modificar los datos de un handler existente con las mismas validaciones.
- **Inhabilitar handler:** Marca un handler como inactivo, conservando su historial.
- **Reactivar handler:** Habilita nuevamente un handler previamente inhabilitado.
- **Buscar handler:** Usa filtros o búsqueda por nombre o gaffette.

---

## Permisos necesarios
Para realizar acciones en el módulo de Handlers, se requieren los siguientes permisos:
- **Ver handlers:** `handlers-view`
- **Crear handler:** `handlers-create`
- **Editar handler:** `handlers-edit`
- **Eliminar o restaurar handler:** `handlers-delete`

Si no cuentas con alguno de estos permisos, solicita acceso a tu administrador del sistema.

---

## Errores comunes
- **Nombre duplicado:** Ya existe un handler con el mismo nombre.
- **Gaffette vacío o inválido:** El campo es obligatorio y no puede quedar vacío.
- **Permisos insuficientes:** No tienes autorización para realizar esta acción.
- **Error de servidor:** No fue posible procesar la solicitud, inténtalo más tarde.

---

## Auditoría
El sistema registra automáticamente:
- Quién creó, editó o inhabilitó cada handler.
- Fechas de creación, actualización e inhabilitación.

Esto permite mantener un historial claro y confiable de todas las acciones realizadas en el catálogo de handlers.
