import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    contact_name: yup.string().required('Contact name is required'),
    contact_phone: yup.string().required('Contact phone is required'),
    tax_number: yup.string().nullable().notRequired(),
    state: yup.string().nullable(),
  })
)

export { schema }
