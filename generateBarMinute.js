var mongoose = require( 'mongoose' );
var d3 = require("d3");

mongoose.connect( 'mongodb://localhost/TickData' ); // connect to database

var Counter = require( './model/counter' );
var Transaction = require( './model/transaction' );
var Minute1Chart = require('./model/minute1Chart');

Counter.find({}).select('code -_id').exec( function ( err, counter ) {
    if (err) throw err;
    getTickData(counter, 0);
} );

function getTickData(counter, counterIndex){
    console.log(counter[counterIndex]);
    Transaction.find({code: counter[counterIndex].code}, function ( err, tickData ) {
        if (err) throw err;
        if (tickData.length == 0) {
            counterIndex += 1;
            if (counterIndex < counter.length) {
                getTickData(counter, counterIndex);
            }
        } else {
            var array2 = tickData.splice(0, Math.ceil(tickData.length / 2));
            Minute1Chart.collection.insert(convertToOHLC(tickData), function ( err, docs ) {
                if (err) return err;

                Minute1Chart.collection.insert(convertToOHLC(array2), function ( err, docs ) {
                    if (err) return err;
                    counterIndex += 1;
                    if (counterIndex < counter.length) {
                        getTickData(counter, counterIndex);
                    }
                });
            });
        }
    })
}

function convertToOHLC(data) {
    var code = data[0].code;
    data.sort((a, b) => d3.ascending(a.time, b.time));
    var result = [];
    data.forEach(d => {
        d.date = new Date(d.time).toISOString().substring(0,10);
    });

    var allDates = [...new Set(data.map(d => d.date))];
    allDates.forEach(d => {
    var minuteCounter = 0;
    var hourCounter = 9;
    var halfTime = new Date(new Date(d).setHours(12,30));
    var halfTimeBegin = new Date(new Date(d).setHours(14,30));
    var fullTime = new Date(new Date(d).setHours(17,00));
    while ( new Date(new Date(d).setHours(hourCounter,minuteCounter)) < fullTime) {
        if (new Date(new Date(d).setHours(hourCounter,minuteCounter)) < halfTime ||
            new Date(new Date(d).setHours(hourCounter,minuteCounter)) >= halfTimeBegin) {
            var currentTime = new Date(new Date(d).setHours(hourCounter,minuteCounter));
            var nextMinute = new Date(new Date(d).setHours(hourCounter,minuteCounter));
            nextMinute.setMinutes(nextMinute.getMinutes() + 1);
            var tempObject = {};
            var filteredData = data.filter(e => e.time >= currentTime && e.time <= nextMinute);
            var filteredBData = data.filter(e => e.time >= currentTime && e.time <= nextMinute && e.mode === 'B');
            var filteredSData = data.filter(e => e.time >= currentTime && e.time <= nextMinute && e.mode === 'S');
            tempObject.code = code;
            tempObject.time = currentTime;
            tempObject.open = filteredData[0] ? filteredData[0].price : 0;
            tempObject.close = filteredData[filteredData.length - 1] ? filteredData[filteredData.length - 1].price : 0;
            tempObject.high = d3.max(filteredData, e => e.price) || 0;
            tempObject.low = d3.min(filteredData, e => e.price) || 0;
            tempObject.volume = d3.sum(filteredData, e => e.volume) || 0;
            tempObject.bVolume = d3.sum(filteredBData, e => e.volume) || 0;
            tempObject.sVolume = d3.sum(filteredSData, e => e.volume) || 0;
            console.log(tempObject);
            result.push(tempObject);
        }

        if (minuteCounter == 59) {
            hourCounter += 1;
            minuteCounter = 0;
        } else {
            minuteCounter += 1;
        }
    }

    });
    return result;
};
