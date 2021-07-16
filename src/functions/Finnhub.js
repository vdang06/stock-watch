import { FINNHUB } from "../common/constants";

const moneyFormat = (number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
}


export const handleCPriceUpdate = (pdata, callback) => { // use map

    // var promises = [obj1, obj2].map(function(obj){
    //     return db.query('obj1.id').then(function(results){
    //        obj1.rows = results
    //        return obj1
    //     })
    //   })
    //   Promise.all(promises).then(function(results) {
    //       console.log(results)
    //   })
    var promises = pdata.map((el) => (

        fetch(`https://finnhub.io/api/v1/quote?symbol=${pdata[pdata.indexOf(el)].symid}&token=${FINNHUB.apiKey}`)
        .then(res => res.json())
        .then((res) => {
            var o = Object.assign({}, el);
            o.c = moneyFormat(res.c);
            o.pc = res.pc;
            o.diffSincePC = moneyFormat(res.c - res.pc);    
            o.percentDiff = ((res.c - res.pc) / res.pc * 100).toFixed(2);
            console.log(o.diffSincePC);
            if (o.percentDiff > 0) {
                o.color = "green";
                o.diffSincePC = `+${o.diffSincePC}`;
                o.percentDiff = `+${o.percentDiff}%`;
            }
            else if (o.percentDiff < 0) {
                o.color = "red"
                o.percentDiff = `${o.percentDiff}%`
            }
            else {o.color = "grey"}
           
            return o;
        })
        .catch((e) => {
            console.log(e);
        })
        
        //return o;
    )
    );
    Promise.all(promises).then((res) => { callback(res), console.log("i'm dumb")});
    
    
    
}