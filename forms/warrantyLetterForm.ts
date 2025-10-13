import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    warranty_agent_id: yup.string().required('name agent is required'),
    port_id: yup.string().required('Port is required'),
    warranty_valid_from: yup.string().required('Valid from is required'),
    warranty_valid_to: yup.string().required('Valid to is required'),
  })
)

export { schema }
