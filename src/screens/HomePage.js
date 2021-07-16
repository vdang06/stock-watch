import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, Button ,Text, TextInput, Image, ImageBackground, TouchableOpacity, TouchableHighlight, zIndex, StyleSheet, Platform } from "react-native"; 

import { isEmpty } from "lodash";
import { firebase } from "@react-native-firebase/app";
import { handleCPriceUpdate } from "../functions/Finnhub";


import { ListItem } from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialIcons";
import { deleteState, handleDoneEdit, handleOnDel } from "../functions/dbUtil";


export const HomePage = ( {navigation } ) => {

    const user = firebase.auth().currentUser;
    const [ userHoldings, setuserHoldings ] = useState([]);
    const [ editMode, seteditMode ] = useState(false);
    const [ showDelete, setshowDelete] = useState(false);
    const [ pullRefresh, setpullRefresh ] = useState(false);
    const [ check, setCheck ] = useState(false);
    console.log(`top ${userHoldings}`)
    //const [ tdata, settdata ] = useState([]);
    //settdata((prevtdata) => [...prevtdata, exdata[k]])


    // useEffect( () => {
        
    //     dispHoldingsWithPrice = userHoldings.map(function(el) {

    //         var o = Object.assign({}, el);

    //         const result = await fetch(`https://finnhub.io/api/v1/quote?symbol=${userHoldings[userHoldings.indexOf(el)].symid}&token=${FINNHUB.apiKey}`)
    //         .then(res => res.json())
    //         .then((res) => {
    //             o.c = res.c;
    //             console.log(o);
    //         })
    //         .catch((e) => {
    //             console.log(e);
    //         })

        
    //         return result;
    //     })

    // },[isPriceUpdate])
    //console.log(pdata);
    

    // const test = () => {
    //     const holdingsRef = firebase.database().ref(`users/${user.uid}`).child("holdings/")
    //     holdingsRef.once("value", (data) => {
    //     if (dbListen) {
    //         const exdata = data.val();
    //         console.log(exdata);
    //         const pdata = [];
    
    //         if (exdata) {
    //             Object.keys(exdata).forEach(k => {
    //                 pdata.push(exdata[k]);
                    
    //             });
        
        
    //             pdata.sort(function(a, b) {
    //                 var nameA = a.name.toUpperCase(); 
    //                 var nameB = b.name.toUpperCase(); 
    //                 if (nameA < nameB) {
    //                 return -1;
    //                 }
    //                 if (nameA > nameB) {
    //                 return 1;
    //                 }
    //                 return 0;
    //             });

    //             console.log(`pdata ${pdata}`);
    //             handleCPriceUpdate(pdata, (out) => {
    //                 setuserHoldings(out);
    //             });

    //         }

    //         else {
    //             setuserHoldings([]);
    //             console.log("DB EMPTY");
    //         }
    //     }

    //     console.log(`End of DB ${userHoldings}`);
    // })}

    //useEffect handles component life cycles/side effects, no dep. run once
    useEffect(() => {
        // firebase.database().ref("users/" + user.uid).child("holdings/").on("child_changed", (snapshot) => {
        //     console.log("holdings updated",snapshot.val());
        // });
        const holdingsRef = firebase.database().ref(`users/${user.uid}`).child("holdings/")
        holdingsRef.on("value", (data) => {
            const exdata = data.val();
            console.log(exdata);
            const pdata = [];
    
            if (exdata) {
                Object.keys(exdata).forEach(k => {
                    pdata.push(exdata[k]);
                    
                });
        
        
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

                console.log(`pdata ${pdata}`);
                handleCPriceUpdate(pdata, (out) => {
                    setuserHoldings(out);
                });

            }

            else {
                setuserHoldings([]); //Getting called too fast, listener needs to be off when deletion in progress? Callback to turn on?
                // or read db holdings and populate again after deletion
                console.log("DB EMPTY"); 
            }
        })
        

        console.log(`End of DB ${userHoldings}`);
        
        return () => {
            
            holdingsRef.off();
        }
  
    },[])


    console.log(`bottom ${userHoldings}`)

    return (
        <SafeAreaView style={styles.container} edges={["top","right", "left"]}>
            
            {editMode && userHoldings.length
                ? <View style ={styles.header}>
                        <Text
                            style={{
                                flex: 1,
                                fontSize:30,
                                color:"grey"
                            }}>
                                delete
                        </Text>
                        
                            {showDelete
                                ? <Icon
                                      name="delete"
                                      size={30}
                                      onPress={() => {
                                          handleOnDel(userHoldings, () => {
                                              seteditMode(false);
                                          });
                                      }}
                                  />
                                : null
                            }
                        
                        <TouchableOpacity>
                            <Icon
                                name="done"
                                size={30}
                                onPress={() => {
                                    handleDoneEdit(userHoldings, (out) => {
                                        seteditMode(out);
                                        setshowDelete(out);
                                    })
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                : (<View style={styles.header}>
                        <Text
                            style={{
                                fontSize: 30
                            }}>
                                holdings &amp; watchlist
                        </Text>
                        {userHoldings.length 
                            ?  <TouchableOpacity>
                                  <Icon 
                                  name="edit"
                                  size={30}
                                  onPress={() => seteditMode(true)}
                                  />
                              </TouchableOpacity>
                            : null
                        }
                
                  </View>
                )
            }
                
            {/* {console.log(userHoldings)} */}
            {isEmpty(userHoldings) 
                ? <Button 
                      title="Add your favourite stocks now!"
                      style={{flex: 1}}
                      onPress={() => {navigation.navigate("Search")}}
                  />
                : <FlatList 
                      style={styles.holdings}
                      data={userHoldings}
                      keyExtractor={(item, index) => index.toString()}
                      onRefresh={() => handleCPriceUpdate(userHoldings, (out) => {
                          setuserHoldings(out);
                      })}
                      refreshing={pullRefresh}
                      renderItem={({item}) => (
                          <ListItem 
                              bottomDivider
                              containerStyle={{backgroundColor: "white"}}
                              underlayColor= "white"
                              onPress={() => {
                                  if (typeof item.flagRemove == 'undefined') {item.flagRemove = false};
                                  if (editMode) {
                                        item.flagRemove = !item.flagRemove;
                                        setshowDelete(deleteState(userHoldings));
                                        setCheck(!check);
                                  }
                              }}
                              onLongPress={() => {
                                  if (typeof item.flagRemove == 'undefined') {item.flagRemove = false};
                                  item.flagRemove = !item.flagRemove;
                                  setshowDelete(deleteState(userHoldings));
                                  setCheck(!check);
                                  seteditMode(true);
                              }}
                           
                          >
                              {editMode 
                                  ? <ListItem.CheckBox 
                                          checked={item.flagRemove}
                                          onIconPress={() => {
                                              if (typeof item.flagRemove == 'undefined') {item.flagRemove = false};
                                              item.flagRemove = !item.flagRemove;
                                              setshowDelete(deleteState(userHoldings));
                                              setCheck(!check);
                                          }}
                                    /> 
                                  : null
                              }
                              <ListItem.Content style={{flex:4}}>
                                  <ListItem.Title>{item.name}</ListItem.Title>
                                  <ListItem.Subtitle>{item.symid}</ListItem.Subtitle>

                              </ListItem.Content>
                              <ListItem.Content style={{flex:1}}>
                              <Text>{item.c}</Text>       
                                  <Text
                                      style={{color: (item.color)}}
                                  >
                                      {item.diffSincePC}
                                  </Text>
                                  
                                  <Text
                                      style={{color: item.color}}
                                  >
                                      {item.percentDiff}
                              </Text>
                              </ListItem.Content>
                              {!editMode ? <ListItem.Chevron/> : false}
                          </ListItem>
                      )}
                  />
            }
            <View>
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
            </View>
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
