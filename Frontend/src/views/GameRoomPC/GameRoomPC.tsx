import { Cell } from 'models';
import { Component } from 'react';
import { NLineRule } from 'components/Board/rules';
import { Board } from '../../components';
import {AuthService} from '../../services'
import config from '../../envConfig';
import style from './GameRoomPC.module.css';
import ReactLoading from 'react-loading';
import defaultProfilePic from '../../views/defaultPic.jpg';
import Settings from '@material-ui/icons/Settings';
import { BoardConfigurationDialog } from '../../components/Board/BoardConfiguration.dialog';
import { RoomState } from 'enums/RoomState';

const io = require('socket.io-client');
const token = AuthService.getAccessToken();

export class GameRoomPC extends Component {

  public state: any;
  private board: Cell[][];

  constructor(props: any) {
    super(props);

    this.state = {
      user: AuthService.getAuthUser(),
      socket: io(config.ApiUrl,{query:{token:token}}),
      roomState: RoomState.DISCONNECTED,
      player2: {},
      colorPlayer1: '#F44E3B',
      colorPlayer2: '#68BC00',
      seg: '',
      dropdown: false, //para el select del tamaño del tablero,
      selectedBoardSize: 8
    };
    this.state.socket.on('connect',this.socketConnected)
    this.board = []

    this.state.socket.on('gameRoomInfo', (data: any) => {
      console.log(data);

      this.setState({
        roomState: RoomState.PLAYING,
        board: data.board,
        player2: data.player,
        gamerule: new NLineRule(this.state.socket, data.isPlaying, data.isPaused, data.isLeave)
      });
      //this.forceUpdate();
    });
  }

  socketConnected = (socket:any) => {
    console.log("Conectado")
    this.setState({roomState:this.state.roomState == RoomState.FINISH? RoomState.FINISH:RoomState.IDEL});
  }

  /**
 * Detecta cuando una sala acabo.
 * @param data 
 */
  finishGameRoom = (data: any) => {
    this.setState({ roomState: RoomState.FINISH, socket: io(config.ApiUrl,{query:{token:token}}) });
    this.state.socket.on('connect',this.socketConnected)
    this.gameRoomInfo();
  }

  gameRoomInfo(){
    this.state.socket.on('gameRoomInfo', (data: any) => {
      console.log(data);
      this.setState({
        roomState: RoomState.PLAYING,
        board: data.board,
        player2: data.player,
        gamerule: new NLineRule(this.state.socket, data.isPlaying, data.isPaused, data.isLeave)
      });

      //this.forceUpdate();
    });
  }

  createGameRoom(nivel:number) {
    this.state.socket.emit("createGameRoom", {
      boardSize: this.state.selectedBoardSize,
      bot: true,
      nivel: nivel,
      playerInfo: {
        id: this.state.user.data.id,
        username: this.state.user.data.username,
        picture: this.state.user.data.picture,
        code: ''
      }
    })
    this.state.socket.on('createdGameRoom', (data: any) => {
      this.setState({ ownCode: data, roomState: RoomState.WAITING })
    });
  }

  private openCloseDropdown = () => {
    this.setState({ dropdown: !this.state.dropdown });
  }

  sendBoardSize(size: number) {
    this.setState({ selectedBoardSize: size });
  }

  render() {
    return (
      <div className="container gameRoom">
        <div className="row">
          <div className="col-12 col-md-7">
            <h2 className="text-center">Tablero</h2>
            {(this.state.roomState == RoomState.WAITING) ?
              (<ReactLoading type="bubbles" className="m-auto" color="#2395FF" height={'100px'} width={'100px'} />) :
              (this.state.roomState == RoomState.PLAYING || this.state.roomState == RoomState.FINISH ?
                (<Board
                  roomState ={this.state.roomState}
                  matchTime={15}
                  gameRule={this.state.gamerule}
                  board={this.state.board}
                  bot={true}
                  player2={{
                    id: -1,
                    color: this.state.colorPlayer2,
                    picture: defaultProfilePic,
                    username: 'BAD BOT',
                    win: false
                  }}
                  player1={{
                    id: this.state.user.data.id,
                    color: this.state.colorPlayer1,
                    picture: this.state.user.data.picture,
                    username: this.state.user.data.username,
                    win: false
                  }}
                  onFinish={this.finishGameRoom}
                />) :
                (''))}
          </div>
          <div className="col-12 col-md-5">
            <div className={`outlineTitle bg-info rounded-lg pl-2 pr-2 text-white`}>Creador</div>
            <div className={`container-fluid mb-3 outlineSecondary rounded-lg`}>
              <div className="row mt-4">
                <div className="col-12 col-md-5">
                  <label><strong>Tablero:</strong></label>
                </div>
                <div className="col-12 col-md-7">
                  <select defaultValue="8" className="w-100 p-1" onChange={(e: any) => this.sendBoardSize(e.target.value)}>
                    <option value="6">6x6</option>
                    <option value="8">8x8</option>
                    <option value="10">10x10</option>
                  </select>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-12">
                  <label><strong>Dificultad:</strong></label>
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-12">
                  <button disabled={!(this.state.roomState == RoomState.IDEL || this.state.roomState == RoomState.FINISH)} className="btn btn-info btn-block" onClick={(e) => this.createGameRoom(1)}>
                    Nivel 1
                      </button>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <button disabled={!(this.state.roomState == RoomState.IDEL || this.state.roomState == RoomState.FINISH)} className="btn btn-info btn-block" onClick={(e) => this.createGameRoom(2)}>
                    Nivel 2
                        </button>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <button disabled={!(this.state.roomState == RoomState.IDEL || this.state.roomState == RoomState.FINISH)} className="btn btn-info btn-block" onClick={(e) => this.createGameRoom(3)}>
                    Nivel 3
                        </button>
                </div>
              </div>
              <div className="row mt-5 mb-3">
                <div className="col-12">
                  <div onClick={() => this.setState({ dialog: true })}>
                    <Settings />Configurar Tablero
                  </div>
                  <BoardConfigurationDialog
                    open={this.state.dialog}
                    params={{
                      colorPlayer1: this.state.colorPlayer1,
                      colorPlayer2: this.state.colorPlayer2
                    }}
                    onClose={(data: any) => {
                      this.setState({ dialog: false })
                      if (data) {
                        this.setState(data)
                      }
                    }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}