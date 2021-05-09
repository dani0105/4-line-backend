const { REQUEST_HEADER_FIELDS_TOO_LARGE } = require('http-status-codes');

var pararTiempo = false;
var timer = 15;
module.exports = class NLineRoom{

    constructor(size, winSize, playerInfo, socketPlayer1, code, privateRoom, deleter, bots, nivels, roomId,socket){
        this.board = this.createBoard(size);
        this.code = code;
        this.socket = socket;
        this.winSize = winSize;
        this.player1 = {
            info: playerInfo,
            socket:socketPlayer1
        }
        this.roomId = roomId;
        this.player2 = {
            info:null,
            socket:null
        }
        this.player1Playing = true;
        this.privateRoom = privateRoom;
        this.active = true;
        this.viewers = [];
        this.deleter = deleter;
        this.botInfo = {
            bot: bots,
            nivel: nivels,
            id: -1
        }
    }

    disconnectionhandler (isPlayer1) {
        this.active = false;
        this.deleter(this);
        if(!this.botInfo.bot){
            const controller = require('../controllers').PlayerController;
            // se guarda en al base de datos
            controller.addGame({
                player1:this.player1.info.id,
                player2:this.player2.info.id,
                player_winner:isPlayer1?this.player2.info.id:this.player1.info.id
            })

            this.player1.socket.emit("finishGameRoom",{win:0, playerWinner:isPlayer1? this.player2.info.id: this.player1.info.id }); // 0 : desconectado
            this.player2.socket.emit("finishGameRoom",{win:0, playerWinner:isPlayer1? this.player2.info.id: this.player1.info.id }); // 0 : desconectado

            if(this.roomId){
                const boardController = require('../controllers/boardController');
                boardController.updateUserState(this.socket,this.roomId,this.player1.info.id,false,null);
                boardController.updateUserState(this.socket,this.roomId,this.player2.info.id,false,null);
            }
            // se envia la informacion de perdidad al jugador desconectado

            // se cierra la conexion
            this.killListeners(this.player1.socket);
            this.killListeners(this.player2.socket);   
        }else if(this.botInfo){  
            this.finishGame(1, this.botInfo.id);
            // se cierra la conexion
        }
    }

    moveHandler(data,sendTo){
        if(this.verifyMove(data.x,data.y)){
            //El movimiento es valido

            this.board[data.x][data.y].id = data.id;
            if(this.verifyWin(data.id)){
                //Gano el Jugador que movio
                this.finishGame(1,data.id);
                return;
            }
            if(!this.verifyBoard()){
                //tablero lleno
                this.finishGame(2,0);
                return;
            }
            // se envia la informacion al jugador
            if(!this.botInfo.bot || data.id == -1){
                console.log(data)
                sendTo.emit('responseBoard', data);
                this.viewers.forEach(element => element.emit('responseBoard',data))
            }
        }
    }

    finishGame(win,playerWinner){
        this.active = false;
        this.killListeners(this.player1.socket);
        this.deleter(this);
        if(this.botInfo.bot){
            this.player1.socket.emit("finishGameRoom",{ win:win, board:this.board, playerWinner: playerWinner });
            return;
        }
        this.killListeners(this.player2.socket);
        this.viewers.forEach(element => element.emit('finishGameRoom',{ win:win, board:this.board, playerWinner: playerWinner }));
        this.player1.socket.emit("finishGameRoom",{ win:win, board:this.board, playerWinner: playerWinner });
        this.player2.socket.emit("finishGameRoom",{ win:win, board:this.board, playerWinner: playerWinner });
        
        if(this.roomId){
            const boardController = require('../controllers/boardController');
            boardController.updateUserState(this.socket,this.roomId,this.player1.info.id,false,null);
            boardController.updateUserState(this.socket,this.roomId,this.player2.info.id,false,null);
        }
        
        // se guarda en al base de datos
        const controller = require('../controllers').PlayerController;
        controller.addGame({
            player1:this.player1.info.id,
            player2:this.player2.info.id,
            player_winner: playerWinner
        })
        
    }

    killListeners(socket){
        console.log("matando Listeners")
        socket.removeAllListeners('disconnect');
        socket.removeAllListeners('gameRoomInfo');
        socket.removeAllListeners('pauseGame');
        socket.removeAllListeners('leaveGame');
        socket.removeAllListeners('boardMove');
        socket.removeAllListeners('finishGameRoom');
    }

    addViewer(socket){
        this.viewers.push(socket);
        socket.emit('matchInfo',{
            player1:this.player1.info,
            player2:this.player2.info,
            board:this.board
        });
    }

    /**
     * Verifica si el tablero esa lleno
     * @returns 
     */
    verifyBoard(){
        for(let col = 0; col < this.board.length ; col ++){
            if(this.board[0][col].id == 0)
                return true;
        }
        return false;
    }

    verifyMove(x,y){
        return this.board[x][y].id == 0? true:false;
    }

    markGroup(initialX,initialY,substractionX,substractionY){
        for(let i = 0; i < this.winSize;i++){
            this.board[initialX][initialY].mark = true;
            initialX = initialX + substractionX;
            initialY = initialY + substractionY;
        }
    }

    verifyWin(id){
        for( let r = 0; r < this.board.length; r++){
            for( let c = 0; c < this.board.length; c++){

                if(this.board[r][c].id != id)
                    continue
                
                if(c+(this.winSize-1) < this.board.length){
                    if(this.verifyRight(r,c,id)){
                        this.markGroup(r,c,0,1);
                        return true;
                    }
                }
                if(r+(this.winSize-1) < this.board.length){
                    if(this.verifyBottom(r,c,id)){
                        this.markGroup(r,c,1,0);
                        return true;
                    }
                    if(c+(this.winSize-1) < this.board.length)
                        if(this.verifyBotomRight(r,c,id)){
                            this.markGroup(r,c,1,1);
                            return true;
                        }
                    if(c-(this.winSize-1) >= 0)
                        if(this.verifyBottomLeft(r,c,id)){
                            this.markGroup(r,c,1,-1);
                            return true;
                        }
                }
            }
        }
        return false;
    }

    verifyPreWinBot(id){
        for( let r = 0; r < this.board.length; r++){
            for( let c = 0; c < this.board.length; c++){

                if(this.board[r][c].id != id)
                    continue
                
                if(c+(this.winSize-1) < this.board.length){
                    if(this.verifyRightPCO(r,c,id)){
                        return {r,c,num:1};
                    }
                }
                if(r+(this.winSize-1) < this.board.length){
                    if(this.verifyBottomPCO(r,c,id)){
                        return {r,c,num:2};
                    }
                    if(c+(this.winSize-1) < this.board.length)
                        if(this.verifyBotomRightPCO(r,c,id)){
                            return {r,c,num:3};
                        }
                    if(c-(this.winSize-1) >= 0)
                        if(this.verifyBottomLeftPCO(r,c,id)){
                            return {r,c,num:4};
                        }
                }
            }
        }
        return false;
    }

    verifyBottomLeft(x,y,id){
        for(let i = this.winSize-1; i > 0; i--){
            if(this.board[x+i][y-i].id != id){
                return false;
            }
        }
        return true;
    }

    verifyBotomRight(x,y,id){
        for(let i = 0; i < this.winSize; i++){
            if(this.board[x+i][y+i].id != id){
                return false;
            }
        }
        return true;
    }

    verifyBottom(x,y,id){
        for(let i = 0; i < this.winSize; i++){
            if(this.board[x+i][y].id != id){
                return false;
            }
        }
        return true;
    }

    verifyRight(x,y,id){
        for(let i = 0; i < this.winSize; i++){
            if(this.board[x][y+i].id != id){
                return false;
            }
        }
        return true;
    }

    verifyBottomLeftPCO(x,y,id){    
        for(let i = this.winSize-1; i > 0; i--){
            if(this.board[x+i][y-i].id != id){
                return false;
            }
        }
        return true;
    }

    verifyBotomRightPCO(x,y,id){
        for(let i = 0; i < this.winSiz-1; i++){
            if(this.board[x+i][y+i].id != id){
                return false;
            }
        }
        return true;
    }
    
    verifyRightPCO(x,y,id){
        for(let i = 0; i < this.winSize-1; i++){
            if(this.board[x][y+i].id != id){
                return false;
            }
        }
        return true;
    }

    verifyBottomPCO(x,y,id){
        for(let i = 0; i < this.winSize-1; i++){
            if(this.board[x+i][y].id != id){
                return false;
            }
        }
        return true;
    }

    verifyUpPC(x,y,id){
        if(x-1 > -1){
            if(this.board[x-1][y].id != id){
                return false;
            }
        }
        return true;
    }

    verifyLeftPC(x,y,id){
        if(y-1 > -1){
            if(this.board[x][y-1].id != id){
                return false;
            }
        }
        return true;
    }

    verifyRightPC(x,y,id){
        if(y+1 < this.board.length-1){
            if(this.board[x][y+1].id != id){
                return false;
            }
        }
        return true;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    verifyId(id){
        for( let r = 0; r < this.board.length; r++){
            for( let c = 0; c < this.board.length; c++){
                if(this.board[r][c].id == id){
                    return true;
                }
            }
        }
        return false;
    }

    verifyIdCont(id, cont){
        for( let r = 0; r < this.board.length; r++){
            for( let c = 0; c < this.board.length; c++){
                if(this.board[r][c].id == id){
                    cont -= 1;
                    if(cont==0){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    botNivel2(dataUser){
        var ronda = false;
        while(!ronda){
            var y = this.getRandomInt(1, 4);
            if(!this.verifyRightPC(dataUser.x, dataUser.y, dataUser.id) && y == 1){
                this.moveHandler({x:this.returnXData(dataUser.y+1).x, y:dataUser.y+1, id:-1},this.player1.socket);   
                ronda = true; 
            }else if(!this.verifyLeftPC(dataUser.x, dataUser.y, dataUser.id) && y == 2){
                this.moveHandler({x:this.returnXData(dataUser.y-1).x, y:dataUser.y-1, id:-1},this.player1.socket);
                ronda = true;
            }else if(!this.verifyUpPC(dataUser.x, dataUser.y, dataUser.id) && y == 3){
                this.moveHandler({x:dataUser.x-1, y:dataUser.y, id:-1},this.player1.socket);
                ronda = true;
            }else{
                ronda = false;
            }
        }
    }

    returnXData(y){
        var cont = 0;
        while(true){
            var data = this.validarEspacio(y);
            if(data){
                return data;
            }
            cont += 1;
            if(cont ==  5){
                y -= 1;
            }
        }
    }

    validarEspacio(y){
        if(y<this.board.length){
            for(var i = this.board.length-1; i >= 0;i--){
                if(this.board[i][y].id == 0){
                    return this.board[i][y];
                }
            }  
        }
        return false;
    }

    botfunction(nivel, size, dataUser){
        if(nivel == 1){
            if(this.verifyBoard()){
                while(true){
                    var y = this.getRandomInt(0, size-1);
                    var data = this.validarEspacio(y);
                    if(data){
                        break;
                    }
                }
                this.moveHandler({x:data.x, y:data.y, id:-1},this.player1.socket);
            } else {
                this.player1.socket.emit("finishGameRoom",{win:2,playerWinner:0});
            }
        } else if(nivel == 2){
            if(this.verifyBoard()){
                this.botNivel2(dataUser);
            }else {
                this.player1.socket.emit("finishGameRoom",{win:2,playerWinner:0});
            }
        } else if(nivel == 3){  
            var ronda = false;
            while(!ronda){
                var y = this.getRandomInt(1, 4);
                if(this.verifyBoard()){
                    if(this.verifyId(-1)){                              
                        if(this.verifyIdCont(-1, 3)){
                            data = this.verifyPreWinBot(-1);
                            if(data == true && data.num == 1){
                                this.moveHandler({x:this.returnXData(data.c+1).x, y:data.c, id:-1},this.player1.socket); 
                                ronda = true;
                                break;
                            }else if(data == true && data.num == 2){
                                this.moveHandler({x:this.returnXData(data.c).x, y:data.c, id:-1},this.player1.socket); 
                                ronda = true;
                                break;
                            }else if(data == true && data.num == 3){
                                this.moveHandler({x:this.returnXData(data.c+1).x, y:data.c, id:-1},this.player1.socket); 
                                ronda = true;
                                break;
                            }else if(data == true && data.num == 4){
                                this.moveHandler({x:this.returnXData(data.c+1).x, y:data.c, id:-1},this.player1.socket); 
                                ronda = true;
                                break;
                            }else{
                                this.botNivel2(dataUser);
                                ronda = true;
                            }
                        }else{
                            this.botNivel2(dataUser);
                            ronda = true;
                        }
                    }else{
                        this.botNivel2(dataUser);
                        ronda = true;
                    }
                }else {
                    this.player1.socket.emit("finishGameRoom",{win:2,playerWinner:0});
                }
            }
        } 
    }

    startBot(){
        this.player1.socket.emit('gameRoomInfo',{board: this.board, isPlaying:this.player1Playing, player: this.player2.info});
        
        this.player1.socket.on('disconnect', () => {
            if(this.active)
                this.disconnectionhandler(true)
        });

        this.player1.socket.on('leaveGame', (data) => {
            if(data){
                this.disconnectionhandler(true);
            }
        });

        this.player1.socket.on('boardMove', (data) => {
            pararTiempo = true;
            this.moveHandler(data,this.player2.socket);
            this.botfunction(this.botInfo.nivel, this.board.length, data);
        });
        
    }

    startHuman(){
        if(this.roomId){
            const boardController = require('../controllers/boardController');
            boardController.updateUserState(this.socket,this.roomId,this.player1.info.id,true,this.code);
            boardController.updateUserState(this.socket,this.roomId,this.player2.info.id,true,this.code);
        }

        this.player1.socket.emit('gameRoomInfo',{ board: this.board, isPlaying:this.player1Playing, player: this.player2.info});
        this.player2.socket.emit('gameRoomInfo',{ board: this.board, isPlaying:!this.player1Playing, player: this.player1.info});

        this.player1.socket.on('disconnect', () => {
            if(this.active)
                this.disconnectionhandler(true)
        });

        this.player2.socket.on('disconnect', () => {
            if(this.active)
                this.disconnectionhandler(false)
        });

        this.player1.socket.on('pauseGame', (data) => {
            if(data){
                pararTiempo = true;
                this.player2.socket.emit('pausedGame', data);
            }else{
                this.player2.socket.emit('pausedGame', data);
                //this.cronometro(this.player1Playing, timer);
            }
        });

        this.player1.socket.on('leaveGame', (data) => {
         
            if(data){
                this.disconnectionhandler(true);
            }
        });

        this.player2.socket.on('pauseGame', (data) => {
            if(data){
                pararTiempo = true;     
                this.player1.socket.emit('pausedGame', data);          
            }else{
                this.player1.socket.emit('pausedGame', data);
                //this.cronometro(this.player1Playing, timer);
            }
        });

        this.player2.socket.on('leaveGame', (data) => {
          
            if(data){
                this.disconnectionhandler(false);
            }
        });

        //this.cronometro(this.player1Playing, 15);

        this.player1.socket.on('boardMove', (data) => {
         
            if(this.player1Playing){
                pararTiempo = true;
                this.moveHandler(data,this.player2.socket);
                this.player1Playing = false;
                //this.cronometro(this.player1Playing, 15);
            }
        });

        this.player2.socket.on('boardMove', (data) =>{
          
            if(!this.player1Playing){
                pararTiempo = true;
                this.moveHandler(data,this.player1.socket);
                this.player1Playing = true;
                //this.cronometro(this.player1Playing, 15);
            }
        });
    }

    start(){
        if(this.botInfo.bot == true){
            this.startBot();
        } else {
            this.startHuman();
        }
    }

    cronometro(jugador, time){
        const modulo = require('proyecto-2c-crono');
        const cont = new modulo.Descontador(time);
        var d = cont.start().subscribe(
            data =>  {
                if(pararTiempo){
                    timer = data.split(":");
                    timer = timer[2];
                    d.unsubscribe();
                    pararTiempo = false;
                }
                if(!this.active){
                    d.unsubscribe();
                }
                if (data === 'FINISH') {
                    d.unsubscribe();
                    if(jugador === true){
                        this.player1.socket.offAny();
                        pararTiempo = false;
                    }else if(jugador === false){
                        this.player2.socket.offAny();
                        pararTiempo = false;
                    }
                }
            }
        );
    }

    createBoard(size) {
        let board = [];
        for (let x = 0; x < size; x++) {
            let subCol = [];
            for (let y = 0; y < size; y++) {
                subCol.push({
                    id: 0,
                    x: x,
                    y: y,
                    ghost:false,
                    mark:false
                });
            }
            board.push(subCol);
        } 
        return board;
    }
}
