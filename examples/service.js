
// Load modules

var Path = require('path');
var Snap = require('snap');

var Restler = require('restler');

var handler = function(config) {

    return function(callback) {

        for (var name in this.errors) {
            return callback('aborted');
        }

        var request = Restler.request(config.url,{});
        request.on('complete',function(response) {
            setTimeout(function() { callback(); },config.delay);
        });

    };

};

var main = function() {

    var server = new Snap.Server('localhost',8080,{});
    server.start();

    server.on('started',function() {

        var dagger = new Snap.Dagger();

        dagger.register('1', handler({ url:'http://localhost:8080/examples/service.json', delay:1000}),[]);
        dagger.register('2', handler({ url:'http://localhost:8080/examples/service.json', delay:1000}),[]);

        dagger.register('3', handler({ url:'http://localhost:8080/examples/service.json', delay:1000}),[]);
        dagger.register('4', handler({ url:'http://localhost:8080/examples/service.json', delay:1000}),['1']);
        dagger.register('5', handler({ url:'http://localhost:8080/examples/service.json', delay:1000}),['1','2','3']);
        dagger.register('6', handler({ url:'http://localhost:8080/examples/service.json', delay:1000}),['3','4']);
        dagger.register('7', handler({ url:'http://localhost:8080/examples/service.json', delay:1000}),['5','6']);
        dagger.register('8', handler({ url:'http://localhost:8080/examples/service.json', delay:1000}),['5']);

        dagger.on('started',function(task) {
            console.log('started ' + task.name);
        });

        dagger.on('stopped',function(task) {
            console.log('stopped ' + task.name + ' elapsed ' + task.elapsed + (task.error?(' error ' + task.error):''));
        });

        dagger.on('complete',function() {
            console.log('complete ' + this.elapsed);
        });

        dagger.execute(function() {
            server.stop();
        });

    });

};

main();
