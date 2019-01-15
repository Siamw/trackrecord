process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const passportStub = require('passport-stub');

const server = require('../../src/server/app');
const knex = require('../../src/server/db/connection');

chai.use(chaiHttp);
passportStub.install(server);

describe('routes : artist', () => {
    
      beforeEach(() => {
        return knex.migrate.rollback()
      });
    
      afterEach(() => {
        passportStub.logout();
        return knex.migrate.rollback();
      });
  
      describe('POST /artist', () => {
        it('should register a new artist', (done) => {
          passportStub.login({
            username: 'user3',
            password: 'user3'
          });
          chai.request(server)
          .post('/artist')
          .send({
            genres: [1,2,3],
            website: "http://website.com",
            name: "test1",
            contactEmail: "email@gmial.com", 
            phoneNumber: "9492919473", 
            assets: [1,2,3],    
            twitter: "http://twitter.com", 
            instagram: "http://instagram.com", 
            payrate: [1000, 3000], 
            noticeTerm: "req.body.noticeTerm", 
            dayAndNightTerm: "req.body.noticeTerm"
          })
          .end((err, res) => {
            should.not.exist(err);
            res.status.should.eql(200);
            res.type.should.eql('application/json');
            res.body.status.should.eql('success');
            done();
          });
        });
      });

      
    
  });