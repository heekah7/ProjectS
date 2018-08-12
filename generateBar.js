var mongoose = require( 'mongoose' );
var d3 = require("d3");

mongoose.connect( 'mongodb://localhost/TickData' ); // connect to database

var Counter = require( './model/counter' );
var Transaction = require( './model/transaction' );

Counter.find({}).select('code -_id').exec( function ( err, counter ) {
    if (err) throw err;
    console.log('0');
    getTickData(counter, 0);
} );

function getTickData(counter, counterIndex){
    Transaction.find({code: counter[counterIndex].code}, function ( err, tickData ) {
        if (err) throw err;
    })
}

function convertToOHLC(data) {
    data.sort((a, b) => d3.ascending(a.time, b.time));
    var result = [];
    data.forEach(d => {
        d.date = new Date(d.time).toISOString().substring(0,10);
    });

    var allDates = [...new Set(data.map(d => d.date))];
    allDates.forEach(d => {
        var tempObject = {};
        var filteredData = data.filter(e => e.date === d);
        var filteredBData = data.filter(e => e.date === d && e.mode === 'B');
        var filteredSData = data.filter(e => e.date === d && e.mode === 'S');

        tempObject.time = d;
        tempObject.open = filteredData[0].price;
        tempObject.close = filteredData[filteredData.length - 1].price;
        tempObject.high = d3.max(filteredData, e => e.price);
        tempObject.low = d3.min(filteredData, e => e.price);
        tempObject.volume = d3.sum(filteredData, e => e.volume);
        tempObject.bVolume = d3.sum(filteredBData, e => e.volume);
        tempObject.sVolume = d3.sum(filteredSData, e => e.volume);
        result.push(tempObject);
    });
    return result;
};
