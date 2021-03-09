const { Client } = require('pg');
const axios = require('axios').default;
const jwt = require('jsonwebtoken');
const StatusCodes = require('http-status-codes').StatusCodes;

const credentials = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}

exports.login = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('select * from login($1,$2)', [
            req.email,
            req.password
        ]).then(result => {
            if (result.rowCount == 0)
                return {success:false,data:null};
            else{
                const data = result.rows[0];
                const token = generateToken(data.id,req.email,data.username);
                return {success:true,data:result.rows[0],access_token:token};
            }
        }).catch(error => {
            console.log(error);
            throw error;
        });
        client.end();
        return result;
    }
    catch (error) {
        client.end();
        throw error;
    }
}

exports.register = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('call register($1,$2,$3)', [
            req.email,
            req.username,
            req.password
        ]).then(result => {
            const data = result.rows[0];
            if(data.success){
                const token = generateToken(data.id_new,req.email,req.username);
                return {success:true,id:data.id_new,access_token:token}
            }
            
            return {success:false};
        }).catch(error => {
            console.log(error);
            throw error;
        });
        client.end();
        return result;
    }
    catch (error) {
        client.end();
        console.log(error);
        throw error;
    }
}

exports.facebook = async (req) => {
    const result = await axios({
        url: `https://graph.facebook.com/${req.oauth_uid}`,
        method: 'GET',
        validateStatus:(status)=>{
            return status >=200 && status <= 400
        },
        params: {
            access_token:req.access_token
        }
    });

    if(result.status == StatusCodes.OK){
        const data = await loginThirdParty(req.oauth_uid,req.email,result.data.name);
        if(data.success){
            const token = generateToken(data.id,data.email,data.username);
            return {
                success:true,
                data:{
                    email:data.email,
                    username:data.username,
                    id:data.id_new
                },
                access_token:token
            };
        }
        else
            return {success:false};
    }
    else
        return {success:false}

}


exports.google = async (req) => {
    const result = await axios({
        url: `https://oauth2.googleapis.com/tokeninfo`,
        method: 'GET',
        validateStatus:(status)=>{
            return status >=200 && status <= 400
        },
        params: {
            id_token:req.access_token
        }
    });

    if(result.status == StatusCodes.OK){
        const data = await loginThirdParty(req.oauth_uid,req.email,result.data.name);
        const token = generateToken(data.id,data.email,data.username);
        return {
            success:true,
            data:{
                email:data.email,
                username:data.username,
                id:data.id_new
            },
            access_token:token
        };
    }
    else
        return {success:false}
        
}

generateToken = (id,email,username) => {
    return jwt.sign({
        id:id,
        username:username,
        email:email
    },process.env.SERVER_SCRET,
    {
        expiresIn: '1h',
        subject:email
    });
}

loginThirdParty = async (oauth_uid,email,username) => {
    const client = new Client(credentials);
    try {
        await client.connect();

        let result = await client.query('call third_party($1,$2,$3)', [
            oauth_uid,
            email,
            username
        ]).then(result => {
            return result.rows[0];
        }).catch(error => {
            throw error;
        });

        client.end();
        return result;
    }
    catch (error) {
        client.end();
        throw error;
    }
}

module.exports