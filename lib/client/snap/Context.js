
define('snap.Context',function(snap) {

    var TYPE = 0,EID = 1,CONFIG = 2,CHILDREN = 3;

    var Context = function() {};
    snap.extend(Context.prototype,{

        process : function(type) {

            var self = this,global = self.global,queue = global.queue,current;
            queue.parent = queue.current;queue.push(current = queue.current = [type.getName(),0,0,0]);

            type.template(self.current(),self);

            if (queue.parent || (!current[CONFIG])) queue.pop();
            queue.current = queue.parent;queue.parent = queue[queue.length - 2];

            return global.chunk;

        },

        render : function(template,helpers) {

            var self = this,global = self.global;
            var queue = global.queue,current = queue.current;
            if (helpers) snap.extend(self.global,helpers);

            var config = self.current();current[EID] = config.eid = config.eid || snap.eid();
            if (!document.getElementById(config.eid)) return global.chunk.partial(template?template:current[TYPE],self);

            var nodes = config.children || [],widget = global.widget,chk = global.chunk;
            for (var idx = 0,node;(node = nodes[idx]);idx++) widget(chk,self.rebase(node));

        },

        queue : function(config) {
            var self = this,global = self.global,queue = global.queue,current = queue.current,parent = queue.parent;
            if ((current[CONFIG] = config || self.current()) && parent) (parent[CHILDREN] || (parent[CHILDREN] = [])).push(current);
            delete current[CONFIG].eid;
        }

    });

    var context = dust.makeBase({});
    snap.extend(context.constructor.prototype,Context.prototype);

    return Context;

});



