// Let's create our own strategy
var strat = {};
var config = require ('../core/util.js').getConfig();
var startTime
let rsiResultPrev = -999999999;
let adxResultPrev = -999999999;
let trixResultPrev = -999999999;
let cciResultPrev = -999999999;
var buyPrice = 0; //Price at which last buy was made.



let priceProtection = 'disabled'; //Options are 'enabled' or 'disabled'. Ensures that sell price is higher than buy price if enabled.
let previousAction = 'sell'; // set to "sell" if you want to buy

let adxOptIn 		= 14;
let trixOptIn 		= 18;
let cciOptIn 		= 20;

//all of those need to happen for a buy
let buyAdxOver = 30;
let buyCciUnder = -100;

//all of those need to happen for a sell
let sellAdxOver = 30;
let sellCciOver = 100;


// Prepare everything our strat needs
strat.init = function() {
	console.log('init function');


//console.log(typeof priceProtection);
priceProtection = this.settings.priceProtection;
previousAction 	= this.settings.previousAction;

adxOptIn 		= this.settings.adxOptIn;
trixOptIn 		= this.settings.trixOptIn;
cciOptIn 		= this.settings.cciOptIn;

buyAdxOver 		= this.settings.buyAdxOver;
buyCciUnder 	= this.settings.buyCciUnder;

sellAdxOver = this.settings.sellAdxOver;
sellCciOver = this.settings.sellCciOver;

console.log('Using Settings: ');
console.log('Price protection : ' + priceProtection);
console.log('Previous action  : ' + previousAction);
console.log('Indicator Options');
console.log('ADX              : ' + adxOptIn);
console.log('TRIX             : ' + trixOptIn);
console.log('CCI              : ' + cciOptIn);
console.log('Buy factors');
console.log('ADX over         : ' + buyAdxOver);
console.log('CCI under       : ' + buyCciUnder);
console.log('Sell factors');
console.log('ADX over         : ' + sellAdxOver);
console.log('CCI over         : ' + sellCciOver);

  // your code!

//Added stuff from here
this.name = 'Astrali from Scratch';
//        this.settings.ADX = 3; // timeperiod
//        this.settings.ADX_high = 70;
//        this.settings.ADX_low = 50;

//                      Name  indicator
//this.addTulipIndicator('ema10', 'ema', {optInTimePeriod: 10}); //this shit works!
 



 //this.addTulipIndicator('ADX', 'adx', { optInTimePeriod: this.settings.ADX })
//        this.adx = { max: 0, min: 0 };
//################################################
// Info about the indicators here: 
//https://godoc.org/github.com/lroc/talib#Trix
//################################################
//this.addTulipIndicator('ADX', 'adx', { optInTimePeriod: 14 }) ;//investopedia says 14 bars is default optInTimePeriod:(From 2 to 100000)
//this.addTulipIndicator('TRIX', 'trix', { optInTimePeriod: 18 }) ;//optInTimePeriod:(From 1 to 100000)
//this.addTulipIndicator('CCI', 'cci', { optInTimePeriod: 20 }) ;//optInTimePeriod:(From 1 to 100000)

this.addTulipIndicator('ADX', 'adx', { optInTimePeriod: adxOptIn }) ;//investopedia says 14 bars is default optInTimePeriod:(From 2 to 100000)
this.addTulipIndicator('TRIX', 'trix', { optInTimePeriod: trixOptIn }) ;//optInTimePeriod:(From 1 to 100000)
this.addTulipIndicator('CCI', 'cci', { optInTimePeriod: cciOptIn }) ;//optInTimePeriod:(From 1 to 100000)

//until here :D

}



// Candle is an object containing this:
//{ start: moment("2019-07-12T14:48:00.000"),
//  open: 11637.87,
//  high: 11717.35,
//  low: 11614.44,
//  close: 11614.93,
//  vwp: 11666.288436597182,   //volume weighted price (average in this candle)
//  volume: 1881.8956550000007,
//  trades: 17189 }

strat.check = function(candle) {

let adxResult = this.tulipIndicators.ADX.result.result;
let trixResult = this.tulipIndicators.TRIX.result.result;
let cciResult = this.tulipIndicators.CCI.result.result;
let rsiResult = this.tulipIndicators.rsi.result.result;

let timeToBuy = 0
let timeToSell = 0


//console.log('-----------------------------------------------------');
//       -999999999

if (adxResultPrev == -999999999) {
console.log('initial run no previous values');
}
else {
//console.log(adxResultPrev + ' Previous ADX'); //Lets print ADX here to console!
//console.log(trixResultPrev + ' Previous TRIX'); //Lets print ADX here to console!
//console.log(cciResultPrev + ' Previous CCI'); //Lets print ADX here to console!
};
//console.log('Next Candle');
//console.log(adxResult + ' ADX'); //Lets print ADX here to console!
//console.log(trixResult + ' TRIX'); //Lets print ADX here to console!
//console.log(cciResult + ' CCI'); //Lets print ADX here to console!



//##################################################################

if (previousAction == 'buy') {
//do nothing
}
else {

// Checks to Buy
if (adxResult > buyAdxOver) {
//	console.log('ADX high enough (more than 30)');
	timeToBuy +=1;
};
//------------------------------------------------------------------
if (cciResult < buyCciUnder) {
//	console.log('trix low enough (less than -100)');
	timeToBuy +=1;
};
//------------------------------------------------------------------
if (trixResult > trixResultPrev) {
//	console.log('trix uptrending! Yeah :D');
	timeToBuy +=1;
};
if (rsiResult > rsiResultPrev) {
//	console.log('trix uptrending! Yeah :D');
	timeToBuy +=1;
};


//------------------------------------------------------------------
//console.log('buy index = ' + timeToBuy + ' points (3 points will buy)');
if (timeToBuy == 4) {//Insert here buy advice!
//console.log('#############################         BUY NOW BITCH!                        #############################');
console.log('buy  ' + candle.start.format() + '         BUY at ' + this.candle.close);
startTime = this.candle.start;



//this.advice('long'); //buy


this.advice({
  direction: 'long', // or short
  trigger: { // ignored when direction is not "long"
    type: 'trailingStop',
    trailPercentage: trailSellPercent //trailSellPercent is being read from config
    // or:
    // trailValue: 100
  }
});







this.buyPrice = this.candle.close;
//previousAction = 'buy';  
};
};
//##################################################################





//Removed - sell part - in clipboard






adxResultPrev = adxResult;
trixResultPrev = trixResult;
cciResultPrev = cciResult;
rsiResultPrev = rsiResult;

// add the indicator to the strategy
  


//	console.log('highest', candle.high);
//	console.log('lowest', candle.low);



//When criteria is matching give an advice!

//this.advice('long') //buy
//this.advice('short') //sell


  // your code!
}


//https://gekko.wizb.it/docs/internals/events.html#tradeCompleted-event

module.exports = strat;