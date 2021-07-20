import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import "@react-native-firebase/database";

import React, { useState, useEffect } from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { HomePage, LogInPage, SearchPage, DetailsPage, SignUpPage, AddHoldings, NewsPage, ArticlePage } from "../screens";
import { Loading } from "../common/loading";
import { View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const InitStack = createStackNavigator();

const HomeStack = createBottomTabNavigator();
const SearchStack = createStackNavigator();
const ArticleStack = createStackNavigator();

const PublicRoutes = ({ route }) => (
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

const HomeRoutes = ({ route }) => (
    <NavigationContainer>
        <HomeStack.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
        
                    if (route.name === "Home") {
                      iconName = "home";
                    } else if (route.name === "Search") {
                      iconName = "search";
                    } else if (route.name === "News") {
                      iconName = focused ? "insert-chart" : "insert-chart-outlined";
                    }
        
                    // You can return any component that you like here!
                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
                // tabBarActiveTintColor: 'white',
                // tabBarInactiveTintColor: 'white',
            })}
            tabBarOptions={{
                showLabel: false, 
                style: {
                    backgroundColor: "#547aff"
                },
                activeTintColor: "white",
                inactiveTintColor: "#a0c8e8"
            }}
            lazy={false}
        >
            <HomeStack.Screen 
                name="Home" 
                component={HomePage}
            />
            <HomeStack.Screen
                name="Search"
                component={SearchRoutes}
            />
            <HomeStack.Screen
                name="News"
                component={NewsRoutes}
            />
        </HomeStack.Navigator>
    </NavigationContainer>


)

const SearchRoutes = ({ route }) => (
    <SearchStack.Navigator
        headerMode={"none"}
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

const NewsRoutes = () => (
    <ArticleStack.Navigator 
        mode="modal"
        headerMode="none"
    >
        <ArticleStack.Screen
            name="NewsFeed"
            component={NewsPage}
        />
        <ArticleStack.Screen
            name="Article"
            component={ArticlePage}
        />
    </ArticleStack.Navigator>
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