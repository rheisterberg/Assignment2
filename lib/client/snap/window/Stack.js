
define('snap.window.Stack',function(snap) {

    //> public Stack(Object? config)
    var Stack = function(config) {
        var self = this;self.windows = [];
        Stack.superclass.constructor.call(self,config);
    };

    snap.inherit(Stack,'snap.Observable');
    snap.extend(Stack.prototype,{

        //> public void register(snap.window.Window window)
        register : function(window) {
            var self = this;self.windows.push(window);window.order = new Date().getTime();
            window.subscribe('pop',self.pop.bind(self,window),self);
            self.order();
        },

        //> public void unregister(snap.window.Window window)
        unregister : function(window) {
        },

        //> private int sort(Object a,Object b)
        sort: function(a,b) {
            return a.order - b.order;
        },

        // private void order()
        order : function() {
            var self = this,windows = self.windows;windows.sort(self.sort);
            for (var idx = 0,window;(window = windows[idx]);idx++) {
                window.elem.css('z-index',new String(100 + 2*idx + 1));
                if (window.mask) window.mask.elem.css('z-index',new String(100 + 2*idx));
            }
        },

        // protected void pop(Object window,Object message)
        pop : function(window,message) {
            window.order = new Date().getTime();
            this.order();
        }

    });

    Stack.register = function(window) {

        var stack = new Stack({name:'Snap Stack'});

        Stack.register = stack.register.bind(stack);
        Stack.unregister = stack.unregister.bind(stack);

        Stack.register(window);

    };

    return Stack;

});
