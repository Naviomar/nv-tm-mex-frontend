import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

class AwsModule extends FetchFactory<any> {
  private RESOURCE = '/core/aws'

  /**
   * Return a file
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async downloadS3Object(s3Path: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify({ objectPath: s3Path }),
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/download`, fetchOptions)
  }
}

export default AwsModule
