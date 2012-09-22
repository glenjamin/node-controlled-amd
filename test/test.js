var path = require('path');
var expect = require('chai').expect;

var amd = require('../index');

var fixtures = path.resolve(__dirname, 'modules');

describe("amd.require", function() {
  var window;
  beforeEach(function() {
    amd._reset();
    window = {};
  })

  it('should allow setting of root', function() {
    expect(amd).to.respondTo('root');
    amd.root('/a/path/somewhere');
  })

  describe('module root not defined', function() {
    it("should blow up on module loading", function() {
      expect(function() {
        amd.require(window, 'simple');
      }).to.throw(/not defined/)
    })
  })

  describe('module root defined', function() {
    beforeEach(function() { amd.root(fixtures); })

    it("should load an AMD module", function() {
      var module = amd.require(window, 'simple');
      expect(module.simple).to.be.a('function');
    })

    it('should evalulate in the passed window context', function() {
      window.global_variable = 7;
      var module = amd.require(window, 'window');
      expect(module.read_from_global).to.equal(7);
    })

    it('should load dependencies', function() {
      var module = amd.require(window, 'dependants');
      expect(module.simple.simple).to.be.a('function');
    })

    it('should load deep dependencies', function() {
      var module = amd.require(window, 'deep');
      expect(module.simple.simple).to.be.a('function');
    })

    it('should support setting up stubs before call', function() {
      var jQuery = function(){};
      amd.stub('jquery', jQuery);
      var module = amd.require(window, 'view');
      expect(module.jQuery).to.equal(jQuery);
    })

    it('should allow stubbing of dependencies', function() {
      var stubs = { 'simple': { 'simple' : 1 } };
      var module = amd.require(window, stubs, 'deep');
      expect(module.simple.simple).to.equal(1);
    })

    it('should prefer passed stubs over presets', function() {
      amd.stub('jquery', 'jQ one');
      var module = amd.require(window, {'jquery': 'jQ two'}, 'view');
      expect(module.jQuery).to.equal('jQ two');
    })

    it('should support setting aliases', function() {
      amd.alias('jquery', 'fake-jQuery');
      var module = amd.require(window, 'view');
      expect(module.jQuery).to.equal('here be jQuery');
    })

    it('should allow shims on non-AMD modules', function() {
      amd.shim('legacy', 'legacy.deep.variable');
      var module = amd.require(window, 'legacy-dependency');
      expect(module.legacy).to.equal('this worked');
    })
  })
})
