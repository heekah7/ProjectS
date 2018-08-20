var mongoose = require( 'mongoose' );
var d3 = require("d3");

mongoose.connect( 'mongodb://localhost/TickData' ); // connect to database

var Counter = require( './model/counter' );
var Transaction = require( './model/transaction' );
var Minute1Chart = require('./model/minute1Chart');

var start = process.argv[3];
var end = process.argv[4];

Counter.find({}).select('code -_id').exec( function ( err, counter ) {
    if (err) throw err;
    var counterArray = end ? counter.splice(start,end) : counter.splice(start);
    getTickData(counterArray, 0);
} );

function getTickData(counter, counterIndex){
    var code = counter[counterIndex].code;
    console.log(code);
    Transaction.find({code: code, time:{$lte:'2016-06-30'}}, function ( err, tickData ) {
        if (err) throw err;
        if (tickData.length > 0) {
            var minuteData = convertToOHLC(tickData);
            if (minuteData.length > 0 ){
                Minute1Chart.collection.insert(minuteData, function ( err, docs ) {
                    if (err) return err;
                    Transaction.find({code: code,time:{$gt:'2016-06-30'}}, function ( err, tickData ) {
                        var tickDataLength = tickData.length;
                        if (tickDataLength > 0) {
                            var data = convertToOHLC(tickData);
                            Minute1Chart.collection.insert(data, function ( err, docs ) {
                                counterIndex += 1;
                                if (counterIndex < counter.length) {
                                    getTickData(counter, counterIndex);
                                }
                            })
                        } else {
                            counterIndex += 1;
                            if (counterIndex < counter.length) {
                                getTickData(counter, counterIndex);
                            }

                        }
                    })
                });
            } else {
                counterIndex += 1;
                if (counterIndex < counter.length) {
                    getTickData(counter, counterIndex);
                }
            }
        } else {
            counterIndex += 1;
            if (counterIndex < counter.length) {
                getTickData(counter, counterIndex);
            }
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
            var filteredData = [];
            var filteredBData = [];
            var filteredSData = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].time >= currentTime && data[i].time <= nextMinute) {
                    filteredData.push(data[i]);
                    if (data[i].mode === 'B') {
                        filteredBData.push(data[i]);
                    } else if (data[i].mode === 'S') {
                        filteredSData.push(data[i]);
                    }
                } else {
                    break;
                }
            }
            var matchedLength = filteredData.length;
            data = data.splice(matchedLength);
            tempObject.code = code;
            tempObject.time = currentTime;
            tempObject.open = filteredData[0] ? filteredData[0].price : 0;
            tempObject.close = filteredData[filteredData.length - 1] ? filteredData[filteredData.length - 1].price : 0;
            tempObject.high = d3.max(filteredData, e => e.price) || 0;
            tempObject.low = d3.min(filteredData, e => e.price) || 0;
            tempObject.volume = d3.sum(filteredData, e => e.volume) || 0;
            tempObject.bVolume = d3.sum(filteredBData, e => e.volume) || 0;
            tempObject.sVolume = d3.sum(filteredSData, e => e.volume) || 0;
            result.push(tempObject);
        }

        minuteCounter += 3;

        if (minuteCounter == 60) {
            hourCounter += 1;
            minuteCounter = 0;
        }
    }

})
    return result;
};
