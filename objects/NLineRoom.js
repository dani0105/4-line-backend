module.exports = class NLineRoom{

    constructor(size, playerInfo, socketPlayer1, code, privateRoom){
        this.board = this.createBoard(size);
        this.code = code;
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
    }

    start(){
        this.player1.socket.emit('gameRoomInfo',{ board: this.board, isPlaying:true, player: this.player2.info});
        this.player2.socket.emit('gameRoomInfo',{ board: this.board, isPlaying:false, player: this.player1.info });

        this.player1.socket.on('boardMove', (data) => {
            //aquí se debe verificar si es un movimiento valido;
            this.board[data.x][data.y].id = data.id;
            this.player2.socket.emit('responseBoard', data)
        });

        this.player2.socket.on('boardMove', (data) => {
            //aquí se debe verificar si es un movimiento valido;
            this.board[data.x][data.y].id = data.id;
            this.player1.socket.emit('responseBoard', data)
        });
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
