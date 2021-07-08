/**
 * @format
 */

import React from 'react';
import {AppRegistry} from 'react-native';
import Home from './src/Home';
import {name as appName} from './app.json';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'localhost:4000/graphql',
  cache: new InMemoryCache()
});

const App = () => {
    return (
        // <ApolloProvider client={client}>
            <Home />
        // </ApolloProvider>
    )
};

AppRegistry.registerComponent(appName, () => App);
