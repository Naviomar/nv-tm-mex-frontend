import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    bank_id: yup.number().required('Bank name is required'),
    country_id: yup.number().required('Country name is required'),
    currency_id: yup.number().required('Currency name is required'),
    beneficiary_name: yup.string().required('Beneficiary name is required'),
    beneficiary_address: yup.string().required('Beneficiary name is required'),
    beneficiary_zip_code: yup.string().required('Beneficiary zip code is required'),
    beneficiary_city: yup.string().required('Beneficiary city is required'),
    beneficiary_email: yup.string().required('Beneficiary email is required'),
    beneficiary_phone: yup.string().required('Beneficiary phone is required'),
    account_number: yup.string().required('Account number is required'),
    clabe: yup.string().nullable(),
  })
)

export { schema }
