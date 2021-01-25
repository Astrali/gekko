

var strat = {};
var config = require ('../core/util.js').getConfig();
var SMA = require('./indicators/SMA.js');

this.hist = []; //initialize history candle data array

var startTime

let adxResultPrev 		= -999999999;
let trixResultPrev 		= -999999999;
let pdTrixResultPrev 	= -999999999;
let cciResultPrev 		= -999999999;
var buyPrice = 0; //Price at which last buy was made.



let priceProtection = 'disabled'; //Options are 'enabled' or 'disabled'. Ensures that sell price is higher than buy price if enabled.
let previousAction = 'sell'; // set to "sell" if you want to buy

let adxOptIn 		= 14;
let trixOptIn 		= 18;
let pdTrixOptIn		= 18;
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

let VolumeData1,  VolumeData2,  VolumeData3,  VolumeData4,  VolumeData5,  VolumeData6,  VolumeData7,  VolumeData8,  VolumeData9, VolumeData10, VolumeData11,
    VolumeData12, VolumeData13, VolumeData14, VolumeData15, VolumeData16, VolumeData17, VolumeData18, VolumeData19, VolumeData20,
    VolumeData21, VolumeData22, VolumeData23, VolumeData24, VolumeData25, VolumeData26, VolumeData27, VolumeData28, VolumeData29, VolumeData30 = null;



let PumpDumpActive = false
let TrendDirection = 'long'
let previousCandle = undefined
let pdCandleCounter = 0
let pumpVolGain = 10
let pdTimeout = 200

let stopLossPercent = 2
let tradeLock = false
let tradeLockCounter = 0

// Prepare everything our strat needs
strat.init = function() {
console.log('init function');


priceProtection = this.settings.priceProtection;
previousAction 	= this.settings.previousAction;

adxOptIn 		= this.settings.adxOptIn;
trixOptIn 		= this.settings.trixOptIn;
pdTrixOptIn 	= this.settings.pdTrixOptIn;

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

stopLossPercent = this.settings.stopLossPercent;


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
this.addTulipIndicator('PDTRIX', 'trix', { optInTimePeriod: pdTrixOptIn }) ;//optInTimePeriod:(From 1 to 100000)
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

let adxResult 		= this.tulipIndicators.ADX.result.result;
let trixResult 		= this.tulipIndicators.TRIX.result.result;
let pdTrixResult	= this.tulipIndicators.PDTRIX.result.result;
let cciResult 		= this.tulipIndicators.CCI.result.result;
let BB 				= this.tulipIndicators.BB;
//let BBpd 		= this.tulipIndicators.BBpd;
  this.nsamples++;





// Store Volume Data to calculate Average volume on 20 Blocks

if(VolumeData29 != null ) {VolumeData30 = VolumeData29};
if(VolumeData28 != null ) {VolumeData29 = VolumeData28};
if(VolumeData27 != null ) {VolumeData28 = VolumeData27};
if(VolumeData26 != null ) {VolumeData27 = VolumeData26};
if(VolumeData25 != null ) {VolumeData26 = VolumeData25};
if(VolumeData24 != null ) {VolumeData25 = VolumeData24};
if(VolumeData23 != null ) {VolumeData24 = VolumeData23};
if(VolumeData22 != null ) {VolumeData23 = VolumeData22};
if(VolumeData21 != null ) {VolumeData22 = VolumeData21};
if(VolumeData20 != null ) {VolumeData21 = VolumeData20};
if(VolumeData19 != null ) {VolumeData20 = VolumeData19};
if(VolumeData18 != null ) {VolumeData19 = VolumeData18};
if(VolumeData17 != null ) {VolumeData18 = VolumeData17};
if(VolumeData16 != null ) {VolumeData17 = VolumeData16};
if(VolumeData15 != null ) {VolumeData16 = VolumeData15};
if(VolumeData14 != null ) {VolumeData15 = VolumeData14};
if(VolumeData13 != null ) {VolumeData14 = VolumeData13};
if(VolumeData12 != null ) {VolumeData13 = VolumeData12};
if(VolumeData11 != null ) {VolumeData12 = VolumeData11};
if(VolumeData10 != null ) {VolumeData11 = VolumeData10};
if(VolumeData9  != null ) {VolumeData10 = VolumeData9};
if(VolumeData8  != null ) {VolumeData9  = VolumeData8};
if(VolumeData7  != null ) {VolumeData8  = VolumeData7};
if(VolumeData6  != null ) {VolumeData7  = VolumeData6};
if(VolumeData5  != null ) {VolumeData6  = VolumeData5};
if(VolumeData4  != null ) {VolumeData5  = VolumeData4};
if(VolumeData3  != null ) {VolumeData4  = VolumeData3};
if(VolumeData2  != null ) {VolumeData3  = VolumeData2};
if(VolumeData1  != null ) {VolumeData2  = VolumeData1};

//Calculate the Average
if (VolumeData20 != null ) { //start to calculate when we already got 20 candles of data
AvgVolume = (VolumeData1  + VolumeData2  + VolumeData3  + VolumeData4  + VolumeData5  + VolumeData6  + VolumeData7
		   + VolumeData8  + VolumeData9  + VolumeData10 + VolumeData11 + VolumeData12 + VolumeData13 + VolumeData14
		   + VolumeData15 + VolumeData16 + VolumeData17 + VolumeData18 + VolumeData19 + VolumeData20
		   + VolumeData21 + VolumeData22 + VolumeData23 + VolumeData24 + VolumeData25 + VolumeData26 + VolumeData27
		   + VolumeData28 + VolumeData29 + VolumeData30   )/30;

}
else
	{AvgVolume = this.candle.volume}; // no 20 candles data yet - just use current volume to prevent errors.
	VolumeData1 = this.candle.volume; //after all calculations are made - store the current candle for next round

// Check for Volume increase - incoming pump or dump
if (VolumeData1 > AvgVolume * pumpVolGain && PumpDumpActive !== true && AvgVolume > 0 ) {
console.log('****************************************************************************************');
console.log('Whoop! Heavy Volume increase from: ' + AvgVolume + ' to: ' + VolumeData1 + ' at ' + this.candle.start.format());
console.log('****************************************************************************************');
PumpDumpActive = true;
};


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
this.previousCandle.open = null
};




//##################################################################
//##################### Stoploss Function###########################
//##################################################################
if (previousAction == 'buy' && this.candle.close < this.buyPrice / (1 + stopLossPercent / 100)) {
		this.advice('short'); //sell
		previousAction = 'sell';
console.log('################################################################################################################')
console.log('##                                  EMERGENCY EXIT! STOPLOSS TRIGGERED!                                       ##')
console.log('################################################################################################################')
console.log('sell ' + candle.start.format() + '     SELLING at ' + this.candle.close);
//PumpDumpActive == true
//TrendDirection = 'movingdown'
tradeLock = true
tradeLockCounter = 0
};

//##################################################################
//##################################################################
//##################################################################



if (tradeLock == true) { //wait some candles after emergency exit
tradeLockCounter = tradeLockCounter +1;

	if (tradeLockCounter == 20){
		tradeLock = false;
	};

};







//##################################################################
//##################### Processing P&D #############################
//##################################################################
if (PumpDumpActive == true) {
pdCandleCounter += 1; //count up so we can Cancel if nothing happens.

     if (TrendDirection = 'none' && pdTrixResult * 1000 < -25) { TrendDirection = 'movingdown'} //Check where it will be going to ..
else if (TrendDirection = 'none' && pdTrixResult * 1000 >  25) { TrendDirection = 'movingup'};

	 if (TrendDirection == 'movingdown' && pdTrixResult > pdTrixResultPrev) { TrendDirection = 'down';}  //Lets see when it stops going up and then sell
else if (TrendDirection == 'movingup'   && pdTrixResult < pdTrixResultPrev) { TrendDirection = 'up';  }; //Lets see when it stops going down and then buy 

if (pdCandleCounter == pdTimeout /*&& TrendDirection == 'none' || pdTimeout * 3*/) { //timeout if nothing happened yet - otherwise catch the wave!
	pdCandleCounter = 0;
	PumpDumpActive  = false;
	console.log('No Pump or Dump detected - going back to normal trading.')
};
};


if (PumpDumpActive == true && TrendDirection == 'up' || PumpDumpActive == true && TrendDirection == 'down' ) { // P&D detected lets buy/sell
//P&D Buy Check
if (previousAction !== 'buy' && zone !== 'none' && PumpDumpActive == true && TrendDirection == 'down' && tradeLock == false) {
//	console.log('Processing P&D Check to go long');
PumpDumpActive = false;
pdCandleCounter = 0;
pdStart = 0;
previousAction = 'buy';
TrendDirection == 'none'
this.advice('long'); //buy
console.log('buy ' + candle.start.format() + '     BUYING at ' + this.candle.close);
}
// BUY CHECK END

//P&D Sell Check
else if (previousAction !== 'sell' && zone !== 'none' && PumpDumpActive == true  && TrendDirection == 'up') {
//	console.log('Processing P&D Check to go short');
PumpDumpActive = false;
pdCandleCounter = 0;
pdStart = 0;
previousAction = 'sell';
TrendDirection == 'none'
this.advice('short'); //sell
console.log('sell ' + candle.start.format() + '     SELLING at ' + this.candle.close);
};
// Sell CHECK END

}
//##################################################################
//#################### P&D Process End #############################
//##################################################################



//##################################################################
//#########################regular buy check #######################
//##################################################################
if (previousAction !== 'buy' && zone !== 'none' && PumpDumpActive == false && tradeLock == false) {
// Checks to Buy
if (adxResult > buyAdxOver && buysellindex < 3) {
	timeToBuy +=1;
};
//------------------------------------------------------------------
if (cciResult < buyCciUnder && buysellindex < 3) {
	timeToBuy +=1;
};
//------------------------------------------------------------------
if (trixResult > trixResultPrev && buysellindex < 3 || trixResult < trixBuyTrigger && buysellindex < 3) {
	timeToBuy +=1;
};
if (zone == 'dumped') {
	timeToBuy +=1;	//very much dumped .. lets ignore 1 of our other facts! :D
}
//------------------------------------------------------------------
if (timeToBuy == 3) {//Insert here buy advice!
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
if (previousAction == 'buy' && zone !== 'none' && PumpDumpActive == false) {
if (adxResult > sellAdxOver && buysellindex > 2) {
	timeToSell +=1;
};
//------------------------------------------------------------------
if (cciResult > sellCciOver && buysellindex > 2) {
	timeToSell +=1;
};
//------------------------------------------------------------------
if (trixResult < trixResultPrev && buysellindex > 2) {
	timeToSell +=1;
};

if (zone == 'pumped') {
	timeToSell +=1;	//very much raised .. lets ignore 2 of our other facts! :D
}
//------------------------------------------------------------------
if (timeToSell == 3) {
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
pdTrixResultPrev = pdTrixResult;
cciResultPrev = cciResult;
this.previousCandle = candle;


}

//https://gekko.wizb.it/docs/internals/events.html#tradeCompleted-event

module.exports = strat;