var path = require('path');
var vm = require('vm');
var fs = require('fs');

var amd_root, amd_stubs, amd_aliases, amd_shims;

/**
 * Clear any stored state
 *
 * probably only useful for testing
 */
exports._reset = function() {
  amd_root = null;
  amd_stubs = {};
  amd_aliases = {};
  amd_shims = {};
}
exports._reset();

exports.root = function(root) {
  amd_root = root;
}

exports.stub = function(name, value) {
  amd_stubs[name] = value;
}

exports.alias = function(name, other_name) {
  amd_aliases[name] = other_name;
}

exports.shim = function(name, lookup) {
  var props = lookup.split('.'), l = props.length;
  amd_shims[name] = function(scope) {
    var retval = scope;
    for (var i = 0; i < l; ++i) {
      retval = retval[props[i]];
    }
    return retval;
  }
}

exports.require = function(window, stubs, name) {
  if (name === undefined) {
    name = stubs;
    stubs = {};
  }

  if (!amd_root) {
    throw new Error('module root not defined, set with amd.root("/directory")');
  }

  var defined_module, loaded;

  window.define = function() {
    var id, deps, factory;
    // (factory)
    if (arguments.length == 1) {
      id = name, deps = [], factory = arguments[0]
    // (deps, factory)
    } else if (arguments.length == 2) {
      id = name, deps = arguments[0], factory = arguments[1]
    // (id, deps, factory)
    } else {
      id = arguments[0], deps = arguments[1], factory = arguments[2]
    }
    loaded = deps.map(function(dep_name) {
      if (amd_aliases[dep_name]) {
        dep_name = amd_aliases[dep_name];
      }
      if (stubs[dep_name]) {
        return stubs[dep_name];
      } else if (amd_stubs[dep_name]) {
        return amd_stubs[dep_name];
      } else {
        if (dep_name == 'legacy') debugger;
        return exports.require(window, stubs, dep_name);
      }
    })
    if ('function' === typeof(factory)) {
      defined_module = factory.apply(null, loaded)
    } else {
      defined_module = factory;
    }
    stubs[name] = defined_module;
  }
  window.define.amd = {}

  var filename = path.resolve(amd_root, name + '.js');
  try {
    var contents = fs.readFileSync(filename);
    vm.runInNewContext(contents, window, filename);
    if (amd_shims[name]) {
      defined_module = amd_shims[name](window);
    }
  } catch (ex) {
    ex.message = 'Failed to load module ' + name + ': ' + ex.message;
    throw ex;
  }

  return defined_module;
}
