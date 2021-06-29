import { Cell } from 'models';
import { Component } from 'react';
import { NLineRule } from 'components/Board/rules';
import { Board } from '../../components';
import {AuthService} from '../../services';
import config from '../../envConfig';
import style from './GameRoom.module.css';
import ReactLoading from 'react-loading';
import Settings from '@material-ui/icons/Settings';
import { BoardConfigurationDialog } from '../../components/Board/BoardConfiguration.dialog';
import { RoomState } from 'enums/RoomState';


const io = require('socket.io-client');
const token = AuthService.getAccessToken();

export class GameRoom extends Component {

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
      dialog: false,
      seg: '',
      selectedBoardSize: 8
    };
    this.state.socket.on('connect',this.socketConnected)
    this.board = [];
    this.gameRoomInfo();
  }

  socketConnected = (socket:any) => {
    this.setState({roomState:this.state.roomState == RoomState.FINISH? RoomState.FINISH:RoomState.IDEL});
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

  /**
   * Aqui manda una solicitud para crear una sala
   */
  createGameRoom() {
    this.state.socket.emit("createGameRoom", {
      boardSize: this.state.selectedBoardSize,
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

  /**
   * Detecta cuando una sala acabo.
   * @param data 
   */
  finishGameRoom = (data: any) => {
    this.setState({ roomState: RoomState.FINISH, socket: io(config.ApiUrl,{query:{token:token}}) });
    this.state.socket.on('connect',this.socketConnected)
    this.gameRoomInfo();
  }

  /**
   * Aqui se une a una sala de un jugador.
   */
  joinGameRoom() {
    this.state.socket.emit("connectGameRoom", {
      code: this.state.code,
      playerInfo: {
        id: this.state.user.data.id,
        username: this.state.user.data.username,
        picture: this.state.user.data.picture
      }
    })

    this.state.socket.on('connectedGameRoom', (data: any) => {
      if (!data) {
        console.log("not Connected");
        this.setState({ roomState: RoomState.IDEL });
        return;
      }
      console.log("conected");
    });
  }

  /**
   * Esta funcion se encarga de mandar la solicitud para encontrar partidas
   */
  searchGameRoom() {
    this.state.socket.emit("searchGame", {
      boardSize: this.state.selectedBoardSize,
      playerInfo: {
        id: this.state.user.data.id,
        username: this.state.user.data.username,
        picture: this.state.user.data.picture
      }
    });
    this.setState({ roomState: RoomState.WAITING, board: null })

    this.state.socket.on('searchedGame', (data: any) => {
      if (data.searching) {
        this.setState({ roomState: RoomState.WAITING });
      }

    });
  }

  sendBoardSize(size: number) {
    this.setState({ selectedBoardSize: size });
  }

  /*
    selectedValue = ()=>{
  
    }
  
    handleClose = (valu:any) => {
      this.setState({dialog:false});
    };
  
    
              <Settings />*/

  render() {
    return (
      <div className="container">
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
                  bot={false}
                  player2={{
                    id: this.state.player2.id,
                    color: this.state.colorPlayer2,
                    picture: this.state.player2.picture,
                    username: this.state.player2.username,
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
            <div className={`outlineTitle bg-primary rounded-lg pl-2 pr-2 text-white`}>Buscador</div>
            <div className={`container-fluid mb-3 outlinePrimary rounded-lg`}>
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
              <div className="row mt-5">
                <div className="col-12 col-md-5">
                  <label><strong>Codigo:</strong> {this.state.ownCode}</label>
                </div>
                <div className="col-12 col-md-7">
                  <button disabled={!(this.state.roomState == RoomState.IDEL || this.state.roomState == RoomState.FINISH)} className="btn btn-block btn-primary" onClick={(e) => this.createGameRoom()}>
                    Crear Sala
                    </button>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12 col-md-5">
                  <input type="text" className="form-control" value={this.state.code} onChange={(e) => this.setState({ code: e.target.value })} placeholder="Codigo de sala" />
                </div>
                <div className="col-12 col-md-7">
                  <button disabled={!(this.state.roomState == RoomState.IDEL || this.state.roomState == RoomState.FINISH)} className="btn btn-block btn-primary" onClick={(e) => this.joinGameRoom()}>
                    Unirse a Sala
                  </button>
                </div>
              </div>
              <div className="row mt-5">
                <div className="col-12">
                  <button disabled={!(this.state.roomState == RoomState.IDEL || this.state.roomState == RoomState.FINISH)} className="btn btn-success btn-block" onClick={(e) => this.searchGameRoom()}>
                    Buscar Partida Aleatoria
                    </button>
                </div>
              </div>
              <div className="row mt-5">
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

/**
 */