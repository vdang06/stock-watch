import React from 'react';
import firebase from "@react-native-firebase/app";
import { FBDB_CONFIG } from './src/common/secrets';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import Router from "./src/router/Router";


if (!firebase.apps.length) firebase.initializeApp(FBDB_CONFIG)
else firebase.app()


const App = () => {
  return (
    <SafeAreaProvider>
      <Router />
    </SafeAreaProvider>
  )
}

export default App;