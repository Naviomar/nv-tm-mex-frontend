import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    contact_name: yup.string().nullable(),
    tax_number: yup.string().required('Tax number is required'),
    regimen_fiscal: yup.string().required('Régimen fiscal is required'),
    address: yup.object({
      name: yup.string().required('Name is required'),
      street: yup.string().required('Street is required'),
      number: yup.string().required('Number is required'),
      neighborhood: yup.string().required('Neighborhood is required'),
      city: yup.string().required('City is required'),
      state: yup.string().required('State is required'),
      zip_code: yup.string().required('Postal code is required'),
      country_id: yup.string().required('Country is required'),
      is_default: yup.boolean().nullable(),
    }),
  })
)

const schemaEdit = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    contact_name: yup.string().nullable(),
    tax_number: yup.string().required('Tax number is required'),
    regimen_fiscal: yup.string().required('Régimen fiscal is required'),
    metodo_pago: yup.string().nullable(),
    forma_pago: yup.string().nullable(),
    uso_cfdi: yup.string().nullable(),
  })
)


const schemaExecutive = toTypedSchema(
  yup.object().shape({
    executive_id: yup.number().required('Executive is required'),
    executive_valid_from: yup.string().required('Valid from is required'),
    undefined_time: yup.boolean().nullable(),
    executive_valid_to: yup.string().when('undefined_time', {
      is: (undefined_time: boolean) => !undefined_time, // if undefined_time is false
      then: (schema) => {
        return schema.required('Valid to is required')
      },
      otherwise: (schema) => {
        return schema.nullable()
      },
    }),
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

const schemaNotes = toTypedSchema(
  yup.object().shape({
    note: yup.string().required('Notes are required'),
  })
)

export { schema, schemaEdit, schemaAddress, schemaExecutive, schemaNotes }
