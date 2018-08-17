var mongoose = require( 'mongoose' );
mongoose.connect( 'mongodb://localhost/TickData' ); // connect to database
var Counter = require( './model/counter' );
var Transaction = require( './model/transaction' );
var DailyChart = require( './model/dailyChart' );
var array = [];
Counter.find( {} ).select( 'code -_id' ).lean().exec( function ( err, counter ) {
    checkBar(counter, 0);
} );

function checkBar( counter, counterIndex ) {
    DailyChart.find({code:counter[counterIndex]['code']}).lean().exec(function ( err, dailyData ) {
        if (dailyData.length == 0){
            array.push(counter[counterIndex]['code']);
        }
        if (counter.length > counterIndex){
            checkBar(counter, counterIndex);
        } else {
            console.log(array);
            console.log('Done!');
        }
    })
}