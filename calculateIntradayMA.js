var mongoose = require( 'mongoose' );
const SMA = require( 'technicalindicators' ).SMA;
mongoose.connect( 'mongodb://localhost/TickData' ); // connect to database

var Counter = require( './model/counter' );
var MVolumeAverage = require( './model/mvolumeAverage' );
var Minute1Chart = require('./model/minute1Chart');


const _cliProgress = require('cli-progress');
var bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

Counter.find( {} ).select( 'code -_id' ).exec( function ( err, counter ) {
    if ( err ) throw err;
    bar1.start(counter.length - 1);
    getTickData( counter, 0 );
} );

function getTickData( counter, counterIndex ) {
    var code = counter[ counterIndex ].code;
    Minute1Chart.find( { code: code } ).select( 'time volume bVolume sVolume -_id' ).exec( function ( err, data ) {
        var result = [];
        var volumeArray = [];
        var bVolumeArray = [];
        var sVolumeArray = [];
        data.forEach( function ( i ) {
            volumeArray.push( i[ 'volume' ] );
            bVolumeArray.push( i[ 'bVolume' ] );
            sVolumeArray.push( i[ 'sVolume' ] );
        } );
        var volSMA5 = SMA.calculate( { period: 1800, values: volumeArray } );
        var bvolSMA5 = SMA.calculate( { period: 1800, values: bVolumeArray } );
        var svolSMA5 = SMA.calculate( { period: 1800, values: sVolumeArray } );
        var volSMA = SMA.calculate( { period: 360, values: volumeArray } );
        var bvolSMA = SMA.calculate( { period: 360, values: bVolumeArray } );
        var svolSMA = SMA.calculate( { period: 360, values: sVolumeArray } );
        if (data.length > 0) {
            for ( var i = 0; i < data.length; i++ ) {
                result.push( new MVolumeAverage( {
                    code: code,
                    time: data[ i ].time,
                    vSMA5: i >= 19 ? volSMA5[ i - 1799 ] : data[ i ].volume,
                    bVSMA5: i >= 19 ? bvolSMA5[ i - 1799 ] : data[ i ].bVolume,
                    sVSMA5: i >= 19 ? svolSMA5[ i - 1799 ] : data[ i ].sVolume,
                    vSMA: i >= 4 ? volSMA[ i - 359 ] : data[ i ].volume,
                    bVSMA: i >= 4 ? bvolSMA[ i - 359 ] : data[ i ].bVolume,
                    sVMA: i >= 4 ? svolSMA[ i - 359 ] : data[ i ].sVolume
                } ) );
                if ( i === data.length - 1 ) {
                    MVolumeAverage.collection.insert(result, function ( err, docs ) {
                        if (err) throw err;
                        bar1.update(counterIndex);
                        if (counter.length > counterIndex + 1) {
                            getTickData(counter, counterIndex + 1)
                        }
                    });
                }
            }
        } else {
            bar1.update(counterIndex);
            if (counter.length > counterIndex + 1) {
                getTickData(counter, counterIndex + 1)
            }
        }

    } );
}
