import { Component } from 'react';
import { NavLink } from 'react-router-dom';
import {PlayerService,AuthService} from '../../services'

import style from './Dashboard.module.css';
import defaultProfilePic from '../../views/defaultPic.jpg';



import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';


const columnas = [
  {name: "Jugador 1", selector: "player1", sortable: true }, 
  {name: "Jugador 2", selector: "player2",sortable: true}, 
  {name: "Partida", selector: "gamestatus", sortable: true}, 
  {name: "Fecha", selector: "date", sortable: true}
]

const paginationOptions = {
  rowsPerPageText: 'Filas por página',
  rangeSeparatorText: ' de ',
  selectAllRowsItem: true,
  selectAllRowsItemText: 'Todos'
}


export class Dashboard extends Component {

  public state: any;


  constructor(props: any) {
    super(props);
    this.state = { user: AuthService.getAuthUser(), historyTable: [] };
  }


  private getHistory(){
    PlayerService.getHistory({size:20,page_number:0, id_user_account: this.state.user.data.id}).then( result =>{
      if(result.success){
        for(var i in result.data){
          if(result.data[i].gamestatus == 0){
            result.data[i].gamestatus= 'Empate'
          }else if(result.data[i].gamestatus == 1){
            result.data[i].gamestatus= 'Victoria'
          }else{
            result.data[i].gamestatus= 'Derrota'
          }
          result.data[i].date = result.data[i].date.split('T')[0]
        }
        this.setState({historyTable:result.data})
      }
    },err => console.log(err))
  }
  
  componentDidMount() {
    this.getHistory()
    this.setState({ user: AuthService.getAuthUser() });
  }

  render() {
    return (
      <div className='container'>
        <div className='row mt-1'>
          <div className='col-md-auto col-12'>
            <img src={this.state.user.data.picture?this.state.user.data.picture:defaultProfilePic} 
              alt='20' 
              className="img-thumbnail profile-image m-auto m-md-0 d-block" />
          </div>
          <div className='col-md-auto col-12 text-md-left text-center'>
              <div className={`${style.outlineTitle} bg-primary rounded-lg pl-2 pr-2 text-white`}>Perfil</div>
              <div className={`${style.outlinePrimary} p-2 pt-3 rounded-lg w-100`}>
                <strong>Usuario: </strong>
                {this.state.user.data.username}
              </div>
              
          </div>
        </div>
        <div className='row mt-4'>
          <div className='col-md-6 col-12'>
          <NavLink to='dashboard/play' className="text-decoration-none">
              <button type="button" className={`btn btn-block btn-primary`}>
                Jugar en línea
              </button>
            </NavLink>
          </div>
          <div className='col-md-6 col-12'>
            <NavLink to='dashboard/playPC' className="text-decoration-none">
              <button type="button" className={`btn btn-block btn-info mt-2 mt-md-0 `}>
                Jugar con el ordenador
              </button>
            </NavLink>
          </div>
        </div>
        <div className='row mt-2'>
          <div className='col-12'>
            <DataTable columns={columnas} 
            data={this.state.historyTable} 
            title="Historial de Partidas"
            pagination
            paginationComponentOptions={paginationOptions}
            fixedHeader
            fixedHeaderScrollHeight="600px"
            />
          </div>
        </div>
      </div>
    );
  }
}