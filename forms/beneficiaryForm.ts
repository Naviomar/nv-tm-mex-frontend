import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    legal_name: yup.string().nullable(),
    tax_number: yup.string().nullable(),
    contact_name: yup.string().nullable(),
    email: yup.string().email('Invalid email').nullable(),
    phone: yup.string().nullable(),
    country_id: yup.number().nullable(),
    notes: yup.string().nullable(),
    is_active: yup.boolean().nullable(),
  })
)

export { schema }
