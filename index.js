/*
 * Primary file for the API
 * 
 */

var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// instantiating the HTTP server
var httpServer = http.createServer(function(req, res){
  unifiedServer(req, res);
});

// starting the HTTP server
httpServer.listen(config.httpPort, function() {
  console.log('listening to port '+ config.httpPort + ' '+ ' in ' + config.envName);
});

// instantiating the HTTPS server
var httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer( httpsServerOptions, function(req, res){
  unifiedServer(req, res);
});

// starting the HTTPS server
httpsServer.listen(config.httpsPort, function() {
  console.log('listening to port '+ config.httpsPort + ' '+ ' in ' + config.envName);
});

var unifiedServer = function(req, res) {
  var parsedUrl = url.parse(req.url, true);
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+s/g, '');
  var queryStringObject = parsedUrl.query;
  var method = req.method.toLocaleLowerCase();
  var headers = req.headers;
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  // check if theres a data and decode it
  // put it inside the buffer
  req.on('data', function(data){
    buffer += decoder.write(data);
  });

  // this will be called every request
  // close or end the decoder writes
  req.on('end', function() {
    buffer += decoder.end();
    // check if router path exists
    var choosendHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    var data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer
    }

    choosendHandler(data, function(statusCode, payload){
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      payload = typeof(payload) === 'object' ? payload : {};
      var payloadString = JSON.stringify(payload);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log('request recieved', trimmedPath);
      console.log('request method', method);
      console.log('query striing', queryStringObject);
      console.log('request headers', headers);
      console.log('payload', payloadString);
    });
    
  });
};

var handlers = {};

handlers.hello = function(data, callback) {
callback(406, {message: 'Hello World'});
};

handlers.ping = function(data, callback) {
  callback(200);
};

handlers.notFound = function(data, callback) {
callback(404);
};

var router = {
  'ping': handlers.ping,
  'hello': handlers.hello
}