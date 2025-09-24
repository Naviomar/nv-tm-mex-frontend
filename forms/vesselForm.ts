import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    name: yup.string().required('Name is required'),
    line_id: yup.number().required('Line is required'),
  })
)

export { schema }
