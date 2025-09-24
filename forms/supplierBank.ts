import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    id: yup.number().nullable(),
    bank_id: yup.number().required('Bank is required'),
    name: yup.string().required('Name is required'),
    beneficiary_name: yup.string().required('Beneficiary name is required'),
    beneficiary_address: yup.string().nullable(),
    beneficiary_zip_code: yup.string().nullable(),
    beneficiary_city: yup.string().nullable(),
    country_id: yup.string().nullable(),
    account_number: yup.string().required('Account number is required'),
    clabe: yup.string().nullable(),
    currency_id: yup.string().required('Currency is required'),
    aba: yup.string().nullable(),
    swift: yup.string().nullable(),
    iban: yup.string().nullable(),
    beneficiary_email: yup.string().nullable(),
    beneficiary_phone: yup.string().nullable(),
    is_default: yup.boolean().nullable(),

  })
)

export { schema }
