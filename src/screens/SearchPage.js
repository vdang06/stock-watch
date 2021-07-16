import React, { useEffect, useState } from "react";
import { FlatList, View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SearchBar, ListItem } from "react-native-elements";

import firebase from "@react-native-firebase/app";

import { FINNHUB } from "../common/constants";
import { Loading } from "../common/loading";



const handleDetails = (symId, desc, {navigation}) => (
    symId.includes(".") ? Alert.alert("Sorry!","Only stocks traded in the U.S. are supported at the moment."): navigation.navigate("Details", {symId: symId, desc: desc})
)


export const SearchPage = ({ navigation }) => {

    const [ search, setSearch ] = useState("");
    const [ fhdata , setfhdata ] = useState([]);
    const [ isLoading, setisLoading ] = useState(false);


    const handleSearch = (val) => {
        fetch(`https://finnhub.io/api/v1/search?q=${val}&token=${FINNHUB.apiKey}`)
        .then(res => res.json())
        .then((res) => {
            setfhdata(res.result);
        })
        .catch((e) => console.error(e))
        
        setisLoading(false);
    }
    
    useEffect( () => {
        if (search.length && search.trim()) {
            setisLoading(true);
            const searchTimeOut = setTimeout( () => handleSearch(search), 500);
            return () => clearTimeout(searchTimeOut);
        }
        else setfhdata([]);
    },[search]);
    
    // console.log("SEARCHBAR: " + search);
    // console.log(JSON.stringify(fhdata));
    
    return (
        <SafeAreaView style={{ flex : 1}} edges={["right", "left", "top"]}>
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
                    contentContainerStyle={{paddingBottom: useBottomTabBarHeight()}}
                    renderItem={({ item }) => ( //round parantheses imply return, curly do not have return unless explicitly stated
                        <ListItem 
                            bottomDivider
                            containerStyle={{backgroundColor: "f2f2f2"}}
                            underlayColor= "white"
                            onPress={() => handleDetails(item.symbol,item.description,{navigation})}
                        >
                            <ListItem.Content>
                                <ListItem.Title>{item.description}</ListItem.Title>
                                <ListItem.Subtitle>{item.symbol}</ListItem.Subtitle>       
                            </ListItem.Content>
                            <ListItem.Chevron/>
                        </ListItem>
                    )}
                />
            </View>
        </SafeAreaView>
    )  
}

export const DetailsPage = ({ route, navigation }) => {

    const {symId, desc} = route.params;
    const [ fhdata, setfhdata ] = useState({});
    const [ isLoading, setisLoading ] = useState(true);
    const [ fhError, setfhError ] = useState(false);

    // console.log(symId);
    // FETCH FINNHUB PRICE DATA, make sure to include loading screen since API is high usage
    useEffect(() => {
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symId}&token=${FINNHUB.apiKey}`)
        .then(res => res.json())
        .then((res) => {
            setfhdata(res);
            setisLoading(false);
        })
        .catch((e) => {
            setfhError(true);
            setisLoading(false);
            console.error(e);
        })

    },[])


    // console.log(fhdata);

    if (!isLoading && !fhError) return (
        <SafeAreaView style={styles.container}>

            <TouchableOpacity
                style={styles.back}
                onPress={() => navigation.goBack()}
            >
                <ListItem>
                    <ListItem.Chevron />
                </ListItem>
            </TouchableOpacity>
            <Text>{symId}</Text>
            <Text>Current Price: {fhdata.c}</Text>
            <Button
                title="Add to portfolio"
                onPress={() => navigation.navigate("AddHoldings",{symId:symId, desc:desc})}
            />
        </SafeAreaView>

    )
    if (fhError) return navigation.goBack();
    else return <Loading />
}

export const AddHoldings = ({ route, navigation }) => {

    const {symId, desc} = route.params;
    const [ Qty, setQty ] = useState("");
    const [ ACB, setACB ] = useState("");
    const user = firebase.auth().currentUser;

    const handleHoldings = () => (
        
        firebase.database().ref("users/" + user.uid).child("holdings/" + symId).set({
            qty: Qty,
            name: desc,
            symid: symId,
            acb: ACB
        })

    )

    return(
        <SafeAreaView style={{ flex: 1 }}>
            <Text>{symId} - {desc}</Text>
            <TextInput
                style={styles.input}
                onChangeText={setQty}
                placeholder="Enter quantity"
                keyboardType="numeric"
                value={Qty}
            />
            <TextInput
                style={styles.input}
                onChangeText={setACB}
                placeholder="Enter cost per share"
                keyboardType="numeric"
                value={ACB}
            />
            <Button
                title="ok"
                onPress={() => handleHoldings()}
            />
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    back: {
        alignSelf: "flex-start"
    },
    details: {
        
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