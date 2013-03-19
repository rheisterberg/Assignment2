
define('snap.tree.TreeNode',function(snap) {

    //> public TreeNode(Object? config)
    var TreeNode = function(config) {
        TreeNode.superclass.constructor.call(this,config);
    };

    snap.inherit(TreeNode,'snap.Container');
    snap.extend(TreeNode.prototype,{

        classes:{elem:'node'},

        //> protected void render(Object target)
        render : function(target) {

            var self = this;

            TreeNode.superclass.render.call(self,target);

            var image = self.renderImage(self.icon);
            if (image) self.elem.append(image);

            var anchor = self.renderAnchor(self.text,self.href);
            if (anchor) self.elem.append(anchor);

        },

        renderImage : function(icon) {
            var image = snap.isNode(icon)?icon:$('<img/>').attr({src:icon});
            return image?image.addClass('node-i'):null;
        },

        renderAnchor : function(text,href) {
            var elem = $('<a class="node-a"/>').attr({href:href});
            return elem.bind('click',this.onClick.bind(this)).append(text);
        },

        onClick : function(event) {
            return this.publish('click',{text:this.text,href:this.href},true);
        }

    });

    return TreeNode;

});
