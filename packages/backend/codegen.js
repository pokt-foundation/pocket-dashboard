// @ts-ignore
require('dotenv').config()

module.exports = {
  schema: [
    {
      [process.env.HASURA_URL]: {
        headers: {
          'X-Hasura-Admin-Secret': process.env.HASURA_ADMIN_SECRET,
        },
      },
    },
  ],
  documents: ['./src/graphql/*.graphql'],
  overwrite: true,
  generates: {
    './src/graphql/types.ts': {
      plugins: ['typescript', 'typescript-document-nodes'],
    },
  },
}
