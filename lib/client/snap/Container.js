
define('snap.Container',function(snap) {

    var Layout = snap.require('snap.Layout');

    var Registry = snap.require('snap.Registry');
    var Droppable = snap.require('snap.Droppable');

    var createManager = function(self,object) {
        var manager = snap.require(snap.isObject(object)?object.name:object);
        return self.manager = new manager(snap.extend(object.config || {},{container:self}));
    };

    //> public constructs(Object? config)
    var Container = function(config) {

        var self = this;Container.superclass.constructor.call(self,config);
        snap.extend(self.children = self.children || [],{fwd:null,bwd:null,map:{}});
        if (self.droppable) Container.mixin(self,Droppable);

        self.getManager();
        self.appendChildren(self.children);

    };

    snap.inherit(Container,'snap.Component');
    snap.extend(Container.prototype,{

        manager : 'snap.Layout',droppable:false,

        //> public Object getTarget()
        getTarget : function() {
            return this.elem;
        },

        //> public Object getManager()
        getManager : function() {
            return (this.manager instanceof Layout)?this.manager:createManager(this,this.manager);
        },

        //> public void appendChildren(Object[] nodes)
        appendChildren : function(nodes) {

            for (var self = this,idx = 0,node;(node = nodes[idx]);idx++) {
                node = Registry.object(snap.isString(node)?node:node.oid);
                if (node) self.appendChild(nodes[idx] = node,true,true);
            }

            self.layout();

        },

        //> public Object getChild(String cid)
        getChild : function(cid) {
            return this.children.map[cid];
        },

        //> public Object appendChild(Object node,boolean? defer,boolean? render)
        appendChild : function(node,defer,render) {

            var self = this;

            var children = self.children;
            var siblings = node.siblings;

            var bwd = children.bwd;children.bwd = node;
            var fwd = (bwd?bwd.siblings:children).fwd = node;

            if (!render) self.children.push(node);

            children.map[node.cid || node.oid] = node;
            node.parent = self;node.detached = self.detached;
            siblings.bwd = bwd;siblings.fwd = null;

            self.manager.addComponent(node,defer);

            return node;

        },

        //> public Object insertBefore(Object node,Object? before)
        insertBefore : function(node,before) {

            var self = this;

            var children = self.children;
            var siblings = node.siblings;

            var bwd = before.siblings.bwd;
            if (!bwd) return self.appendChild(node);

            var fwd = before.siblings.fwd;
            if (fwd) fwd.siblings.fwd = node;

            var index = $.inArray(before,children);
            if (index >= 0) children.splice(index,0,node);

            children.map[node.cid || node.oid] = node;
            node.parent = self;node.detached = self.detached;
            siblings.bwd = bwd;siblings.fwd = fwd;

            self.manager.addComponent(node);

            return node;

        },

        //> public void removeChildren()
        removeChildren : function() {
            var self = this,children = self.children,node;
            while (node = children.fwd) self.removeChild(node,true);
            self.layout();
        },

        //> public Object removeChild(Object node,boolean? defer)
        removeChild : function(node,defer) {

            var self = this;

            var children = self.children;
            var siblings = node.siblings;

            var index = $.inArray(node,children);
            if (index >= 0) children.splice(index,1);

            (siblings.bwd?siblings.bwd.siblings:children).fwd = siblings.fwd;
            (siblings.fwd?siblings.fwd.siblings:children).bwd = siblings.bwd;

            self.manager.removeComponent(node,defer);

            delete children.map[node.cid || node.oid];
            node.parent = siblings.fwd = siblings.bwd = null;
            delete node.detached;

            return node;

        },

        //> public Object replaceChild(Object replace,Object node)
        replaceChild : function(replace,node) {

            var self = this,children = self.children;
            if (replace.parent !== self) return null;

            var index = $.inArray(replace,children);
            if (index >= 0) self.children[index] = node;

            var siblings = replace.siblings;

            var bwd = siblings.bwd;(bwd?bwd.siblings:children).fwd = node;node.siblings.bwd = bwd;
            var fwd = siblings.fwd;(fwd?fwd.siblings:children).bwd = node;node.siblings.fwd = fwd;

            delete children.map[replace.cid || replace.oid];children.map[node.cid || node.oid] = node;
            node.parent = self;replace.parent = replace.fwd = replace.bwd = null;
            delete replace.detached;

            return replace;

        },

        detach : function(detached) {
            var self = this;self.detached = detached;
            for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
                node.detach(detached);
            }
        },

        //> public void layout(boolean force)
        layout : function(force) {
            this.manager.layout(force);
            this.publish('layout');
        }

    });

    return Container;

});
