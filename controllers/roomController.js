const { Client } = require('pg');

const credentials = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}

exports.addRoom = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('call add_room($1,$2,$3)', [
            req.id_user_account,
            req.name,
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
        throw error;
    }
}

exports.updateRoom = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('call update_room($1,$2,$3,$4)', [
            req.id,
            req.name ? null : req.name,
            req.password ? null : req.password,
            req.is_active == undefined ? null : req.is_active
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
        throw error;
    }
}

exports.getRoom = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('select * from  get_room($1,$2,$3)', [
            req.id_user_account,
            req.page_number,
            req.size
        ]).then(result => {
            return {success:true,data:result.rows};
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

exports.addRoomUserAccount = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('call add_room_user_account($1,$2,$3)', [
            req.id_room,
            req.id_user_account,
            req.is_admin == undefined ? null : req.is_admin
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
        throw error;
    }
}


exports.updateRoomUserAccount = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('call update_room_user_account($1,$2,$3)', [
            req.id,
            req.is_active == undefined? null:req.is_active,
            req.is_admin == undefined ? null: req.is_admin
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
        throw error;
    }
}


exports.getRoomUserAccount = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('select * from get_room_user_account($1,$2,$3)', [
            req.id_room,
            req.page_number,
            req.size
        ]).then(result => {
            return {success: true , data:result.rows};
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

exports.joinRoom = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('call join_room($1,$2,$3)', [
            req.code,
            req.password,
            req.id_user_account
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
        throw error;
    }
}

module.exports