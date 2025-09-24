import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    code: yup.string().required('Code is required'),
    country_id: yup.number().required('Country is required'),
  })
)

export { schema }
