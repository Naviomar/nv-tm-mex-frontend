---
title: Customers – Introducción
summary: Catálogo de clientes (consignatarios) para facturación y operaciones.
order: 3
status: stable
version: 1.0.0
updatedAt: 2025-09-29
module: configuration-customers
roles: [Administrador, Operaciones, Finanzas]
tags: [configuracion, clientes, catalogos, facturacion, permisos]
---

# Objetivo
Contar con un catálogo centralizado de **clientes** para garantizar la correcta facturación, trazabilidad de operaciones y relaciones comerciales dentro del sistema.

---

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar clientes.
- Valida que no existan duplicados en **Nombre/Razón Social** y **RFC**.
- Controla accesos mediante permisos específicos.
- Registra todas las acciones de creación, edición e inhabilitación.

---

# Prerrequisitos
- Debes contar con permisos de acceso al sistema.
- Tener configurados previamente catálogos de **Countries** y **Agents**.

---

# Navegación
- Menú principal: **Configuration → Customers**
- Ruta directa: `/configuration/customers`

---

# Flujo general de uso
1. Ingresa al módulo de **Customers** desde el menú de configuración.
2. Para agregar un cliente, haz clic en **Nuevo cliente** y completa los campos requeridos.
3. El sistema validará que no exista un cliente con el mismo nombre o RFC.
4. Puedes buscar clientes existentes por nombre, RFC o país.
5. Si necesitas editar o inhabilitar un cliente, selecciona la opción correspondiente en la lista.
6. Los clientes inhabilitados pueden reactivarse en cualquier momento.

> **Recomendación:** Siempre verifica duplicados antes de guardar un nuevo cliente.

---

## Vistas principales
- **Listado:** Muestra todos los clientes registrados, con opciones de filtro y búsqueda.
- **Formulario:** Permite agregar o editar clientes, con validaciones en tiempo real.
- **Detalle:** Visualiza información completa y relaciones con facturas y agentes.

---

## Campos y validaciones
- **Nombre / Razón Social:** Obligatorio y único.
- **RFC / Tax ID:** Obligatorio y único.
- **País:** Obligatorio.
- **Dirección fiscal:** Opcional.

---

## Casos de uso
- **Crear cliente:** Ingresa nombre, RFC, país y dirección fiscal (opcional).
- **Editar cliente:** Modifica los datos de un cliente existente con validaciones.
- **Inhabilitar cliente:** Marca el cliente como inactivo, conservando su historial.
- **Reactivar cliente:** Permite volver a habilitar un cliente previamente inhabilitado.
- **Buscar cliente:** Usa filtros por nombre, RFC o país.

---

## Permisos necesarios
- **Ver clientes:** `customers-view`
- **Crear cliente:** `customers-create`
- **Editar cliente:** `customers-edit`
- **Eliminar o restaurar cliente:** `customers-delete`

---

## Errores comunes
- **Nombre duplicado:** Ya existe un cliente con este nombre.
- **RFC inválido o duplicado:** El RFC no cumple el formato o ya existe.
- **País no seleccionado:** El campo país es obligatorio.
- **Permisos insuficientes:** El usuario no tiene autorización.
- **Error de servidor:** No fue posible procesar la solicitud.

---

## Auditoría
El sistema registra automáticamente:
- Quién creó, editó o inhabilitó cada cliente.
- Fechas de creación, actualización e inhabilitación.

---

# Catálogo de Customers Groups

## Objetivo
Administrar **grupos de clientes** que permiten agrupar usuarios en función de criterios operativos o comerciales, facilitando búsquedas, segmentaciones y análisis dentro del módulo de Customers.

---

## Navegación
- Menú principal: **Configuration → Customers Groups**
- Ruta directa: `/configuration/customers/groups`

---

## Vistas principales
- **Listado:** Muestra todos los grupos de clientes con su nombre, fecha de creación y acciones disponibles.
- **Acciones rápidas:** Ver detalle del grupo o eliminarlo.
- **Búsqueda:** Permite filtrar por nombre del grupo.

---

## Flujo de uso
1. Ingresa al submódulo Customers Groups.

2. Utiliza el filtro por nombre y presiona Search para localizar un grupo.

3. Selecciona View para consultar el detalle de clientes asociados.

4. Si es necesario, usa la opción Eliminar para inactivar un grupo.

5. Puedes limpiar los filtros en cualquier momento con Clear.

6. Navega entre páginas mediante la paginación inferior.

---

## Campos y validaciones
- **Name Group:** Obligatorio y único.
- **Created at:** Fecha automática del registro.
- **Acciones:** Disponibles según permisos (ver, eliminar).

---

## Casos de uso
- **Buscar grupo:** Filtrar por nombre y consultar resultados.
- **Ver detalle:** Abrir grupo y revisar clientes asignados.
- **Eliminar grupo:** Inhabilitar un grupo con confirmación previa.
- **Reactivar grupo:** Restaurar un grupo eliminado desde administración.

---

## Crear Consignee Group

### Objetivo
Facilitar la creación de **nuevos grupos de clientes**, validando la información y evitando duplicados mediante búsqueda de similitudes.

---

### Flujo de creación
1. Ingresa a **Customers → Customers Groups → Nuevo grupo**.
2. Completa los campos obligatorios:
   - **Name Group**
   - **Code** (opcional).
3. Haz clic en Save para validar la información.

4. El sistema buscará grupos similares y mostrará coincidencias.

5. Si confirmas, el grupo se registrará y se mostrará un mensaje de éxito.

6. Si cancelas, podrás modificar la información antes de guardar.

---

### Funciones adicionales
- **Search similar:** Busca grupos con nombres parecidos y muestra los resultados en pantalla o en un cuadro de diálogo.
- **Cancel:** Regresa al listado de grupos sin guardar cambios.
- **Save:** Valida y crea el grupo siempre que no existan duplicados.

---

### Errores comunes
- **Name vacío:** No se permite guardar sin un nombre.
- **Grupo duplicado:** El sistema detecta coincidencias y solicita confirmación.
- **Validación pendiente:** Se intenta guardar sin pasar por la búsqueda de similitud.

---

## Permisos necesarios
- **Ver grupos:** `customersgroups-view`
- **Crear grupo:** `customersgroups-create`
- **Editar grupo:** `customersgroups-edit`
- **Eliminar o restaurar grupo:** `customersgroups-delete`

---

## Auditoría
El sistema registra:
- Quién creó, editó o eliminó un grupo.
- Fechas de creación, validación y actualizaciones.
- Historial de reactivaciones.
