import React from 'react';
import firebase from "@react-native-firebase/app";
import { FBDB_CONFIG } from './src/common/secrets';
//import "@react-native-firebase/auth";
//import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import Router from "./src/router/Router";


if (!firebase.apps.length) firebase.initializeApp(FBDB_CONFIG)
else firebase.app()

const App = () => {
  return (
    <Router />
  )
}

export default App;