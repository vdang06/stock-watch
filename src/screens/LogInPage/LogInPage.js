import React, { useState } from "react";
import { View, Button ,Text, TextInput, Image, ImageBackground , TouchableOpacity, zIndex ,StyleSheet } from "react-native"; 


const LogInPage = () => {
    const [username, setUser] = useState('')
    const [password, setPassword] = useState('')

    console.log("hi");

    return (

        <View style={styles.container}>
            <ImageBackground source={require("../../assets/apple_id_desktop_2x.jpg")} style={styles.image} />
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
                    onChangeText={setUser}
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
                <Button
                    title="Log In"
                />
            </View>
            <Image source={require("../../assets/apple_logo.png")} />
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
    loginform: {
        paddingTop: "60%",
        justifyContent: "center",
        alignItems: "center"
    },
    header: {
        color: "black",
        textAlign: "center",
        fontSize: 30
    },
    input: {
        height: 40,
        width: "60%",
        margin: 5,
        paddingLeft: 10,
        borderWidth: 0.3
    }
  })
export default LogInPage;