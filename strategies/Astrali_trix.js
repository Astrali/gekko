var strat = {};
var _ = require('lodash');
var config = require ('../core/util.js').getConfig();
var log = require('../core/log.js');
//var SMA = require('./indicators/SMA.js');
var RSI = require('./indicators/RSI.js');

var rsiLock = false;

var rsiOptIn= 21;
var trixOptIn= -2;
var rsiLockValue = 70;
var percentGain = 2.5;
var stopLoss = 0.5;
var buyPriceDropped = 2;
var consoleLog = true;
let firstRun = true

var method = {};

let mintrix = 0
let maxtrix = 0


method.init = function() {

  this.name = 'Astrali-TRIX';
  this.requiredHistory = this.tradingAdvisor.historySize;

rsiOptIn            = this.settings.rsiOptIn;
trixOptIn           = this.settings.trixOptIn;
rsiLockValue        = this.settings.rsiLockValue;
percentGain         = this.settings.percentGain;
stopLoss            = this.settings.stopLoss;
buyPriceDropped     = this.settings.buyPriceDropped;
consoleLog          = this.settings.consoleLog;

this.addTulipIndicator('RSI', 'rsi', { optInTimePeriod: 14 }) ;//investopedia says 14 bars
this.addTulipIndicator('TRIX', 'trix', { optInTimePeriod: 5 });


console.log('Using Settings: ');
console.log('RSI opt in           : ' + rsiOptIn);
console.log('TRIX opt in          : ' + trixOptIn);
console.log('RSI Locked until     : ' + rsiLockValue);
console.log('Sell after gain in % : ' + percentGain);
console.log('Stop loss in %       : ' + stopLoss);
console.log('Buy if price dropped : ' + buyPriceDropped + ' %');
console.log('Good luck!');
console.log('Best wishes by Astrali')

percentGain     = 1 +percentGain        /100; //make usable values from %
stopLoss        = 1 -stopLoss           /100; //make usable values from %
buyPriceDropped = 1 -buyPriceDropped    /100; //make usable values from %

},




method.check = function() {
    //runs after each trade
let rsi   = this.tulipIndicators.RSI.result.result;
let trix   = this.tulipIndicators.TRIX.result.result;


let logit = false


if (trix < mintrix) {
  mintrix = trix
  logit = true
  };
if (trix > maxtrix) {
  maxtrix = trix
  logit = true
};


if (logit == true) {
console.log('Current TRIX range from ' + mintrix + ' to ' + maxtrix);
logit = false;
};


if (rsiLock == true) {
    if (rsi >= rsiLockValue) {
        rsiLock = false
    };
}
else
{
    if (typeof trix === 'number' && rsiLock == false) { //check if TRIX got calculated                                           
        if (firstRun == true && rsi <= rsiOptIn || firstRun == false && previousAction == 'sell' && trix <= trixOptIn) { //trix below treshold = oversold - lets do first buy
        this.advice('long'); //buy
            if (consoleLog == true) {
            console.log('TRIXbuy' + this.candle.start.format() + '         BUY at ' + this.candle.close + ' with a TRIX of: ' + trix);
            };
        firstRun = false;
        previousAction = 'buy';
        myBuyPrice = this.candle.close; //maybe vwp?
        };
    };
};


//##################################################################
//#########################regular buy check #######################
//##################################################################
// Checks to Buy
if (firstRun == false && previousAction == 'sell' && rsiLock == false) {
//------------------------------------------------------------------
  if (this.candle.close < mySellPrice * buyPriceDropped) {//Insert here buy advice!
  this.advice('long'); //buy
        if (consoleLog == true) {
        console.log('buy   ' + this.candle.start.format() + '         BUY at ' + this.candle.close + ' with a TRIX of: ' + trix);
        };
  myBuyPrice = this.candle.close;
  previousAction = 'buy'; //store last action
  };
};
//##################################################################


//##################################################################
//####################### regular sell check #######################
//##################################################################
// Checks to Sell
if (firstRun == false && previousAction == 'buy') {
//------------------------------------------------------------------
  if (this.candle.close > myBuyPrice * percentGain || this.candle.close < myBuyPrice * stopLoss){
  this.advice('short'); //sell
        if (consoleLog == true) {
        console.log('sell  ' + this.candle.start.format() + '        SOLD at ' + this.candle.close + ' with a TRIX of: ' + trix);
        };
  mySellPrice = this.candle.close;
  previousAction = 'sell'; //store last action
  rsiLock = true;
  }
};
//##################################################################
};

module.exports = method;
