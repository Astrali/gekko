

var strat = {};
var config = require ('../core/util.js').getConfig();
var SMA = require('./indicators/SMA.js');

var startTime

let adxResultPrev = -999999999;
let trixResultPrev = -999999999;
let cciResultPrev = -999999999;
var buyPrice = 0; //Price at which last buy was made.



let priceProtection = 'disabled'; //Options are 'enabled' or 'disabled'. Ensures that sell price is higher than buy price if enabled.
let previousAction = 'sell'; // set to "sell" if you want to buy

let adxOptIn 		= 14;
let trixOptIn 		= 18;
let cciOptIn 		= 20;

let bbOptInTime		= 20;
let bbOptInStdDevs	= 2;

//all of those need to happen for a buy
let buyAdxOver = 30;
let buyCciUnder = -100;
let trixBuyTrigger = -3;

//all of those need to happen for a sell
let sellAdxOver = 30;
let sellCciOver = 100;


let PumpDumpActive = false
let TrendDirection = 'long'
let previousCandle = undefined
let pdCandleCounter = 0
let pumpVolGain = 10
let pdTimeout = 200

let startUp = 1

// Prepare everything our strat needs
strat.init = function() {
console.log('init function');


priceProtection = this.settings.priceProtection;
previousAction 	= this.settings.previousAction;

adxOptIn 		= this.settings.adxOptIn;
trixOptIn 		= this.settings.trixOptIn;
cciOptIn 		= this.settings.cciOptIn;

bbOptInTime		= this.settings.bbOptInTime;
bbOptInStdDevs	= this.settings.bbOptInStdDevs;

buyAdxOver 		= this.settings.buyAdxOver;
buyCciUnder 	= this.settings.buyCciUnder;
trixBuyTrigger  = this.settings.trixBuyTrigger;

sellAdxOver = this.settings.sellAdxOver;
sellCciOver = this.settings.sellCciOver;

pumpVolGain = this.settings.pumpVolGain;
pdTimeout   = this.settings.pdTimeout;

this.requiredHistory = this.tradingAdvisor.historySize;

console.log('Using Settings: ');
console.log('Price protection : ' + priceProtection);
console.log('Previous action  : ' + previousAction);
console.log('Indicator Options');
console.log('ADX              : ' + adxOptIn);
console.log('TRIX             : ' + trixOptIn);
console.log('CCI              : ' + cciOptIn);
console.log('Bollinger Time   : '+ bbOptInTime);
console.log('Bollinger Std Dev: '+ bbOptInStdDevs);
console.log('Buy factors');
console.log('ADX over         : ' + buyAdxOver);
console.log('CCI under        : ' + buyCciUnder);
console.log('Trix under       : ' + trixBuyTrigger);
console.log('or Trix uptrending');
console.log('Sell factors');
console.log('ADX over         : ' + sellAdxOver);
console.log('CCI over         : ' + sellCciOver);
console.log('Pump Detection');
console.log('More than        : ' + pumpVolGain + ' times increased Volume');
console.log('Timeout after    : ' + pdTimeout + ' Candles');


  // your code!

this.name = 'Astrali Pump and Dump';
//################################################
// Info about the indicators here: 
//https://godoc.org/github.com/lroc/talib#Trix
//################################################
this.addTulipIndicator('ADX', 'adx', { optInTimePeriod: adxOptIn }) ;//investopedia says 14 bars is default optInTimePeriod:(From 2 to 100000)
this.addTulipIndicator('TRIX', 'trix', { optInTimePeriod: trixOptIn }) ;//optInTimePeriod:(From 1 to 100000)
this.addTulipIndicator('CCI', 'cci', { optInTimePeriod: cciOptIn }) ;//optInTimePeriod:(From 1 to 100000)
this.addTulipIndicator('BB', 'bbands', { optInTimePeriod: bbOptInTime, optInNbStdDevs : bbOptInStdDevs });

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

let adxResult 	= this.tulipIndicators.ADX.result.result;
let trixResult 	= this.tulipIndicators.TRIX.result.result;
let cciResult 	= this.tulipIndicators.CCI.result.result;
let BB 			= this.tulipIndicators.BB;
//let BBpd 		= this.tulipIndicators.BBpd;
  this.nsamples++;




let timeToBuy = 0
let timeToSell = 0


// price Zone detection
var price = candle.close;
var adjustedbuyprice = price * 1.01
var adjustedsellprice = price * 0.99
var zone = 'none';


  if (adjustedsellprice >= BB.result.bbandsUpper) zone = 'pumped';
  if (price >= BB.result.bbandsUpper) zone = 'top';
  if ((price < BB.result.bbandsUpper) && (price >= BB.result.bbandsMiddle)) zone = 'high';
  if ((price > BB.result.bbandsLower) && (price < BB.result.bbandsMiddle)) zone = 'low';
  if (price <= BB.result.bbandsLower) zone = 'bottom';
  if (adjustedbuyprice <= BB.result.bbandsLower) zone = 'dumped';
  

let buysellindex = 0

if      (zone === 'dumped') {buysellindex = 0;}
else if (zone === 'bottom') {buysellindex = 1;}
else if (zone === 'low')    {buysellindex = 2;}
else if (zone === 'high')   {buysellindex = 3;}
else if (zone === 'top')    {buysellindex = 4;}
else if (zone === 'pumped') {buysellindex = 5;};


if (adxResultPrev == -999999999) {
console.log('initial run no previous values');
this.previousCandle = candle;
console.log (this.previousCandle);
};


//console.log ( BB.result );

//console.log('candle close: ' + BB.result.bbandsMiddle + ' Buy trigger = ' + (BB.result.bbandsMiddle + (BB.result.bbandsMiddle/100*0.1)));


//##################################################################
//#########################regular buy check #######################
//##################################################################
if (previousAction !== 'buy' && zone !== 'none' && trixResultPrev < trixResult) {
// Checks to Buy
if (this.previousCandle.close < BB.result.bbandsMiddle - (BB.result.bbandsMiddle/100*0.3)) {
console.log('TIME TO BUY!!!!!');
console.log('candle close: ' + BB.result.bbandsMiddle + ' Buy trigger = ' + (BB.result.bbandsMiddle - (BB.result.bbandsMiddle/100*0.5)));
	timeToBuy +=1;
};

//------------------------------------------------------------------
if (timeToBuy == 1) {//Insert here buy advice!
console.log('buy  ' + candle.start.format() + '         BUY at ' + this.candle.close);
startTime = this.candle.start;
this.advice('long'); //buy
this.buyPrice = this.candle.close;
	console.log('the market is:  ', zone);
previousAction = 'buy';  
};
};
//##################################################################



//##################################################################
//####################### regular sell check #######################
//##################################################################
// Checks to Sell
if (previousAction == 'buy' && zone !== 'none' && trixResultPrev > trixResult) {
if (this.previousCandle.close > BB.result.bbandsMiddle + (BB.result.bbandsMiddle/100*0.3)) {
	timeToSell +=1;
	console.log('candle close: ' + BB.result.bbandsMiddle + ' Buy trigger = ' + (BB.result.bbandsMiddle + (BB.result.bbandsMiddle/100*0.5)));
};


//------------------------------------------------------------------
if (timeToSell == 1) {
// Sell if price protection is enabled with checking price before .. 
if(priceProtection == 'enabled'){
        	if(this.candle.close > this.buyPrice) {
console.log('sell ' + candle.start.format() + '     SELLING at ' + this.candle.close);
	console.log('the market is :  ', zone);
            	this.advice('short');  //sell
            	previousAction = 'sell';
        	};
};
// Sell if price protection is disabled without further checking .. 
if  (priceProtection == 'disabled'){
//		console.log('Price Protection disabled. Selling right off .. ');
console.log('sell ' + candle.start.format() + '     SELLING at ' + this.candle.close);
	console.log('the market is:  ', zone);
		this.advice('short');
		previousAction = 'sell';
	};
};
}
//##################################################################



adxResultPrev = adxResult;
trixResultPrev = trixResult;
cciResultPrev = cciResult;
this.previousCandle = candle;


}

//https://gekko.wizb.it/docs/internals/events.html#tradeCompleted-event

module.exports = strat;