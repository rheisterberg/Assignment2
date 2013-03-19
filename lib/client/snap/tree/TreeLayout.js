
define('snap.tree.TreeLayout',function(snap) {

    //> public TreeLayout(Object? config)
    var TreeLayout = function(config) {
        TreeLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(TreeLayout,'snap.Layout');
    snap.extend(TreeLayout.prototype,{

        render : function() {
            var self = this;self.nodes = {};
            self.elem = $('<ul class="tree-ul"/>').appendTo(self.target);
        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {
            this.addNode(this.elem,component);
        },

        //> private Object addNode(Object parent,Object node)
        addNode : function(parent,node) {

            var self = this,elem = $('<li class="tree-li"/>').appendTo(parent),children = node.children;
            elem.append(self.addExpander({src:'data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAMDAwAAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw=='}));
            elem.addClass(children.length?(node.expanded?'x':'c'):'n').append(node.elem);

            self.appendChildren(elem,node);

            return node;

        },

        addExpander : function(attrs) {
            var self = this,image = $('<img class="tree-x"/>').attr(attrs);
            return image.bind('click',self.onExpander.bind(self));
        },

        appendChildren : function(parent,node) {
            var self = this,elem = $('<ul class="tree-ul"/>').appendTo(parent),children = node.children;
            for (var idx = 0,len = children.length;(idx < len);idx++) self.addNode(elem,children[idx]);
        },

        onExpander : function(event) {
            var node = event.target.parentNode,className = node.className;
            if (className.match(/tree-li c/)) node.className = 'tree-li x';
            else if (className.match(/tree-li x/)) node.className = 'tree-li c';
        }

    });

    return TreeLayout;

});
