var   when = require('../../../lib/slite/when')
  , expect = require('chai').expect

describe('when', function() {
  it('provides a function for iterating asynchronously over arrays', function() {
    expect(when.iterator).to.be.a('function');
  });

  describe('iterator', function() {
    it('returns completion methods for registering callbacks for success and failure ', function(){ 
      expect(when.iterator([]).done).to.be.a('function');
      expect(when.iterator([]).aborted).to.be.a('function');
    });

    it('allows the completion methods to be chained', function() {
      expect(when.iterator([]).done().aborted).to.be.a('function');
      expect(when.iterator([]).aborted().done).to.be.a('function');
    });

    it('executes the done callback if each step registers sucess', function(){ 
      when.iterator([1,2,3], function(i, val, step){
        step.done();
      }).done(function() {
        expect(true).to.be.true;
      }).go();
    });

    it('executes the failed callback if a step does not register sucess', function(){ 
      when.iterator([1,2,3], function(i, val, step){
      }).failed(function() {
        expect(true).to.be.true;
      }).go();
    });

    it('executes the aborted callback if a step registers failure', function(){ 
      when.iterator([1,2,3], function(i, val, step){
        step.abort();
      }).aborted(function() {
        expect(true).to.be.true;
      }).go();
    });

    it('passes the error from its 1st arg to the callback', function() {
      when.iterator([1,2,3], function(i, val, step){
        if (i === 2) step.abort('aborted');
      }).aborted(function(err) {
        expect(err).to.eq('aborted');
      }).go();
    });
    it('registers which array index aborted', function(){ 
      when.iterator([1,2,3], function(i, val, step){
        if (i === 2) step.abort();
      }).aborted(function(err, i) {
        expect(i).to.eq(2);
      }).go();
    });

    it('does not call aborted or failed if it called done', function() {
      when.iterator([1,2,3], function(i, val, step){
        step.done();
      }).done(function() {
        expect(true).to.be.true;
      }).failed(function() {
        expect(true).to.be.false;
      }).aborted(function() {
        expect(true).to.be.false;
      }).go();
    });

    it('does not call done or failed if it called aborted', function() {
      when.iterator([1,2,3], function(i, val, step){
        step.abort();
      }).done(function() {
        expect(true).to.be.false;
      }).failed(function() {
        expect(true).to.be.false;
      }).aborted(function() {
        expect(true).to.be.true;
      }).go();
    });

    it('does not call done or aborted if it called failed', function() {
      when.iterator([1,2,3], function(i, val, step){
      }).done(function() {
        expect(true).to.be.false;
      }).failed(function() {
        expect(true).to.be.true;
      }).aborted(function() {
        expect(true).to.be.false;
      }).go();
    });
  });
});
