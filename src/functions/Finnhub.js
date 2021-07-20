import { isEmpty, toNumber } from "lodash";
import moment from "moment";
import { FINNHUB } from "../common/constants";
import { polygon_apiKey } from "../common/constants";

const moneyFormat = (num) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
    })
    .format(num);
}

export const sigDigFormat = (num) => {
    return new Intl.NumberFormat('en-US',{ 
        useGrouping: 'false',
        maximumSignificantDigits: '5'
    }).format(num);
}

const toShorten = (num) => {
    const mktCapformat = new Intl.NumberFormat('en-US', {
        notation: "compact",
        compactDisplay: "short"
    });
    return mktCapformat.format(num);
}

export const isMarketOpen = () => (

    fetch(`https://api.polygon.io/v1/marketstatus/now?&apiKey=${polygon_apiKey}`)
    .then(res => res.json())
    .then((res) => {
        return res;
    })
    .catch((e) => {
        console.log(`[POLYGON-isMarketOpen]: `,e);
    })
)

export const toPct = (num) => {

    const fmt = new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 2
        // signDisplay: "exceptZero"
    });
    return fmt.format(num);
}

export const finnCalc = (el, res, opt) => {
    var o = Object.assign({}, el);

    o.percentDiff = ((res.c - res.pc) / res.pc * 100).toFixed(2);
    


    //SIMPLE FORMATTING that messes up type
    
    if (opt == "format") {
        o.c = moneyFormat(res.c);
        o.acb = moneyFormat(res.acb);
        o.o = sigDigFormat(res.o);
        o.pc = sigDigFormat(res.pc);
        o.h =  sigDigFormat(res.h);
        o.l =  sigDigFormat(res.l);
        o.diffSincePC = moneyFormat(res.c - res.pc);
        
        if (!isEmpty(o.totalCost)) {
            o.currVal = moneyFormat(o.qty * res.c);
            o.dayReturn = moneyFormat((res.c - res.pc) * o.qty);
            o.totalReturn = moneyFormat((res.c * o.qty)- (o.totalCost));
            o.pcttotReturn = toPct(((res.c * o.qty) - (o.totalCost)) / o.totalCost);
            o.prevVal = moneyFormat(o.qty * res.pc);
            o.pctOfHoldings = toPct(el.currVal / res.pVal);
        };
        
        if (o.percentDiff > 0) {
            o.color = "green";
            o.diffSincePC = `+${o.diffSincePC}`;
            o.percentDiff = `+${o.percentDiff}%`;
        }
        else if (o.percentDiff < 0) {
            o.color = "#ff3333";
            o.percentDiff = `${o.percentDiff}%`
        }
        else {
            o.color = "grey"
        }
    }

    else if (opt == "no-format") {
        o.c = (res.c).toString();
        o.o = (res.o).toString();
        o.pc = (res.pc).toString();
        o.h =  (res.h).toString();
        o.l =  (res.l).toString();
        o.diffSincePC = (res.c - res.pc).toString();
        
        if (!isEmpty(o.totalCost)) {
            o.currVal = (o.qty * res.c).toString();
            o.dayReturn = ((res.c - res.pc) * o.qty).toString();
            o.totalReturn = ((res.c * o.qty)- (o.totalCost)).toString();
            o.prevVal = (o.qty * res.pc).toString();
        };

        if (o.percentDiff > 0)  o.color = "green"; 
        else if (o.percentDiff < 0) o.color = "red";
        else o.color = "grey";
    }



    //PORT CALC. ONLY IF VALUES ARE PASSED

   
    return o;
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
            //var o = Object.assign({}, el);

            return finnCalc(el, res, "no-format");

        })
        .catch((e) => {
            console.log(e);
        })
        
        //return o;
    )
    );
    Promise.all(promises).then((res) => { 
        console.log(`AFTER PROMISE ~~~~~~~~~~`,res)
        var pVal = 0;
        var pdayReturn = 0;
        var plastVal = 0; // previous close port value
        var ptotalReturn = 0;
        var pDeposit = 0;

        res.forEach((el) => {
            console.log(`IM AN IDIOT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,el.currVal,`~~~~~~~~`,el.totalCost);

            pVal = pVal + toNumber(el.currVal);
            pdayReturn = pdayReturn + toNumber(el.dayReturn);
            ptotalReturn = ptotalReturn + toNumber(el.totalReturn);
            plastVal = plastVal + toNumber(el.prevVal);
            pDeposit = pDeposit + toNumber(el.totalCost);
        
        });
        

        const portObj = {
            pVal: moneyFormat(pVal),
            pdayReturn: moneyFormat(pdayReturn),
            ptotalReturn: moneyFormat(ptotalReturn),
            plastVal: moneyFormat(plastVal),
            pDeposit: moneyFormat(pDeposit),
            pPCTdayReturn: toPct((pdayReturn / plastVal)),
            pPCTtotReturn: toPct((ptotalReturn / pDeposit))
        }


        console.log(`~~~~~~~~~~~~~~~~~~~PORTFOLIO OBJECT~~~~~~~~~~~~~~~~~~~~~`,portObj);

        const finalData = res.map((el) => {

            const out = {
                ...el,
                pVal: pVal
            }

            console.log(out)
            return finnCalc(el, out, "format");
        })
        console.log(`~~~~~~~~~~~~~~~~~~~~BEFORE CALLBACK~~~~~~~~~~~~~~~~~~~~~~~`, finalData)
        callback(finalData, portObj);
        
    },(e) => {
        console.log(`handleCPrice REJECTED: `,e);
    })


}

export const fetchDetails = (symId, callback) => {
    const quoteObj = {
        symid: symId
    };

    const promises = [
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symId}&token=${FINNHUB.apiKey}`)
        .then(res => res.json())
        .then((res) => {
            const formmatedObj = finnCalc(res, res, "format"); //res needs to be passed for t value update
            Object.assign(quoteObj, formmatedObj);

            // console.log(`quoteObj quote only`,quoteObj);

        })
        .catch((e) => {
            console.error(e);
        }),

        fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symId}&metric=all&token=${FINNHUB.apiKey}`)
        .then(res => res.json())
        .then((res) => {
            // console.log(`METRIC LOG ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`, res.metric)
            const resRef = res.metric;
            const objOut = {
                eps: (resRef.epsInclExtraItemsTTM.toFixed(2)),
                marketCap: toShorten(resRef.marketCapitalization * 1000000),
                "52wHigh": sigDigFormat(resRef["52WeekHigh"]),
                "52wLow": sigDigFormat(resRef["52WeekLow"]),
                ...(resRef.currentDividendYieldTTM/100 > 0 ? {divYield: toPct(resRef.currentDividendYieldTTM/100)} : {divYield: "n/a"}),
                ...(resRef.peInclExtraTTM ? {peRatio: resRef.peInclExtraTTM.toFixed(2)} : {peRatio: "n/a"}),
                avgVol: toShorten(resRef["10DayAverageTradingVolume"] * 1000000)
            }
            Object.assign(quoteObj, objOut);

            // console.log(`quoteObj with metrics`,quoteObj);

        })
        .catch((e) => {
            console.error(e);
        }),

        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symId}&token=${FINNHUB.apiKey}`)
        .then(res => res.json())
        .then((res) => {
            const compInfo = res;
            // console.log(compInfo);
            delete compInfo.marketCapitalization;
            compInfo.shareOutstanding = toShorten(res.shareOutstanding * 1000000);
            Object.assign(quoteObj, compInfo);

            // console.log(`quoteObj with company info`,quoteObj);

        })
        .catch((e) => {
            console.error(e);
        }),

        isMarketOpen().then((res) => 
        {
            const outObj = {
                isMktOpen: res.market
            }
            Object.assign(quoteObj, outObj)

            // console.log(`quoteObj MARKET OPEN `,quoteObj)
        })

    ]

    Promise.all(promises).then((res) => {
        callback((quoteObj));

    });
}

export const fetchNews = (callback) => {
    fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB.apiKey}`)
    .then(res => res.json())
    .then((res) => {
        // console.log(`Set news`,res);
        const out = res.map((el) => {
            return ({
                ...el,
                datetime: moment.unix(el.datetime).fromNow()
            })
        })
        Promise.resolve(out).then((res) => {callback(res)});

    })
}