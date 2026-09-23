import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schemaBankInfo = toTypedSchema(
  yup.object().shape({
    bank: yup.string().required('Bank is required'),
    beneficiary_name: yup.string().required('Beneficiary name is required'),
    account_number: yup.string().required('Account number is required'),
    clabe: yup.string().nullable(),
    aba: yup.string().nullable(),
    swift: yup.string().nullable(),
    iban: yup.string().nullable(),
  })
)

export { schemaBankInfo }
