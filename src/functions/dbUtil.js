import firebase from "@react-native-firebase/app";

export const handleDoneEdit = (hld, callback) => { //check this func, shouldnt work right now since userHoldings is read only
    
    const promises = hld.map((el) => {
        return ({
            ...el,
            flagRemove: false //never use . to assign 
        })
    })
    Promise.all(promises).then((res) => {
        console.log(`PROMISE RESOLVED`,res);
        callback(res);
    })
    
}

export const deleteState = (hld) => {
    function toRemove(stock) {
        return stock.flagRemove == true;
    }
    
    isStockFlagged = hld.find(toRemove);
    console.log(`STOCKFLAG`,isStockFlagged);
    if (isStockFlagged) return true;
    return false;
}

export const handleOnDel = (hld, callback) => {
    const user = firebase.auth().currentUser;
    const holdingsRef = firebase.database().ref("users/" + user.uid).child("holdings/");
    const queuedToDel = {}

    hld.forEach((el) => {
        if (el.flagRemove) {
            const dbKey = el.symid;
            queuedToDel[dbKey] = null;
            console.log(dbKey);
            console.log(`del ${el.symid}`);
        }
    })

    console.log(queuedToDel);
    holdingsRef.update(queuedToDel).then(() => {
        console.log("UPDATE COMPLETE")
        callback();
    }) //Make sure to verify before writing data to db
    
}