import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    suppliers: yup.array().of(yup.object()).nullable(),
    has_cap_limit: yup.boolean().nullable(),
    cap_limit: yup.number().when('has_cap_limit', {
      is: (val: any) => val === false,
      then: (
        schema // <---- notice here return function
      ) => schema.required('Cap limit is required'),
    }),
  })
)

export { schema }
