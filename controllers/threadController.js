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
                reject("error getting db data, check connection")
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

const createThread = (req, res) => {

};

const getThread = (req, res) => {
    console.log('getThread called');
    getSqlData('SELECT name FROM boards WHERE board_id=2', [])
        .then(response => {
            res.send(response);
        })
        .catch(error => {
            console.log(error);
        });
};

// SELECT name FROM boards WHERE board_id=2; result: testing2 // getSqlData('SELECT $1::text as message', ['Hello world!'])

const reportThread = (req, res) => {

};

const deleteThread = (req, res) => {

};

module.exports = {
    createThread,
    getThread,
    reportThread,
    deleteThread
};