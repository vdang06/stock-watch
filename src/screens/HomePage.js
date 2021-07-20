import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, FlatList, View, Button ,Text, TextInput, Image, ImageBackground, TouchableOpacity, TouchableHighlight, zIndex, StyleSheet, Platform } from "react-native"; 
import { indexOf, isEmpty } from "lodash";
import { firebase } from "@react-native-firebase/app";
import { handleCPriceUpdate } from "../functions/Finnhub";


import { ListItem, Icon } from "react-native-elements";
// import Icon from "react-native-elements";
import { deleteState, handleDoneEdit, handleOnDel } from "../functions/dbUtil";


export const HomePage = ( {navigation, route} ) => {

    const user = firebase.auth().currentUser;
    const [ userHoldings, setuserHoldings ] = useState([]);
    const [ portValues, setportValues ] = useState({});

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
        
                // if (pdata.length > 1){
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
    
                // }
                
                console.log(`pdata`,pdata);
                handleCPriceUpdate(pdata, (fdata, portObj) => {
                    setportValues(portObj);
                    setuserHoldings(fdata);
                });

            }

            else {
                setuserHoldings([]); //Getting called too fast, listener needs to be off when deletion in progress? Callback to turn on?
                // or read db holdings and populate again after deletion
                console.log("DB EMPTY"); 
            }
        })
    

        console.log(`End of DB `,userHoldings);
        



        return () => {
            
            holdingsRef.off();
        }
  
    },[])

    useEffect(() => {
        setshowDelete(deleteState(userHoldings));
    })

    const onFlagPress = (item) => {
        const itemRef = userHoldings.indexOf(item);
        console.log(itemRef);
        seteditMode(true);
        console.log("do stock click")
        if (typeof item.flagRemove == 'undefined') {
            setuserHoldings(userHoldings.map((el) => {
                if (item.symid == el.symid) {
                    return ({
                        ...el,
                        flagRemove: true //never use . to assign 
                    })
                    
                }
                return el;
            }))
        }
        else {
            setuserHoldings(userHoldings.map((el) => {
                if (item.symid == el.symid) {
                    return ({
                        ...el,
                        flagRemove: !item.flagRemove //never use . to assign 
                    })
                }
                return el;  
            }))
            

        }
    
    }

    console.log(`bottom`,userHoldings);

    return (
        <SafeAreaView style={styles.container} edges={["top","right", "left"]}>
            <StatusBar
                barStyle={"light-content"}
            />
            {editMode && userHoldings.length
                ? <View style ={{...styles.header, height: 70, margin: 0}}>
                        <Text
                            style={{                                
                                ...styles.biglabels,
                                fontSize: 40,
                                fontWeight: "400",
                                alignSelf: "center",
                                paddingLeft: 10
                            }}>
                                delete
                        </Text>
                        
                            {showDelete
                                ? 
                                <TouchableOpacity style={{flex: 1, justifyContent: "center"}}>
                                    <Icon
                                        name="delete"
                                        color="white"
                                        //   containerStyle={{justifyContent: "space-between"}}
                                        iconStyle={{
                                            ...styles.biglabels,
                                            fontSize: 30,
                                            fontWeight: "400",
                                            alignSelf: "flex-end"
                                        }}
                                        onPress={() => {
                                            handleOnDel(userHoldings, () => {
                                                seteditMode(false);
                                            });
                                        }}
                                    />
                                    </TouchableOpacity>
                                : null
                            }
                        
                        <TouchableOpacity style={{justifyContent: "center"}} >
                            <Icon
                                name="done"
                                color="white"
                                iconStyle={{
                                    ...styles.biglabels,
                                    fontSize: 30,
                                    fontWeight: "400",
                                    paddingRight: 10
                                }}
                                onPress={() => {
                                    handleDoneEdit(userHoldings, (out) => {
                                        console.log(userHoldings);
                                        setuserHoldings(out);
                                        seteditMode(false);
                                        setshowDelete(false);
                                    })
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                : (<View style={{...styles.header, height: 70, margin: 0}}>
                        <Text
                            style={{
                                ...styles.biglabels,
                                fontSize: 40,
                                fontWeight: "400",
                                alignSelf: "center",
                                paddingLeft: 10
                            }}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                                holdings
                        </Text>
                        {userHoldings.length 
                            ?  <TouchableOpacity
                                    style={{justifyContent: "center"}}
                                >
                                  <Icon 
                                    name="edit"
                                    size={30}
                                    color="white"
                                    iconStyle={{
                                        ...styles.biglabels,
                                        fontSize: 30,
                                        fontWeight: "400",
                                        paddingRight: 10
                                    }}
                                    onPress={() => seteditMode(true)}
                                  />
                              </TouchableOpacity>
                            : null
                        }
                
                  </View>
                )
            }
            <View style={{flex: 1, backgroundColor: "white"}}>
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
                        onRefresh={() => handleCPriceUpdate(userHoldings, (fdata, portObj) => {
                            setportValues(portObj);
                            setuserHoldings(fdata);
                        })}
                        extraData={[userHoldings]} //if not in condtional, this is needed cause state changed setuserHoldings
                        refreshing={pullRefresh}
                        renderItem={({item}) => {
                            console.log("refresh")
                            return (
                            <ListItem 
                                bottomDivider
                                containerStyle={{backgroundColor: "white"}}
                                underlayColor= "white"
                                onPress={()=> {
                                        if(editMode) {
                                            onFlagPress(item);
                                        }
                                        else {

                                            console.log(portValues[indexOf(item)])
                                            navigation.navigate("Details",{
                                                symId: item.symid,
                                                desc: item.name,
                                                acb: item.acb,
                                                qty: item.qty,
                                                dayReturn: item.dayReturn,
                                                currVal: item.currVal,
                                                totalReturn: item.totalReturn,
                                                pcttotReturn: item.pcttotReturn,
                                                pctOfHolding: item.pctOfHoldings
                                                // pcthold: item.
                                            }); //since lazy render, search navigator never gets rendered. have to render it first
                                        }
                                }}
                                onLongPress={() => onFlagPress(item)}
                            >
                                {editMode 
                                    ? <ListItem.CheckBox 
                                            uncheckedIcon={"check-box-outline-blank"}
                                            checkedIcon={"check-box"}
                                            checkedColor={"#6e8eff"}
                                            iconType={"Material"}
                                            checked={item.flagRemove}
                                            onIconPress={() => onFlagPress(item)}
                                    /> 
                                    : null
                                }
                                <ListItem.Content style={{flex:1}}>
                                    <ListItem.Title
                                        style={{fontSize: 18, fontWeight: "300"}}
                                    >
                                        {item.name}
                                    </ListItem.Title>
                                    <ListItem.Subtitle
                                        style={{fontSize: 14, fontWeight: "500", color: "#949494"}}
                                    >
                                        {item.symid}
                                    </ListItem.Subtitle>

                                </ListItem.Content>
                                <ListItem.Content style={{flex:1}}>

                                <View style={{justifyContent: "center", alignSelf: "flex-end"}}>
                                    <Text>{item.c}</Text>       
                                        <Text
                                            style={{color: (item.color), textAlign: "right"}}
                                        >
                                            {item.diffSincePC}
                                        </Text>
                                        
                                        <Text
                                            style={{color: item.color, textAlign: "right"}}
                                        >
                                            {item.percentDiff}
                                    </Text>
                                </View>
                                </ListItem.Content>
                                {/* {!editMode ? <ListItem.Chevron/> : false} */}
                            </ListItem> 
                            )      
                        }}
                    />
                }

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
                <Text style={{
                    alignSelf: "center"
                    }}
                >
                    Welcome {user.email}
                </Text>
            </View>    
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#547aff"
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        margin: 10
    },
    holdings: {
        flex: 1,
        flexDirection: "column"
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
    
    }
})


//Sign out
