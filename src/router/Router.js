import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import "@react-native-firebase/database";
import { HomePage, LogInPage, SearchPage } from "../screens";



const HomeStack = createBottomTabNavigator();

const PublicRoutes = () => (
    <LogInPage />
)

const AuthRoutes = () => (
    <NavigationContainer>
        <HomeStack.Navigator>
            <HomeStack.Screen 
                name="Home" 
                component={HomePage}
            />
            <HomeStack.Screen
                name="Search"
                component={SearchPage}
            />
        </HomeStack.Navigator>
    </NavigationContainer>
    
)

const Router = () => {

    const [auth, setAuth] = useState(null)

    console.log(auth)
    useEffect(() => {
        firebase.auth().onAuthStateChanged(user => user ? setAuth(user) : setAuth(false))
        
    }, [])
    
    if (auth == null) return null;
    if (auth) return <AuthRoutes />
    return <PublicRoutes />
}

export default Router;