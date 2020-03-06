

var strat = {};
var config = require ('../core/util.js').getConfig();
var SMA = require('./indicators/SMA.js');

var startTime
var signal

let bullFear = 0;
let bearFear = 0;
let lastBullFear = 0;
let lastBearFear = 0;

let adxOptIn 		= 14;
let trixOptIn 		= 18;
let cciOptIn 		= 20;

let firstrun 		= true; //we need this for the array
let timePeriods		= 12;	//candles for the Bull Bear Fear strategy
let revertAdvice	= false;
//let maxHistLength 	= 20; 	//maximum history length in our array
let maxHistLength 	= timePeriods;
var buyTriggers		= 5;	
var sellTriggers	= 5;	

var highestHigh 	= 0;
var lowestHigh		= 0;
var highestLow		= 0;
var lowestLow		= 0;

var timeToBuy 		= false;	
var timeToSell 		= false;

var buyState		= 0;
var sellState		= 0;

// Prepare everything our strat needs
strat.init = function() {
console.log('init function');
this.name = 'Astrali Bull and Bear Fear';

timePeriods		= this.settings.timePeriods;
maxHistLength = timePeriods;
revertAdvice	= this.settings.revertAdvice;
buyTriggers		= this.settings.buyTriggers;
sellTriggers	= this.settings.sellTriggers;


console.log('Starting BullBear Fear Strategy with settings:');
console.log('###############################################');
console.log('## Timeperiods: ' + timePeriods);
console.log('## revertAdvice: ' + revertAdvice);
console.log('## buyTriggers: ' + buyTriggers);
console.log('## sellTriggers: ' + sellTriggers);
console.log('###############################################');
}



strat.check = function(candle) {

//###################################################################################
//############################## Create a data Array ################################
//###################################################################################
if (firstrun == true) {
this.hist = []; //initialize history candle data array
firstrun = false;
};

this.hist.unshift(candle);   //unshift will add candle on top of array

if(this.hist.length > maxHistLength) { //more than 20 entrys ..
        this.hist.pop(); //pop will remove last entry
      }
//###################################################################################
//###################################################################################
//###################################################################################
// get data from this hist with:         this.hist[x].close





if (this.hist.length == maxHistLength) { //only execute our calculations when we got enough data!

//#######################################################################################################################
//############################################# Generate our Indicators #################################################
//#######################################################################################################################
highestHigh 	= 0;
lowestHigh		= 0;
highestLow		= 0;
lowestLow		= 0;

var i = 0;
do {
//############ find highest high #########
if (this.hist[i].high > highestHigh) {
highestHigh = this.hist[i].high;
};
//######### end find highest high ########

//############ find highest low #########
if (this.hist[i].low > highestLow) {
highestLow = this.hist[i].low;
};
//######### end find highest low ########

//############################################ find lowest high ################################################
if (this.hist[i].high < lowestHigh && i > 0) { //if less than lowestHigh use new data - if it's not first round
lowestHigh = this.hist[i].high;
}
else {
if (i == 0) { //on first round lets use the high data
	lowestHigh = this.hist[i].high;
}
};
//###################################### end of find lowest high ###############################################

//############################################ find lowest low ################################################
if (this.hist[i].low < lowestLow && i > 0) { //if less than lowestHigh use new data - if it's not first round
lowestLow = this.hist[i].low;
}
else {
if (i == 0) { //on first round lets use the high data
	lowestLow = this.hist[i].low;
}
};
//###################################### end of find lowest low ###############################################
  i++; //add var i +1
}
while (i < timePeriods);

//console.log('highestHigh: ' + highestHigh + " and lowestHigh: " + lowestHigh);
//console.log('highestLow : ' + highestLow + " and lowestLow : " + lowestLow);
//console.log('------------------------------------------------------------------------------------------');

//#######################################################################################################################
//#######################################################################################################################
//#######################################################################################################################


let bullFear = (highestHigh - lowestHigh) / 2 + lowestHigh;
let bearFear = (highestLow - lowestLow) / 2 + lowestLow;

//v3
//buyState		= 0;
//sellState		= 0;

if (this.hist[0].close > bullFear && this.hist[1].close < lastBullFear )  {
	if (revertAdvice == true){
	//this.advice('short'); //sell
	sellState++
	buyState = 0
	}
	else {
	//this.advice('long'); //buy
	buyState++
	sellState = 0
	}
}

if ( bearFear > this.hist[0].close && lastBearFear < this.hist[1].close ) {
	if (revertAdvice == true){
	//this.advice('long'); //buy
	buyState++
	sellState = 0
	}
	else {
	//this.advice('short'); //sell
	sellState++
	buyState = 0
	}
}

console.log('buyState: ' + buyState + ' sellState: ' + sellState)

if (buyState == buyTriggers) {
this.advice('long'); //buy
buyState = 0
};

if (sellState == sellTriggers) {
this.advice('short'); //sell
sellState = 0
};


lastBullFear = bullFear;
lastBearFear = bearFear;

}
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



module.exports = strat;
