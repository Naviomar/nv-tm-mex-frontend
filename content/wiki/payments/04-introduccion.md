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

# Módulo: Refunds Management (Gestión de Reembolsos)

Este módulo forma parte del sistema de gestión de reembolsos, donde los usuarios pueden consultar, filtrar, visualizar y cancelar los reembolsos registrados.
La ruta principal de acceso es:

---

**Objetivo**
Permitir a los usuarios administrar las devoluciones de pagos a proveedores, visualizando CFDI relacionados, montos y estado de la devolución.

---

**Propósito**

Permitir a los usuarios administrar los reembolsos realizados a clientes o beneficiarios, ofreciendo un control centralizado sobre:

- Folios de reembolso.

- Beneficiarios.

- Servicios vinculados.

- Montos totales.

- Estado de pago (Pagado/No pagado).

- Registro de usuarios y fechas.

Se incluye la funcionalidad de cancelar reembolsos con comentarios obligatorios para mantener trazabilidad y auditoría.

---

**Estructura funcional**

**1. Panel de filtros**

Ubicado en la parte superior, permite buscar y filtrar reembolsos según varios criterios:

- **Folio:** identificador del reembolso.

- **Beneficiario / Cliente:** mediante el componente ACustomerSearch.

- **Agente aduanal:** mediante AGlobalSearch, que permite búsqueda dinámica de agentes de aduana.

- **Fecha desde / Fecha hasta:** para filtrar por rango de fechas de creación.

Incluye botones de acción:

- **Clear** → Limpia todos los filtros y recarga la información.

- **Search** → Aplica los filtros seleccionados.
También se puede presionar Enter para ejecutar la búsqueda.

---

**2. Listado de reembolsos (tabla principal)**

Cada fila representa un reembolso registrado, con las siguientes columnas:

| Columna         | Descripción                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actions**     | Botones para **ver detalles** o **cancelar** el reembolso. Solo se permite cancelar si no ha sido eliminado previamente.                                 |
| **Folio**       | Número de identificación del reembolso.                                                                                                                  |
| **Beneficiary** | Nombre del beneficiario o cliente.                                                                                                                       |
| **Services**    | Lista de servicios asociados al reembolso (chips con referencia de cada servicio).                                                                       |
| **Amount**      | Monto total del reembolso, con formato de moneda y divisa.                                                                                               |
| **Status**      | Estado del pago de la factura relacionada (Pagado/No pagado), representado con chips de color verde o rojo. <br>Incluye un subcomponente para ver los pagos relacionados.|
| **Created at**  | Fecha de creación y usuario que registró el reembolso (`UserInfoBadge`).                                                                                 |

Los reembolsos cancelados se destacan con fondo rojo tenue para indicar su estado inactivo.

---

**3. Paginación**

Se muestra arriba y abajo de la tabla para navegar entre páginas de resultados.
La paginación se sincroniza con los filtros aplicados y los datos obtenidos desde la API.

---

**4. Diálogo de cancelación**

Cuando el usuario decide cancelar un reembolso:

- Aparece un cuadro modal que muestra el número de folio afectado.

- Solicita al usuario ingresar comentarios obligatorios para la cancelación.

- Botones disponibles:

    - Close → cierra la ventana sin acción.

    - Yes, I confirm → confirma la cancelación y actualiza la tabla.

La cancelación se registra en el sistema con comentarios, manteniendo la trazabilidad de auditoría.

---

---

**Alcance**
Incluye:
- Listado de devoluciones con filtros por folio, cliente, agente aduanal y rango de fechas.  
- Consulta de montos, servicios vinculados y estado de la devolución (Paid / Unpaid).  
- Cancelación de devoluciones con registro de comentarios.  
- Paginación de resultados y gestión de estado eliminado.

---

**Prerrequisitos**

- Catálogos relacionados: **Suppliers**, **Clientes**, **Agentes aduanales**, **Monedas**.

---

**Navegación**
- Menú: `Refunds → Suppliers`  
- Ruta principal: `/refunds`  
- Acciones: `View` para ver detalles, `Delete` para cancelar devoluciones.

---

**Filtros de búsqueda**
1. **Folio:** Texto libre.  
2. **Cliente:** Selección desde ACustomerSearch.  
3. **Agente aduanal:** Selección desde AGlobalSearch.  
4. **Rango de fechas:** Desde y hasta.  
5. Botones **Search** y **Clear** para filtrar o reiniciar.

---

**Listado de devoluciones**
- Tabla con columnas: Acciones, Folio, Beneficiario, Servicios, Monto, Estado, Creado en.  
- Servicios mostrados como chips con referencias de pago.  
- Monto mostrado según moneda y total de la devolución.  
- Estado: Paid (verde) / Unpaid (rojo).  
- Filas eliminadas resaltadas en rojo claro (dark mode rojo oscuro).  

---

**Paginación**
- Paginación arriba y abajo de la tabla.  
- Cambio de página recarga resultados.  

---

**Cancelación de devolución**
1. Seleccionar `Delete` en la fila correspondiente.  
2. Confirmar en diálogo emergente, agregando comentarios obligatorios.  
3. Botón **Yes, I confirm** para ejecutar cancelación.  
4. Botón **Close** para cerrar sin acción.  

---

**Cálculos**
El Total de devolución representa la suma de todos los pagos registrados como reembolsos dentro del sistema. 
Este valor se calcula automáticamente y refleja el importe global devuelto en un proceso determinado.

Además, el total se mantiene actualizado de manera dinámica tanto en los listados como en los detalles de cada devolución. 
Esto permite al usuario consultar de forma inmediata y confiable el monto acumulado, facilitando la conciliación contable, la validación de operaciones financieras y el seguimiento preciso de cada reembolso realizado.

---

**Validaciones**
- Comentarios obligatorios para cancelar devolución.  
- Devolución no puede ser eliminada si ya tiene estado eliminado.  

---

**Funcionalidades adicionales**
- Vaciar filtros con **Clear**.  
- Búsqueda dinámica de clientes y agentes aduanales.  
- Alertas tipo snackbar para errores, información y confirmaciones.  
- Indicadores visuales de estado y selección.  

---

**Errores comunes**
- No se encuentra devolución según filtros aplicados.  
- Comentarios faltantes al intentar eliminar devolución.  
- Devolución ya eliminada previamente.  

---

# Módulo: Request Refund Detail (Detalle de Solicitud de Reembolso)

Este componente forma parte del sistema de gestión de reembolsos y se accede al seleccionar un reembolso específico desde la lista de reembolsos.

---

**Propósito**

Permite a los usuarios visualizar todos los detalles de una solicitud de reembolso específica, incluyendo:

- Información del beneficiario.

- Datos bancarios para la transferencia del reembolso.

- Conceptos y servicios asociados.

- Estado de pago.

- Notas internas del reembolso.

- Visualización del PDF de la solicitud.

- Opciones de edición y cancelación según permisos.

Esencialmente, es la vista detallada y operativa de cada reembolso.

---

**Estructura funcional**

**1. Detalles principales**

Muestra la información básica del reembolso:

- Beneficiario: nombre y tipo (cliente, agente aduanal, etc.).

- Monto total: suma de todos los pagos asociados al reembolso.

- Solicitado por: usuario que creó la solicitud.

- Fecha de creación: registro temporal de la solicitud.

- Estado del pago: indica si la factura asociada está pagada o pendiente.

- Acciones: botón para previsualizar el PDF de la solicitud.

---

**2. Información bancaria del beneficiario**

Contiene los datos necesarios para realizar la transferencia del reembolso:

- Banco

- Nombre del beneficiario

- Número de cuenta

- CLABE / ABA

- Swift / IBAN

Opcionalmente, si el reembolso no ha sido pagado, el usuario puede:

- Editar la información bancaria, usando un formulario seguro.

- Guardar los cambios para actualizar la solicitud.

---

3. Notas de la solicitud

Permite registrar comentarios internos sobre la solicitud:

- Las notas se muestran en un alerta informativa.

- Si el reembolso no ha sido pagado, las notas pueden ser editadas y guardadas.

- Se reemplazan los saltos de línea por formato legible en pantalla.

---

4. Conceptos asociados (tabla de pagos)

Muestra todos los pagos o cargos vinculados al reembolso:

| Columna          | Descripción                                                        |
| ---------------- | ------------------------------------------------------------------ |
| **Actions**      | Permite eliminar un concepto de la solicitud si no ha sido pagado. |
| **Service Ref#** | Número de referencia del servicio asociado al pago.                |
| **Concept**      | Nombre del cargo y, si aplica, número de contenedor.               |
| **Amount**       | Monto del cargo.                                                   |
| **Currency**     | Divisa asociada al monto.                                          |

Si no hay conceptos asociados, se muestra un mensaje: "No concepts found".

---

**Resumen general**

| Categoría              | Descripción                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Módulo**             | Request Refund Detail                                                                                         |
| **Propósito**          | Visualizar y gestionar todos los detalles de una solicitud de reembolso específica.                           |
| **Interfaz principal** | Tarjetas de detalle de beneficiario y banco, tabla de conceptos asociados, notas, y visor de PDF.             |
| **Usuarios objetivo**  | Finanzas, contabilidad, operaciones y usuarios con permisos de edición.                                       |
| **Resultado esperado** | Control completo sobre la solicitud de reembolso, con capacidad de edición, auditoría y seguimiento de pagos. |

