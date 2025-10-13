import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    code: yup.string().required('Code is required'),
    teus: yup.number().required('Teus is required'),
    is_reefer: yup.number().required('Is reefer is required'),
  })
)

const schemaReferencia = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    container_number: yup.string().required('Number is required'),
    container_type_id: yup.string().required('Type is required'),
    volume: yup.number().nullable(),
    weight: yup.number().required('Kgs is required'),
    num_packages: yup.number().required('Teus is required'),
    notes: yup.string().nullable(),
  })
)

export { schema, schemaReferencia }
