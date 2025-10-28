---
title: Consignees MBL – Introducción
summary: Catálogo de consignees asociados a Master Bill of Lading (MBL).
order: 11
status: draft
version: 1.0.0
updatedAt: 2025-09-17
module: configuration-consignees-mbl
roles: [Administrador, Operaciones]
tags: [configuracion, consignees, mbl, catalogo, permisos]
---

# Objetivo
Contar con un catálogo centralizado de **consignees asociados a Master Bill of Lading (MBL)**, que permita registrar su nombre y definir si generan procesos de **demurrages**.  
Este catálogo facilita la trazabilidad en operaciones logísticas, evitando duplicados mediante validación de similares y asegurando consistencia en el sistema.

# Alcance
- Permite crear, editar, buscar, inhabilitar y reactivar consignees MBL.  
- Valida en tiempo real campos obligatorios y coincidencias similares.  
- El acceso a las funciones está controlado por permisos específicos.  
- Se integra directamente con procesos de **demurrages**.  

# Prerrequisitos
- Debes contar con permisos de acceso al sistema.  
- Permisos específicos requeridos:  
  - `consignees_mbl.view`  
  - `consignees_mbl.create`  
  - `consignees_mbl.update`  
  - `consignees_mbl.delete`  

# Navegación
- Menú principal: **Configuración → Consignees MBL**  
- Ruta directa: `/configuration/consignees-mbl`  

# Flujo general de uso
1. Ingresa al módulo de **Consignees MBL** desde el menú de configuración.  
2. Haz clic en **Nuevo consignee** y completa los campos requeridos.  
3. Usa el botón **Search similar** para verificar posibles duplicados.  
4. Si existen coincidencias, el sistema mostrará un panel y/o modal de confirmación.  
5. Guarda el registro.  
6. El consignee quedará disponible en **operaciones MBL** y **procesos de demurrages**.  

> **Recomendación:** antes de guardar, revisa siempre la lista de similares para evitar duplicados.  

---

## Vistas principales
- **Listado:** muestra todos los consignees con opciones de filtro y búsqueda.  
- **Formulario:** permite agregar o editar consignees, con validaciones en tiempo real.  
- **Panel de similares:** lista de coincidencias detectadas antes de confirmar.  
- **Modal de similares:** confirmación final para proceder con el guardado.  

## Campos y validaciones
- **Nombre:** Obligatorio, no puede estar vacío.  
- **Init demurrages?:** Obligatorio (Sí/No), define si el consignee dispara procesos de demurrages.  

---

## Casos de uso
- **Crear consignee:** Ingresa nombre y define si activa demurrages → valida similares → guarda.  
- **Editar consignee:** Modifica datos de un registro existente con las mismas validaciones.  
- **Inhabilitar consignee:** Marca el registro como inactivo, conservando historial.  
- **Reactivar consignee:** Permite volver a habilitar un consignee previamente inhabilitado.  
- **Buscar consignee:** Usa filtros en el listado o el botón **Search similar**.  

---

## Permisos necesarios
Para realizar acciones en el módulo de Consignees MBL, necesitas los siguientes permisos:  
- **Ver consignees:** `consignees_mbl.view`  
- **Crear consignee:** `consignees_mbl.create`  
- **Editar consignee:** `consignees_mbl.update`  
- **Eliminar o restaurar consignee:** `consignees_mbl.delete`  

Si no cuentas con alguno de estos permisos, solicita acceso a tu administrador del sistema.  

---

## Errores comunes
- **Nombre vacío:** el campo nombre es obligatorio.  
- **Similares encontrados:** ya existen consignees con un nombre parecido.  
- **Formulario inválido:** el formulario no puede enviarse sin validar todos los campos.  
- **Permisos insuficientes:** no tienes autorización para realizar esta acción.  
- **Error de servidor:** no fue posible procesar tu solicitud, inténtalo más tarde.  

---

## Auditoría
El sistema registra automáticamente:  
- Quién creó, editó o inhabilitó cada consignee.  
- Fechas de creación, actualización e inhabilitación.  

Esto permite mantener un historial claro y seguro de todas las acciones realizadas en el catálogo de consignees MBL.  
