import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    code: yup.string().required('ISO Code 2 letters is required'),
    code2: yup.string().required('ISO Code 3 letteres is required'),
  })
)

export { schema }
