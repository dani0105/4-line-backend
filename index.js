// Server basic
require('dotenv').config();
const express = require('express');
var app = express();
var server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors:true,
    origins:'*:*'
});


const fs = require('fs');

//Modules
const logger = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');

//Routes
const Route = require('./routers/index');

//controllers
const Controller = require('./controllers/index');
const { Socket } = require('dgram');

//midlewares
const Middlewares = require('./middlewares/index');

app.set('port', process.env.PORT);

try {
    fs.mkdirSync(path.resolve('./temp'));
    fs.mkdirSync(path.resolve('./storage'));
} catch (e) { }

//Configuration server
app.use(logger('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "x-requested-with, content-type,Authorization");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(express.static('public'));

app.use('/auth', Route.AuthRoute);
app.use('/player', Middlewares.verifyTokenHTTP(), Route.PlayerRoute);

io.use(Middlewares.verifyTokenSocket()).on("connection", (client) => {
    Controller.BoardController.createGameRoom(io, client);
    Controller.BoardController.connectGameRoom(io, client);
    Controller.BoardController.searchGame(io, client);
});

server.listen(process.env.PORT, function () {
    console.log(`Servidor escuchando en puerto ${process.env.PORT}`);
});

