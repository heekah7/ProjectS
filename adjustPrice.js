var mongoose = require( 'mongoose' );
mongoose.connect( 'mongodb://localhost/TickData' ); // connect to database
var Counter = require( './model/counter' );
var Minute1Chart = require( './model/minute1Chart' );
var stackCall = 0;
Counter.find( {} ).select( 'code -_id' ).exec( function ( err, counter ) {
    if ( err ) throw err;
    var counterArray = end ? counter.splice( start, end ) : counter.splice( start );
    getMinuteData( counterArray, 0 );
} );

function getMinuteData( counter, counterIndex ) {
    if (counter.length > counterIndex) {

        console.log(counterIndex + ' ' + counter[counterIndex].code);
        Minute1Chart.find( { code: counter[counterIndex].code }, function ( err, data ) {
            calcRealPrice( counter, counterIndex, data, 0 );
        } );
    }
}

function calcRealPrice( counter, counterIndex, data, dataIndex ) {
    if (dataIndex > 1 && ( data[dataIndex].open === 0 && data[dataIndex - 1].close !== 0 )) {
        stackCall = 0;
        data[dataIndex].open = data[dataIndex-1].close;
        data[dataIndex].close = data[dataIndex-1].close;
        data[dataIndex].low = data[dataIndex-1].close;
        data[dataIndex].high = data[dataIndex-1].close;
        data[dataIndex].save(function ( err ) {
            if (err) throw err;
            dataIndex += 1;
            if (dataIndex < data.length) {
                calcRealPrice(counter, counterIndex, data, dataIndex);
            } else {
                getMinuteData( counter, counterIndex + 1);
            }
        })
    } else {
        stackCall += 1;
        dataIndex += 1;
        var timeout = stackCall > 1000 ? 500 : 0;

        if (timeout > 0) {
            setTimeout(function (  ) {
                stackCall = 0;
                if (dataIndex < data.length) {
                    calcRealPrice(counter, counterIndex, data, dataIndex);
                } else {
                    getMinuteData( counter, counterIndex + 1);
                }
            }, timeout);
        } else {
            if (dataIndex < data.length) {
                calcRealPrice(counter, counterIndex, data, dataIndex);
            } else {
                getMinuteData( counter, counterIndex + 1);
            }
        }
    }

}
