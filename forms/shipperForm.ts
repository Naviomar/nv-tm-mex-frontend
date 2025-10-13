import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    is_shipper: yup.boolean().nullable(),
    is_consignee: yup.boolean().nullable(),
    contact_name: yup.string().nullable(),
    contact_email: yup.string().nullable(),
    contact_phone: yup.string().nullable(),
    contact_rfc: yup.string().nullable(),
  })
)

export { schema }
