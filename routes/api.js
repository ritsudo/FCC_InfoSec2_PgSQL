'use strict';

const {
  createThread,
  getThread,
  reportThread,
  deleteThread
} = require ("../controllers/threadController");

const {
  createPost,
  getPost,
  reportPost,
  deletePost
} = require ("../controllers/postController");

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get(getThread)
    .post(createThread)
    .put(reportThread)
    .delete(deleteThread);
    
  app.route('/api/replies/:board')
    .get(getPost)
    .post(createPost)
    .put(reportPost)
    .delete(deletePost);   

};
