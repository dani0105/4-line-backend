import { time } from 'node:console';
import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import { NavLink, Redirect } from 'react-router-dom';
import { infoToast,errorToast,successToast,deleteToast } from 'services';
import SimpleReactValidator from 'simple-react-validator';
import AuthService from '../../services/auth.service';

import styles from './Login.module.css';

export class Login extends Component {

  private validator: SimpleReactValidator;
  state:any;
  delta: any;

  constructor(props: any) {
    super(props);
    this.validator = new SimpleReactValidator({autoForceUpdate: this});
    this.state = {
      email:'',
      password:'',
      redirect:false,
      login:false
    };
    this.formChange = this.formChange.bind(this);
    this.onClickThirdParty = this.onClickThirdParty.bind(this);
  }

  private onClickThirdParty(){
    this.setState({login:true});
  }

  private responseFacebook = (response: any) => {
    infoToast("Enviando");
    AuthService.facebook(response.userID,response.accessToken,response.email,response.picture.data.url).then( result => {
      if(result.success){
        successToast("Logueado");
        this.setState({redirect:true});
        return;
      }
      errorToast("Credenciales Invalidas");
      this.setState({login:false});
    },err => {errorToast("Error Interno")})
  
  }

  private responseGoogle = (response: any) => {
    infoToast("Enviando");
    AuthService.google(response.googleId, response.tokenId, response.profileObj.email,response.profileObj.imageUrl).then( result => {
      if(result.success){
        successToast("Logueado");
        this.setState({redirect:true});
        return;
      }
      errorToast("Credenciales Invalidas");
      this.setState({login:false});
    },err => {errorToast("Error Interno")})
  }

  private onSubmitForm = (event:any) => {
    event.preventDefault();
    this.setState({login:true});
    this.login();
  }

  private login(){
    infoToast("Enviando");
    AuthService.login({email:this.state.email,password:this.state.password}).then( result =>{
      if(result.success){
        successToast("Logueado");
        this.setState({redirect:true});
        return;
      }
      this.setState({login:false});
      errorToast("Credenciales Invalidas");
    },err => {errorToast("Error Interno")})
  }

  private formChange(event:any){
    const target = event.target;
    const name = target.name;
    this.setState({
      [name]: target.value
    });
  }

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect push to='/dashboard' />
    }
  }

  render() {
    return (
      <div className={styles.background}>
        {this.renderRedirect()}
        <div className={`bg-white rounded-lg d-block position-absolute ${styles.login}`}>
          <div className="container-fluid"> 
            <div className="row mt-2">
              <div className="col-12">
                <h1 className={`text-center w-100 ${styles.loginText}`}>Entrar</h1>
              </div>
            </div>
            <form onSubmit={this.onSubmitForm}>
              <div className="row mt-2">
                <div className="col-12">
                  <label>Correo</label>
                  <input required name="email" type="email" value={this.state.email} onChange={this.formChange}  placeholder="ejemplo@correo.com" className="form-control"/>
                  {this.validator.message('email', this.state.email, 'required|email',{ className: 'text-danger' })}
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-12">
                  <label>Contraseña</label>
                  <input required name="password" type="password" value={this.state.password} onChange={this.formChange}  className="form-control"/>
                  {this.validator.message('password', this.state.password, 'required|min:8|max:20',{ className: 'text-danger' })}
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-12">
                  <button type="submit" disabled={!this.validator.allValid()} className="btn btn-success btn-block">Login</button>
                </div>
              </div>
            </form>
            <div className="row mt-2">
                <div className="col-12">
                  <div className="text-black-50 text-center">
                    - o -
                  </div>
                </div>
              </div>
            <div className="row mt-3">
              <div className="col-12">
                <FacebookLogin
                  isDisabled={this.state.login}
                  onClick={this.onClickThirdParty}
                  appId="169120591518005"
                  cssClass=" btn btn-block btn-primary"
                  fields="name,picture,email"
                  callback={this.responseFacebook}
                  textButton="Login con Facebook" />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <GoogleLogin
                  disabled={this.state.login}
                  clientId="458119816447-ccej9rk4dflmdtjgf3ftds65knufin2s.apps.googleusercontent.com"
                  buttonText="Login con Google"
                  className="btn btn-block"
                  onSuccess={this.responseGoogle}
                  cookiePolicy={'single_host_origin'} />
              </div>
            </div>
            <div className="row mt-2 mb-5">
                <div className="col-12">
                  <NavLink className="text-center w-100 d-block" to="/register">¿No tienes una cuenta?</NavLink>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}