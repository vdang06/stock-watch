import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import firebase from "@react-native-firebase/app";
// import "@react-native-firebase/auth"

import { Alert, View, Button ,Text, TextInput, Image, ImageBackground , TouchableOpacity, zIndex ,StyleSheet } from "react-native"; 



export const LogInPage = ({ navigation }) => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLoginPress = () => {
        firebase.auth().signInWithEmailAndPassword(username, password)
            .then(() => {
                console.log("Login Success")
            })
            .catch((error) => {
                var err = error.message;
                var matches = err.search(/]/) + 1;
                var trimmedError = (err.slice(matches)).trim();
                Alert.alert("Login Failed", trimmedError);
            })
    }



    return (

        <SafeAreaView style={styles.container}>
            {/* <ImageBackground source={require("../assets/apple_id_desktop_2x.jpg")} style={styles.image} /> */}
            {/* <Image source={require("../assets/apple_logo.png")} style={styles.logo} />   */}
            <View style={[styles.loginform]}>     
                 <Text 
                    style={{ 
                        //Objects within objects, Remember valid obj must have Key & value
                        //Spreading operator will list out object data one by one
                        ...styles.header
                    }}
                >
                    stockwatch
                </Text>
                <Text 
                    style={{
                        fontSize: 12,
                        color: "black",
                        marginBottom: 30,  
                        // Padding protects your insides
                        // Keep margin out, don't get called  
                    }}
                >   
                    a simple portfolio tracker and watchlist
                </Text>
                 
                <TextInput 
                    style={styles.input}
                    textAlign="left"
                    placeholder="email"
                    autoCapitalize="none"
                    onChangeText={setUsername}
                    value={username}
                />
                <TextInput 
                    style={styles.input}
                    textAlign="left" 
                    placeholder="password"
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    value={password}
                />
                {/* <TouchableOpacity>
                    <Text 
                        style={{
                            fontSize: 20,
                            backgroundColor: "grey",
                            borderColor: "grey",
                            borderWidth: 10,
                            borderRadius: 12,
                            overflow: "hidden",
                            color: "white"
                        }}
                        onPress={handleLoginPress}
                    >
                        login
                    </Text>
                </TouchableOpacity> */}
                <Button
                    title="login"
                    borderWidth="5"
                    onPress={handleLoginPress}
                />
            </View>
        
            <Button
                title="don't have an account? sign up now!"
                color="grey"
                onPress={() => {navigation.navigate("Signup")}}
            />
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between"
    },
    image: {
        height: "100%",
        width: "100%",
        position: "absolute",
        resizeMode: "contain",
        zIndex: 0
    },
    logo: {
        width: 50,
        height: 200,
        justifyContent: "center",
        alignSelf: "center",
        position: "absolute",
        resizeMode: "contain"
    },
    loginform: {
        //paddingTop: "50%",
        justifyContent: "center",
        alignItems: "center",
        flex: 1
    },
    header: {
        color: "black",
        textAlign: "center",
        fontSize: 30
    },
    input: {
        backgroundColor: "white",
        height: 40,
        width: "60%",
        margin: 5,
        paddingLeft: 10,
        borderWidth: 0.3
    }
  })
export default LogInPage;