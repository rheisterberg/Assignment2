
define('snap.Messaging',function(snap) {

    //> public Messaging(Object? config)
    var Messaging = function(config) {
        var self = this;Messaging.channels[config.name] = self;
        Messaging.superclass.constructor.call(self,config);
    };

    snap.inherit(Messaging,'snap.Observable');
    snap.extend(Messaging.prototype,{

        //> public Object publish(String type,Object object,Object scope)
        publish : function(type,object,scope) {
            var self = this,message = {source:scope,type:type};
            var result = self.dispatch(type,message,object,false);
            return (result === false)?result:self.dispatch('global',message,object,false);
        }

    });

    snap.extend(Messaging,{

        channels : {},

        channel : function(name) {
            return this.channels[name] || (this.channels[name] = new Messaging({name:name}));
        }

    });

    var global = Messaging.channel('*');

    snap.publish = global.publish.bind(global);

    snap.subscribe = global.subscribe.bind(global);
    snap.unsubscribe = global.unsubscribe.bind(global);

    return Messaging;

});

snap.require('snap.Messaging');
