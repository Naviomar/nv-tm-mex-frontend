import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
  })
)

const schemaNotes = toTypedSchema(
  yup.object().shape({
    note: yup.string().required('Notes are required'),
  })
)

export { schema, schemaNotes }
