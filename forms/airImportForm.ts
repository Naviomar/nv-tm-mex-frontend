import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    reference_number: yup.string().nullable(),
    next_year: yup.string().nullable(),
    master_awb: yup.string().required('Master AWB is required'),
    house_awb: yup.string().required('House AWB is required'),
    origin_ff_id: yup.string().required('Origin FF is required'),
    origin: yup.string().required('Origin is required'),
    destination: yup.string().required('Destination is required'),
    consignee_id: yup.string().required('Customer is required'),
    executive_id: yup.string().nullable(),
    executive: yup.object().shape({}).nullable(),
    airline_id: yup.string().required('Airline is required'),
    shipper_id: yup.string().nullable(),
    ff_id: yup.string().nullable(),
    sent_releases: yup.array().of(yup.object().shape({})).nullable(),
    release_files: yup.array().of(yup.object().shape({})).nullable(),
    source_system_id: yup.number().nullable(),
    incident: yup.string().nullable(),
    release_agent_id: yup.string().nullable(),
    rate: yup.string().nullable(),
    locked_at: yup.string().nullable(),
  })
)

const schemaEdit = toTypedSchema(
  yup.object().shape({
    id: yup.string().required('Id is required'),
    consignee_id: yup.string().required('Consignee is required'),
    executive_id: yup.string().nullable(),
    executive: yup.object().shape({}).nullable(),
    line_id: yup.string().required('Line is required'),
    origin_ff_id: yup.string().required('Origin FF is required'),
    vessel_departure_id: yup.string().required('Vessel is required'),
    voyage_departure: yup.string().required('Voyage is required'),
    pol_id: yup.string().required('POL is required'),
    pod_id: yup.string().required('POD is required'),
    voyage_discharge_id: yup.string().nullable(),
    cargo_type: yup.string().nullable(),
    coloader_id: yup.string().nullable(),
    release_agent_id: yup.string().nullable(),
  })
)




export {
  schema,
  schemaEdit,
}
