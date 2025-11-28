import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    id: yup.number().nullable(),
    name: yup.string().required('Name is required'),
    code: yup.string().max(3).required('Code is required'),
    prefix: yup.string().required('Prefix is required'),
    logo_url: yup.string().nullable(),
  })
)

export { schema }
