---
title: Containers – Introducción
summary: Catálogo de contenedores.
order: 12
status: draft
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-containers
roles: [Administrador, Operaciones]
tags: [configuracion, contenedores, catalogo, permisos]
---

# Objetivo
Gestionar un catálogo centralizado de **contenedores**, permitiendo registrar su nombre, código, capacidad en TEUs y si son refrigerados (*reefer*).  
Este catálogo facilita la selección en procesos operativos y garantiza que la información sea consistente en todo el sistema.

# Alcance
- Creación, edición, búsqueda, inhabilitación y reactivación de contenedores.  
- Validación en tiempo real de campos obligatorios y de posibles duplicados mediante búsqueda de similares.  
- Control de acceso a las funciones mediante permisos específicos.  
- Relación directa con operaciones logísticas que requieran selección de contenedores.  

# Prerrequisitos
- Debes contar con permisos de acceso al sistema.  
- Permisos específicos requeridos:  
  - `containers.view`  
  - `containers.create`  
  - `containers.update`  
  - `containers.delete`  

# Navegación
- Menú principal: **Configuración → Containers**  
- Ruta directa: `/configuration/containers`  

# Flujo general de uso
1. Ingresa al módulo de **Containers** desde el menú de configuración.  
2. Para agregar un nuevo contenedor, haz clic en **Nuevo contenedor** y completa los campos requeridos.  
3. Utiliza el botón **Search similar** para validar si existen registros con nombre parecido.  
4. Si hay coincidencias, el sistema mostrará un panel y/o modal de similares para confirmar.  
5. Guarda el registro.  
6. El contenedor quedará disponible en procesos de operaciones.  

> **Recomendación:** antes de guardar un contenedor, usa la búsqueda de similares para evitar duplicados.  

---

## Vistas principales
- **Listado:** muestra todos los contenedores registrados, con opciones de filtro y búsqueda.  
- **Formulario:** permite alta/edición de contenedores, con validaciones en tiempo real.  
- **Panel de similares:** muestra coincidencias detectadas antes de confirmar el guardado.  
- **Modal de similares:** confirmación final antes de guardar.  

## Campos y validaciones
- **Container name:** Obligatorio, no puede estar vacío.  
- **Code:** Obligatorio, alfanumérico, máximo 10 caracteres.  
- **Teus:** Obligatorio, numérico, define la capacidad del contenedor.  
- **Reefer:** Obligatorio (Sí/No), indica si el contenedor es refrigerado.  

---

## Casos de uso
- **Crear contenedor:** Ingresa nombre, código, TEUs y reefer → valida similares → guarda.  
- **Editar contenedor:** Modifica los datos de un registro existente con las mismas validaciones.  
- **Inhabilitar contenedor:** Marca el registro como inactivo, conservando historial.  
- **Reactivar contenedor:** Permite habilitar nuevamente un contenedor inhabilitado.  
- **Buscar contenedor:** Usa filtros en el listado o el botón **Search similar**.  

---

## Permisos necesarios
Para operar en el módulo de Containers, necesitas los siguientes permisos:  
- **Ver contenedores:** `containers.view`  
- **Crear contenedor:** `containers.create`  
- **Editar contenedor:** `containers.update`  
- **Eliminar o restaurar contenedor:** `containers.delete`  

Si no cuentas con alguno de estos permisos, solicita acceso a tu administrador del sistema.  

---

## Errores comunes
- **Nombre vacío:** "Name is required".  
- **Similares encontrados:** "Containers with similar name".  
- **Formulario inválido:** "Please fill in all required fields".  
- **Permisos insuficientes:** No tienes autorización para realizar esta acción.  
- **Error de servidor:** No fue posible procesar tu solicitud, inténtalo más tarde.  

---

## Auditoría
El sistema registra automáticamente:  
- **created_by**: usuario que creó el contenedor.  
- **updated_by**: usuario que lo modificó.  
- **deleted_by**: usuario que lo inhabilitó.  
- Fechas de creación, actualización e inhabilitación.  

Esto asegura **trazabilidad, control y seguridad** en la administración del catálogo de contenedores.  
