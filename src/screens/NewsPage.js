import React, { useEffect, useState, useCallback } from "react";
import { FlatList, View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground } from "react-native";
import { SafeAreaView, useSafeAreaFrame } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SearchBar, ListItem, Card, Icon } from "react-native-elements";
import moment from "moment";

import firebase from "@react-native-firebase/app";

import { WebView } from 'react-native-webview';
import { FINNHUB } from "../common/constants";
import { Loading } from "../common/loading";
import { fetchNews } from "../functions/Finnhub";
import { isEmpty } from "lodash";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";


export const NewsPage = ({ navigation, route }) => {

    const [ isFetching, setisFetching ] = useState(false);
    const [ firstLoad, setfirstLoad ] = useState(true);
    const [ fetchedNews, setfetchedNews ] = useState([]);
    const ITEM_HEIGHT = 150;

    useEffect( () => {
        fetchNews((out) => {
            setfetchedNews(out);
            setfirstLoad(false);
        })
    },[])

    // const getItemHeight = useCallback(
    //     (data, index) => ({
    //         length: ITEM_HEIGHT, 
    //         offset: ITEM_HEIGHT * index, 
    //         index,
    //     })
    // ,[]);

    // pagination ?
    const renderNews = useCallback(({item}) => (

        <ImageBackground
            source={{uri: item.image}}
            imageStyle={{opacity: 1, flex: 1}}
            resizeMode={"cover"}
            style={{flex: 0}}    
        >
            <ListItem 
                topDivider
                bottomDivider
                Component={TouchableWithoutFeedback}
                containerStyle={{flex: 1, backgroundColor: "f2f2f2", height: 125}}
                onPress={() => navigation.navigate("Article", {url: item.url})}
            >
                <ListItem.Content
                    style={{alignSelf: "flex-start"}}
                >
                    <ListItem.Title
                        style={{flex: 1, ...styles.newslabels, alignSelf: "auto"}}
                    >{item.headline}</ListItem.Title>
                    <ListItem.Subtitle
                        style={{...styles.newslabels, alignSelf: "auto"}}
                    >
                        {item.datetime}
                    </ListItem.Subtitle>       
                </ListItem.Content>
                <Text style={styles.newslabels}>
                    {item.source}</Text>
            </ListItem>
        </ImageBackground>


         
        // <Card
        //     containerStyle={{flex: 1}}
        // >
        //     <Card.Title>{item.headline}</Card.Title>
        //     <Text>{item.datetime}</Text>
        //     <Text>{item.source}</Text>
        //     <ListItem.Chevron/>
        //     <Card.Image
        //         source={{uri: "https://image.cnbcfm.com/api/v1/image/106909508-1626097516638-gettyimages-1278097978-pi-2083749.jpeg"}}
        //         resizeMode={"contain"}
        //         style={{position: "absolute"}}
        //     />
        // </Card>
        
    ),[])

    const usekeyExtractor = useCallback((item, index) => index.toString(), []);

    const NewsHead = () => (
        <View style={{...styles.header}}>
            <Text
                style={{...styles.newslabels, fontSize: 40, fontWeight: "400", alignSelf: "flex-start", margin: 10}}
            >headlines</Text>
        </View>
    )

    if (firstLoad) return <Loading />;
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "#547aff"}} edges={["top","left","right"]}>
            {/* <View style={styles.header}>
                <Text> Yep </Text>
            </View> */}
            <FlatList 
                data={fetchedNews}
                keyExtractor={usekeyExtractor}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                ListHeaderComponent={<NewsHead/>}
                ListHeaderComponentStyle={{ backgroundColor: "#547aff"}}
                // getItemLayout={getItemHeight}
                showsVerticalScrollIndicator={false}
                onRefresh={() => {
                    setisFetching(true);
                    fetchNews((out) => {
                        setfetchedNews(out);
                        setisFetching(false);
                    })
                }}
                refreshing={isFetching}
                //contentContainerStyle={{paddingBottom: useBottomTabBarHeight()}}
                renderItem={renderNews}
            />
        </SafeAreaView>
    )
}

export const ArticlePage = ({ navigation, route}) => {

    // console.log(typeof(route.params.url));
    const htmlContent = route.params.url;
    
    return (
        <SafeAreaView style={{...styles.header, height: 0}} edges={["left", "right"]}>
            <Icon
                name="expand-more"
                type="material"
                color="white"
            />

            <WebView
                // originWhitelist={["*"]}
                source={{uri: htmlContent}}
                // startInLoadingState={true}
                // renderLoading={() => <Loading />}
                //contentInset={{useSafeAreaFrame}}
            />

        </SafeAreaView>
    )
}

const styles = new StyleSheet.create({
    header: {
        backgroundColor: "#547aff",
        flex: 1,
        height: 70,
        // marginBottom: 10
    },
    newslabels: {
        alignSelf: "flex-end",
        fontWeight: "bold",
        color: "white",
        textShadowColor: "black",
        textShadowOffset: {
            width: -1,
            height: 1
        },
        textShadowRadius: 6
    
    }
})