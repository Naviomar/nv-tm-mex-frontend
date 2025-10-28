---
title: Executives – Introducción
summary: Catálogo de ejecutivos asociados a clientes, proveedores y operaciones.
order: 12
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-executives
roles: [Administrador, Operaciones, Comercial]
tags: [configuracion, ejecutivos, catalogos, contactos, permisos]
---

# Objetivo
Contar con un catálogo centralizado de ejecutivos que permita asignar responsables a clientes, proveedores y operaciones, asegurando un registro consistente de contactos clave dentro del sistema.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar ejecutivos.
- Valida que no existan ejecutivos duplicados por nombre y puesto.
- El acceso a las funciones está controlado mediante permisos específicos.
- Se registra quién crea, edita o inhabilita a cada ejecutivo para mayor trazabilidad.

# Prerrequisitos
- Debes contar con permisos de acceso al sistema.
- Es necesario tener los catálogos de clientes y proveedores actualizados para asociar ejecutivos correctamente.

# Navegación
- Menú principal: **Configuration → Executives**
- Ruta directa: `/configuration/executives`

# Flujo general de uso
1. Ingresa al módulo de Ejecutivos desde el menú de configuración.
2. Para agregar un ejecutivo, haz clic en "Nuevo ejecutivo" y completa los campos requeridos.
3. Antes de guardar, el sistema validará que no exista un ejecutivo con el mismo nombre y puesto.
4. Puedes buscar ejecutivos existentes usando los filtros por nombre, puesto o estatus.
5. Si necesitas editar o inhabilitar un ejecutivo, selecciona la opción correspondiente en la lista.
6. Los ejecutivos inhabilitados pueden reactivarse en cualquier momento.

> **Recomendación:** Antes de crear un nuevo ejecutivo, utiliza la búsqueda para evitar duplicados.

---

## Vistas principales
- **Listado:** Muestra todos los ejecutivos registrados, con filtros por nombre, puesto y estatus.
- **Formulario:** Permite agregar o editar ejecutivos, con validaciones en tiempo real.
- **Detalle:** Visualiza información completa y las relaciones del ejecutivo con clientes, proveedores y operaciones.

## Campos y validaciones
- **Nombre:** Obligatorio, máximo 100 caracteres.
- **Puesto:** Obligatorio, máximo 100 caracteres.
- **Correo electrónico:** Opcional, con formato válido.
- **Teléfono:** Opcional, numérico y con formato internacional.
- **Estatus:** Activo/Inactivo.

---

## Casos de uso
- **Crear ejecutivo:** Ingresa nombre y puesto. El sistema valida duplicados antes de guardar.
- **Editar ejecutivo:** Modifica datos de un ejecutivo existente con las mismas validaciones.
- **Inhabilitar ejecutivo:** Marca el ejecutivo como inactivo sin eliminar su historial.
- **Reactivar ejecutivo:** Permite volver a habilitar un ejecutivo previamente inhabilitado.
- **Buscar ejecutivo:** Utiliza los filtros para localizar ejecutivos por nombre, puesto o estatus.

---

## Permisos necesarios
Para realizar acciones en el módulo de Ejecutivos, necesitas los siguientes permisos:
- **Ver ejecutivos:** `executives-view`
- **Crear ejecutivo:** `executives-create`
- **Editar ejecutivo:** `executives-edit`
- **Eliminar o restaurar ejecutivo:** `executives-delete`

Si no cuentas con alguno de estos permisos, solicita acceso a tu administrador del sistema.

---

## Errores comunes
- **Nombre duplicado:** Ya existe un ejecutivo con este nombre y puesto.
- **Campos vacíos:** Nombre o puesto no pueden estar vacíos.
- **Formato inválido:** El correo electrónico no cumple con el formato correcto.
- **Permisos insuficientes:** No tienes autorización para realizar esta acción.
- **Error de servidor:** No fue posible procesar tu solicitud, inténtalo más tarde.

---

## Auditoría
El sistema registra automáticamente:
- Quién creó, editó o inhabilitó cada ejecutivo.
- Fechas de creación, actualización e inhabilitación.

Esto permite mantener un historial confiable y seguro de todas las acciones realizadas en el catálogo de ejecutivos.
