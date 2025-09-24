import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    vessel_id: yup.number().required('Vessel is required'),
    impoExpo: yup.string().required('Import/Export is required'),
  })
)

const schemaEdit = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    vessel_id: yup
      .mixed()
      .test('is-object-or-string', 'data must be either a string or an object with a name property', (value) => {
        if (typeof value === 'string') return true // Valid if the value is a string
        if (typeof value === 'number') return true // Valid if the value is a number (id
        if (typeof value === 'object' && value !== null) {
          // Valid if the value is an object with a 'name' property
          return yup
            .object({
              name: yup.string().required('Vessel is required'),
            })
            .isValidSync(value)
        }
        return false // Invalid if none of the above conditions are true
      })
      .required('Vessel is required'),
    impoExpo: yup.string().required('Import/Export is required'),
  })
)

const schemaDestinationEdit = toTypedSchema(
  yup.object().shape({
    eta_date: yup.string().nullable(),
    arrival_date: yup.string().nullable(),
    locked_at: yup.string().nullable(),
    pod_id: yup
      .mixed()
      .test('is-object-or-string', 'data must be either a string or an object with a name property', (value) => {
        if (typeof value === 'string') return true // Valid if the value is a string
        if (typeof value === 'number') return true // Valid if the value is a number (id
        if (typeof value === 'object' && value !== null) {
          // Valid if the value is an object with a 'name' property
          return yup
            .object({
              name: yup.string().required('POL is required'),
            })
            .isValidSync(value)
        }
        return false // Invalid if none of the above conditions are true
      })
      .required('Destination port is required'),
  })
)

const schemaDestUpdateEta = toTypedSchema(
  yup.object().shape({
    new_eta_date: yup.string().required('ETA date is required'),
    emails_internal: yup.string().nullable(),
    subject: yup.string().required('Subject is required'),
    notes: yup.string().nullable(),
  })
)

const schemaDestNotifyPort = toTypedSchema(
  yup.object().shape({
    emails_port: yup.string().nullable(),
    subject: yup.string().required('Subject is required'),
    notes: yup.string().nullable(),
  })
)

const schemaNotes = toTypedSchema(
  yup.object().shape({
    note: yup.string().required('Notes are required'),
  })
)

export { schema, schemaEdit, schemaDestinationEdit, schemaDestUpdateEta, schemaNotes, schemaDestNotifyPort }
