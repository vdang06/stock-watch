import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, Button ,Text, TextInput, Image, ImageBackground, TouchableOpacity, TouchableHighlight, zIndex, StyleSheet, Platform } from "react-native"; 
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { isEmpty } from "lodash";
import { firebase } from "@react-native-firebase/app";

import { ListItem } from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialIcons";

export const HomePage = ( {navigation} ) => {

    const user = firebase.auth().currentUser;
    const [ userHoldings, setuserHoldings ] = useState([]);
    const [ editMode, seteditMode ] = useState(false);

    //const [ tdata, settdata ] = useState([]);
    //settdata((prevtdata) => [...prevtdata, exdata[k]])


    //console.log(pdata);
    
    //useEffect handles component life cycles/side effects, no dep. run once
    useEffect( () => {
        // firebase.database().ref("users/" + user.uid).child("holdings/").on("child_changed", (snapshot) => {
        //     console.log("holdings updated",snapshot.val());
        // });
        const holdingsRef = firebase.database().ref(`users/${user.uid}`).child("holdings/")
        holdingsRef.on("value", (data) => {
            var exdata = data.val();
            const pdata = [];
    
            Object.keys(exdata).forEach(k => {
                pdata.push(exdata[k]);
                
            });
    
            
            console.log("getdata");
            pdata.sort(function(a, b) {
                var nameA = a.name.toUpperCase(); 
                var nameB = b.name.toUpperCase(); 
                if (nameA < nameB) {
                  return -1;
                }
                if (nameA > nameB) {
                  return 1;
                }
                return 0;
              });
            setuserHoldings(pdata); 
    
        })
        return () => {
            holdingsRef.off();
        }
        //})
    },[])


    return (
        <SafeAreaView style={styles.container}>
            
            {editMode
                ? <View style ={styles.header}>
                        <Text
                            style={{
                                fontSize:30,
                                color:"grey"

                            }}>
                                editing
                        </Text>
                        <TouchableOpacity>
                            <Icon
                                name="done"
                                size={30}
                                onPress={() => seteditMode(false)}
                            />
                        </TouchableOpacity>
                    </View>
                : <View style={styles.header}>
                        <Text
                            style={{
                                fontSize: 30
                            }}>
                                holdings &amp; watchlist
                        </Text>
                        <TouchableOpacity>
                            <Icon 
                            name="edit"
                            size={30}
                            onPress={() => seteditMode(true)}
                            />
                        </TouchableOpacity>
                    </View>
            }
                
            
            {isEmpty(userHoldings) 
                ? <Button 
                      title="Add your favourite stocks now!"
                      onPress={() => {navigation.navigate("Search")}}
                  />
                : <FlatList 
                      style={styles.holdings}
                      data={userHoldings}
                      keyExtractor={(item, index) => index.toString()}
                      //contentContainerStyle={{paddingBottom: useBottomTabBarHeight()}}
                      renderItem={({item}) => (
                          <ListItem 
                              bottomDivider
                              containerStyle={{backgroundColor: "white"}}
                              underlayColor= "white"
                              //onPress={() => handleDetails(item.symbol,item.description,{navigation})}
                          >
                              <ListItem.Content>
                                  <ListItem.Title>{item.name}</ListItem.Title>
                                  <ListItem.Subtitle>{item.symid}</ListItem.Subtitle>       
                              </ListItem.Content>
                              <ListItem.Chevron/>
                          </ListItem>
                      )}
                  />
            }

            <Text style={{
                alignSelf: "center"
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
                    onPress={() => {
                        firebase
                            .auth()
                            .signOut()
                            .then(() => {
                                console.log("Signed out!")
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                    }}
                >
                    Log Out
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        margin: 10
    },
    holdings: {
        flex: 1,
        flexDirection: "column"
    }
})


//Sign out
