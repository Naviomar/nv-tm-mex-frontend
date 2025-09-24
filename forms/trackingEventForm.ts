import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    type: yup.string().required('Type is required'),
    description: yup.string().nullable(),
  })
)

export { schema }
