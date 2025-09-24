import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    code: yup.string(),
    charge_type_id: yup.string().nullable(),
    charge_entity_id: yup.string().nullable(),
    services: yup.array().of(yup.number()),
    is_local: yup.string(),
    default_amount: yup.number().required('Default amount is required'),
    default_currency_id: yup.string().nullable(),
    can_be_deleted: yup.string(),
  })
)

export { schema }
