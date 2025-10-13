import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    entrust_agent_id: yup.string().required('name agent is required'),
    port_id: yup.string().required('Port is required'),
    entrust_valid_from: yup.string().required('Valid from is required'),
    entrust_valid_to: yup.string().required('Valid to is required'),
  })
)

export { schema }
