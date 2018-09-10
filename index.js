var mongoose = require( 'mongoose' );
var express = require( 'express' );
var cors = require( 'cors' );
var bodyParser = require('body-parser')
var app = express();
app.use( cors() );
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

mongoose.connect( 'mongodb://localhost/TickData' ); // connect to database

var Counter = require( './model/counter' );
var Transaction = require( './model/transaction' );
var DailyChart = require( './model/dailyChart' );
var MinChart = require( './model/minute1Chart' );


app.get( '/init', function ( req, res ) {
    Counter.find( {} ).select( 'code name lname -_id' ).exec( function ( err, counter ) {
        res.json( counter );
    } );
} );

app.post( '/historical/:code/:fDate/:eDate', function ( req, res ) {
    var stockCode = req.param( "code" );
    var from = req.param( 'fDate' );
    var end = req.param( 'eDate' );
    DailyChart.find({code: stockCode, time:{$gte: from ,$lte: end }}).lean().exec(function ( err, daily ) {
        res.json(daily);
    });
});

app.post( '/historicalTransaction/:code/:fDate', function ( req, res ) {
    var stockCode = req.param( "code" );
    var from = new Date(req.param( 'fDate' ));
    var end = new Date(from);
    end.setDate(end.getDate() + 1);
    Transaction.find({code: stockCode, time:{$gte: from ,$lte: end }}).lean().exec(function ( err, trans ) {
        res.json(trans);
    });
});

app.post( '/historicalMinChart/:code/:fDate', function ( req, res ) {
    var stockCode = req.param( "code" );
    var from = new Date(req.param( 'fDate' ));
    var end = new Date(from);
    end.setDate(end.getDate() + 1);
    MinChart.find({code: stockCode, time:{$gte: from ,$lte: end }}).lean().exec(function ( err, min ) {
        res.json(min);
    });
});

app.listen( 8080 );
