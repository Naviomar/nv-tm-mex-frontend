import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    short_name: yup.string().optional(),
    description: yup.string().required('Description is required'),
  })
)

export { schema }
