---
title: Freight Forwarders – Introducción
summary: Catálogo de agentes de carga (freight forwarders) para operaciones de transporte.
order: 13
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-freight-forwarders
roles: [Administrador, Operaciones, Logística]
tags: [configuracion, freight, forwarders, catalogos, transporte, agentes, permisos]
---

# Objetivo
Contar con un catálogo centralizado de agentes de carga (freight forwarders), que permita registrar y consultar información fiscal, de contacto y logística de cada uno para las operaciones de transporte.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar agentes de carga.
- Valida que no existan duplicados por nombre o RFC.
- El acceso está controlado por permisos específicos.
- Se registra quién realiza cada acción para mayor trazabilidad.

# Prerrequisitos
- Debes contar con permisos de acceso al sistema.
- Es necesario tener los catálogos de países y grupos de carga actualizados.

# Navegación
- Menú principal: **Configuration → Freight Forwarders**
- Ruta directa: `/configuration/freight-forwarders`

# Flujo general de uso
1. Ingresa al módulo de Freight Forwarders desde el menú de configuración.
2. Para agregar un agente, haz clic en "Nuevo freight forwarder" y completa los campos requeridos.
3. Antes de guardar, el sistema validará que no exista un agente con el mismo nombre o RFC.
4. Puedes buscar agentes existentes usando filtros por nombre, RFC, país o grupo de carga.
5. Si necesitas editar o inhabilitar un freight forwarder, selecciona la opción correspondiente en la lista.
6. Los agentes inhabilitados pueden reactivarse en cualquier momento.

> **Recomendación:** Usa siempre la búsqueda de similares antes de crear un nuevo agente de carga.

---

## Vistas principales
- **Listado:** Muestra todos los agentes registrados, con filtros por nombre, RFC, país y grupo.
- **Formulario:** Permite agregar o editar freight forwarders con validaciones.
- **Detalle:** Visualiza información completa y sus relaciones con clientes, países y operaciones.

## Campos y validaciones
- **Nombre:** Obligatorio y único.
- **RFC / Tax number:** Opcional, alfanumérico y validado según formato fiscal.
- **Nombre de contacto:** Obligatorio, máximo 100 caracteres.
- **Teléfono de contacto:** Opcional, numérico con formato internacional.
- **País:** Obligatorio, seleccionado del catálogo de países.
- **Grupo de carga (Freight group):** Opcional, seleccionado del catálogo de grupos.
- **Dirección:** Opcional, máximo 250 caracteres.
- **Estado / Provincia:** Opcional.
- **Código postal:** Opcional, numérico.
- **Estatus:** Activo/Inactivo.

---

## Casos de uso
- **Crear freight forwarder:** Ingresa nombre, RFC y país. El sistema valida duplicados antes de guardar.
- **Editar freight forwarder:** Modifica datos existentes con las mismas validaciones.
- **Inhabilitar freight forwarder:** Marca al agente como inactivo pero conserva su historial.
- **Reactivar freight forwarder:** Permite volver a habilitar un agente previamente inhabilitado.
- **Buscar freight forwarder:** Usa los filtros por nombre, RFC, país o grupo de carga.

---

## Permisos necesarios
Para realizar acciones en el módulo de Freight Forwarders, necesitas los siguientes permisos:
- **Ver freight forwarders:** `freightForwarders-view`
- **Crear freight forwarder:** `freightForwarders-create`
- **Editar freight forwarder:** `freightForwarders-edit`
- **Eliminar o restaurar freight forwarder:** `freightForwarders-delete`

Si no cuentas con alguno de estos permisos, solicita acceso a tu administrador del sistema.

---

## Errores comunes
- **Nombre duplicado:** Ya existe un freight forwarder con este nombre.
- **RFC inválido o duplicado:** El número fiscal no es válido o ya está registrado.
- **Campos obligatorios vacíos:** Nombre, contacto o país no pueden estar vacíos.
- **Permisos insuficientes:** No tienes autorización para realizar esta acción.
- **Error de servidor:** No fue posible procesar tu solicitud, inténtalo más tarde.

---

## Auditoría
El sistema registra automáticamente:
- Quién creó, editó o inhabilitó cada freight forwarder.
- Fechas de creación, actualización e inhabilitación.

Esto permite mantener un historial seguro y confiable de todas las acciones realizadas en el catálogo de freight forwarders.

---

# Catálogo de Freight Forwarders Groups

## Objetivo 

Administrar grupos de agentes de carga (freight forwarders) que permiten agrupar empresas con funciones o características similares.
Esto facilita la organización, segmentación y búsqueda operativa dentro del módulo de Freight Forwarders.

--- 
## Navegación

- Menú principal: **Configuration → Freight Forwarders Groups**
- Ruta directa: `/configuration/freight-forwarders/groups`

---

## Vistas principales

**Listado**

Presenta todos los grupos registrados con la siguiente información:

- Nombre del grupo

- Lista de freight forwarders asociados

- Fecha de creación

- Acciones disponibles

**Acciones rápidas**

Permite realizar las siguientes acciones por grupo:

- View: Ver detalle del grupo y sus freight forwarders asociados.

- Delete / Restore: Inactivar o reactivar un grupo.

**Búsqueda**

Incluye un filtro por nombre del grupo, con opciones para:

- Search: Ejecutar la búsqueda.

- Clear: Limpiar filtros y restablecer resultados.

---

## Flujo de uso

1. Ingresar al submódulo Freight Forwarders Groups.

2. Escribir el nombre del grupo en el campo de búsqueda y presionar Search.

3. Consultar los resultados en la tabla principal.

4. Seleccionar View para revisar los freight forwarders asociados.

5. Utilizar Delete para inactivar un grupo o Restore para reactivarlo.

6. Cambiar de página mediante la paginación ubicada en la parte inferior.

7. Usar Clear para limpiar los filtros en cualquier momento.

--- 

## Campos y validaciones

| Campo                    | Descripción                              | Validación                 |
| ------------------------ | ---------------------------------------- | -------------------------- |
| **F.F. Group (Name)**    | Nombre del grupo de *freight forwarders* | Obligatorio y único        |
| **Freight forwarder(s)** | Lista de empresas asociadas al grupo     | Automático según relación  |
| **Created at**           | Fecha de creación del registro           | Generada automáticamente   |
| **Acciones**             | Ver o eliminar grupos                    | Según permisos del usuario |

--- 

## Casos de uso 

1. Buscar grupo: Localizar grupos de freight forwarders mediante el filtro por nombre.

2. Ver detalle: Consultar los freight forwarders asociados a un grupo específico.

3. Eliminar grupo: Inhabilitar un grupo con confirmación previa.

4. Reactivar grupo: Restaurar un grupo eliminado desde la administración.

--- 

## Crear Freight Forwarder Group

**Objetivo**

Permitir la creación de nuevos grupos de agentes de carga, asegurando que los nombres no se repitan y manteniendo la coherencia en las asociaciones.

## Flujo de creación

1. Acceder a Freight Forwarders → Freight Forwarders Groups → Nuevo grupo.
2. Completar los campos obligatorios:
    - Name Group*
    - Code (opcional)
3. Hacer clic en Save para validar la información.
4. El sistema verificará la existencia de grupos similares.
5. Confirmar para crear el grupo o cancelar para modificar los datos.
6. Al guardarse correctamente, se mostrará un mensaje de éxito.

--- 
## Funciones adicionales

- Search similar: Busca grupos con nombres similares antes de guardar.
- Cancel: Regresa al listado de grupos sin guardar cambios.
- Save: Valida y registra el grupo, siempre que no haya duplicados.

---

## Errores comunes

| Error                    | Descripción                                           |
| ------------------------ | ----------------------------------------------------- |
| **Name vacío**           | No se permite guardar sin un nombre.                  |
| **Grupo duplicado**      | Se detectan coincidencias y se solicita confirmación. |
| **Validación pendiente** | Intento de guardar sin verificar similitudes.         |

---

## Permisos necesarios

| Acción                     | Permiso                          |
| -------------------------- | -------------------------------- |
| Ver grupos                 | `freightforwardersgroups-view`   |
| Crear grupo                | `freightforwardersgroups-create` |
| Editar grupo               | `freightforwardersgroups-edit`   |
| Eliminar o restaurar grupo | `freightforwardersgroups-delete` |

---

## Auditoría

El sistema mantiene registro de:

- Usuario que creó, editó o eliminó un grupo.
- Fechas de creación, modificación y validación.
- Historial de reactivaciones.

