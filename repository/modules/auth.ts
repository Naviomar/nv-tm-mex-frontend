import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../factory'

type IUser = {
  id: number
  name: string
  email: string
  email_verified_at: string
  deleted_at: string
  password: string
  created_at: string
  roles: IRole
  permissions: IPermission
}

type IRole = {
  id: number
  name: string
  guard_name: string
  created_at: string
  permissions: IPermission
}

type IPermission = {
  id: number
  name: string
  guard_name: string
  created_at: string
}

class AuthModule extends FetchFactory<any> {
  private RESOURCE = '/'


}

export default AuthModule
