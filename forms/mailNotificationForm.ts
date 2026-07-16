import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    short_name: yup.string().optional(),
    description: yup.string().required('Description is required'),
    include_creator_as_to: yup.boolean().optional(),
  })
)

export { schema }
