import React, { Component } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import SimpleReactValidator from 'simple-react-validator';
import { ToastContainer, toast } from 'react-toastify';
import AuthService from '../../services/auth.service';


import style from './Register.module.css';

export class Register extends Component {
    private validator: SimpleReactValidator;
    state: any;
    delta: any;

    constructor(props: any) {
        super(props);
        this.validator = new SimpleReactValidator({ autoForceUpdate: this });
        this.state = {
            email: '',
            username: '',
            password: '',
            passwordConfirmed: '',
            redirect: false,
            register: false
        };
        this.formChange = this.formChange.bind(this);
    }


    private onSubmitForm = (event: any) => {
        event.preventDefault();
        if(this.state.password == this.state.passwordConfirmed){
            this.setState({ login: true });
            toast.info("Registrando", {position: 'bottom-right', autoClose: 1500, pauseOnHover: false, draggable: false});
            AuthService.register({email:this.state.email, username:this.state.username, password:this.state.password}).then(resulte=>{
                console.log(resulte);
            })
        }else{
            toast.info("Contraseñas diferentes", {position: 'bottom-right', autoClose: 1500, pauseOnHover: false, draggable: false});
        }
    }

    private formChange(event: any) {
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
            <div className={style.background}>
                {this.renderRedirect()}
                <ToastContainer />
                <div className={`bg-white rounded-lg d-block position-absolute ${style.register}`}>
                    <div className="container-fluid">
                        <div className="row mt-2">
                            <div className="col-12">
                                <h1 className={`text-center w-100 ${style.registerText}`}>Regístrate</h1>
                            </div>
                        </div>
                        <form onSubmit={this.onSubmitForm}>
                            <div className="row mt-2">
                                <div className="col-12">
                                    <label>Correo</label>
                                    <input required name="email" type="email" value={this.state.email} onChange={this.formChange} placeholder="ejemplo@correo.com" className="form-control" />
                                    {this.validator.message('email', this.state.email, 'required|email', { className: 'text-danger' })}
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-12">
                                    <label>Nombre de usuario</label>
                                    <input required name="username" type="username" value={this.state.username} onChange={this.formChange} className="form-control" />
                                    {this.validator.message('username', this.state.username, 'required|min:8|max:20', { className: 'text-danger' })}
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-12">
                                    <label>Contraseña</label>
                                    <input required name="password" type="password" value={this.state.password} onChange={this.formChange} className="form-control" />
                                    {this.validator.message('password', this.state.password, 'required|min:8|max:20', { className: 'text-danger' })}
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-12">
                                    <label>Confirmar contraseña</label>
                                    <input required name="passwordConfirmed" type="password" value={this.state.passwordConfirmed} onChange={this.formChange} className="form-control" />
                                    {this.validator.message('passwordConfirmed', this.state.passwordConfirmed, 'required|min:8|max:20', { className: 'text-danger' })}
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-12">
                                    <button type="submit" disabled={!this.validator.allValid()} className="btn btn-success btn-block">Registrarse</button>
                                </div>
                            </div>
                        </form>
                        <div className="row mt-2 mb-3">
                            <div className="col-12">
                                <NavLink className="text-center w-100 d-block" to="/">¿Ya tienes una cuenta?</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}