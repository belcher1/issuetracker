const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let delete_id;

suite('Functional Tests', function() {
    //#1
    test('Create an issue with every field', function (done) {
        chai
            .request(server)
            .post('/api/issues/apitest')
            .set('content-type', 'application/json')
            .send({
            issue_title: 'Test',
            issue_text: 'This is a test',
            created_by: 'Andrew',
            assigned_to: 'James',
            status_text: 'To be completed'
            })
            .end(function (err, res) {
            delete_id = res.body._id;
            assert.equal(res.body.issue_title, 'Test');
            assert.equal(res.body.issue_text, 'This is a test');
            assert.equal(res.body.created_by, 'Andrew');
            assert.equal(res.body.assigned_to, 'James');
            assert.equal(res.body.status_text, 'To be completed');
            done();
            });
    });
    //#2
    test('Create an issue with only required fields', function (done) {
        chai
          .request(server)
          .post('/api/issues/apitest')
          .set('content-type', 'application/json')
          .send({
            issue_title: 'Test2',
            issue_text: 'The second test',
            created_by: 'Andrew'
          })
          .end(function (err, res) {
            assert.equal(res.body.issue_title, 'Test2');
            assert.equal(res.body.issue_text, 'The second test');
            assert.equal(res.body.created_by, 'Andrew');
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            done();
          });
    });
    //#3
    test('Create an issue with missing required fields', function (done) {
        chai
            .request(server)
            .post('/api/issues/apitest')
            .set('content-type', 'application/json')
            .send({
            
            })
            .end(function (err, res) {
            assert.equal(res.body.error, 'required field(s) missing');
            done();
            });
    });
    //#4
    test('View issues on a project', function (done) {
        chai
          .request(server)
          .get('/api/issues/andrew')
          .end(function (err, res) {
            assert.equal(res.body.length, 4);
            done();
          });
    });
    //#5
    test('View issues on a project with one filter', function (done) {
        chai
          .request(server)
          .get('/api/issues/andrew?_id=62434660dc3230de80501b40')
          .end(function (err, res) {
            assert.equal(res.body[0].issue_title, '3');
            done();
          });
    });
    //#6
    test('View issues on a project with multiple filters', function (done) {
        chai
          .request(server)
          .get('/api/issues/andrew?issue_title=3&issue_text=4')
          .end(function (err, res) {
            assert.equal(res.body[0].created_by, '5');
            done();
          });
    });
    //#7
    test('Update one field on an issue', function (done) {
        chai
          .request(server)
          .put('/api/issues/belcher')
          .send({
            _id: '6243493cf6ee461909663309',
            issue_title: 'Test7',
          })
          .end(function (err, res) {
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, '6243493cf6ee461909663309');
            done();
          });
    });
    //#8
    test('Update multiple fields on an issue', function (done) {
        chai
          .request(server)
          .put('/api/issues/belcher')
          .send({
            _id: '6243493cf6ee461909663309',
            issue_title: 'Test8',
            issue_text: 'Test8'
          })
          .end(function (err, res) {
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, '6243493cf6ee461909663309');
            done();
          });
    }); 
    //#9
    test('Update an issue with missing _id', function (done) {
        chai
          .request(server)
          .put('/api/issues/belcher')
          .send({
            issue_title: 'Test9'
          })
          .end(function (err, res) {
            assert.equal(res.body.error, 'missing _id');
            done();
          });
    });
    //#10
    test('Update an issue with no fields to update', function (done) {
        chai
          .request(server)
          .put('/api/issues/belcher')
          .send({
            _id: '6243493cf6ee461909663309'
          })
          .end(function (err, res) {
            assert.equal(res.body.error, 'no update field(s) sent');
            assert.equal(res.body._id, '6243493cf6ee461909663309');
            done();
          });
    });
    //#11
    test('Update an issue with invalid _id', function (done) {
        chai
          .request(server)
          .put('/api/issues/belcher')
          .send({
            _id: '123',
            issue_title: '123'
          })
          .end(function (err, res) {
            assert.equal(res.body.error, 'could not update');
            assert.equal(res.body._id, '123');
            done();
          });
    });
    //#12
    test('Delete an issue', function (done) {
        chai
            .request(server)
            .delete('/api/issues/apitest')
            .set('content-type', 'application/json')
            .send({
                _id: delete_id
            })
            .end(function (err, res) {
                assert.equal(res.body.result, 'successfully deleted');
                assert.equal(res.body._id, delete_id);
                done();
            });
    });
    //#13
    test('Delete an issue with invalid _id', function (done) {
        chai
            .request(server)
            .delete('/api/issues/apitest')
            .send({
                _id: '123'
            })
            .end(function (err, res) {
                assert.equal(res.body.error, 'could not delete');
                assert.equal(res.body._id, '123');
                done();
            });
    });
    //#14
    test('Delete an issue with missing _id', function (done) {
        chai
            .request(server)
            .delete('/api/issues/apitest')
            .send({

            })
            .end(function (err, res) {
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });
});
