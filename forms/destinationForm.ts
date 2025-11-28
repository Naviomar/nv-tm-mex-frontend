import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    country_id: yup.number().required('Country is required'),
    is_foreign: yup.number().nullable(),
    amacarga_code: yup.string().nullable(),
  })
)

export { schema }
