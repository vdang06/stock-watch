import React, { useEffect, useState, useCallback } from "react";
import { FlatList, View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, TouchableWithoutFeedback,
RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SearchBar, ListItem, Input, Button, Card } from "react-native-elements";

import firebase from "@react-native-firebase/app";

import { finnCalc, fetchDetails } from "../functions/Finnhub";
import { sigDigFormat } from "../functions/Finnhub";
import { isMarketOpen } from "../functions/Finnhub";
import moment from "moment";
import { toTitleCase } from "../functions/common";


import { FINNHUB } from "../common/constants";
import { Loading } from "../common/loading";

import { LineChart } from "react-native-chart-kit";
import { truncate } from "lodash";

const handleDetails = (symId, desc, {navigation}) => (
    symId.includes(".") ? Alert.alert("Sorry!","Only stocks traded in the U.S. are supported at the moment."): navigation.navigate("Details", {symId: symId, desc: desc})
)

const OpenURLButton = ({ url, children }) => {
    const handlePress = useCallback(async () => {
      // Checking if the link is supported for links with custom URL scheme.
      const supported = await Linking.canOpenURL(url);
  
      if (supported) {
        // Opening the link with some app, if the URL scheme is "http" the web link should be opened
        // by some browser in the mobile
        await Linking.openURL(url);
      } else {
        Alert.alert(`Don't know how to open this URL: ${url}`);
      }
    }, [url]);
  
    return (
        <TouchableOpacity>
            <Text
                style={{...styles.details, flex: 0, fontSize: 12}}
                numberOfLines={1}
                adjustsFontSizeToFit
                onPress={handlePress}
            >
                {children}
            </Text>
        </TouchableOpacity>
    )
  };


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
        <SafeAreaView style={{flex: 1, backgroundColor: "#547aff"}} edges={["right", "left", "top"]}>
            <View style={{maxHeight: 60, marginBottom: 10}}>
                <SearchBar
                    containerStyle={{ backgroundColor : "#547aff" }}
                    inputContainerStyle={{ backgroundColor: "white"}}
                    placeholder="Search for your favourite stocks"
                    onChangeText={setSearch}
                    cancelButtonProps={{color: "white"}}
                    platform={Platform.OS}
                    value={search}
                />
            </View>
            <View style={{flex: 1, backgroundColor: "white"}}>

                    <FlatList 
                        data={fhdata}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{backgroundColor: "white"}}
                        renderItem={({ item }) => ( //round parantheses imply return, curly do not have return unless explicitly stated
                            <ListItem 
                                bottomDivider
                                containerStyle={{ backgroundColor: "f2f2f2"}}
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
    const [ routeInfo, setrouteInfo ] = useState(route.params.symId);
    const [ uHoldings, setuHoldings ] = useState(route.params);
    const [ hasHoldings, sethasHoldings ] = useState(false);
    const [ fhdata, setfhdata ] = useState({});
    const [ isLoading, setisLoading ] = useState(true);
    const [ pullRefresh, setpullRefresh ] = useState(false);
    const [ fhError, setfhError ] = useState(false);


    // console.log(`ROUTE INFO`,route.params);

    // FETCH FINNHUB PRICE DATA, make sure to include loading screen since API is high usage

    useEffect(() => {

        console.log(`USER HOLDINGS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,uHoldings);
        if (uHoldings.qty > 0) {
            sethasHoldings(true)
        }

        fetchDetails(symId, (out) => {
            setfhdata(out);
            setpullRefresh(false);
            setisLoading(false);
        });

    },[route, pullRefresh]);

    

    console.log(`final Obj`,fhdata);


    if (!isLoading && !fhError) return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
           
            <View style={{...styles.header, paddingHorizontal: 10}}>
                <Button 
                    title={"<"}
                    type={"clear"}
                    containerStyle={{alignSelf: "center"}}
                    titleStyle={{...styles.navlabels}}
                    onPress={() => navigation.goBack()}
                />
                
                <View style={{...styles.headerTitle, flex: 1}}>
                    <Text 
                        style={{...styles.biglabels, alignSelf: "center", fontSize: 30}}
                        numberOfLines={1}
                        ellipsizeMode={"tail"}
                    >
                        {fhdata.symid}
                    </Text>
                    <Text
                        style={{...styles.biglabels, alignSelf: "center", fontSize: 10, fontWeight: "500"
                        }}
                    >
                        {fhdata.exchange} ({fhdata.currency})
                    </Text>

        
                </View>
                <Button 
                    title={"+"}
                    type={"clear"}
                    containerStyle={{alignSelf: "center"}}
                    titleStyle={{...styles.navlabels}}
                    onPress={() => navigation.navigate("AddHoldings",{symId: symId, desc: fhdata.name})}
                />
            </View>

            {/* SCROLL VIEW  */}

            <ScrollView 
                style={{
                        flex: 1,
                        backgroundColor: "white"
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={pullRefresh}
                            onRefresh={ () => {
                                fetchDetails(fhdata.symid, (out) => {
                                    setfhdata(out);
                                    setpullRefresh(false);
                                })}
                            }
                        />
                    }
            >

                <Text
                    style={{
                        ...styles.biglabels,
                        alignSelf: "auto",
                        textShadowColor: "grey",
                        textAlign: "center",
                        paddingHorizontal: 20,
                        textShadowRadius: 3,
                        fontWeight: "300",
                        ...styles.buttontxt
                    }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {fhdata.name}
                </Text>
                <View style={{
                        flex: 1, 
                        flexDirection: "row",
                        // maxHeight: 40, 
                        // paddingHorizontal: 10,
                        marginHorizontal: 30,
                        alignItems: "center"
                    }}
                >
                    <Text
                        style={{...styles.biglabels,
                            color: "#4f4f4f",
                            flex: 1,
                            alignSelf: "auto",
                            fontSize: 40,
                            textShadowColor: "grey",
                            textShadowRadius: 3,
                            fontWeight: "300",
                            textAlign: "center"}}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {fhdata.c}
                    </Text>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "column",
                            alignItems: "flex-end"
                        }}
                    >
                        <Text
                            style={{
                                ...styles.biglabels,
                                fontSize: 20,
                                color: fhdata.color,
                                textShadowColor: "grey",
                                textShadowRadius: 3,
                                fontWeight: "300",
                                alignSelf: "center"
                            }}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {fhdata.diffSincePC} ({fhdata.percentDiff})
                        </Text>
                        <Text
                            style={{...styles.navlabels, textShadowColor: "grey",fontSize: 12, color: "#595959", fontWeight: "300"}}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {/* Handle open/closed only. Extended hours not available for price checking so it's closed */}
                            {fhdata.isMktOpen == "open" && fhdata.isMktOpen != undefined ? "mkt. open" : "at close"} {moment.unix(fhdata.t).format("MMM. D, h:mm a")} edt
                        </Text>                   
                    </View>
                </View>

                {/* HOLDINGS SECTION */}
                {hasHoldings
                    ?
                    <TouchableOpacity 
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate("AddHoldings", {symId: fhdata.symid, desc: desc})}
                    >
                        <Card containerStyle={styles.cardContainer}>
                            <View style={styles.cardboxHoriz}>
                                <Text style={styles.cardtitle}>holdings</Text>
                                    <Text style={
                                        {   
                                            color: "white",
                                            fontSize: 14,
                                            fontWeight: "300", 
                                            textAlign: "right",
                                            alignSelf: "flex-end"
                                        }}
                                    >
                                        tap to edit
                                    </Text>
                            </View>
                            <Card.Divider color={"white"}/>
                            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}>
                                <Text style={styles.labels}>
                                    shares 
                                </Text>
                                <Text style={styles.labels}>
                                    total value   
                                </Text>
                            </View>
                            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}>
                                <Text                             
                                        style={styles.holdings}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    > 
                                        {uHoldings.qty}
                                </Text>
                                <Text                             
                                        style={styles.holdings}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        {uHoldings.currVal}
                                </Text>
                            </View>
                            <Card.Divider color={"white"}/>
                            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}>
                                <Text style={styles.labels}>
                                    average price
                                </Text>
                                <Text style={styles.labels}>
                                    % of holdings
                                </Text>

                            </View>
                            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}>
                                <Text                             
                                    style={styles.holdings}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {uHoldings.acb}
                                </Text>
                                <Text                             
                                    style={styles.holdings}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {uHoldings.pctOfHolding}
                                </Text>
                            </View>

                            <Card.Divider color={"white"}/>
                            {/* <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}> */}
                                <Text style={styles.labels}>
                                    day's return 
                                </Text>
                                <Text                             
                                    style={{...styles.holdings}}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {uHoldings.dayReturn} ({fhdata.percentDiff})
                                </Text>
                            {/* </View> */}
                            <Card.Divider color={"white"}/>
                            <Text style={styles.labels}>
                                total return
                            </Text>
                            <Text 
                                style={styles.holdings}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {uHoldings.totalReturn} ({uHoldings.pcttotReturn})
                            </Text>
                            <Card.Divider color={"white"}/>
                        </Card>
                    </TouchableOpacity>
                    : null
                } 

                {/*  STATS AND FINANCIALS */}
                <TouchableOpacity 
                    activeOpacity={0.9}
                >
                    <Card containerStyle={styles.cardContainer}>
                        <Text style={styles.cardtitle}>stats &amp; financials</Text>
                        <Card.Divider color={"white"}/>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}>
                            <Text style={styles.labels}>
                                open 
                            </Text>
                            <Text                             
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            > 
                                {fhdata.o}
                            </Text>
                            <Text style={styles.labels}>
                                mkt.cap   
                            </Text>
                            <Text                             
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata.marketCap}
                            </Text>
                        </View>
                        <Card.Divider color={"white"}/>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}>
                            <Text style={styles.labels}>
                                prev.close 
                            </Text>
                            <Text                             
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata.pc}
                            </Text>
                            <Text style={styles.labels}>
                                p/e ratio
                            </Text>
                            <Text                             
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata.peRatio}
                            </Text>
                        </View>
                        <Card.Divider color={"white"}/>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}>
                            <Text style={styles.labels}>
                                high 
                            </Text>
                            <Text                             
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata.h}
                            </Text>
                            <Text style={styles.labels}>
                                eps
                            </Text>
                            <Text                             
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata.eps}
                            </Text>
                        </View>
                        <Card.Divider color={"white"}/>
                        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                            <Text style={styles.labels}>
                                low 
                            </Text>
                            <Text                             
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata.l}
                            </Text>
                            <Text style={styles.labels}>
                                div yield
                            </Text>
                            <Text                             
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata.divYield}
                            </Text>
                        </View>
                        <Card.Divider color={"white"}/>
                        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                            <Text style={styles.labels}>
                                52wk.hi
                            </Text>
                            <Text 
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata["52wHigh"]}
                            </Text>
                            <Text style={styles.labels}>
                                avg vol
                            </Text>
                            <Text                             
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata.avgVol}
                            </Text>
                        </View>
                        <Card.Divider color={"white"}/>
                        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                            <Text style={styles.labels}>
                                52wk.low
                            </Text>
                            <Text                             
                                style={styles.details}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata["52wLow"]}
                            </Text>
                            <Text style={styles.labels}
                            >
                                updated
                            </Text>
                            <Text style={{...styles.details, alignSelf: "baseline", fontSize: 12}}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                            >
                                {/* a few seconds ago */}
                                {moment.unix(fhdata.t).fromNow()}
                            </Text>
                        </View>
                        <Card.Divider color={"white"}/>
                    </Card>
                </TouchableOpacity>

                {/* ABOUT COMPANY INFO */}
                <TouchableOpacity
                    activeOpacity={0.9}
                >
                    <Card containerStyle={{...styles.cardContainer}}>
                        <Text
                            style={styles.cardtitle}
                        >
                            about
                        </Text>
                        <Card.Divider color={"white"}/>
                        <View style={styles.cardboxHoriz}>
                            <Text
                                style={styles.labels}
                            >
                                country
                            </Text>
                            <Text
                                style={{...styles.details, textAlign: "right"}}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata.country}
                                {/*  */}
                            </Text>
                        </View>
                        <Card.Divider color={"white"}/>
                        <View style={styles.cardboxHoriz}>
                            <Text
                                style={styles.labels}
                            >
                                industry
                            </Text>
                            <Text
                                style={{...styles.details, textAlign: "right"}}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {fhdata.finnhubIndustry}
                            </Text>
                        </View>
                        <Card.Divider color={"white"}/>
                        <View style={styles.cardboxHoriz}>
                            <Text
                                style={styles.labels}
                            >
                                ipo date
                            </Text>
                            <Text
                                style={{...styles.details, textAlign: "right"}}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {moment(fhdata.ipo, 'YYYY-MM-DD').calendar()}
                            </Text>
                        </View>
                        <Card.Divider color={"white"}/>
                        <View style={styles.cardboxHoriz}>
                            <Text
                                style={{...styles.labels, flex: 0}}
                            >
                                website
                            </Text>
                            <OpenURLButton url={fhdata.weburl}>{fhdata.weburl}</OpenURLButton>
                        </View>
                        <Card.Divider color={"white"}/>
                    </Card>
                </TouchableOpacity>
                
                
                <Button
                    title={"data provided by finnhub.io"}
                    type={"clear"}
                    titleStyle={{...styles.hldbutton, fontSize: 16}}
                    // onPress={() => navigation.navigate("AddHoldings",{symId:symId, desc:desc})}
                />
            </ScrollView>

            
        </SafeAreaView>

    )
    if (fhError) {
        return <Loading />;
    }
    else {
        return <Loading />
    }
}

export const AddHoldings = ({ route, navigation }) => {

    const {symId, desc} = route.params;
    const [ Qty, setQty ] = useState("");
    const [ totalCost, settotalCost ] = useState("");
    const [ LotDateTime, setLotDateTime ] = useState("");
    const user = firebase.auth().currentUser;

    const handleHoldings = (callback) => {

        firebase.database().ref("users/" + user.uid).child("holdings/" + symId ).set({
            qty: Qty,
            name: desc,
            symid: symId,
            acb: ((totalCost/Qty).toString()),
            totalCost: totalCost
        })
        .then((res) => {
            if (callback) {
                callback();
            }
            console.log(`WRITE COMPLETE`,res)
        })
        .catch((e) => {
            console.log(e);
            Alert.alert("Error", "Sorry! Your request cannot be handled right now. Please try again later.");
        })



    }

    return(
        <SafeAreaView style={{...styles.container}} edges={["top", "right", "left"]}>
            <View style={{...styles.header}}>
                <Button 
                    title={"<"}
                    type={"clear"}
                    size={30}
                    titleStyle={{...styles.navlabels,
                        paddingLeft: 10
                    }}
                    onPress={() => navigation.goBack()}
                />
                
                <View style={{...styles.headerTitle}}>
                    <Text 
                        style={{fontSize: 30, ...styles.biglabels}}
                        numberOfLines={1}
                        ellipsizeMode={"tail"}
                    >
                        {symId}
                    </Text>
                    <Text
                        style={{
                            ...styles.biglabels,
                            fontSize: 12,
                        }}
                    >
                        {desc}
                    </Text>
                </View>
            </View>
            
            <View
                style={{flex: 1, backgroundColor: "white"}}
            >
                <Input
                    inputContainerStyle={styles.input}
                    onChangeText={setQty}
                    placeholder="lot size"
                    keyboardType="numeric"
                    value={Qty}
                />
                <Input
                    inputContainerStyle={styles.input}
                    onChangeText={settotalCost}
                    placeholder="price paid"
                    keyboardType="numeric"
                    value={totalCost}
                />
                {/* <Input
                    inputContainerStyle={styles.input}
                    onChangeText={setLotDateTime}
                    placeholder="trade date"
                    value={LotDateTime}
                /> */}
            </View>
            <Button
                title={"save to holdings"}
                type={"clear"}
                titleStyle={{color: "#6e8eff"}}
                buttonStyle={{backgroundColor: "white"}}
                onPress={() => handleHoldings((out) => {
                    navigation.navigate("Details", {symId: symId, desc: desc});
                })}
            />
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: "#547aff",
        flex: 1
    },
    cardContainer: {
        flex: 1, 
        borderRadius: 20,
        backgroundColor: "#6e8eff"
    },
    back: {
        alignSelf: "flex-start"
    },
    details: {
        
    },
    input: {
        // backgroundColor: "white",
        margin: 5,
        paddingLeft: 10,
        // borderWidth: 0.3
    },
    header: {
        backgroundColor: "#547aff",
        flex: 1,
        flexDirection: "row",
        alignItems: "center", 
        maxHeight: 60,
        marginBottom: 10
    },
    headerTitle: {
        // backgroundColor: "#9DABDD",
        alignItems: "center",
        // justifyContent: "flex-start",
        // flexDirection: "row",
        flex: 10
        // margin: 10
    },
    labels: {
        flex: 1,
        fontSize: 18,
        color: "white",
        fontWeight: "300"
    },
    holdings: {
        flex: 1,
        fontSize: 18,
        color: "white",
        fontWeight: "500"

    },
    hldbutton: {
        color: "grey"
    },
    details: {
        flex: 1,
        fontSize: 20,
        color: "white",
        fontWeight: "600",
        textAlign: "center"
    },
    cardtitle: {
        alignSelf: "flex-start",
        fontSize: 20,
        color: "white"
    },
    cardboxHoriz: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline"
    },
    majortxt: {
        color: "white",
        fontWeight: "bold"
    },
    minortxt: {
        color: "white",
        fontWeight: "400"
    },
    buttontxt: {
        color: "#547aff"
    },
    biglabels: {
        alignSelf: "flex-start",
        fontWeight: "bold",
        fontSize: 40,
        color: "white",
        textShadowColor: "black",
        textShadowOffset: {
            width: -1,
            height: 1
        },
        textShadowRadius: 6
    
    },
    navlabels:{
        alignSelf: "flex-start",
        fontSize: 30,
        color: "white",
        textShadowColor: "black",
        textShadowOffset: {
            width: -1,
            height: 1
        },
        textShadowRadius: 6,
        fontWeight: "400",
        // paddingLeft: 10
    }
})

