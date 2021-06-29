import config from '../envConfig'
import http from 'axios';

const URL = `${config.ApiUrl}/auth`;
const USER_ID = 'User';

const AuthService = {
    login: (params:any) => new Promise<any>(
        (resolve,rejected)=>{
            http.post(`${URL}/login`,params).then( data=>{
                let user = data.data;
                if(user.success){
                    loginUser({data:user.data, access_token:user.access_token});
                    resolve({ success:true });
                }else
                    resolve({ success:false });
            }).catch( err => rejected(err));
        }
    ),
    register: (params:any) => new Promise<any>(
        (resolve,rejected)=>{
            http.post(`${URL}/register`,params).then( result => {
                let user = result.data;
                resolve(user);
            }).catch(err => rejected(err));
        }
    ),
    facebook: (id:string,access_token:string,email:string,picture:string) => new Promise<any>(
        (resolve,rejected)=>{
            http.post(`${URL}/facebook`,{oauth_uid:id,email:email,access_token:access_token}).then( data => {
                let user = data.data;
                if(user.success){
                    user.data.picture = picture;
                    loginUser({data:user.data, access_token:user.access_token});
                    resolve ({success:true});
                }
                else    
                    resolve({success:false});
            }).catch( err => rejected(err))
        }
    ),
    google: (id:string,access_token:string,email:string,picture:string) => new Promise<any>(
        (resolve,rejected)=>{
            http.post(`${URL}/google`,{oauth_uid:id,email:email,access_token:access_token}).then( data => {
                let user = data.data;
                if(user.success){
                    user.data.picture = picture;
                    loginUser({data:user.data, access_token:user.access_token});
                    resolve({success:true});
                }
                else
                    resolve({success:false});
            }).catch( err => rejected(err));
        }
    ),
    getAuthUser: () => {
        const data = localStorage.getItem(USER_ID);
        if(data){
            return JSON.parse(data);
        }
        return null;
    },
    logout: () => {
        localStorage.removeItem(USER_ID);
        sessionStorage.clear();
        return true;
    },
    getAccessToken:() =>{
        const data = localStorage.getItem(USER_ID);
        if(data){
            return JSON.parse(data).access_token;
        }
        return '';
    }
}

export default AuthService;

function loginUser(data:any){
    localStorage.setItem(USER_ID,JSON.stringify(data))
}