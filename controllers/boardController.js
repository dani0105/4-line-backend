const GameRoom = require('./GameRoom.js');

//este es un ejemplo de un punto de escucha
var colaArreglo = [];

var cont = 0;

// Este sería para crear una sala y jugar con amigos
exports.createGameRoom = (socket,client) => {
    client.on("createGameRoom", (data)=>{
        cont += 1;
        var code = Math.random().toString(36).substring(7).concat(cont);
        var gameRoom = new GameRoom(data.size, data.id, socket, code);
        colaArreglo.push(gameRoom);
        socket.sockets.emit('response', code);
    });
}

// Este sería para conectar con una sala 
exports.connectGameRoom = (socket,client) => {
    client.on("connectGameRoom", (data)=>{
        
    });
}

//este sería para buscar otro jugador con cual jugar 
exports.searchGame = (socket,client) => {
    client.on("searchGame", (data)=>{
        
    });
}

//Haría falta otro que se encargaría de tener el tablero virtual y mantener la conexion entre dos usuarios 
exports.playGame = (socket,client) => {
    client.on("playGame", (data)=>{
        
    });
}



module.exports