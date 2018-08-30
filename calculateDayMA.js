var mongoose = require( 'mongoose' );
const SMA = require( 'technicalindicators' ).SMA;
mongoose.connect( 'mongodb://localhost/TickData' ); // connect to database

var Counter = require( './model/counter' );
var DailyChart = require( './model/dailyChart' );
var VolumeAverage = require( './model/volumeAverage' );

const _cliProgress = require('cli-progress');
var bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

Counter.find( {} ).select( 'code -_id' ).exec( function ( err, counter ) {
    if ( err ) throw err;
    bar1.start(counter.length - 1);
    getTickData( counter, 0 );
} );

function getTickData( counter, counterIndex ) {
    var code = counter[ counterIndex ].code;
    DailyChart.find( { code: code } ).select( 'time volume bVolume sVolume -_id' ).exec( function ( err, data ) {
        var result = [];
        var volumeArray = [];
        var bVolumeArray = [];
        var sVolumeArray = [];
        data.forEach( function ( i ) {
            volumeArray.push( i[ 'volume' ] );
            bVolumeArray.push( i[ 'bVolume' ] );
            sVolumeArray.push( i[ 'sVolume' ] );
        } );
        var volSMA20 = SMA.calculate( { period: 20, values: volumeArray } );
        var bvolSMA20 = SMA.calculate( { period: 20, values: bVolumeArray } );
        var svolSMA20 = SMA.calculate( { period: 20, values: sVolumeArray } );
        var volSMA5 = SMA.calculate( { period: 5, values: volumeArray } );
        var bvolSMA5 = SMA.calculate( { period: 5, values: bVolumeArray } );
        var svolSMA5 = SMA.calculate( { period: 5, values: sVolumeArray } );
        for ( var i = 0; i < data.length; i++ ) {
            result.push( new VolumeAverage( {
                code: code,
                time: data[ i ].time,
                vSMA20: i >= 19 ? volSMA20[ i - 19 ] : data[ i ].volume,
                bVSMA20: i >= 19 ? bvolSMA20[ i - 19 ] : data[ i ].bVolume,
                sVSMA20: i >= 19 ? svolSMA20[ i - 19 ] : data[ i ].sVolume,
                vSMA5: i >= 4 ? volSMA5[ i - 4 ] : data[ i ].volume,
                bVSMA5: i >= 4 ? bvolSMA5[ i - 4 ] : data[ i ].bVolume,
                sVMA5: i >= 4 ? svolSMA5[ i - 4 ] : data[ i ].sVolume
            } ) );
            if ( i === data.length - 1 ) {
                VolumeAverage.collection.insert(result, function ( err, docs ) {
                    if (err) throw err;
                    bar1.update(counterIndex);
                    if (counter.length > counterIndex + 1) {
                        getTickData(counter, counterIndex + 1)
                    }
                });
            }
        }

    } );
}
