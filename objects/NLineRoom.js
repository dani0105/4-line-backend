
module.exports = class NLineRoom{

    constructor(size,winSize, playerInfo, socketPlayer1, code, privateRoom,deleter){
        this.board = this.createBoard(size);
        this.code = code;
        this.winSize = winSize;
        this.player1 = {
            info: playerInfo,
            socket:socketPlayer1
        }
        this.player2 = {
            info:null,
            socket:null
        }
        this.player1Playing = true;
        this.privateRoom = privateRoom;
        this.active = true;
        this.deleter = deleter;
    }

    disconnectionhandler (isPlayer1) {
        console.log("disconected")
        this.active = false;
        this.deleter(this);
        const controller = require('../controllers').PlayerController;
        // se guarda en al base de datos
        controller.addGame({
            player1:this.player1.info.id,
            player2:this.player2.info.id,
            player_winner:isPlayer1?this.player2.info.id:this.player1.info.id
        })

        // se envia la informacion de perdidad al jugador desconectado


        // se cierra la conexion
        //console.log(this.player1.socket);
        this.player1.socket.disconnect(true);
        this.player2.socket.disconnect(true);
    }

    moveHandler(data,sendTo){
        if(this.verifyMove(data.x,data.y)){
            this.board[data.x][data.y].id = data.id;
            
            //Verificar ganador aqui

            sendTo.emit('responseBoard', data)
        }
    }

    verifyMove(x,y){
        return this.board[x][y].id == 0? true:false;
    }


    verifyWin(id){
        // horizontalCheck 
        for (var j = 0; j<this.size-3 ; j++ ){
            for (var i = 0; i<this.size; i++){
                if (this.board[i][j].id == id && this.board[i][j+1].id == id && this.board[i][j+2].id == id && this.board[i][j+3].id == id){
                    return true;
                }           
            }
        }
        // verticalCheck
        for (var i = 0; i<this.size-3 ; i++ ){
            for (var j = 0; j<this.size; j++){
                if (this.board[i][j].id == id && this.board[i+1][j].id == id && this.board[i+2][j].id == id && this.board[i+3][j].id == id){
                    return true;
                }           
            }
        }
        // ascendingDiagonalCheck 
        for (var i=3; i<this.size; i++){
            for (var j=0; j<this.size-3; j++){
                if (this.board[i][j].id == id && this.board[i-1][j+1].id == id && this.board[i-2][j+2].id == id && this.board[i-3][j+3].id == id)
                    return true;
            }
        }
        // descendingDiagonalCheck
        for (var i=3; i<this.size; i++){
            for (var j=3; j<this.size; j++){
                if (this.board[i][j].id == id && this.board[i-1][j-1].id == id && this.board[i-2][j-2].id == id && this.board[i-3][j-3].id == id)
                    return true;
            }
        }
        return false;
    }

    start(){
        this.player1.socket.emit('gameRoomInfo',{ board: this.board, isPlaying:this.player1Playing, player: this.player2.info});
        this.player2.socket.emit('gameRoomInfo',{ board: this.board, isPlaying:!this.player1Playing, player: this.player1.info });

        this.player1.socket.on('disconnect', () => {
            if(this.active)
                this.disconnectionhandler(true)
        });

        this.player2.socket.on('disconnect', () => {
            if(this.active)
                this.disconnectionhandler(false)
        });

        this.cronometro(player1Playing);

        this.player1.socket.on('boardMove', (data) => {
            if(this.player1Playing){
                this.player1Playing = false;
                cronometro(player1Playing);
                this.moveHandler(data,this.player2.socket);
            }
        });
        this.player2.socket.on('boardMove', (data) =>{
            if(!this.player1Playing){
                this.player1Playing = true;
                cronometro(player1Playing);
                this.moveHandler(data,this.player1.socket);
            }
        });
    }

    cronometro(jugador){
        const modulo = require('proyecto-2c-crono');
        const cont = new modulo.Descontador(15);
        var d = cont.start().subscribe(
            data =>  {
                if (data === 'FINISH') {
                    d.unsubscribe();
                    if(jugador === true){
                        this.player1.socket.disconnect(true);
                    }else if(jugador === false){
                        this.player2.socket.disconnect(true);
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
                });
            }
            board.push(subCol);
        } 
        return board;
    }
}
