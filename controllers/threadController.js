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

function getBoardIdPromise(board_name) {
    let myGetBoardIdPromise = new Promise((resolve, reject) => {
        getSqlData("SELECT board_id FROM boards WHERE name=$1", [board_name])
        .then(response => {
            resolve(response);
        })
        .catch(error => { reject(error) })
    });

    return myGetBoardIdPromise;
}


const createThread = (req, res) => {
    console.log(req.params.board);
    console.log(req.body.text);
    console.log(req.body.delete_password);

    getBoardIdPromise(req.params.board)
    .then(response => {
        console.log(response)
        return response
    })
    .then(response => {
        if ( !response[0] ) {
            res.send('error: provided board not found')
        } else {
            getSqlData("INSERT INTO threads(text, board_id, pwd_delete) VALUES($1, $2, $3)", [req.body.text, response[0].board_id, req.body.delete_password])
                .then(response => {
                    res.redirect('/b/' + req.params.board + '/');
                })
                .catch(error => {console.log(error)});
        }
    })
    .catch(error => { console.log(error) })

};


const getThread = (req, res) => {
    console.log('getThread called');

    getBoardIdPromise(req.params.board)
    .then(response => {
        if ( !response[0] ) {
            res.send('error: provided board not found')
        } else {
            getSqlData('SELECT * FROM threads WHERE board_id=$1 ORDER BY bumped_on DESC LIMIT 10', [response[0].board_id])
            .then(response => {
                resJson = [];
    
                response.forEach(function(respThread) {
                    resJson.push({
                        _id: respThread.thread_id,
                        text: respThread.text,
                        created_on: respThread.create_date,
                        bumped_on: respThread.bumped_on,
                        replies: [],
                        replycount: 0
                    })
                })
                
                res.send(resJson);
            })
            .catch(error => { console.log(error); });
        }
    })
    .catch(error => { console.log(error) })

    /*
    //add WHERE condition for board get
    //SELECT * FROM threads WHERE board_id=7 ORDER BY bumped_on DESC LIMIT 10;
    //get board_id

        */
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