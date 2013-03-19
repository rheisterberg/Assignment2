
var Events = require('events');

var Util = require('./util');

var Dagger = module.exports = function() {
    this.queued = 0;
    this.tasks = {};
};

Util.inherits(Dagger,Events.EventEmitter);
Util.extend(Dagger.prototype,{

    prefix : function(tasks,prefix) {
        var prefixed = [];
        for (var idx in tasks) prefixed.push(prefix.concat(tasks[idx]));
        return prefixed;
    },

    register : function(name,func,tasks,timeout) {
        this.tasks[name] = {parent:this,name:name,func:func,pred:tasks?tasks:[],succ:{},errors:{},timeout:timeout?timeout:15000};
    },
    
    validate : function(callback) {

        this.callback = callback;
        this.started = new Date().getTime();

        for (var name in this.tasks) {

            this.queued++;

            var task = this.tasks[name],pred = task.pred;
            task.pred = {};task.remaining = pred.length;

            for (var idx = 0,key;(key = pred[idx]);++idx) {
                task.pred[key] = this.tasks[key];
                this.tasks[key].succ[name] = task;
            }
            
        }

    },
    
    submit : function() {
    
        this.queue = {};

        for (var name in this.tasks) {
            var task = this.tasks[name];
            if (!task.started && (task.remaining == 0)) {
                this.start(name);
            }
        }
        
    },
    
    execute : function(callback) {
        this.validate(callback);
        this.submit();
    },
    
    complete : function() {

        this.elapsed = new Date().getTime() - this.started;
        if (this.callback) this.callback.call(this);

        this.emit('complete');

    },

    start : function(name) {

        var task = this.tasks[name];
        task.started = new Date().getTime() - this.started;

        this.queue[name] = task;
        this.emit('started',task);

        //task.timer = setTimeout(this.stop.bind(this,name,'timeout'),task.timeout);
        task.func.call(task,this.stop.bind(this,name));

    },

    stop : function(name,error) {

        var task = this.tasks[name];
        if (task.elapsed) return;

        task.error = error;
        task.elapsed = new Date().getTime() - (this.started + task.started);

        clearTimeout(task.timer);

        this.emit('stopped',task);

        delete task.timer;
        delete this.queue[name];

        for (var key in task.succ) {
            var succ = this.tasks[key];succ.remaining--;
            if (error) succ.errors[name] = task;
        }

        if (--this.queued) this.submit();
        else this.complete();

    }
  
});
