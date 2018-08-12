var fs = require( 'fs' );
var readline = require( 'readline' );
var stream = require( 'stream' );
var mongoose = require( 'mongoose' );

mongoose.connect( 'mongodb://localhost/TickData' ); // connect to database
var Counter = require( './model/counter' );
var Transaction = require( './model/transaction' );

var instream = fs.createReadStream( '/Users/hoi2/Desktop/data/data5.txt' );
var outstream = new stream;
var rl = readline.createInterface( instream, outstream );
var counterDetails = {};
var transactionDetails = [];
rl.on( 'line', function ( line ) {
    var processedString = line.split( '<\/d>' );
    for ( var i in processedString ) {
        if ( processedString[ i ].match( new RegExp( '<common>' ) ) ) {
            var transaction = transactionDetails;
            transactionDetails = [];
            var counterContent = processedString[ i ];
            counterDetails.code = counterContent.split( new RegExp( '<\/?no>' ) )[ 1 ];
            counterDetails.name = counterContent.split( new RegExp( '<\/?name>' ) )[ 1 ];
            counterDetails.lname = counterContent.split( new RegExp( '<\/?lname>' ) )[ 1 ];
            counterDetails.share = counterContent.split( new RegExp( '<\/?share>' ) )[ 1 ];
            counterDetails.syariah = counterContent.split( new RegExp( '<\/?syariah>' ) )[ 1 ];
            Transaction.collection.insert(transaction, function ( err, docs ) {
                if (err) return err;
            });

            Counter.create(counterDetails,function ( err, obj ) {
                console.log(obj);
            })
        } else {
            if ( processedString[ i ].length > 0 || processedString[ i ] == '') {
                var tmp = processedString[ i ].split( '<d>' )[ 1 ];
                tmp = tmp != undefined ? tmp.split( '@' ) : '';
                if (tmp != '') {
                    var transactionDetail = {};
                    transactionDetail.code = counterDetails.code;
                    transactionDetail.price = tmp[ 3 ];
                    transactionDetail.volume = tmp[ 4 ];
                    transactionDetail.time = new Date(tmp[5]);
                    transactionDetail.mode = tmp[ 8 ];
                    transactionDetails.push( transactionDetail );
                }
            }
        }
    }
} );

rl.on( 'close', function () {
    Transaction.collection.insert(transactionDetails, function ( err, docs ) {
        if (err) return
    });
    console.log('Import Finished');
} );
