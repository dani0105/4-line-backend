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
        var gameRoom = new NLineRoom(data.boardSize, 4, data.playerInfo, client, code, true, deleteGameRoom, data.bot, data.nivel,data.roomId,socket);
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
            if(data.roomId){
                if(room.roomId == data.roomId){
                    room.player2 = {
                        info:data.playerInfo,
                        socket:client
                    }
                    client.emit('searchedGame',{searching:false,});
                    room.start();
                    return;
                }
                else
                    continue;
            }
            if(!room.privateRoom && data.boardSize == room.board.length && room.roomId == null){
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
        var code = Math.random().toString(36).substring(7).concat(cont);
        var gameRoom = new NLineRoom(data.boardSize,4, data.playerInfo, client,code,false,deleteGameRoom,false,0,data.roomId,socket);
        gameRooms.push(gameRoom);
        client.emit('searchedGame', {searching:true});
    });
}

var rooms = [];

exports.joinRoom = (socket,client) => {
    client.on("joinRoom", (data)=>{
        console.log("El usuario",data.user.username," con id ",data.user.id)
        var room = null;
        data.user.socket = client;
        for(let i = 0; i < rooms.length; i++){
            if(rooms[i].idRoom == data.idRoom){
                var exist = false;
                room = rooms[i];
                for(let i = 0; i < room.user.length; i++){
                    if(room.user[i].id == data.user.id){
                        exist = true;
                        break
                    }
                }

                if(!exist)
                    room.user.push(data.user);
                break
            }
        }
        if(!room){
            room = {idRoom:data.idRoom,user:[{id:3,username:'Test User',picture:'',isPlaying:true,code:'as'},data.user]};
            rooms.push(room);
        }

        client.join(data.idRoom);

        //le envio al conectado los que estan en la sala conectados;
        var users = [];
        for(let i = 0; i < room.user.length; i ++){
            const user = room.user[i]
            users.push({
                id:user.id,
                username:user.username,
                picture:user.picture,
                code:user.code,
                isPlaying:user.isPlaying
            })
        }
        client.emit('roomInfo',users);

        //enviar la informacion del conectado a todos
        socket.in(data.idRoom).emit('userConnected',{
            username: data.user.username,
            id: data.user.id,
            picture: data.user.picture,
            code:data.user.code,
            isPlaying:data.user.isPlaying
        });

        client.on('disconnect',() => {
            console.log("User Disconected")
            client.leave(data.idRoom);
            socket.in(data.idRoom).emit('userDisconnected',{
                id:data.user.id,
                username:data.user.username,
                picture: data.user.picture
            });
        });
    });
}

exports.viewGame = (socket,client) => {
    client.on("viewGame", (data) => {
        for(let i = 0; i < gameRooms.length; i++){
            if(gameRooms[i].code == data.code && gameRooms[i].roomId == data.roomId){
                gameRooms[i].addViewer(client);
                return;
            }
        }
    });
}


exports.exitRoom = (socket,client) => {
    client.on("exitRoom", (data) => {
        for(let i = 0;i<rooms.length; i++){
            if(rooms[i].idRoom == data.idRoom){
                const room = rooms[i];
                for(let x = 0; x < room.user.length; x++){
                    if(room.user[x].id == data.id){
                        room.user.splice(x,i);
                        client.leave(data.idRoom);
                        socket.in(data.idRoom).emit('userDisconnected',{
                            id:data.id
                        });
                        return;
                    }
                }
            }
        }
    });
}

exports.playWithUser = (socket,client) => {
    client.on("playWithUser", (data)=>{
        for(let i = 0 ; i < rooms.length; i++){
            if(rooms[i].idRoom == data.idRoom){
                
                const room = rooms[i];

                for(let x = 0; x < room.user.length; x++){
                    if(room.user[x].id == data.player2.id){
                        //room.user[x].socket.emit('gameNotification',data.player2);
                        socket.emit('gameNotification',data.player2);
                        client.on('notificationResponse',(response) => {
                            if(response){
                                cont++;
                                var code = Math.random().toString(36).substring(7).concat(cont);
                            
                                const player1 = {
                                    info:{
                                        id:data.player1.username,
                                        picture:data.player1.picture,
                                        username:data.player1.username
                                    }
                                }

                                var gameRoom = new NLineRoom(6, 4, player1, client, code, true, deleteGameRoom, false, 0,data.idRoom,socket);
                                gameRoom.player2 = {
                                    info:data.player2,
                                    socket:client
                                };
                                gameRooms.push(gameRoom);
                                gameRoom.start();
                                
                            }
                            client.emit('gameNotificationAnswer',response);
                        })
                    }
                }
            }
        }
    });
}

exports.updateUserState = (socket,idRoom,idUser,state, code) => {
    for(let i = 0; i < rooms.length; i++){
        if(rooms[i].idRoom == idRoom){
            const room = rooms[i];
            for(let x = 0; x < room.user.length; x++){
                if(room.user[x].id == idUser){
                    room.user[x].isPlaying = state;

                    socket.in(idRoom).emit('userStateChange',{
                        id:room.user[x].id,
                        username:room.user[x].username,
                        picture:room.user[x].picture,
                        isPlaying:room.user[x].isPlaying,
                        code:code
                    });
                    break;
                }
            }
            break;
        }
    }
}



module.exports