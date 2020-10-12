import { gql, ApolloClient, InMemoryCache } from '@apollo/client/core';
import { SchemaLink } from '@apollo/client/link/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import ConductorApi from '@holochain/conductor-api';
import {
  profilesUsernameResolvers,
  profilesUsernameTypeDefs,
} from 'holochain-profiles-username';
import { ProfilesMock } from 'holochain-profiles-username/mocks/profiles.mock';
import {
  AppWebsocketMock,
  DnaMock,
  hashToString,
  randomHash,
} from 'holochain-ui-test-utils';

import { mutualCreditResolvers, mutualCreditTypeDefs } from '../../dist';
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

const dnaMock = new DnaMock({
  profiles: new ProfilesMock(),
  transactor: new PublicTransactorMock(),
});
async function getAppWebsocket() {
  if (process.env.CONDUCTOR_URL)
    return ConductorApi.AppWebsocket.connect(process.env.CONDUCTOR_URL);
  else {
    return new AppWebsocketMock([dnaMock]);
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

  const client = new ApolloClient({
    typeDefs: allTypeDefs,

    cache: new InMemoryCache(),
    link: schemaLink,
  });

  return {
    client,
    appWebsocket,
    agentAddress: hashToString(cellId[1]),
  };
}
