// Let's create our own strategy
var strat = {};
var config = require ('../core/util.js').getConfig();
var SMA = require('./indicators/SMA.js');
//var BB = require('./indicators/BB-1525204262.js');
// BB-1525204262
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


// Prepare everything our strat needs
strat.init = function() {
	console.log('init function');

//Bollinger Band
//  this.name = 'BB';
//  this.nsamples = 0;
//  this.trend = {
//    zone: 'none',  // none, top, high, low, bottom
//    duration: 0,
//    persisted: false
//  };
// Bollinger end



//console.log(typeof priceProtection);
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
this.addTulipIndicator('BB', 'bbands', { optInTimePeriod: bbOptInTime, optInNbStdDevs : bbOptInStdDevs });

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

let adxResult 	= this.tulipIndicators.ADX.result.result;
let trixResult 	= this.tulipIndicators.TRIX.result.result;
let cciResult 	= this.tulipIndicators.CCI.result.result;
let BB 			= this.tulipIndicators.BB;
  this.nsamples++;

//console.log(BB);

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

if (zone === 'dumped') {
	buysellindex = 0;
}
else if (zone === 'bottom') {
buysellindex = 1;
}
else if (zone === 'low') {
buysellindex = 2;
}
else if (zone === 'high') {
buysellindex = 3;
}
else if (zone === 'top') {
buysellindex = 4;
}
else if (zone === 'pumped') {
buysellindex = 5;
};
//console.log(BB.result.bbandsMiddle);
//	console.log('current zone:  ', zone);


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

if (previousAction !== 'buy' && zone !== 'none') {



// Checks to Buy
if (adxResult > buyAdxOver && buysellindex < 3) {
//	console.log('ADX high enough (more than 30)');
	timeToBuy +=1;
};
//------------------------------------------------------------------
if (cciResult < buyCciUnder && buysellindex < 3) {
//	console.log('cci low enough (less than -100)');
	timeToBuy +=1;
};
//------------------------------------------------------------------
if (trixResult > trixResultPrev && buysellindex < 3 || trixResult < trixBuyTrigger && buysellindex < 3) {
//	console.log('trix uptrending! Yeah :D');
	timeToBuy +=1;
};
if (zone == 'dumped') {
	timeToBuy +=2;	//very much dumped .. lets ignore 1 of our other facts! :D
}

//------------------------------------------------------------------
//console.log('buy index = ' + timeToBuy + ' points (3 points will buy)');
if (timeToBuy == 3) {//Insert here buy advice!
//console.log('#############################         BUY NOW BITCH!                        #############################');
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
// Checks to Sell
if (previousAction == 'buy' && zone !== 'none') {
if (adxResult > sellAdxOver && buysellindex > 2) {
//	console.log('ADX high enough (more than 30)');
	timeToSell +=1;
};
//------------------------------------------------------------------
if (cciResult > sellCciOver && buysellindex > 2) {
//	console.log('trix high enough (more than +100)');
	timeToSell +=1;
};
//------------------------------------------------------------------
if (trixResult < trixResultPrev && buysellindex > 2) {
//	console.log('trix downtrending! Yeah :D');
	timeToSell +=1;
};

if (zone == 'pumped') {
	timeToSell +=2;	//very much raised .. lets ignore 2 of our other facts! :D
}

//console.log('buy index = ' + timeToSell + ' points (3 points will sell)');
//------------------------------------------------------------------
if (timeToSell == 3) {//Insert here sell advice!
//console.log('#############################        SELL NOW BITCH!                        #############################');
// Sell if price protection is enabled with checking price before .. 
if(priceProtection == 'enabled'){
//        console.log('Price Protection Enabled. - only sell above ', this.buyPrice);
  //      console.log('Price Protection Enabled. - only sell above ' + this.buyPrice)        
        	if(this.candle.close > this.buyPrice) {
console.log('sell ' + candle.start.format() + '     SELLING at ' + this.candle.close);
	console.log('the market is :  ', zone);
//        		console.log('selling now for ' + this.candle.close)
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

// add the indicator to the strategy
  


//	console.log('highest', candle.high);
//	console.log('lowest', candle.low);



//When criteria is matching give an advice!

//this.advice('long') //buy
//this.advice('short') //sell



}


//https://gekko.wizb.it/docs/internals/events.html#tradeCompleted-event

module.exports = strat;