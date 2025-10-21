---
title: F.F. Agents – Debit / Credit Notes
summary: Pantalla de acceso para la gestión de notas de débito y crédito de agentes de carga, con vínculos directos a submódulos financieros relacionados.
roles: [Finanzas, Operaciones, Administrador]
tags: [agentes, debit notes, credit notes, pagos, soa, reportes]
order: 6
status: draft
version: 1.0.0
updatedAt: 2025-09-25
module: payments-agents
permalink: /manual/ff-agents-debit-credit
---

# 1. Objetivo y alcance
Centralizar el acceso a las **notas de débito y crédito** de agentes de carga (Freight Forwarders), permitiendo al usuario navegar hacia los submódulos relacionados de conciliación, estados de cuenta, pagos y reportes.  
El objetivo es facilitar la revisión financiera y la aplicación de ajustes entre la empresa y los agentes.  

# 2. Prerrequisitos
- Permisos:  
  - `ff-agents-debit-credit` → Visualizar pantalla de notas.  
  - `ff-agents-soa` → Acceder al estado de cuenta de agentes.  
  - `ff-agents-payments` → Gestionar pagos a agentes.  
  - `ff-agents-reports` → Consultar reportes financieros.  
- Datos maestros:  
  - Catálogo de agentes registrados en el sistema.  
  - Definición de políticas de notas de débito/crédito.  
- Integraciones:  
  - Módulo de contabilidad (para contabilización de notas).  
  - Módulo de pagos (para conciliación de movimientos).  

# 3. Navegación en la app
- Ruta de menú: `Home → Payments → Agents → Debit / Credit Notes`
- URL: `/payments/agents/debit-credit`
- Accesos disponibles en pantalla:  
  - **SOA module** → `/payments/agents/soa`  
  - **Payments module** → `/payments/agents/payments`  
  - **Report module** → `/payments/agents/reports`  

# 4. Conceptos clave
- **Nota de Débito**: Documento que incrementa el saldo adeudado por el agente hacia la empresa (ej. cargos adicionales, penalidades).  
- **Nota de Crédito**: Documento que disminuye el saldo adeudado por el agente hacia la empresa (ej. descuentos, devoluciones).  
- **SOA (Statement of Account)**: Estado de cuenta consolidado con cargos, pagos y notas aplicadas.  
- **Payments**: Registro de pagos efectuados hacia o desde agentes.  

# 5. Flujo de negocio (E2E)
1. El usuario ingresa a la pantalla de **Debit / Credit Notes**.  
2. Desde aquí, selecciona el acceso al submódulo requerido (SOA, Payments o Report).  
3. El sistema redirige al submódulo correspondiente.  
4. El usuario consulta o aplica las notas vinculadas a un agente.  
5. Los movimientos se reflejan en estados de cuenta y reportes financieros.  

:::tip
Registra primero la nota de débito/crédito en el sistema contable antes de reflejarla en el **SOA** del agente.
:::

# 6. Pantallas y campos
## 6.1 Debit / Credit Notes
**Propósito**: Brindar accesos a los submódulos relacionados con la gestión de notas financieras de agentes.  
**Elementos en pantalla**:
- **SOA module** → acceso al estado de cuenta de agentes.  
- **Payments module** → gestión de pagos vinculados a notas.  
- **Report module** → acceso a reportes de notas y conciliaciones.  

**Mensajes del sistema**:
- **Éxito**: "Redirección exitosa al módulo seleccionado".  
- **Error**: "No tienes permisos para acceder a este módulo".  

_(Figura X — Captura de Debit / Credit Notes)_  

# 7. Procedimientos
## 7.1 Revisión de notas en SOA
**Precondiciones**: Usuario con permiso `ff-agents-soa`.  
**Pasos**:  
1. Ingresar a **SOA module**.  
2. Consultar el estado de cuenta del agente.  
3. Verificar que la nota de débito/crédito esté reflejada correctamente.  
**Resultado esperado**: Estado de cuenta actualizado.  

## 7.2 Vinculación de notas a pagos
**Precondiciones**: Usuario con permiso `ff-agents-payments`.  
**Pasos**:  
1. Ingresar a **Payments module**.  
2. Seleccionar el pago de un agente.  
3. Aplicar la nota de débito o crédito correspondiente.  
**Resultado esperado**: Pago conciliado con las notas aplicadas.  

# 8. Reglas de negocio
- Toda nota de débito/crédito debe estar vinculada a un agente válido.  
- Una nota solo puede aplicarse una vez y debe tener un documento de respaldo.  
- Los reportes consolidan todas las notas aplicadas dentro del rango de fechas seleccionado.  

# 9. Integraciones
- **Módulo contable**: Registro y validación de notas.  
- **Módulo de pagos**: Aplicación de notas en conciliaciones.  
- **Módulo de reportes**: Consolidación de movimientos financieros de agentes.  
