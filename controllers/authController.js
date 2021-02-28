const { Client } = require('pg');
var credentials = require('../config/envconfig').database;


exports.login = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('select * from login_user($1,$2,$3)', [
            !req.oauth_uid?null:req.oauth_uid,
            !req.username?null:req.username,
            !req.password? null:req.password
        ]).then(result => {
            console.log(result.rows)
            if (result.rowCount == 0)
                return {success:false,data:null};
            else
                return {success:true,data:result.rows[0]};
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
        let result = await client.query('call register_user($1,$2,$3)', [
            req.email,
            req.username,
            req.password
        ]).then(result => {
            return result.rows[0];
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

exports.thirdParty = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('call third_party($1,$2,$3)', [
            req.oauth_uid,
            req.email,
            req.picture
        ]).then(result => {
            return result.rows[0];
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

module.exports