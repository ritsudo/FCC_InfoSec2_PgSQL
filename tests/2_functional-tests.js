const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    let testThreadName = "TestThreadText" + Date.now();
    let testPostName = "TestPostText" + Date.now();
    let testThreadId, testPostId = 0;
	
	suite("Create and get thread tests", function() {
		test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
            chai
            .request(server)
            .post("/api/threads/general")
            .send({
                text: testThreadName,
                delete_password: "qwerty"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                done();
            });
		});
		
        test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function (done) {
            chai
            .request(server)
            .get("/api/threads/general")
            .end(function (err,res) {
                assert.equal(res.status, 200);
                let result = res.body.filter(obj => {
                    return obj.text === testThreadName
                });
                assert.notEqual(result, null);
                testThreadId = result[0]._id;
                console.log("# Created test thread with id: " + testThreadId);
                done();
            });
		});
		
	});

	suite("Create ang get replies tests", function() {

        test("Creating a new reply: POST request to /api/replies/{board}", function (done) {
            chai
            .request(server)
            .post("/api/replies/general")
            .send({
                thread_id: testThreadId,
                text: testPostName,
                delete_password: "qwerty"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                done();
            });
		});
		
		test("Viewing a single thread with all replies: GET request to /api/replies/{board}", function (done) {
            chai
            .request(server)
            .get("/api/replies/general?thread_id="+testThreadId)
            .end(function (err,res) {
                assert.equal(res.status, 200);
                let result = res.body.replies.filter(obj => {
                    return obj.text === testPostName
                });
                assert.notEqual(result, null);
                testPostId = result[0]._id;
                console.log("# Created test post with id: " + testPostId);
                done();
            });
		});
	});

	suite("Report tests", function() {
		test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
            chai
            .request(server)
            .put("/api/threads/general")
            .send({
                board: "general",
                thread_id: testThreadId,
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "reported");
                done();
            });
		});
		
		test("Reporting a reply: PUT request to /api/replies/{board}", function (done) {
            chai
            .request(server)
            .put("/api/replies/general")
            .send({
                board: "general",
                thread_id: testThreadId,
                reply_id: testPostId
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "reported");
                done();
            });
		});
		
	});
	suite("Delete tests", function() {
        test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", function (done) {
            chai
            .request(server)
            .delete("/api/replies/general")
            .send({
                thread_id: testThreadId,
                reply_id: testThreadId,
                delete_password: "qwertz"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "incorrect password");
                done();
            });
		});

        test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", function (done) {
            chai
            .request(server)
            .delete("/api/replies/general")
            .send({
                thread_id: testThreadId,
                reply_id: testPostId,
                delete_password: "qwerty"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "success");
                done();
            });
		});

        test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", function (done) {
            chai
            .request(server)
            .delete("/api/threads/general")
            .send({
                thread_id: testThreadId,
                delete_password: "qwertz"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "incorrect password");
                done();
            });
		});

        test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", function (done) {
            chai
            .request(server)
            .delete("/api/threads/general")
            .send({
                thread_id: testThreadId,
                delete_password: "qwerty"
            })
            .end(function(err,res){
                assert.equal(res.status, 200);
                assert.equal(res.text, "success");
                done();
            });
		});
    });
});
