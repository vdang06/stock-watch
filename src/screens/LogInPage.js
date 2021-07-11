import React, { useContext, useEffect, useState } from "react";
import firebase from "@react-native-firebase/app";
// import "@react-native-firebase/auth"

import { View, Button ,Text, TextInput, Image, ImageBackground , TouchableOpacity, zIndex ,StyleSheet } from "react-native"; 


export const LogInPage = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLoginPress = () => {
        firebase.auth().signInWithEmailAndPassword(username, password)
            .then((userCredential) => {     
                var user = userCredential.user;
                
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
            })
    }



    return (

        <View style={styles.container}>
            <ImageBackground source={require("../assets/apple_id_desktop_2x.jpg")} style={styles.image} />
            <Image source={require("../assets/apple_logo.png")} style={styles.logo} />  
            <View style={[styles.loginform]}>     
                 <Text 
                    style={{ 
                        //Objects within objects, Remember valid obj must have Key & value
                        //Spreading operator will list out object data one by one
                        ...styles.header
                    }}
                >
                    Apple ID
                </Text>
                <Text 
                    style={{
                        fontSize: 12,
                        color: "white",
                        marginBottom: 50,  
                        // Padding protects your insides
                        // Keep margin out, don't get called  
                    }}
                >   
                    Manage your Apple account
                </Text>
                 
                <TextInput 
                    style={styles.input}
                    textAlign="left"
                    placeholder="Apple ID"
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
                <TouchableOpacity>
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
                        Log In
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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
        paddingTop: "60%",
        justifyContent: "center",
        alignItems: "center"
    },
    header: {
        color: "white",
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