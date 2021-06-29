import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Dashboard,GameRoom,GameRoomPC} from 'views';
import logo from './dashboardIcon.png';
import style from './DashboardNavigator.module.css';
import ExitToApp from '@material-ui/icons/ExitToApp';

export class DashboardNavigator extends Component {

  private path: string = '/dashboard';

  constructor(props: any) {
    super(props);
  }


  render() {
    return (
      <div className='background'>
        <nav className='navbar navbar-dark bg-dark'>
          <div className="container-fluid">
            <NavLink className="navbar-brand" to={this.path}>
              <img src={logo} width="30" height="30" className="d-inline-block align-top mr-2"></img>
                Conecta 4
            </NavLink>
            <NavLink className="text-decoration-none text-white navbar-brandnav-link active" to='/'>
              <ExitToApp/>Salir
            </NavLink>
            
          </div>
        </nav>
        <div className={`card mt-md-2 mb-md-3 w-75 mx-auto ${style.boardContainer}`}>
          <Switch>
            <Route exact path={this.path} component={Dashboard} />
            <Route exact path={this.path + '/play'} component={GameRoom} />
          <Route exact path={this.path + '/playPC'} component={GameRoomPC} />
          </Switch>
        </div>
        
      </div>

    );
  }
}