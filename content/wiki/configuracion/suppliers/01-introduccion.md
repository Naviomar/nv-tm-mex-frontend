---
title: Catálogo de Suppliers (Proveedores)
summary: Administración de proveedores, incluyendo alta, edición, direcciones, correos electrónicos, bancos y validación de duplicados.
roles: [Administrador, Operaciones, Facturación]
tags: [configuración, suppliers, proveedores, catálogo]
order: 10
status: draft
version: 1.0.0
updatedAt: 2025-09-10
module: configuration-suppliers
permalink: /manual/suppliers
---

# 1. Objetivo y alcance
Gestionar proveedores del sistema, permitiendo registrar información básica (nombre, RFC, tipo, días de crédito) y asociar direcciones, bancos y correos electrónicos.  
Incluye validación para evitar duplicados.

# 2. Prerrequisitos
- Permisos: `suppliers.create`, `suppliers.update`, `suppliers.view`, `suppliers.delete`
- Datos maestros: Catálogo de **Tipos de proveedores**
- Integraciones: CFDI (SAT), Bancos

# 3. Navegación en la app
- Ruta de menú: `Configuración > Catálogos > Proveedores`
- URL: `/configuration/suppliers`
- Secciones/pestañas:
  - Datos básicos
  - Bancos
  - Direcciones
  - Correos electrónicos

# 4. Conceptos clave
- **RFC (Tax Number):** Identificador fiscal del proveedor.
- **Credit Days:** Plazo de pago acordado con el proveedor.
- **Supplier Type:** Clasificación del proveedor (ej. servicios, transporte, insumos).
- **Similar Suppliers:** Proveedores con nombres similares detectados al intentar un alta.

# 5. Flujo de negocio (E2E)
1. Usuario accede al módulo de **Suppliers**.
2. Ingresa los datos básicos obligatorios (Nombre, RFC, Tipo, Días de crédito).
3. El sistema valida si existen proveedores similares.
4. Si hay coincidencias:
   - Muestra un listado de proveedores similares.
   - El usuario puede cancelar o confirmar el alta.
5. Una vez confirmado, el proveedor queda registrado.
6. Se habilitan las secciones adicionales (direcciones, bancos, correos).
7. El proveedor queda disponible en todo el sistema.

:::tip
El sistema realiza una búsqueda de similares antes de confirmar el alta para evitar duplicados.
:::

# 6. Pantallas y campos
## 6.1 Formulario de Proveedores
**Propósito**: Registrar o editar proveedores.

**Campos**:
- `Name` (obligatorio) — Nombre del proveedor.
- `Supplier type` (obligatorio) — Catálogo de tipos de proveedor.
- `Credit days` (obligatorio) — Número de días de crédito (entero).
- `RFC` (obligatorio) — Registro Federal de Contribuyentes.

**Acciones**:  
- Guardar  
- Cancelar  
- Buscar similares  

**Mensajes del sistema**:
- **Éxito:** "Supplier created" / "Supplier updated"
- **Advertencia:** "Name is required", "Validate form before submit"
- **Confirmación:** "Suppliers with similar name"

_(Figura X — Captura del formulario de alta de proveedor)_

## 6.2 Subformularios asociados
- **Bancos:** Alta/edición de cuentas bancarias.
- **Direcciones:** Registro de direcciones del proveedor.
- **Correos electrónicos:** Registro y validación de emails de contacto.

# 7. Procedimientos
## 7.1 Alta de Proveedor
**Precondiciones**: Usuario con permiso `suppliers.create`.  
**Entradas**: Nombre, RFC, Tipo, Días de crédito.  

**Pasos**:
1. Abrir el formulario en `Configuración > Proveedores > Nuevo`.
2. Completar los campos obligatorios.
3. Presionar **Guardar**.
4. Revisar la ventana de proveedores similares.
5. Confirmar la creación.

**Resultado esperado**: El proveedor queda registrado.  
**Postcondiciones**: El proveedor aparece en el listado y está disponible para ser vinculado a operaciones.

# 8. Reglas de negocio
- El campo **Name** no puede estar vacío.
- El **RFC** debe ser único. En caso de eliminar un proveedor, se agrega sufijo `_deleted_<timestamp>`.
- Solo un **Address** puede estar marcado como `is_default`.
- Los correos electrónicos se administran con validación de duplicados.
- La eliminación/restauración es lógica (SoftDelete).

# 9. Integraciones
- **CFDI/SAT:** Validación de RFC y CFDI asociados al proveedor.
- **Bancos:** Alta de cuentas bancarias vinculadas al proveedor.
- **Interno:** Relación con módulos de Compras y Facturación.
