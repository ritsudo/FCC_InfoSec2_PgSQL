const { getSqlData } = require("./sqlController")

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

function getRepliesDigest(thread_id) {
    getSqlData('SELECT * FROM posts WHERE thread_id=$1 ORDER BY create_date DESC LIMIT 3', [thread_id])
    .then(postResponse => {
        
        resJsonPosts = [];

        postResponse.forEach(function(respPost) {
            resJsonPosts.push({
                _id: respPost.post_id,
                text: respPost.text,
                created_on: respPost.create_date,
            })
        })
        
        resolve(resJsonPosts);
    })
    .catch(error => { console.log(error); reject(error); });
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
};

const reportThread = (req, res) => {
    console.log(req.body.thread_id);

    getSqlData("SELECT thread_id FROM threads WHERE thread_id=$1", [req.body.thread_id])
    .then(response => {
        if (!response[0]) {
            res.send("thread not found")
        } else {
            getSqlData("UPDATE threads SET reported=true WHERE thread_id=$1", [req.body.thread_id])
            .then(response => {
                console.log(response);
                res.send("reported")
            })
            .catch(error => {console.log(error)});
        }
    })
    .catch(error => {console.log(error)});

};

const deleteThread = (req, res) => {
    console.log(req.body.thread_id);
    console.log(req.body.delete_password);

    getSqlData("SELECT thread_id FROM threads WHERE thread_id=$1 AND pwd_delete=$2", [req.body.thread_id, req.body.delete_password])
        .then(response => {
            if (!response[0]) {
                res.send("incorrect password")
            } else {
                getSqlData("DELETE FROM posts WHERE thread_id=$1", [req.body.thread_id])
                .then(response => {
                    console.log(response);
                    getSqlData("DELETE FROM threads WHERE thread_id=$1 AND pwd_delete=$2", [req.body.thread_id, req.body.delete_password])
                    .then(response => {
                        console.log(response);
                        res.send("success")
                    })
                    .catch(error => {console.log(error)});   
                })
                .catch(error => {console.log(error)});

            }
        })
        .catch(error => {console.log(error)});

};

module.exports = {
    createThread,
    getThread,
    reportThread,
    deleteThread
};