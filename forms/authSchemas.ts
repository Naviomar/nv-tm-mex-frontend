import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const loginSchema = toTypedSchema(
  yup.object().shape({
    email: yup
      .string()
      .matches(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Email address is not valid'
      )
      .required('Email is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 8 characters')
      .required('Password is required'),
  })
)


export { loginSchema }
