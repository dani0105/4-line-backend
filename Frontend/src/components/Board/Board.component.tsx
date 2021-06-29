import { Component } from 'react';
import { Cell } from '../../models';
import { CellComponent } from './Cell.component';
import { Rule } from './rules';
import style from './Board.module.css';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CloseIcon from '@material-ui/icons/Close';
import { BottomNavigationAction } from '@material-ui/core';
import { RoomState } from 'enums/RoomState';

const crono = require('proyecto-2c-crono');
var arTimer;
var timer = 15;

interface prop {
    board: Cell[][],
    player1: {
        id: number,
        color: string,
        username: string,
        picture: string,
        win: boolean
    },
    player2: {
        id: number,
        color: string,
        username: string,
        picture: string,
        win: boolean
    },
    gameRule: Rule,
    matchTime: number,
    onFinish: any,
    roomState: RoomState,
    bot: boolean
}

interface state {
    board: Cell[][],
    timer: string
}

export class Board extends Component<prop> {

    public state: state;

    constructor(props: any) {
        super(props);
        this.state = {
            board: this.props.board,
            timer: ''
        };


        this.props.gameRule.initRule({
            updata: this.update,
            startTimer: this.startTimer,
            onFinish: this.onFinish,
            time: this.state.timer
        });
    }

    public update = (x: number, y: number, id: number, ghost = false) => {
        this.state.board[x][y].id = id;
        this.state.board[x][y].ghost = ghost;
        this.forceUpdate();
    }

    public onFinish = (data: any) => {
        console.log(data);
        this.props.onFinish();
        if (data.playerWinner == this.props.player1.id) {
            this.props.player1.win = true;
        }
        if (data.playerWinner == this.props.player2.id) {
            this.props.player2.win = true;
        }
        if (data.win == 1) {
            this.setState({ board: data.board });
        } else
            this.setState({ time: 'Abandono' });
        // this.forceUpdate();
    }

    private resetBoard() {
        this.setState({ board: [] })
    }

    /**
     * Cuando se hace un click en una celda esta funcion se llama.
     * @param {Cell} cell datos de la celda en la que se dio click
     */
    private onClick = (cell: Cell): boolean => {
        return this.props.gameRule.onClick(this.state.board, cell, this.props.player1.id, this.update)
    };

    /**
     * Cuando se coloca el mouse sobre una celda esta funcion se llama.
     * @param {Cell} cell datos de la celda en la que el mouse salio
     */
    private onLeave = (cell: Cell): boolean => {
        return this.props.gameRule.onLeave(this.state.board, cell, this.props.player1.id, this.update)
    };

    /**
     * Cuando se coloca el mouse sobre una celda esta funcion se llama.
     * @param {Cell} cell datos de la celda en la que el mouse esta
     */
    private onEnter = (cell: Cell): boolean => {
        return this.props.gameRule.onEnter(this.state.board, cell, this.props.player1.id, this.update);
    };

    private returnColor(id: number) {
        if (id == this.props.player1.id) {
            return this.props.player1.color;
        }
        if (id == this.props.player2.id || id == -1) {
            return this.props.player2.color;
        }
        return '';
    }

    /**
     * Esta Funcion se encarga de llevar una cuenta regresiva con el objetivo 
     * de mostrarle al jugador cuanto tiempo le queda para mover su ficha 
     */
    public startTimer = (time: any) => {
        if (!this.props.bot) {
            const cont = new crono.Descontador(time);
            var d = cont.start().subscribe(
                (data: string) => {
                    if (this.props.gameRule.getIsPaused()) {
                        arTimer = data.split(":");
                        timer = parseInt(arTimer[2]);
                        d.unsubscribe();
                    }
                    if (!this.props.gameRule.getIsPlaying()) {
                        d.unsubscribe();
                        this.setState({ timer: '' });
                        return;
                    }
                    if (data === 'FINISH') {
                        d.unsubscribe();
                        this.props.gameRule.setIsPlaying(false);
                        this.setState({ timer: 'Fin' });
                        return;
                    }
                    var seg = data.split(':').pop();
                    this.setState({ timer: seg });
                }
            );
        }
    }

    public pauseGame() {
        this.props.gameRule.pauseGame();
        if (!this.props.gameRule.getIsPaused()) {
            console.log("tiempo")
            this.startTimer(this.state.timer);
        }
    }

    public leaveGame() {
        this.props.gameRule.leaveGame();
        //this.props.player2.win = true;
        this.props.onFinish();
    }


    /**
     *  Esta funcion se encarga de renderizar el tablero
     */
    render() {
        return (
            <div className="container-fluid">
                <div className="row mt-2">

                    <div className="col-12 col-md-2">
                        <img className="d-block m-auto" style={{ height: '50px', width: '50px' }} src={this.props.player2.picture} />
                    </div>
                    <div className="col-12 col-md-3 text-center">
                        <div className={this.props.player2.win ? style.winner : ''}>
                            {this.props.player2.username}
                        </div>
                    </div>

                    <div className="col-12 col-md-2 text-center font-weight-bold">
                        <div>VS</div>
                        <div>{this.state.timer}</div>
                    </div>
                    <div className="col-12  col-md-3 text-center">
                        <div className={this.props.player1.win ? style.winner : ''}>
                            {this.props.player1.username}
                        </div>

                    </div>
                    <div className="col-12 col-md-2">
                        <img className="d-block m-auto" src={this.props.player1.picture} />
                    </div>

                </div>
                <div className="row">
                    <div className="col-12">
                        <div className={style.table}>
                            <div className="bg-white">
                                {this.state.board.map((row, inde) => {
                                    return (
                                        <div className="d-flex" key={inde}>
                                            {row.map((singleCell: Cell, index: number) => {
                                                return (
                                                    <CellComponent
                                                        key={index}
                                                        data={singleCell}
                                                        onClick={this.onClick}
                                                        onEnter={this.onEnter}
                                                        onLeave={this.onLeave}
                                                        color={this.returnColor(singleCell.id)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                {this.props.roomState == RoomState.FINISH ? ('') : (
                    <div className="row" >
                        <div className="col-1"></div>
                        <div className="col-5  mt-2 mb-2">
                            <button className={this.props.gameRule.getIsPaused() ? "btn btn-block btn-success btn-sm" : "btn btn-block btn-warning btn-sm"}
                                onClick={() => this.pauseGame()}>
                                {this.props.gameRule.getIsPaused() ?
                                    (<div><PlayArrowIcon />Reanudar partida</div>) : (<div><PauseIcon />Pausar partida</div>)}
                            </button>
                        </div>
                        <div className="col-5 mt-2 mb-2">
                            <button className="btn btn-block btn-danger btn-sm" onClick={() => this.leaveGame()}>
                                <CloseIcon /> Abandonar partida
                         </button>
                        </div>
                    </div>
                )}

            </div>
        );
    }
}