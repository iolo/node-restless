var sys = require('sys');
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var restserver = require('./restserver');
var lang = require('./lang');

var TaskResource = Class({
  path: /\/task/,

  tasks: ['first task', 'second task', 'third task'],

  init: function() {
    sys.puts('TaskResource init');
  },

  doGet: function(req, res) {
    var reqUrl = url.parse(req.url, true);
    var i = (reqUrl.query) ? reqUrl.query['i'] : null;
    sys.puts('get task: i=' + i);
    res.writeHead(200, {'Content-Type': 'text/plain'} );
    if (i) {
      res.write(this.tasks[i]);
    } else {
      this.tasks.forEach(function(task) {
        res.write(task + '\n');
      });
    }
    res.end();
  },

  doPost: function(req, res) {
    var _this = this;
    req.addListener('data', function(chunk) {
      sys.puts('post task: chunk=' + chunk);
      var task = querystring.parse(chunk + '')['task'];
      sys.puts('post task: task=' + task);
      if (task) {
        _this.tasks.push(task);
        res.writeHead(200, {'Content-Type': 'text/plain'});
      } else {
        res.writeHead(500, {'Content-Type': 'text/plain'});
      }
      res.end();
    });
  },

  doDelete: function(req, res) {
    var reqUrl = url.parse(req.url, true);
    var i = (reqUrl.query) ? reqUrl.query['i'] : null;
    sys.puts('delete task: i=' + i);
    var resHeaders = {'Content-Type': 'text/plain'};
    if (i) {
      this.tasks.splice(i, 1);
      res.writeHead(200, {'Content-Type': 'text/plain'});
    } else {
      this.tasks = [];
      res.writeHead(500, {'Content-Type': 'text/plain'});
    }
    res.end();
  },

  _version: 1
});

var host = 'localhost';
var port = 8888;
var resources = [
  new restserver.StaticResource('./www'),
  new TaskResource()
];
var server = new restserver.RestServer(host, port, resources);

server.start();

sys.puts('server running at http://' + host + ':' + port);

