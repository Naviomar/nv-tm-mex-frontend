import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    has_demurrages: yup.boolean().required('Demurrages is required'),
  })
)

export { schema }
