
define('snap.tree.TreeLoader',function(snap) {

    var Tree = snap.require('snap.tree.Tree');
    var TreeNode = snap.require('snap.tree.TreeNode');

    var AjaxRequest = snap.require('snap.ajax.AjaxRequest');

    //> public TreeLoader(Object? config)
    var TreeLoader = function(config) {
        TreeLoader.superclass.constructor.call(this,config);
    };

    snap.inherit(TreeLoader,'snap.Observable');
    snap.extend(TreeLoader.prototype,{

        load : function(url,async) {

            var self = this;

            var request = new AjaxRequest();

            request.subscribe('success',self.onSuccess,self);
            request.subscribe('error',self.onError,self);

            request.get(url,async);

        },

        onSuccess : function(event,request) {

            var self = this;

            var root = request.responseXML.firstChild;

            var tree = new Tree({title:root.getAttribute('title')});
            for (var node = root.firstChild;(node);node = node.nextSibling) self.addNode(tree,node);

            self.publish('complete',tree);

        },

        onError : function(event,request) {
            this.publish('complete',null);
        },

        addNode : function(parent,node) {

            var self = this,type = node.nodeType;
            if (type != 1) return null;

            var icon = node.getAttribute('icon');
            var text = node.getAttribute('text');

            var href = node.getAttribute('href');
            var expanded = node.getAttribute('expanded');

            var treeNode = new TreeNode({icon:icon,text:text,href:href,expanded:expanded});
            for (var node = node.firstChild;(node);node = node.nextSibling) self.addNode(treeNode,node);

            return parent.appendChild(treeNode);

        }

    });

    return TreeLoader;

});
