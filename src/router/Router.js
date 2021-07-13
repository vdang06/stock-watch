import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import "@react-native-firebase/database";

import React, { useState, useEffect } from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { HomePage, LogInPage, SearchPage, DetailsPage, SignUpPage, AddHoldings } from "../screens";
import { Loading } from "../common/loading";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


const HomeStack = createBottomTabNavigator();
const InitStack = createStackNavigator();
const SearchStack = createStackNavigator();

const PublicRoutes = () => (
    <NavigationContainer>
        <InitStack.Navigator
            headerMode="none"
        >
            <InitStack.Screen
                name="Login"
                component={LogInPage}
            />
            <InitStack.Screen
                name="Signup"
                component={SignUpPage}
            />
        </InitStack.Navigator>
    </NavigationContainer>
    
)

const HomeRoutes = () => (
    <NavigationContainer>
        <HomeStack.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
        
                    if (route.name === "Home") {
                      iconName = focused ? "insert-chart" : "insert-chart-outlined";
                    } else if (route.name === "Search") {
                      iconName = "search";
                    }
        
                    // You can return any component that you like here!
                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'blue',
                tabBarInactiveTintColor: 'gray',
            })
        }
            tabBarOptions={{showLabel: false}}
        >
            <HomeStack.Screen 
                name="Home" 
                component={HomePage}
            />
            <HomeStack.Screen
                name="Search"
                component={SearchRoutes}
            />
        </HomeStack.Navigator>
    </NavigationContainer>
)

const SearchRoutes = () => (
    <SearchStack.Navigator
        headerMode="none"
    >
        <SearchStack.Screen
            name="Search"
            component={SearchPage}
        />
        <SearchStack.Screen
            name="Details"
            component={DetailsPage}
        />
        <SearchStack.Screen
            name="AddHoldings"
            component={AddHoldings}
        />
    </SearchStack.Navigator>
)


const Router = (load) => {

    const [auth, setAuth] = useState(null);

    console.log(auth)
    useEffect(() => {
        firebase.auth().onAuthStateChanged(user => user ? setAuth(user) : setAuth(false));
    }, [])
    
    if (auth == null) return <Loading />;
    if (auth) return <HomeRoutes />;
    return <PublicRoutes />
}

export default Router;