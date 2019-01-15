process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const passportStub = require('passport-stub');

const server = require('../../src/server/app');
const knex = require('../../src/server/db/connection');

chai.use(chaiHttp);
passportStub.install(server);

describe('routes : auth', () => {
    
      beforeEach(() => {

      });
    
      afterEach(() => {
        passportStub.logout();
      });
  
      describe('POST /auth/register', () => {
        it('should register a new user', (done) => {
          chai.request(server)
          .post('/auth/register')
          .send({
            username: 'user5',
            password: 'user5',
            roleID: 1,
            email: "jhyunkim0914@gmail.com"
          })
          .end((err, res) => {
            should.not.exist(err);
            res.redirects.length.should.eql(0);
            res.status.should.eql(200);
            res.type.should.eql('application/json');
            res.body.status.should.eql('success');
            done();
          });
        });
      });
  
      describe('POST /auth/login', () => {
        it('should login a user', (done) => {
          chai.request(server)
          .post('/auth/login')
          .send({
            username: 'jeremy',
            password: 'johnson123'
          })
          .end((err, res) => {
            should.not.exist(err);
            res.redirects.length.should.eql(0);
            res.status.should.eql(200);
            res.type.should.eql('application/json');
            res.body.status.should.eql('success');
            done();
          });
        });
  
        it('should not login an unregistered user', (done) => {
          chai.request(server)
          .post('/auth/login')
          .send({
            username: 'michael',
            password: 'johnson123'
          })
          .end((err, res) => {
            should.exist(err);
            res.redirects.length.should.eql(0);
            res.status.should.eql(404);
            res.type.should.eql('application/json');
            res.body.status.should.eql('User not found');
            done();
          });
        });
      });
  
      describe('GET /auth/logout', () => {
        it('should logout a user', (done) => {
          passportStub.login({
            username: 'jeremy',
            password: 'johnson123'
          });
          chai.request(server)
          .get('/auth/logout')
          .end((err, res) => {
            should.not.exist(err);
            res.redirects.length.should.eql(0);
            res.status.should.eql(200);
            res.type.should.eql('application/json');
            res.body.status.should.eql('success');
            done();
          });
        });

        it('should throw an error if a user is not logged in', (done) => {
            chai.request(server)
            .get('/auth/logout')
            .end((err, res) => {
              should.exist(err);
              res.redirects.length.should.eql(0);
              res.status.should.eql(401);
              res.type.should.eql('application/json');
              res.body.status.should.eql('Please log in');
              done();
            });
          });
      });
    
  });