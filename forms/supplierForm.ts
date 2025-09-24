import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    credit_days: yup.number().required('Credit days is required'),
    tax_number: yup.string().required('Tax number is required'),
  })
)

const schemaAddress = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    name: yup.string().required('Name is required'),
    street: yup.string().required('Street is required'),
    number: yup.string().required('Number is required'),
    neighborhood: yup.string().required('Neighborhood is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zip_code: yup.string().required('Postal code is required'),
    country_id: yup.string().required('Country is required'),
    is_default: yup.boolean().nullable(),
  })
)

const schemaManualCfdiAdd = toTypedSchema(
  // supplier_id
  // uuid
  // folio
  // serie
  // invoice_date
  // xml_attachment
  // pdf_attachment
  // zip_attachment
  // rfc_emisor
  // name_emisor
  // rfc_receptor
  // name_receptor
  // tipo_comprobante
  // has_cap_limit
  // amount_cfdi
  // cap_limit
  // amount_provisioned
  // currency_id
  // notes
  yup.object().shape({
    supplier_id: yup.string().required('Supplier is required'),
    folio: yup.string().required('Folio is required'),
    serie: yup.string().nullable(),
    invoice_date: yup.string().required('Invoice date is required'),
    // xml_attachment: yup.string().required('Xml attachment is required'),
    // pdf_attachment: yup.string().required('Pdf attachment is required'),
    // zip_attachment: yup.string().required('Zip attachment is required'),
    // rfc_emisor: yup.string().required('Rfc emisor is required'),
    // name_emisor: yup.string().required('Name emisor is required'),
    rfc_receptor: yup.string().required('Rfc receptor is required'),
    name_receptor: yup.string().required('Name receptor is required'),
    tipo_comprobante: yup.string().required('Tipo comprobante is required'),
    amount_cfdi: yup
      .number()
      .typeError('Amount must be a number') // in case it's passed as a string
      .required('Amount cfdi is required')
      .moreThan(0, 'Amount must be greater than zero'), // or .min(0.01, '...') if you prefer    currency_id: yup.string().required('Currency is required'),
    notes: yup.string().nullable(),

  })
)

const schemaSupplierCfdiNotes = toTypedSchema(
  yup.object().shape({
    note: yup.string().required('Notes are required'),
  })
)

export { schema, schemaAddress, schemaManualCfdiAdd, schemaSupplierCfdiNotes }
