// Server basic
const express   = require('express');
var app         = express();
var server      = require('http').Server(app);
const io        = require('socket.io')(server);
const fs        = require('fs');

//Modules
const logger    = require('morgan');
const path      = require('path'); 

//Configuration files
const config    = require('./config/envconfig');

//Routes
const Route     = require('./routers/index');



try{
    fs.mkdirSync(path.resolve('./temp'));
    fs.mkdirSync(path.resolve('./storage'));
}catch(e){}

//Configuration server
app.use(logger('dev'));
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({extended:true}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "x-requested-with, content-type,Authorization");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(express.static('public'));

app.use('/auth', Route.AuthRoute);

server .listen(config.server.port, function(){
    console.log(`Servidor escuchando en puerto ${config.server.port}`);
});

