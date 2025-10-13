import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    id: yup.string().nullable(),
    mail_notification_ids: yup.array().of(
      yup.string().required('Mail notification id is required')
    ),
    mail_notifications: yup.array().of(
      yup.object().shape({
        id: yup.string().nullable(),
        type: yup.string().required('Type is required'),
      })
    ),
    email: yup.string().required('Email is required')
  })
)

export { schema }
