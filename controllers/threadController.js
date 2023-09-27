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

const createThread = (req, res) => {
//    console.log(req.params.board);
//    console.log(req.body.text);
//    console.log(req.body.delete_password);

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
//    console.log('getThread called');

    getBoardIdPromise(req.params.board)
    .then(response => {
        if ( !response[0] ) {
            res.send('error: provided board not found')
        } else {
            //TODO ADD COUNT(*) as count, optimize query
            getSqlData("SELECT * FROM threads FULL JOIN (SELECT thread_id thr_post_id, array_agg(post_data order by thread_id) AS recent_posts FROM (SELECT thread_id, concat_ws('& ', post_id, post_text, post_created_on) AS post_data FROM threads LEFT JOIN LATERAL (SELECT post_id, text post_text, create_date post_created_on FROM posts WHERE posts.thread_id = threads.thread_id ORDER BY create_date DESC LIMIT 3) ON TRUE) GROUP BY thread_id) ON threads.thread_id = thr_post_id WHERE board_id=$1 ORDER BY bumped_on DESC LIMIT 10", [response[0].board_id])
            .then(threadsResponse => {

                resJson = [];
    
                threadsResponse.forEach(function(respThread) {
                    
                    let replies = [];

//                    console.log(respThread.recent_posts);

                    if ( respThread.recent_posts[0] != '') {
                        respThread.recent_posts.forEach(function(reply) {
                            replies.push({
                                _id: reply.split('& ')[0],
                                text: reply.split('& ')[1],
                                created_on: reply.split('& ')[2]
                            })
                        })
                    }

                    resJson.push({
                        _id: respThread.thread_id,
                        text: respThread.text,
                        created_on: respThread.create_date,
                        bumped_on: respThread.bumped_on,
                        replies: replies,
                        replycount: replies.length
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
 //   console.log(req.body.thread_id);

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
//    console.log(req.body.thread_id);
//    console.log(req.body.delete_password);

    getSqlData("SELECT thread_id FROM threads WHERE thread_id=$1 AND pwd_delete=$2", [req.body.thread_id, req.body.delete_password])
        .then(response => {
            if (!response[0]) {
                res.send("incorrect password")
            } else {
                getSqlData("DELETE FROM posts WHERE thread_id=$1", [req.body.thread_id])
                .then(response => {
//                    console.log(response);
                    console.log("thread deleted");
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