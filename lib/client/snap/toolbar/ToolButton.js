
define('snap.toolbar.ToolButton',function(snap) {

    //> public Button(Object? config)
    var ToolButton = function(config) {
        ToolButton.superclass.constructor.call(this,config);
        if (this.children[0]) this.renderArrow(this.menu = this.children[0]);
    };

    snap.inherit(ToolButton,'snap.Container');
    snap.extend(ToolButton.prototype,{

        //> protected void render(Object target)
        render : function(target) {

            var self = this;ToolButton.superclass.render.call(self,target);
            self.button = $('button',self.elem).attr({value:self.value,title:self.title});

            var before = self.classes.elem.match(/(top|lt)/);
            var icon = self.icon,image = icon?self.renderImage(icon):null;

            if (image && before) self.button.prepend(image);
            else if (image) self.button.append(image);

            self. button.bind('mouseover',self.onMouseOver.bind(self));
            self. button.bind('mouseout',self.onMouseOut.bind(self));

            self. button.bind('mousedown',self.onMouseDown.bind(self));
            self. button.bind('mouseup',self.onMouseUp.bind(self));

            self. button.bind('click',self.onClick.bind(self));

        },

        renderImage : function(icon) {
            return snap.isNode(icon)?icon:$('<img/>').attr({src:icon});
        },

        renderArrow : function(menu) {

            var self = this;
            self.elem.addClass('arrow');

            var arrow = $('<img class="arrow"/>').attr({src:self.arrow}).appendTo(self.elem);
            arrow.bind('click',self.onShow.bind(self));

        },

        onMouseOver : function(event) {

            var self = this,related = event.relatedTarget;
            if ($.contains(self.elem[0],related)) return;

            self.elem.addClass('hover');

        },

        onMouseOut : function(event) {

            var self = this,related = event.relatedTarget;
            if ($.contains(self.elem[0],related)) return;

            self.elem.removeClass('hover');

        },

        onMouseDown : function(event) {
            this.elem.addClass('down');
        },

        onMouseUp : function(event) {
            this.elem.removeClass('down');
        },

        onShow : function(event) {
            this.menu.publish('show',{align:'bottom'});
            return false;
        },

        onClick : function(event) {
            return this.publish('click',{text:this.text,href:this.href});
        }

    });

    return ToolButton;

});
