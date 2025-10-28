---
title: Roles and Permissions
summary: Gestión de roles de usuario y permisos asociados dentro del sistema.
order: 2
status: stable
version: 1.0.0
updatedAt: 2025-09-22
module: roles-permissions
roles: [Administrador]
tags: [roles, permisos, seguridad, usuarios]
---

# Introducción
El módulo **Roles and Permissions** permite administrar los roles de los usuarios y los permisos asociados a cada rol.  
Es fundamental para el control de acceso y la seguridad del sistema.

# Componentes principales
- **RolePermissionsTable** → Tabla interactiva para asignar y visualizar permisos por rol.

# Funcionalidades
- Crear, editar y eliminar roles.
- Asignar permisos específicos a cada rol.
- Control de acceso granular a funcionalidades del sistema.

---

**Botones principales (parte superior del módulo)**

| Botón                 | Función                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **CREAR ROLE**       | Permite crear un nuevo **rol de usuario**, asignándole un nombre y posteriormente permisos específicos. |
| **CREAR PERMISO** | Permite registrar un **nuevo permiso individual**, que después podrá asignarse a uno o varios roles.    |

---

**Sección “Roles”**

Esta sección lista todos los roles registrados en el sistema, con sus permisos actuales.

Incluye tres columnas:

| Columna                    | Descripción                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| **Actions**                | Generalmente contiene botones o iconos para editar o eliminar el rol.              |
| **Role Name**              | Nombre del rol en el sistema (por ejemplo: *Admin*, *Importación Marítima Admin*). |
| **Attached permission(s)** | Lista de permisos asignados al rol (en formato de etiquetas o chips).              |

---

**Listado de Roles**

1. Super Admin

- Descripción: “Super Admin have all access.”
 
- No requiere permisos individuales porque tiene acceso total a todo el sistema.

- Es el rol maestro, con control absoluto.

2. Admin

- Permite añadir permisos manualmente con el botón ADD PERMISSION.

- En la imagen no muestra permisos cargados, pero puede servir como rol general de administración interna.

3. Import maritime

- Rol enfocado en operaciones de importación marítima.

- Permite añadir más permisos (botón azul “ADD PERMISSION”).

4. Importación Marítima Admin

- Rol avanzado del área marítima de importación.

- Muestra una gran cantidad de permisos relacionados con:

    - Contenedores (containers-view, containers-create, containers-edit, containers-delete)

    - Agentes de aduana (customs-agents-*)

    - Transitarios o freight forwarders (freight-forwarders-*)

    - Líneas (lines-*)

    - Buques (vessel-lines-*)

    - Referencias de importación marítima (sea-import-references-*)

    - Facturación de clientes (customer-invoices-view)

    - Grupos de consignatarios (consignee-groups-*)

    - Destinos de viaje (voyage-destinations-edit)

    - Control de ganancias (import-maritime-profit)

5. Exportación Marítima Admin

- Rol equivalente al anterior, pero enfocado en la exportación marítima.

- Permisos destacados:

    - sea-export-update-detentions → Actualizar detenciones (containers o demoras).

    - freight-forwarders-view/create/edit/delete

    - shippers-view/create/edit/delete

    - voyages-*

    - sea-export-references-*

    - vessel-lines-*, vessel-names-*

    - export-maritime-profit

6. Importación Aérea Admin

- Rol centrado en operaciones aéreas de importación.

- Permisos observados:

    - air-profit-totals

    - airlines-view/create/edit/delete

    - airports-view/create/edit/delete

    - freight-forwarders-*

    - handlers-* (manejadores de carga aérea)

    - warehouses-* (almacenes)

    - air-import-references-*

7. Exportación Aérea Admin

- Rol para operaciones aéreas de exportación.

- Permisos:

    - air-profit-totals

    - airlines-*, airports-*

    - handlers-*, warehouses-*

    - air-export-references-*

---

**Comportamiento de los Permisos (Chips)**

- Cada permiso aparece en una etiqueta ovalada gris oscuro, con una “X” roja al lado izquierdo, lo que sugiere:

    - Opción de eliminar ese permiso del rol.

    - Formato: módulo-acción (por ejemplo, containers-edit).

- Ejemplo:
sea-import-references-edit → Editar referencias de importación marítima.
warehouses-delete → Eliminar un almacén.

---

**Funcionalidad General del Módulo**

1. Crear roles personalizados.

2. Asignar o eliminar permisos individuales.

3. Ver de un vistazo qué permisos tiene cada área (marítima o aérea).

4. Control jerárquico:

    - Super Admin → acceso total.

    - Admin → acceso controlado por permisos.

    - Importación/Exportación → acceso por área o tipo de transporte.

---

| Elemento                    | Descripción                                                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ubicación**               | Panel administrativo del sistema TM México.                                                                                                    |
| **Funcionalidad principal** | Gestión de Roles y Permisos del sistema.                                                                                                       |
| **Roles observados**        | Super Admin, Admin, Import maritime, Importación Marítima Admin, Exportación Marítima Admin, Importación Aérea Admin, Exportación Aérea Admin. |
| **Tipo de permisos**        | Divididos por área (marítima/aérea) y por acción (view, create, edit, delete).                                                                 |
| **Propósito**               | Mantener un control granular sobre qué usuarios pueden acceder, modificar o eliminar datos en cada módulo operativo.                           |

---

**Propósito principal:**

La página está diseñada para que los administradores gestionen y visualicen los roles de usuario junto con los permisos asociados a cada uno. 
Su objetivo es centralizar el control de accesos dentro de la aplicación, permitiendo revisar, modificar o asignar permisos según el rol.

---

**Estructura de la página**

1. Encabezado principal

- Texto: “Roles and permissions”

- Función: Indicar claramente la sección de administración de roles y permisos.

- Estilo: Texto grande y resaltado para diferenciarlo del resto del contenido.

2. Contenedor de contenido

- Organiza los elementos de manera vertical y con separación uniforme.

- Acomoda la tabla de roles y permisos para que ocupe todo el ancho disponible, adaptándose al tamaño de pantalla.

3. Tabla de roles y permisos

- Contiene una lista de roles existentes en el sistema.
 
- Para cada rol, muestra los permisos asignados, como:

    - Visualización de información

    - Creación de registros

    - Edición de registros

    - Eliminación de registros

- Posibles acciones de usuario sobre la tabla:

    - Asignar permisos: Permitir o revocar privilegios específicos a un rol.

    - Editar rol: Cambiar el nombre o la descripción de un rol.
 
    - Eliminar rol: Remover un rol que ya no sea necesario (con restricciones de seguridad).
 
    - Buscar y filtrar: Filtrar roles por nombre o permisos asociados para encontrar rápidamente lo que se necesita.
 
---

**Lógica**

- La página está conectada a un servicio de API que permite consultar la información de roles y permisos desde la base de datos.

- Los administradores pueden interactuar con la tabla para actualizar permisos o crear nuevos roles, siempre dependiendo de los niveles de acceso que tengan asignados.

- Los metadatos de la página indican que el título que se muestra en el navegador es “Roles and permissions” y que se utiliza un diseño estándar que incluye elementos comunes de la aplicación, como encabezado, menú lateral y pie de página.

---

**Funcionalidad**

- Integración con API:
La página se comunica con un servicio central de API para obtener la información actualizada de roles y permisos. 
Esto asegura que cualquier cambio se refleje de manera inmediata en la aplicación.

- Accesos y permisos de administración:
Solo los usuarios con permisos de administrador o superusuario pueden acceder a esta página y realizar cambios.
Los usuarios sin privilegios adecuados solo pueden visualizar información limitada.

- Interactividad esperada:

    - Los administradores pueden seleccionar un rol y ver todos sus permisos.

    - Pueden asignar nuevos permisos o revocar existentes.

    - Los cambios se reflejan en tiempo real gracias a la integración con el backend.

    - La tabla permite ordenar y buscar roles y permisos para una gestión más eficiente.

---

**Contexto funcional**

- Forma parte de un módulo de administración de usuarios.

- Solo usuarios con permisos elevados pueden acceder y realizar cambios.

- La tabla permite filtrar, ordenar y buscar roles, haciendo más eficiente la gestión de permisos.

- Su diseño modular facilita agregar nuevas funciones en el futuro, como auditoría de cambios o integración con políticas de seguridad.

---

**Consideraciones de diseño**

- Visual: El título y la tabla están organizados para mantener consistencia visual y claridad en la jerarquía de la información.

-Accesibilidad: El encabezado principal asegura que los lectores de pantalla y otras herramientas de accesibilidad puedan interpretar correctamente la estructura de la página.
 
- Reusabilidad: La tabla de roles y permisos es un componente independiente que se puede usar en otras secciones de administración sin modificar la página principal.

---

## Roles and Permissions – Gestión de roles y permisos de usuario

Esta página permite a los administradores gestionar roles de usuario y sus permisos asociados. 
Su objetivo es centralizar el control de accesos dentro de la aplicación, garantizando que cada usuario tenga los privilegios adecuados según su rol.

**Permisos disponibles en el sistema**

Los permisos controlan quién puede realizar acciones sobre usuarios, roles y permisos dentro del módulo de administración. 
Cada permiso se aplica a rutas específicas y determina el nivel de acceso que tiene un usuario.

El módulo de Roles y Permisos permite gestionar la estructura de roles dentro del sistema y los privilegios que cada rol puede tener. Esto garantiza un control granular de los accesos, mejorando la seguridad y la administración de la plataforma.

**Permisos del módulo Roles y Permisos**

1. roles-create

- Descripción: Permite crear nuevos roles dentro del sistema.

- Función: Agrega perfiles de usuario personalizados que luego pueden ser asignados a cuentas individuales.

- Ejemplo de uso: Crear un rol de “Supervisor” o “Analista” con permisos específicos.

2. roles-edit

- Descripción: Permite modificar roles existentes, incluyendo la asignación de permisos.

- Función: Cambia el nombre, la descripción o los permisos asociados a un rol, adaptando su funcionalidad según las necesidades organizativas.

- Ejemplo de uso: Actualizar el rol de “Coordinador” para incluir acceso a nuevas funciones.

3. roles-delete

- Descripción: Permite eliminar roles del sistema.

- Función: Remueve roles que ya no se utilizan, evitando confusiones o accesos obsoletos.

- Ejemplo de uso: Eliminar un rol temporal creado para un proyecto específico que ya finalizó.

4. permissions-create

- Descripción: Permite crear nuevos permisos individuales.

- Función: Agrega acciones específicas que pueden ser asignadas a roles o directamente a usuarios.

- Ejemplo de uso: Crear un permiso llamado “aprobar solicitudes” para asignarlo a un rol.

5. permissions-edit

- Descripción: Permite modificar permisos existentes.

- Función: Cambia la descripción o funcionalidad de un permiso, manteniendo la coherencia de la estructura de roles.

- Ejemplo de uso: Actualizar un permiso de “editar reportes” para incluir nuevas secciones.

6. permissions-delete

- Descripción: Permite eliminar permisos individuales.

- Función: Remueve permisos que ya no son necesarios o que se consideran obsoletos, evitando riesgos de seguridad.

- Ejemplo de uso: Eliminar un permiso que ya no corresponde a ninguna función activa del sistema.

Todos estos permisos pertenecen al módulo de Roles y Permisos, ya que gestionan la estructura de roles y los privilegios asignados a cada rol o permiso individual, garantizando un control centralizado y seguro de los accesos en la aplicación.

---

**Aplicación de permisos a rutas**

- Cada permiso está asociado a rutas específicas dentro del módulo de administración de usuarios.

- Las acciones como crear, editar o eliminar requieren que el usuario tenga explícitamente el permiso correspondiente.

- Los permisos permiten una gestión granular, asegurando que los administradores puedan delegar tareas sin comprometer la seguridad general.

---

**Ejemplo práctico de uso**

1. Un usuario con el rol Administrador podría tener todos los permisos: crear, editar y eliminar usuarios, roles y permisos.

2. Un usuario con el rol Supervisor de departamento podría tener solo:

    - Ver usuarios (users-index y users-view)

    - Actualizar permisos de su departamento (department-coordinator)

3. Un usuario con rol Usuario estándar no tendría permisos de administración, solo acceso a información propia o funciones básicas del sistema.

---

**Objetivos de la página**

Visualizar todos los roles existentes dentro del sistema.

Consultar los permisos asignados a cada rol.

Crear nuevos roles o modificar los existentes.

Asignar o revocar permisos a roles específicos.

Garantizar la seguridad mediante una gestión centralizada de accesos.

---
