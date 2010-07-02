var sys = require('sys');
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var lang = require('./lang');

exports.StaticResource = Class({
  path: /\/[^\.]+\.html/,

  baseDir: '.',

  init: function(baseDir) {
    sys.puts('StaticResourc init: baseDir=' + baseDir);
    this.baseDir = baseDir;
  },

  doGet: function(req, res) {
    var reqUrl = url.parse(req.url);
    var path = this.baseDir + reqUrl.pathname;
    sys.puts('http get: path=' + path);
    fs.readFile(path, function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('path:' + path + ',error:' + err);
        return;
      }
      sys.puts('http get: length=' + data.length);
      res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length});
      res.end(data);
    });
  },

  _version: 1
});

exports.RestServer = Class({
  host: null,
  port: null,
  resources: [],
  httpServer: null,

  init: function(host, port, resources) {
    this.host = host;
    this.port = port;
    this.resources = resources;
    this.httpServer = http.createServer(lang.hitch(this, '_onServerRequest'));
  },

  start: function() {
    this.httpServer.listen(this.port, this.host);
  },

  stop: function() {
    this.httpServer.close();
  },

  _onServerRequest: function(req, res) {
    var resource = this.findResource(req);
    var processed = false;
    if (resource) {
      processed = this.processRequest(resource, req, res);
    }
    if (!processed) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('no matching resources!\n')
    }
  },

  findResource: function(req) {
    var reqUrl = url.parse(req.url);
    sys.puts('find resource for request: url=' + req.url + ',pathname=' + reqUrl.pathname);
    for (var i = 0; i < this.resources.length; i++) {
       if (this.resources[i].path.test(reqUrl.pathname)) { return this.resources[i]; }
    }
    return null;
  },

  processRequest: function(resource, req, res) {
    sys.puts('process request: method=' + req.method + ',resource=' + resource.constructor.name);
    switch(req.method) {
    case 'GET': resource.doGet(req, res); break;
    case 'POST': resource.doPost(req, res); break;
    case 'DELETE': resource.doDelete(req, res); break;
    case 'PUT': resource.doPut(req, res); break;
    default:
      sys.puts('unsupported method: ' + req.method);
      return false;
    }
    return true;
  },

  _vesion: 1
});

