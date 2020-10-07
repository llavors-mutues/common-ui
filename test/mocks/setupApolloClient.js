import { gql, ApolloClient, InMemoryCache } from '@apollo/client/core';
import { SchemaLink } from '@apollo/client/link/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { AppWebsocket } from '@holochain/conductor-api';
import {
  profilesUsernameResolvers,
  profilesUsernameTypeDefs,
} from 'holochain-profiles-username';

import { mutualCreditResolvers, mutualCreditTypeDefs } from '../../dist';
import { AppWebsocketMock } from './AppWebsocket.mock';
import { PublicTransactorMock } from './transactor.mock';

const rootTypeDef = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

const allTypeDefs = [
  rootTypeDef,
  profilesUsernameTypeDefs,
  mutualCreditTypeDefs,
];

async function getAppWebsocket() {
  if (process.env.CONDUCTOR_URL)
    return AppWebsocket.connect(process.env.CONDUCTOR_URL);
  else {
    const dnaMock = new PublicTransactorMock();
    return new AppWebsocketMock(dnaMock);
  }
}

/**
 * If process.env.CONDUCTOR_URL is undefined, it will mock the backend
 * If process.env.CONDUCTOR_URL is defined, it will try to connect to holochain at that URL
 */
export async function setupApolloClient() {
  const appWebsocket = await getAppWebsocket();

  const appInfo = await appWebsocket.appInfo({ app_id: 'test-app' });

  const cellId = appInfo.cell_data[0][0];

  const executableSchema = makeExecutableSchema({
    typeDefs: allTypeDefs,
    resolvers: [
      profilesUsernameResolvers(appWebsocket, cellId),
      mutualCreditResolvers(appWebsocket, cellId),
    ],
  });

  const schemaLink = new SchemaLink({ schema: executableSchema });

  return new ApolloClient({
    typeDefs: allTypeDefs,

    cache: new InMemoryCache(),
    link: schemaLink,
  });
}
