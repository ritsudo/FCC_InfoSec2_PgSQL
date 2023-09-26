const { Client } = require('pg');

function getSqlData(request_body, request_params) {
    const client = new Client({
        user: 'postgres',
        password: 'postgres',
        database: 'forum'
    });

    let mySqlPromise = new Promise((resolve, reject) => {
        try {
        client.connect((err) => {
            client.query(request_body, request_params, (err, res) => {
              if (res) {
                resolve(res.rows);
              } else {
                reject(err)
              }
              client.end()
            })
         })
        } catch (error) {
            reject(error.message);
        }
    });

    return mySqlPromise;
}

module.exports = {
    getSqlData
}