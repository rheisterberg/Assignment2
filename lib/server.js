
//Load modules

var Path = require('path');

var Http = require('http');
var Https = require('https');

var Events = require('events');

var Routes = require('./routes');
var Util = require('./util');

var root = Path.join(Path.resolve(__dirname),'../');
var icon = Path.join(root,'/favicon.ico');

var Server = module.exports = function(host,port,options) {
    
    var self = this;

    self.routes = [];

    self.config = {host:host,port:port,options:options};
    
    self.config.host = host?host.toLowerCase():'0.0.0.0';
    self.config.port = (typeof port !== 'undefined')?port:(self.config.tls?443:80);

    self.listener = Http.createServer(self.dispatch.bind(self));

};

Util.inherits(Server,Events.EventEmitter);
Util.extend(Server.prototype, {

    start : function(callback) {
        
        var self = this;

        self.listener.once('listening',function() {

            // Update config with actual bindings
            var address = self.listener.address();

            self.config.port = address.port;
            self.config.host = self.config.host || address.address;

            self.config.uri = (self.config.tls ? 'https://' : 'http://') + self.config.host + ':' + self.config.port;

            console.log('server started on ' + self.config.host + ":" + self.config.port);
            self.emit('started');

            return (callback || function(){})();
            
        });

        self.listener.listen(self.config.port,self.config.host);

        self.register(new Routes.File({root:icon,path:'/favicon.ico'}));
        self.register(new Routes.File({root:root,path:'/',browse:true}));

    },
    
    stop : function() {
        console.log('server stopped');
        this.listener.close();
        this.emit('stopped');
    },
    
    register : function(route) {
        this.routes.push(route);
    },
    
    dispatch : function(request,response,options) {

        var routes = this.routes;

        console.log('request ' + request.url);

        for (var idx = 0,len = routes.length;(idx < len);++idx) {
          var handler = routes[idx].handler(request);
          if (handler) return handler.handle({server:this,request:request,response:response});
        }

        response.end();
        
    }

});
