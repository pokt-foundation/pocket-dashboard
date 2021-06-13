import { Client, createClient } from '@urql/core'
import env from '../environment'

export default class HasuraFetcher {
  private gqlClient: Client

  constructor({ url = '' }: { url: string }) {
    this.gqlClient = createClient({
      url,
      // @ts-ignore
      fetchOptions: () => {
        return {
          headers: {
            'x-hasura-admin-secret': env('HASURA_SECRET'),
          },
        }
      },
    })
  }
}
