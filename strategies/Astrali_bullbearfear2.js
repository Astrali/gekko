

var strat = {};
var config = require ('../core/util.js').getConfig();
var SMA = require('./indicators/SMA.js');

var startTime
var signal

let trixOptIn = 5;
let trixResult = 0;

let bullFear = 0;
let bearFear = 0;
let lastBullFear = 0;
let lastBearFear = 0;

let firstrun 		= true; //we need this for the array
let timePeriods		= 12;	//candles for the Bull Bear Fear strategy
let revertAdvice	= false;

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

var pumpVolGain 	= 30;
var pdTimeout 		= 30;
var pumphistory 	= 20;
var pdactive 		= false;
var avgVolume 		= 0;
var avgPrice		= 0;
var pdstart		= 0;
var pdDirection		= 'none';
var cooldown 		= 100000;
var justTraded 		= false;


// Prepare everything our strat needs
strat.init = function() {
console.log('init function');
this.name = 'Astrali Bull and Bear Fear';

timePeriods		= this.settings.timePeriods;
maxHistLength 		= timePeriods;
revertAdvice		= this.settings.revertAdvice;
buyTriggers		= this.settings.buyTriggers;
sellTriggers		= this.settings.sellTriggers;
pumpVolGain		= this.settings.pumpVolGain;
pdTimeout		= this.settings.pdTimeout;
pumphistory		= this.settings.pumphistory;

//maximum history length in our array after loading settings
if (timePeriods > pumphistory){
maxHistLength       = timePeriods;
}
else
{
maxHistLength       = pumphistory;
};
//initialise TRIX for Pump and Dump
this.addTulipIndicator('TRIX', 'trix', { optInTimePeriod: trixOptIn }) ;//optInTimePeriod:(From 1 to 100000);

console.log('Starting BullBear Fear Strategy with settings:');
console.log('###############################################');
console.log('## Timeperiods	: ' + timePeriods);
console.log('## revertAdvice	: ' + revertAdvice);
console.log('## buyTriggers	: ' + buyTriggers);
console.log('## sellTriggers	: ' + sellTriggers);
console.log('## pumpVolGain	: ' + pumpVolGain);
console.log('## pdTimeout	: ' + pdTimeout);
console.log('## pumphistory	: ' + pumphistory);
console.log('###############################################');
}



strat.check = function(candle) {
//update TRIX for Pump and Dump
let lasttrix = trixResult;
trixResult          = this.tulipIndicators.TRIX.result.result;
//lets add +1 to cooldown so pump and dump gets activated first time when we got enough candles!
cooldown++

//###################################################################################
//############################## Create a data Array ################################
//###################################################################################
if (firstrun == true) {
this.hist = []; //initialize history candle data array
firstrun = false;
console.log('Gathering ' + maxHistLength + ' candles Data before trading.');
};




if(this.hist.length < maxHistLength) { //still filling candles ..
var missing = maxHistLength - this.hist.length;
        console.log('another '+ (missing - 1) + ' candles left')
      };


this.hist.unshift(candle);   //unshift will add candle on top of array

if(this.hist.length > maxHistLength) { //more than 20 entrys ..
        this.hist.pop(); //pop will remove last entry
      };
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


//#######################################################################################################################
//#######################################################################################################################
//#######################################################################################################################
var i = 0;
var tempVolume = 0;
do {
tempVolume = tempVolume + this.hist[i].volume
i++; //add var i +1
}
while (i < pumphistory);
avgVolume = tempVolume / pumphistory;
//console.log('Average Volume: ' + avgVolume)
//#######################################################################################################################
//#######################################################################################################################
//#######################################################################################################################




if (this.hist[0].volume > (avgVolume * pumpVolGain) && pdactive == false && cooldown > (maxHistLength / 2) ){ //check if theres an incoming pump!
pdactive = true;
console.log('****************************************************************************************');
console.log('Whoop! Heavy Volume increase from: ' + avgVolume + ' to: ' + this.hist[0].volume + ' at ' + this.candle.start.format());
console.log('****************************************************************************************');
pdstart = 0;
};



//######################Calculate average price for P&D##############
if (pdactive == true){
var i = 0;
var tempPrice = 0;
do {
tempPrice = tempPrice + this.hist[i].vwp
i++; //add var i +1
}
while (i < pumphistory);
avgPrice = tempPrice / pumphistory;
};
//####################################################################



if (pdactive == true){
pdstart++
if (justTraded == false){
console.log('Average price previous: ' + avgPrice + ' now its: ' + this.hist[0].close + ' trix: ' + trixResult + ' lasttrix: ' + lasttrix);
};

if (avgPrice * 1.0099 < this.hist[0].close) {
//console.log('Price pumped!')
pdDirection = 'up';
}

else if (avgPrice * 0.991 > this.hist[0].close){
//console.log('Price down the drain!')
pdDirection = 'down';
};

if (pdstart +2 > pdTimeout && pdDirection == 'none' ){ //check for timeout
pdactive = false;
pdDirection = 'none';
console.log('no pump or dump - sorry!');
cooldown = 0;
}

//console.log(pdDirection);

//##############################################################################
//## This will unlock trading as soon as market recovers after a pump or dump
//##############################################################################
if (pdDirection != 'none' && justTraded == true){
//console.log(trixResult);
if (pdDirection == 'up' && trixResult < -0.1 && cooldown > pdTimeout){
console.log('uptrend unlocked at ' + trixResult)
pdDirection = 'none';
pdactive = false;
justTraded = false;
console.log('unlocked trading again ' + this.candle.start.format() )
}
else if (pdDirection == 'down' && trixResult > 0.1 && cooldown > pdTimeout){
console.log('downtrend unlocked at ' + trixResult)
pdDirection = 'none';
pdactive = false;
justTraded = false;
console.log('unlocked trading again ' + this.candle.start.format() )
};
}
//##############################################################################
//##############################################################################
else if (pdDirection == 'down' && trixResult > lasttrix ){ // when trix is not moving in the right direction anymore - BUY
console.log('buy initiated');
this.advice('long'); //buy
//pdactive = false;
//pdDirection = 'none';
justTraded = true;
cooldown = 0;
}
//##############################################################################
//##############################################################################
else if (pdDirection == 'up' && trixResult < lasttrix){ //when trix is not moving in the right direction anymore - SELL
console.log('sell initiated');
this.advice('short'); //sell

//pdactive = false;
//pdDirection = 'none';
justTraded = true;
cooldown = 0;
};
//##############################################################################
//##############################################################################
}


// console.log('cooldown: ' + cooldown + ' pdactive: ' + pdactive + ' pdDirection: ' + pdDirection);


let bullFear = (highestHigh - lowestHigh) / 2 + lowestHigh;
let bearFear = (highestLow - lowestLow) / 2 + lowestLow;


//v3
//console.log(pdactive);
if (pdactive == false ) { //only buy/sell if pd is not active anymore!
//console.log('calculating candle');
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

//console.log('buyState: ' + buyState + ' sellState: ' + sellState)

if (buyState == buyTriggers) {
this.advice('long'); //buy
buyState = 0
};

if (sellState == sellTriggers) {
this.advice('short'); //sell
sellState = 0
};

}//check of pdactive end



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
