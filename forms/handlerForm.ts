import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    gaffette: yup.string().required('Gaffette is required'),
  })
)

export { schema }
