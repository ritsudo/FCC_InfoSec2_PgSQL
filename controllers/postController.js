const { getSqlData } = require("./sqlController")

function getThreadIdPromise(board_name) {
    let myGetBoardIdPromise = new Promise((resolve, reject) => {
        getSqlData("SELECT * FROM threads WHERE thread_id=$1", [board_name])
        .then(response => {
            resolve(response);
        })
        .catch(error => { reject(error) })
    });

    return myGetBoardIdPromise;
}

const createPost = (req, res) => {
//    console.log("create post called")

    let creationDate = Date.now();

    getSqlData("INSERT INTO posts(text, thread_id, pwd_delete, create_date) VALUES($1, $2, $3, (to_timestamp($4/1000.0)))", [req.body.text, req.body.thread_id, req.body.delete_password, creationDate])
    .then(response => {
        getSqlData("UPDATE threads SET bumped_on=(to_timestamp($1/1000.0)) WHERE thread_id=$2", [creationDate, req.body.thread_id])
            .then(response => {
                res.redirect('/b/' + req.params.board + '/' + req.body.thread_id);
            })
            .catch(error => {console.log(error)});
    })
    .catch(error => {console.log(error)});

};

const getPost = (req, res) => {
    //console.log('getPost called');
    //console.log(req.params.board);
    //console.log(req.query.thread_id);

    getThreadIdPromise(req.query.thread_id)
    .then(response => {
        if ( !response[0] ) {
            res.send('error: provided thread not found')
        } else {
            getSqlData('SELECT * FROM posts WHERE thread_id=$1 ORDER BY create_date DESC', [response[0].thread_id])
            .then(postResponse => {
                
                resJsonPosts = [];
    
                postResponse.forEach(function(respPost) {
                    resJsonPosts.push({
                        _id: respPost.post_id,
                        text: respPost.text,
                        created_on: respPost.create_date,
                    })
                })
                
                res.send({
                    _id: req.query.thread_id,
                    text: response[0].text,
                    created_on: response[0].create_date,
                    bumped_on: response[0].bumped_on,
                    replies: resJsonPosts
                });

            })
            .catch(error => { console.log(error); });
        }
    })
    .catch(error => { console.log(error) })
};

const reportPost = (req, res) => {
    //console.log("# report post called")
    //console.log(req.body.reply_id);

    getSqlData("SELECT post_id FROM posts WHERE post_id=$1", [req.body.reply_id])
    .then(response => {
        if (!response[0]) {
            res.send("post not found")
        } else {
            getSqlData("UPDATE posts SET reported=true WHERE post_id=$1", [req.body.reply_id])
            .then(response => {
                console.log(response);
                res.send("reported")
            })
            .catch(error => {console.log(error)});
        }
    })
    .catch(error => {console.log(error)});
};

const deletePost = (req, res) => {
    //console.log("# delete post called");
    //console.log(req.body.thread_id);
    //console.log(req.body.delete_password);

    getSqlData("SELECT post_id FROM posts WHERE post_id=$1 AND pwd_delete=$2", [req.body.reply_id, req.body.delete_password])
        .then(response => {
            if (!response[0]) {
                res.send("incorrect password")
            } else {
                console.log("post marked as deleted");
                getSqlData("UPDATE posts SET text='[deleted]' WHERE post_id=$1 AND pwd_delete=$2", [req.body.reply_id, req.body.delete_password])
                .then(response => {
                    console.log(response);
                    res.send("success")
                })
                .catch(error => {console.log(error)});
            }
        })
        .catch(error => {console.log(error)});
};

module.exports = {
    createPost,
    getPost,
    reportPost,
    deletePost
};