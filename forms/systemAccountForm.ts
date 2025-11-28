import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    tax_number: yup.string().required('Tax number is required'),
    address: yup.string().required('Address is required'),
    zip_code: yup.string().required('Zip code is required'),
  })
)

const schemaBankAccount = toTypedSchema(
  yup.object().shape({
    bank_name: yup.string().required('Bank name is required'),
    type: yup.string().required('Type is required'),
    currency_id: yup.string().required('Currency is required'),
    account_number: yup.string().required('Account number is required'),
    clabe: yup.number().required('CLABE is required'),
    address: yup.string().required('Address is required'),
    zip_code: yup.string().required('Zip code is required'),
  })
)

export { schema, schemaBankAccount }
