import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    next_year: yup.string().nullable(),
    consignee_id: yup.string().required('Consignee is required'),
    freight_forwarder_id: yup.string().nullable(),
    shipper_id: yup.string().nullable(),
    incident: yup.string().nullable(),
    line_id: yup.string().required('Line is required'),
    etd_date: yup.string().required('ETD is required'),
    vessel_departure_id: yup.string().nullable(),
    voyage_departure: yup.string().nullable(),
    release_agent_id: yup.string().nullable(),
    origin_id: yup.string().nullable(),
    pol_id: yup.string().required('POL is required'),
    pod_id: yup.string().required('POD is required'),
    destination_id: yup.string().nullable(),
    voyage_discharge_id: yup.string().nullable(),
    cargo_type: yup.string().nullable(),
    coloader_id: yup.string().nullable(),
  })
)

const schemaEdit = toTypedSchema(
  yup.object().shape({
    id: yup.string().required('Id is required'),
    reference_number: yup.string(),
    // voyage_departure: yup.string().nullable(),
    incident: yup.string().nullable(),
    consignee_id: yup.string().required('Consignee is required'),
    executive_id: yup.string().nullable(),
    executive: yup.object().shape({}).nullable(),
    freight_forwarder_id: yup.string().nullable(),
    shipper_id: yup.string().nullable(),
    demurrage_days: yup.string().nullable(),
    credit_days: yup.string().nullable(),
    line_id: yup.string().required('Line is required'),
    vessel_departure_id: yup.string().nullable(),
    voyage_departure: yup.string().nullable(),
    origin_id: yup.string().nullable(),
    pol_id: yup.string().required('POL is required'),
    pod_id: yup.string().required('POD is required'),
    release_agent_id: yup.string().nullable(),
    destination_id: yup.string().nullable(),
    voyage_discharge_id: yup.string().nullable(),
    cargo_type: yup.string().nullable(),
    coloader_id: yup.string().nullable(),
    rebate: yup.string().nullable(),
    rebate_currency_id: yup.string().nullable(),
    rebate_exchange_rate: yup.string().nullable(),
    charges: yup.array(),
    containers: yup.array(),
    master_bls: yup.array(),
    house_bls: yup.array(),
    demurrage_charges: yup.array(),
    tranships: yup.array(),
    invoice_tms: yup.array(),
    invoice_wms: yup.array(),
    source_system_id: yup.number().nullable(),
    tracker_pos: yup.array().nullable(),
    tracker_ref: yup.object().nullable(),
    tracker_sync_alerts: yup.array().nullable(),
    rebate_total_amount: yup.number().nullable(),
  })
)



const schemaExport = toTypedSchema(
  yup.object().shape({
    next_year: yup.string().nullable(),
    doc_closing_date: yup.string().required('Doc closing date is required'),
    transit_days: yup.string().required('Transit days is required'),
    booking_number: yup.string().required('Booking line is required'),
    consignee_id: yup.string().required('Consignee is required'),
    freight_forwarder_id: yup.string().nullable(),
    notify_id: yup.string().nullable(),
    shipper_id: yup.string().nullable(),
    line_id: yup.string().required('Line is required'),
    sea_region_id: yup.string().required('Traffic is required'),
    origin_id: yup.string().nullable(),
    pol_id: yup.string().required('POL is required'),
    pod_id: yup.string().required('POD is required'),
    destination_id: yup.string().nullable(),
    voyage_departure: yup.string().nullable(),
    voyage_discharge_id: yup.string().required('Voyage discharge is required'),
    cargo_type: yup.string().nullable(),
    coloader_id: yup.string().nullable(),
  })
)

const schemaExportEdit = toTypedSchema(
  yup.object().shape({
    id: yup.string().required('Id is required'),
    reference_number: yup.string().nullable(),
    credit_days: yup.string().nullable(),
    tranships: yup.array().of(yup.object()).nullable(),
    doc_closing_date: yup.string().required('Doc closing date is required'),
    nomination_type: yup.string().required('Nomination type is required'),
    transit_days: yup.string().required('Transit days is required'),
    consignee_id: yup.string().required('Consignee is required'),
    freight_forwarder_id: yup.string().nullable(),
    shipper_id: yup.string().nullable(),
    executive_id: yup.string().nullable(),
    executive: yup.object().shape({}).nullable(),
    notify_id: yup.string().nullable(),
    line_id: yup.string().required('Line is required'),
    voyage_departure: yup.string().required('Voyage is required'),
    origin_id: yup.string().nullable(),
    pol_id: yup.string().required('POL is required'),
    pod_id: yup.string().required('POD is required'),
    destination_id: yup.string().nullable(),
    rebate: yup.number().nullable(),
    rebate_currency_id: yup.string().nullable(),
    rebate_exchange_rate: yup.number().nullable(),
    master_bls: yup.array().of(yup.object()).nullable(),
    house_bls: yup.array().of(yup.object()).nullable(),
    bkg_containers: yup.array().of(yup.object()).nullable(),
    containers: yup.array().of(yup.object()).nullable(),
    voyage_discharge_id: yup.string().nullable(),
    cargo_type: yup.string().nullable(),
    coloader_id: yup.string().nullable(),
    rebate_total_amount: yup.number().nullable(),
  })
)

const schemaMasterBl = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    referencia_id: yup.string().nullable(),
    name: yup.string().required('Master BL number is required'),
    consignee_mbl_id: yup.string().required('Consignee is required'),
    can_be_delivered: yup.string().nullable(),
    comments: yup.string().nullable(),
    type: yup.string().nullable(),
    attachment: yup
      .mixed()
      .nullable()
      .test('fileRequired', 'Attachment is required', (value) => {
        // If value is null or undefined, it's invalid (if required)
        if (!value) return true;

        // Check if the value is an instance of a File (for validation)
        return value instanceof File;
      }),
  })
)

const schemaExportMasterBl = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    referencia_id: yup.string().nullable(),
    name: yup.string().required('Master BL number is required'),
    attachment: yup
      .mixed()
      .nullable()
      .test('fileRequired', 'Attachment is required', (value) => {
        // If value is null or undefined, it's invalid (if required)
        if (!value) return true;

        // Check if the value is an instance of a File (for validation)
        return value instanceof File;
      }),
  })
)

const schemaHouseBl = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    referencia_id: yup.string().nullable(),
    name: yup.string().required('House BL number is required'),
    can_be_delivered: yup.string().nullable(),
    comments: yup.string().nullable(),
    consignee: yup.lazy(value => {
      if (typeof value === 'number') {
        return yup.number().required('Consignee must be a number');
      } else if (typeof value === 'object') {
        return yup.object().shape({
          id: yup.string().required('Consignee ID is required'),
        });
      }
      return yup.mixed().required('Consignee is required');
    }),
    consignee_id: yup.string().nullable(),
    type: yup.string().nullable(), // Ticket #660
    attachment: yup
      .mixed()
      .nullable()
      .test('fileRequired', 'Attachment is required', (value) => {
        // If value is null or undefined, it's invalid (if required)
        if (!value) return true;

        // Check if the value is an instance of a File (for validation)
        return value instanceof File;
      }),
  })
)

const schemaBuyRate = toTypedSchema(
  yup.object().shape({
    buy_rate: yup.number().required('Buy rate is required'),
    buy_rate_type: yup.string().required('Buy rate type is required'),
  })
)

const schemaSellRate = toTypedSchema(
  yup.object().shape({
    sell_rate: yup.number().required('Sell rate is required'),
    sell_rate_type: yup.string().required('Sell rate type is required'),
  })
)

const schemaCharge = toTypedSchema(
  yup.object().shape({
    id: yup.number(),
    charge_id: yup.number().required('Charge is required'),
    amount: yup.number().required('Amount is required'),
    currency_id: yup.number().required('Currency is required'),
    exchange_rate: yup.string().nullable(),
    fuera_dentro_bl: yup.string().required('BL type is required'),
    is_con_iva: yup.string().nullable(),
    tm_wm: yup.string().required('Invoice type is required'),
  })
)

const schemaCreditDebitNotes = toTypedSchema(
  yup.object().shape({
    format: yup.string().required('Format is required'),
    as_invoice: yup.boolean().nullable(),
    agente_ff_id: yup.string().required('Freight forwarder is required'),
  })
)

const schemaProformaChargeTm = toTypedSchema(
  yup.object().shape({
    charge_id: yup.number().required('Charge is required'),
    amount: yup.number().required('Amount is required'),
    currency_id: yup.number().required('Currency is required'),
    fuera_dentro_bl: yup.string().required('BL type is required'),
    is_con_iva: yup.string().nullable(),
  })
)

const schemaInvoiceCharge = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    charge_id: yup.string().required('Charge is required'),
    amount: yup.number().required('Amount is required'),
    currency_id: yup.string().required('Currency is required'),
    fuera_dentro_bl: yup.string().required('BL type is required'),
    is_con_iva: yup.string().nullable(),
    exchange_rate: yup.string().required('Exchange rate is required'),
  })
)

const schemaReleaseAgent = toTypedSchema(
  yup.object().shape({
    release_line_date: yup.string().required('Release line date is required'),
    release_date: yup.string().required('Release date is required'),
    release_agent_id: yup.string().required('Release agent is required'),
    notes: yup.string().nullable().default('').label('Notes'),
  })
)

export {
  schema,
  schemaBuyRate,
  schemaSellRate,
  schemaCreditDebitNotes,
  schemaMasterBl,
  schemaHouseBl,
  schemaCharge,
  schemaEdit,
  schemaInvoiceCharge,
  schemaProformaChargeTm,
  schemaExport,
  schemaExportEdit,
  schemaExportMasterBl,
  schemaReleaseAgent,
}
