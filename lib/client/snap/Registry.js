
define('snap.Registry',function(snap) {

    var Registry = function() {};

    snap.extend(Registry,{

        eidx : 1,
        oidx : 1,

        objects:{},
        aliases:{},
        elements:{},

        eid : function() {
            return 'e0-' + this.eidx++;
        },

        oid : function() {
            return 'o' + this.oidx++;
        },

        //> public Object exists(String oid)
        exists : function(oid) {
            return this.objects[oid];
        },

        //> public Object object(String oid)
        object : function(oid) {
            var self = this,entry = self.objects[oid] || self.aliases[oid];
            return entry?entry.object:null;
        },

        //> public void alias(Object object,String alias)
        alias : function(object,alias) {
            var self = this,oid = object.oid;
            var entry = self.objects[oid] || (self.objects[oid] = {object:object,aliases:[]});
            self.aliases[alias] = entry;entry.aliases.push(alias);
        },

        element : function(element) {
            var elem = element.jquery?element[0]:element;
            if (elem && !elem.id) elem.id = this.eid();
            return elem;
        },

        //> public void register(Object object,Object? element)
        register : function(object,element) {
            var self = this,oid = object.oid || (object.oid = self.oid());
            var entry = self.objects[oid];self.objects[oid] = entry?entry:{object:object,aliases:[]};
            if (element) self.elements[object.oid] = self.element(element);
            if (object.alias) self.alias(object,object.alias);
        },

        //> public void destroy(Object object)
        destroy : function(object) {
            var self = this,oid = object.oid;
            var entry = self.objects[oid],aliases = entry?entry.aliases:[];
            for (var idx = 0,alias;(alias = aliases[idx]);idx++) delete self.aliases[alias];
            delete self.objects[oid];delete self.elements[oid];
            if (object.destroy) object.destroy();
        },

        //> public void update()
        update : function() {
            var self = this;
            var objects = self.objects,elements = self.elements;
            for (var oid in elements) {
                var entry = objects[oid],object = entry.object,element = elements[oid];
                if (!object.detached && element && document.getElementById(element.id) == null) self.destroy(object);
            }
        },

        //> private void unload(Event event)
        unload : function(event) {
            var self = this,objects = self.objects;
            for (var oid in objects) self.destroy(objects[oid].object);
        }

    });

    snap.eid = Registry.eid.bind(Registry);
    snap.oid = Registry.oid.bind(Registry);

    snap.register = Registry.register.bind(Registry);
    snap.destroy = Registry.destroy.bind(Registry);

    $(window).bind('unload',Registry.unload.bind(Registry));
    $(document).bind('ajaxComplete',Registry.update.bind(Registry));

    return Registry;

});

snap.require('snap.Registry');
