import React, { useContext, useEffect, useState } from "react";
import { Button, View, Text, StyleSheet, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import firebase from "@react-native-firebase/app";

export const SignUpPage = ({ navigation }) => {

    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");

    const handleSignUpPress = () => {
        firebase.auth().createUserWithEmailAndPassword(username, password)
        .then((auth) => {
            // handleInitWrite();
            console.log("Sign up passed")
        })
        .catch((error) => {
            var err = error.message;
            var matches = err.search(/]/) + 1;
            var trimmedError = (err.slice(matches)).trim();
            Alert.alert("Signup Failed", trimmedError);
        })
    }

    // const handleInitWrite = () => {
    //     const user = firebase.auth().currentUser;
    //     firebase.database().ref("users/").push(user.uid);
    // }

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.form]}>     
                 <Text 
                    style={{ 
                        //Objects within objects, Remember valid obj must have Key & value
                        //Spreading operator will list out object data one by one
                        ...styles.header
                    }}
                >
                    sign up
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
                    do it, it's free
                </Text>
                 
                <TextInput 
                    style={styles.input}
                    textAlign="left"
                    placeholder="enter an email"
                    autoCapitalize="none"
                    onChangeText={setUsername}
                    value={username}
                />
                <TextInput 
                    style={styles.input}
                    textAlign="left" 
                    placeholder="enter a password"
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
                    title="done"
                    borderWidth="5"
                    onPress={handleSignUpPress}
                />
            </View>
            
            <Button
                title="already have an account? go back."
                color="grey"
                onPress={() => {navigation.navigate("Login")}}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between"
    },
    form: {
        paddingTop: "50%",
        justifyContent: "center",
        alignItems: "center"
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