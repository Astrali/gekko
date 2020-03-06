var strat = {};
var _ = require('lodash');
var config = require ('../core/util.js').getConfig();
var log = require('../core/log.js');
//var SMA = require('./indicators/SMA.js');
var RSI = require('./indicators/RSI.js');

var rsiLock = false;

var rsiOptIn= 21;
var rsiLockValue = 70;
var percentGain = 2.5;
var stopLoss = 0.5;
var buyPriceDropped = 2;
var consoleLog = true;
let firstRun = true

var method = {};



method.init = function() {

  this.name = 'Astrali-Swing';
  this.requiredHistory = this.tradingAdvisor.historySize;

rsiOptIn            = this.settings.rsiOptIn;
rsiLockValue        = this.settings.rsiLockValue;
percentGain         = this.settings.percentGain;
stopLoss            = this.settings.stopLoss;
buyPriceDropped     = this.settings.buyPriceDropped;
consoleLog          = this.settings.consoleLog;

this.addTulipIndicator('RSI', 'rsi', { optInTimePeriod: 14 }) ;//investopedia says 14 bars

console.log('Using Settings: ');
console.log('RSI opt in           : ' + rsiOptIn);
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


if (rsiLock == true) {
    if (rsi >= rsiLockValue) {
        rsiLock = false
    };
}
else
{
    if (typeof rsi === 'number' && rsiLock == false) { //check if RSI got calculated                                           
        if (firstRun == true && rsi <= 36 || firstRun == false && previousAction == 'sell' && rsi <= rsiOptIn) { //RSI below 20 = oversold - lets do first buy
        this.advice('long'); //buy
            if (consoleLog == true) {
            console.log('RSIbuy' + this.candle.start.format() + '         BUY at ' + this.candle.close + ' with an RSI of: ' + rsi);
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
        console.log('buy   ' + this.candle.start.format() + '         BUY at ' + this.candle.close + ' with an RSI of: ' + rsi);
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
        console.log('sell  ' + this.candle.start.format() + '        SOLD at ' + this.candle.close + ' with an RSI of: ' + rsi);
        };
  mySellPrice = this.candle.close;
  previousAction = 'sell'; //store last action
  rsiLock = true;
  }
};
//##################################################################
};

module.exports = method;
