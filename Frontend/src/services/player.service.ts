import config from '../envConfig'
import http from 'axios';
import AuthService from './auth.service';

const URL = `${config.ApiUrl}/player`;

const header = {
    'Authorization':'barear '+AuthService.getAccessToken()
};

/**
 *  Se encarga de conectar con el back-end para enviar y recuperar los datos del historial.
 * @param {*} params objeto json que se envía con size, page_number y id_user_account
 */
const PlayerService = {
    getHistory: (params:any) => new Promise<any>(
        (resolve,rejected)=>{
            http.get(`${URL}/game`,{params:params,headers:header}).then( data=>{
                resolve(data.data);
            }).catch( err => rejected(err));
        }
    )
}

export default PlayerService;