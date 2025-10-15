---
title: Freight Forwarder Agents – Debit/Credit Notes
summary: Módulo de gestión de notas de débito y crédito relacionadas con agentes freight forwarder.
order: 8
status: stable
version: 1.0.0
updatedAt: 2025-09-18
module: payments-agents-notes
roles: [Administrador, Finanzas, Operaciones]
tags: [pagos, agentes, notas, debit, credit, soa, conciliaciones]
---

# Objetivo
Centralizar la administración de **notas de débito/crédito** de agentes freight forwarder, vinculadas a procesos de conciliación, reportes y pagos.

# Alcance
- Consulta de notas aplicadas a agentes.
- Integración con el **módulo de pagos de agentes**.
- Generación de reportes y SOA (*Statement of Account*).
- Control de pagos y conciliaciones.

# Navegación
- Menú principal: **Payments → Agents → Debit/Credit Notes**
- Ruta directa: `/payments/agents`

# Acciones disponibles
- **SOA module:** Revisión y conciliación de cuentas de agentes.
- **Payments module:** Registro y control de pagos a agentes.
- **Report module:** Generación de reportes de movimientos y conciliaciones.
- *(Opcional)* **Check module** (oculto en interfaz actual).

# Flujo de uso
1. Ingresar al módulo de **Agents Debit/Credit Notes**.  
2. Acceder al **SOA module** para validar cuentas.  
3. Ir al **Payments module** para aplicar pagos pendientes.  
4. Generar reportes desde el **Report module**.  

---

## Vistas principales
- **SOA module:** Conciliación de cuentas con agentes.
- **Payments module:** Pagos a agentes por servicios prestados.
- **Report module:** Informes consolidados de notas y pagos.
- **Notas de débito/crédito:** Relación directa con facturas y cargos.

---

## Permisos necesarios
- `agents-notes-view` – Ver notas.
- `agents-notes-manage` – Crear/editar notas.
- `agents-payments` – Aplicar pagos.
- `agents-reports` – Generar reportes.

---

## Errores comunes
- **Notas no conciliadas:** Inconsistencias entre SOA y pagos.
- **Permisos insuficientes:** Usuario sin rol de finanzas/operaciones.
- **Reporte incompleto:**
