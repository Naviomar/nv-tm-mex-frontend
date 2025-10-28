---
title: Custom Agents – Introducción
summary: Catálogo de agentes aduanales.
order: 6
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: configuration-custom-agents
roles: [Administrador, Operaciones, Logística]
tags: [configuracion, agentes, aduanales, catalogos, operaciones, permisos]
---

# Objetivo
Contar con un catálogo centralizado de agentes aduanales, incluyendo patente, agencia y puertos autorizados, que sirva como referencia en procesos de importación y exportación dentro del sistema.  
Este catálogo asegura que la información esté actualizada, validada y disponible en otros módulos como embarques, facturación y operaciones logísticas.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar agentes aduanales.  
- Valida que no existan nombres o patentes duplicadas.  
- Permite asociar agentes con múltiples puertos (ej. puertos de México).  
- El acceso a las funciones está controlado por permisos específicos.  
- Se registra quién crea, edita o elimina cada agente para mayor seguridad y control.  

# Prerrequisitos
- Debes contar con permisos de acceso al sistema.  
- Es necesario tener actualizado el catálogo de puertos, ya que los agentes se asocian a puertos específicos.  

# Navegación
- Menú principal: **Configuration → Custom Agents**  
- Ruta directa: `/configuration/custom-agents`  

# Flujo general de uso
1. Ingresa al módulo de Agentes Aduanales desde el menú de configuración.  
2. Para agregar un agente, haz clic en **"Nuevo agente"** y completa los campos requeridos.  
3. Antes de guardar, el sistema validará que no exista un agente con el mismo nombre o patente.  
4. Puedes asociar al agente con uno o más puertos (ejemplo: puertos mexicanos).  
5. Si necesitas editar o inhabilitar un agente, selecciona la opción correspondiente en la lista.  
6. Los agentes inhabilitados pueden reactivarse en cualquier momento.  

> **Recomendación:** Antes de crear un nuevo agente, utiliza la función **"Search similar"** para evitar duplicados.

---

## Vistas principales
- **Listado:** Muestra todos los agentes registrados, con filtros y opciones de búsqueda.  
- **Formulario:** Permite agregar o editar agentes, con validaciones en tiempo real.  
- **Detalle:** Visualiza información completa del agente, incluyendo sus puertos asociados.  

## Campos y validaciones
- **Nombre:** Obligatorio y único.  
- **Patente:** Obligatoria y única.  
- **Agencia:** Opcional.  
- **Puertos:** Selección múltiple, al menos uno si aplica.  

---

## Casos de uso
- **Crear agente:** Ingresa nombre, patente, agencia (opcional) y selecciona puertos. El sistema valida duplicados antes de guardar.  
- **Editar agente:** Modifica los datos de un agente existente con las mismas validaciones.  
- **Inhabilitar agente:** Marca al agente como inactivo, pero conserva su historial.  
- **Reactivar agente:** Permite volver a habilitar un agente previamente inhabilitado.  
- **Buscar agente:** Utiliza los filtros por nombre, patente o puerto.  
- **Buscar similares:** Usa la función de búsqueda para identificar agentes con datos parecidos antes de crear uno nuevo.  

---

## Permisos necesarios
Para realizar acciones en el módulo de Agentes Aduanales, necesitas los siguientes permisos:  
- **Ver agentes:** `custom-agents-view`  
- **Crear agente:** `custom-agents-create`  
- **Editar agente:** `custom-agents-edit`  
- **Eliminar o restaurar agente:** `custom-agents-delete`  

Si no cuentas con alguno de estos permisos, solicita acceso a tu administrador del sistema.  

---

## Errores comunes
- **Nombre duplicado:** Ya existe un agente con ese nombre.  
- **Patente duplicada:** Ya existe un agente con esa patente.  
- **Campos requeridos vacíos:** Nombre y patente son obligatorios.  
- **Permisos insuficientes:** No tienes autorización para realizar esta acción.  
- **Error de servidor:** No fue posible procesar tu solicitud, inténtalo más tarde.  

---

## Auditoría
El sistema registra automáticamente:  
- Quién creó, editó o inhabilitó cada agente.  
- Fechas de creación, actualización e inhabilitación.  

Esto permite mantener un historial claro y seguro de todas las acciones realizadas en el catálogo de agentes aduanales.
