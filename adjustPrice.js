var mongoose = require( 'mongoose' );
mongoose.connect( 'mongodb://localhost/TickData' ); // connect to database
var Counter = require( './model/counter' );
var Minute1Chart = require( './model/minute1Chart' );
var start = process.argv[3];
var end = process.argv[4];
const _cliProgress = require('cli-progress');
var bar1;

Counter.find( {} ).select( 'code -_id' ).exec( function ( err, counter ) {
    if ( err ) throw err;
    var counterArray = end ? counter.splice( start, end ) : counter.splice( start );
    getMinuteData( counterArray, 0 );
} );

function getMinuteData( counter, counterIndex ) {
    if (counter.length > counterIndex) {
        Minute1Chart.find( { code: counter[counterIndex].code }, function ( err, data ) {
            if (data.length > 0) {
                console.log(counterIndex + ' ' + counter[counterIndex].code);
                bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
                bar1.start(data.length - 1, 0);
                var dataLength = data.length;
                for (var i = 0; i < dataLength; i++) {
                    bar1.update(i);
                    if ( i > 1 && ( data[ i ].open === 0 && data[ i - 1 ].close !== 0 ) ) {
                        data[i].open = data[i-1].close;
                        data[i].close = data[i-1].close;
                        data[i].low = data[i-1].close;
                        data[i].high = data[i-1].close;
                    }
                    if (i === data.length - 1){
                        Minute1Chart.remove({code: counter[counterIndex].code}, function ( err ) {
                            if (err) return err;
                            Minute1Chart.collection.insert(data, function ( err, docs ) {
                                getMinuteData(counter, counterIndex + 1);
                            });
                        });
                    }
                }
            } else {
                getMinuteData(counter, counterIndex + 1);
            }
        } );
    }
}