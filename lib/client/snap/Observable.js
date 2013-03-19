
define('snap.Observable',function(snap) {

    var Registry = snap.require('snap.Registry');

    //> public Observable(Object? config)
    var Observable = function(config) {
        var self = this;snap.extend(self.config = self.config || {},config);
        snap.extend(self,config);snap.register(self);self.listeners = {'global':[]};
    };

    snap.extend(Observable.prototype,{

        splice : function(listeners,idx) {
            listeners.splice(idx,1);
            return false;
        },

        validate : function(listener) {
            var self = this,scope = listener.scope;
            if (!scope.oid || Registry.exists(scope.oid)) return listener;
            //else snap.log('debug','Remove listener',self.constructor.getName(),scope.constructor.getName(),scope.oid,listener.type);
            return null;
        },

        dispatch : function(key,message,object,bubble) {

            var self = this,type = message.type;
            var listeners = self.listeners[key] || [],result;
            for (var idx = 0,len = listeners.length;(idx < len);idx++) {
                var listener = listeners[idx],scope = listener.scope;
                var valid = self.validate(listener) || self.splice(listeners,idx--,len--);
                var response = (valid && type.match(listener.type))?listener.func.call(scope,message,object):undefined;
                if (snap.isDefined(response)) result = response;
                if (result === false) break;
            }

            if (listeners.length <= 0) delete self.listeners[key];

            var parent = bubble && (result !== false) && self.parent;
            if (parent) result = parent.dispatch(key,message,object,bubble);

            return result;

        },

        //> public Object publish(String type,Object? object,bubble)
        publish : function(type,object,bubble) {
            var self = this,message = {source:self,type:type};
            var result = self.dispatch(type,message,object,bubble);
            return (result === false)?result:self.dispatch('global',message,object,bubble);
        },

        //> public void subscribe(String type,Function func,Object? scope)
        subscribe : function(type,func,scope) {
            var self = this,key = (type instanceof RegExp)?'global':type;
            var listeners = self.listeners[key] || (self.listeners[key] = []);
            listeners.push({type:type,func:func,scope:scope || self});
        },

        //> public void unsubscribe(String type,Function func,Object? scope)
        unsubscribe : function(type,func,scope) {

            var self = this,key = (type instanceof RegExp)?'global':type;
            var listeners = self.listeners[key] || [];

            for (var idx = 0,listener;(listener = listeners[idx]);idx++) {
                if (scope && (listener.scope !== scope)) continue;
                else if (func && (listener.func !== func)) continue;
                else { listeners.splice(idx,1); break;}
            }

            if (listeners.length <= 0) delete self.listeners[key];

        },

        //> public void destroy()
        destroy : function() {
            //snap.log('debug','Destroy',this.constructor.getName(),this.oid);
        }

    });

    return Observable;

});
