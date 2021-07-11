import React, { useEffect, useState } from "react";
import { FlatList, View, Button ,Text, TextInput, Image, ImageBackground , TouchableOpacity, zIndex , StyleSheet, SafeAreaView, Platform } from "react-native"; 
import { SearchBar, ListItem } from "react-native-elements";
import "@react-native-firebase/auth";
import { firebase } from "@react-native-firebase/auth";
import { FINNHUB } from "../common/constants";
import { json } from "express";


export const HomePage = () => {

    const user = firebase.auth().currentUser;
    const [ search, setSearch ] = useState("");
    const [ fhdata , setfhdata ] = useState([]);
    

    const handleSearch = (val) => {
        fetch(`https://finnhub.io/api/v1/search?q=${val}&token=${FINNHUB.apiKey}`)
        .then(res => res.json())
        .then((res) => {
            setfhdata(res.result);
        })
        .catch((e) => console.error(e))
        
    }

    useEffect( () => {
        if (search.length && search.trim()) {
            const searchTimeOut = setTimeout( () => handleSearch(search), 500);
            return () => clearTimeout(searchTimeOut);
        }
        else setfhdata([]);
    },[search]);


    console.log("SEARCHBAR: " + search);
    console.log(JSON.stringify(fhdata));


    return (
        <SafeAreaView style={{ flex : 1 }}>
            <View>
                <SearchBar
                    containerStyle={{ backgroundColor : "f2f2f2" }}
                    placeholder="Search for your favourite stocks"
                    onChangeText={setSearch}
                    platform={Platform.OS}
                    value={search}
                />
                <FlatList 
                    data={fhdata}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{paddingBottom: 20}}
                    renderItem={({ item }) => ( //round parantheses imply return, curly do not have return unless explicitly stated
                        <ListItem bottomDivider>
                            <ListItem.Content>
                                <ListItem.Title>{item.description}</ListItem.Title>
                                <ListItem.Subtitle>{item.displaySymbol}</ListItem.Subtitle>
                            </ListItem.Content>
                        </ListItem>
                    )}
                    
                />
                <Text style={{
                    alignSelf: "center",
                    paddingTop: 350
                }}
                >
                Welcome {user.email}
                </Text>
                <TouchableOpacity
                    style={{
                        alignSelf: "center"
                    }}>
                    <Text 
                        style={{
                            color: "blue"
                        }}
                        onPress={ () => firebase.auth().signOut().then(() => {
                            console.log("Signed out!")
                        }).catch((error) => {
                            console.log(error)
                        })
                        }
                        >
                        Log Out
                    </Text>
                </TouchableOpacity>
            </View>
        </ SafeAreaView>
    )
}
