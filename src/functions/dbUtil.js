import firebase from "@react-native-firebase/app";

export const handleDoneEdit = (hld, callback) => {
    hld.forEach((el) => {
        hld[hld.indexOf(el)].flagRemove = false;
    })
    return callback(false);
}

export const deleteState = (hld) => {
    function toRemove(stock) {
        return stock.flagRemove == true;
    }
    
    isStockFlagged = hld.find(toRemove);
    console.log(`STOCKFLAG ${isStockFlagged}`);
    if (isStockFlagged) return true;
    return false;
}

export const handleOnDel = (hld, callback) => {
    const user = firebase.auth().currentUser;
    const holdingsRef = firebase.database().ref("users/" + user.uid).child("holdings/");
    const queuedToDel = {}

    hld.forEach((el) => {
        const dbEntry = hld[hld.indexOf(el)];
        if (dbEntry.flagRemove) {
            const dbKey = dbEntry.symid;
            queuedToDel[dbKey] = null;
            console.log(dbKey);
            console.log(`del ${dbEntry.symid}`);
        }
    })

    console.log(queuedToDel);
    holdingsRef.update(queuedToDel, console.log("UPDATE COMPLETE"));
    callback();
}