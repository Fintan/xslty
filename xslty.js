var fs = require('fs');
var system = require('system');
var page = require('webpage').create();

var xml;
var xslt;
var params;

window.__dirname = phantom.libraryPath;
window.__filename = phantom.libraryPath + "/" + phantom.scriptName;

if (system.args.length < 3) {
  console.log("Usage: xslty.js SOURCE_XML XSLT_FILE");
  phantom.exit(1);
} else {
  xml = fs.read(system.args[1]);
  xslt = fs.read(system.args[2]);
  if(system.args[3]) {
    params = JSON.parse(fs.read(system.args[3]));
  }
}

var url = "file://" + __dirname + '/index.html?';

page.onConsoleMessage = function(msg) { console.error(msg); };

page.open(url, function(status) {
  setTimeout(function() {
    var doc = page.evaluate(function(_xml, _xslt, _params) {
      var result = Saxon.run({
        source: Saxon.parseXML(_xml),
        logLevel: "SEVERE",
        stylesheet: Saxon.parseXML(_xslt),
        parameters: _params
      }).getResultDocument();

      return Saxon.serializeXML(result);
    }, xml, xslt, params);

    var body = page.evaluate(function() {
        return document.body.innerHTML;
    });

    var rgx = /(<iframe(?: \w+="[^"]+")* id="Saxonce"(?: \w+="[^"]+")*>([^<]*)<\/iframe>)/g;
    
    var body = body.replace(rgx, '');
    console.log(body);

    phantom.exit(0);
  });
});
