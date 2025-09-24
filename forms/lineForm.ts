import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    line_type: yup.string().required('Type is required'),
    name: yup.string().required('Name is required'),
    code: yup.string().nullable(),
    contact_name: yup.string().nullable(),
    commercial_name: yup.string().required('Commercial name is required'),
    // country_id: yup.mixed().test('is-object-or-string', 'Country is required', (value) => {
    //   if (typeof value === 'string') return true // Valid if the value is a string
    //   if (typeof value === 'object' && value != null) {
    //     // Valid if the value is an object with a 'name' property
    //     return yup
    //       .object({
    //         name: yup.string().required('Country is required'),
    //       })
    //       .isValidSync(value)
    //   }
    //   return false // Invalid if none of the above conditions are true
    // }),
    address: yup.string().nullable(),
    zip_code: yup.string().nullable(),
    amacarga_code: yup.string().nullable(),
  })
)


const schemaNotes = toTypedSchema(
  yup.object().shape({
    note: yup.string().required('Notes are required'),
  })
)

export { schema, schemaNotes }
