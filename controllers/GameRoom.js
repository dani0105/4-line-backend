class GameRoom{

    constructor(size, id, socket, code){
        this.matrix = this.createBoard(size);
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
