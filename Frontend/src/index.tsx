import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import {
  DashboardNavigator,
  Login, 
  NotFound,
  Register
} from './views/index'

import './style.css';
import { ToastContainer } from 'react-toastify';

ReactDOM.render(
  <React.StrictMode>
    <ToastContainer position="top-right" newestOnTop autoClose={false} pauseOnFocusLoss={false} draggable={false} />
    <Router>
      <Switch>
        <Route path="/" exact component={Login} />

        <Route path="/Register" exact component={Register} />
        
        <Route path="/dashboard" render={({ location }) =>
                true ? (
                  <DashboardNavigator/>
                ) : (
                    <Redirect
                        to={{
                            pathname: "/",
                            state: { from: location }
                        }}
                    />
                )
            }/>
          
        <Route path="*" component={NotFound}/>
      </Switch>
    </Router>
   
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
