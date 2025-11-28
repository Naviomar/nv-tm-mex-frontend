import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    patente: yup.string().required('Patente is required'),
    agencia: yup.string().nullable(),
  })
)

const schemaEmail = toTypedSchema(
  yup.object().shape({
    email: yup.string().required('Email is required'),
  })
)

export { schema, schemaEmail }
