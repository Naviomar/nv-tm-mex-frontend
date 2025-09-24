import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    note: yup.string().required('Note is required'),
  })
)

export { schema }
