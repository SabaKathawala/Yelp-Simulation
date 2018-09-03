/**
 * Simple Test Runner that can be used to run mocha unit tests with webstorm's debugger
 *
 * See: http://wuntusk.blogspot.com/2012/06/using-webstorm-or-phpstorm-and-mocha.html
 *
 * @author: Blake Robertson
 */

var Mocha = require('mocha');
var mocha = new Mocha();

var argv = require('optimist').argv;
if( argv.test ) {
    var testFiles = [ argv.test ];
}

mocha.reporter('list').ui('bdd');

for (var i =0;i<testFiles.length;i++) {
    mocha.addFile(testFiles[i]);
}

mocha.run(function(){
    "use strict";
    console.info('finished');
});