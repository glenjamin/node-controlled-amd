node-controlled-amd
===================

An AMD loader for NodeJS that keeps you in control by using minimal magic.

Aimed primarily at loading frontend modules for unit testing, with the intention
of giving the caller control of what actually gets loaded.

Usage
-----

    amd.root('path/to/module/root');
    var window = {};
    // Will load 'path/to/module/root/module.js' using `window` as the context
    var m = amd.require(window, 'module');

