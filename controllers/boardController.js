
//este es un ejemplo de un punto de escucha
exports.hello = (socket,client) => {
    client.on("hello", (data)=>{
        console.log(data);
        socket.sockets.emit("bye", data);//de esta manera envia infomracion 
    })
}

// Este sería para crear una sala y jugar con amigos
exports.createGameRoom = (socket,client) => {
    client.on("createGameRoom", (data)=>{
        
    })
}

// Este sería para conectar con una sala 
exports.connectGameRoom = (socket,client) => {
    client.on("connectGameRoom", (data)=>{
        
    })
}

//este sería para buscar otro jugador con cual jugar 
exports.searchGame = (socket,client) => {
    client.on("searchGame", (data)=>{
        
    })
}

// Haría falta otro que se encargaría de tener el tablero virtual y mantener la conexion entre dos usuarios 



module.exports