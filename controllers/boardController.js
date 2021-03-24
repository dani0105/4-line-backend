const NLineRoom = require('../objects/index').NLineRoom;

var gameRooms   = [];
var cont        = 0;

/**
 *  se encarga de crear instnacias de juegos privadas
 * @param {*} socket socket del servidor 
 * @param {*} client socket del cliente
 */
exports.createGameRoom = (socket,client) => {
    client.on("createGameRoom", (data)=>{
        cont++;
        var code = Math.random().toString(36).substring(7).concat(cont);
        var gameRoom = new NLineRoom(data.boardSize, 4, data.playerInfo, client, code, true, deleteGameRoom, data.bot, data.nivel);
        gameRooms.push(gameRoom);
        client.emit('createdGameRoom', code);
        if(data.bot){
            gameRoom.start();
        }
    });
}

function deleteGameRoom (object) {
    let index = gameRooms.indexOf(object);
    gameRooms.splice(index,1);
}


/**
 *  Se encarga de conectar con una instancia de juego en epecifico
 * @param {*} socket socket del servidor 
 * @param {*} client socket del cliente
 */
exports.connectGameRoom = (socket,client) => {
    client.on("connectGameRoom", (data)=>{
        for( var i = 0; i < gameRooms.length; i++ ){
            var room = gameRooms[i];
            if(room.code == data.code){
                console.log(data.playerInfo)
                room.player2 = {
                    info:data.playerInfo,
                    socket:client
                }
                client.emit('connectedGameRoom',true);
                room.start();
                return;
            }
        }
        client.emit('connectedGameRoom',false)
    });
}

/**
 * Esta funcion se encarga de buscar una instancia de juego a la cual conectar. en caso de que no exista una 
 * se crea una instancia y espera la conexion de otro jugador. 
 * @param {*} socket socket del servidor 
 * @param {*} client socket del cliente
 */
exports.searchGame = (socket,client) => {
    client.on("searchGame", (data)=>{
        for( var i = 0; i < gameRooms.length; i++){
            var room = gameRooms[i];
            if(!room.privateRoom && data.boardSize == room.board.length){
                room.player2 = {
                    info:data.playerInfo,
                    socket:client
                }
                client.emit('searchedGame',{searching:false});
                room.start();
                return;
            }
        }
        cont++;
        var gameRoom = new NLineRoom(data.boardSize,4, data.playerInfo, client,'',false,deleteGameRoom);
        gameRooms.push(gameRoom);
        client.emit('searchedGame', {searching:true});
    });
}
module.exports