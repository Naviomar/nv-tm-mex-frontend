---
title: Refunds – Suppliers
summary: Módulo para gestionar devoluciones de pagos a proveedores, incluyendo filtros, validación y cancelación.
order: 13
status: stable
version: 1.0.0
updatedAt: 2025-09-25
module: refunds-suppliers
roles: [Administrador, Finanzas, Operaciones]
tags: [devoluciones, proveedores, pagos, cfdi, refunds]
---

# Objetivo
Permitir a los usuarios administrar las devoluciones de pagos a proveedores, visualizando CFDI relacionados, montos y estado de la devolución.

# Alcance
Incluye:
- Listado de devoluciones con filtros por folio, cliente, agente aduanal y rango de fechas.  
- Consulta de montos, servicios vinculados y estado de la devolución (Paid / Unpaid).  
- Cancelación de devoluciones con registro de comentarios.  
- Paginación de resultados y gestión de estado eliminado.

# Prerrequisitos

- Catálogos relacionados: **Suppliers**, **Clientes**, **Agentes aduanales**, **Monedas**.

# Navegación
- Menú: `Refunds → Suppliers`  
- Ruta principal: `/refunds`  
- Acciones: `View` para ver detalles, `Delete` para cancelar devoluciones.

# Filtros de búsqueda
1. **Folio:** Texto libre.  
2. **Cliente:** Selección desde ACustomerSearch.  
3. **Agente aduanal:** Selección desde AGlobalSearch.  
4. **Rango de fechas:** Desde y hasta.  
5. Botones **Search** y **Clear** para filtrar o reiniciar.

# Listado de devoluciones
- Tabla con columnas: Acciones, Folio, Beneficiario, Servicios, Monto, Estado, Creado en.  
- Servicios mostrados como chips con referencias de pago.  
- Monto mostrado según moneda y total de la devolución.  
- Estado: Paid (verde) / Unpaid (rojo).  
- Filas eliminadas resaltadas en rojo claro (dark mode rojo oscuro).  

# Paginación
- Paginación arriba y abajo de la tabla.  
- Cambio de página recarga resultados.  

# Cancelación de devolución
1. Seleccionar `Delete` en la fila correspondiente.  
2. Confirmar en diálogo emergente, agregando comentarios obligatorios.  
3. Botón **Yes, I confirm** para ejecutar cancelación.  
4. Botón **Close** para cerrar sin acción.  

# Cálculos
El Total de devolución representa la suma de todos los pagos registrados como reembolsos dentro del sistema. 
Este valor se calcula automáticamente y refleja el importe global devuelto en un proceso determinado.

Además, el total se mantiene actualizado de manera dinámica tanto en los listados como en los detalles de cada devolución. 
Esto permite al usuario consultar de forma inmediata y confiable el monto acumulado, facilitando la conciliación contable, la validación de operaciones financieras y el seguimiento preciso de cada reembolso realizado.

# Validaciones
- Comentarios obligatorios para cancelar devolución.  
- Devolución no puede ser eliminada si ya tiene estado eliminado.  

# Funcionalidades adicionales
- Vaciar filtros con **Clear**.  
- Búsqueda dinámica de clientes y agentes aduanales.  
- Alertas tipo snackbar para errores, información y confirmaciones.  
- Indicadores visuales de estado y selección.  

# Errores comunes
- No se encuentra devolución según filtros aplicados.  
- Comentarios faltantes al intentar eliminar devolución.  
- Devolución ya eliminada previamente.  
