const { Client } = require('pg');
const StatusCodes = require('http-status-codes').StatusCodes;

const credentials = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}

exports.addGame = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('call add_game($1,$2,$3)', [
            req.player1,
            req.player2,
            req.player_winner
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

exports.getGames = async (req) => {
    const client = new Client(credentials);
    try {
        await client.connect();
        let result = await client.query('select * from get_games($1,$2,$3)', [
            req.id_user_account,
            req.size,
            req.page_number
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

module.exports