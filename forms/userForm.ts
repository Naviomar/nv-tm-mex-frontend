import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const schema = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup
      .string()
      .matches(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Email address is not valid'
      )
      .required('El email es requerido'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref('password')], 'Your passwords do not match.')
      .required('Password confirmation is required'),
    roles: yup.array().of(yup.object()),
    permissions: yup.array().of(yup.object()),
  })
)

const schemaEdit = toTypedSchema(
  yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup
      .string()
      .matches(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Email address is not valid'
      )
      .required('El email es requerido'),
    // password: yup.string().when('password', {
    //   is: (val: any) => val.length > 0,
    //   then: (
    //     schema // <---- notice here return function
    //   ) => schema.required('Password is required'),
    // }),
    // password: yup.string().when('password', {
    //   is: (val: any) => !!(val && val.length > 0),
    //   then: (
    //     schema // <---- notice here return function
    //   ) => schema.oneOf([yup.ref('password_confirmation'), undefined], 'Passwords must match'),
    // }),
    password_confirmation: yup.string().when('password', {
      is: (val: any) => !!(val && val.length > 0),
      then: (
        schema // <---- notice here return function
      ) => schema.required('Password confirmation is required'),
    }),
    roles: yup.array().of(yup.object()),
    permissions: yup.array().of(yup.object()),
  })
)

const schemaUpdatePassword = toTypedSchema(
  yup.object().shape({
    current_password: yup.string().required('Current password is required'),
    new_password: yup.string().min(6, 'Password must be at least 6 characters long').required('Password is required'),
    password_confirmation: yup
      .string()
      .required('Please retype your password.')
      .oneOf([yup.ref('new_password')], 'Your passwords do not match.'),
  })
)

const fields = {
  name: {
    name: 'name',
    label: 'Name',
    type: 'text',
    attrs: {
      placeholder: 'Full name',
      required: true,
    },
  },
  email: {
    name: 'email',
    label: 'Email address',
    type: 'email',
    attrs: {
      placeholder: 'Email',
      required: true,
    },
  },
  password: {
    name: 'password',
    label: 'Password',
    type: 'text',
    attrs: {
      placeholder: 'Enter a password',
      required: true,
    },
  },
}

export { schema, schemaEdit, schemaUpdatePassword, fields }
