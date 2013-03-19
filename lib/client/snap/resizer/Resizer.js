
define('snap.resizer.Resizer',function(snap) {

    var elem,borders;

    //> public Resizer(Object? config)
    var Resizer = function(config) {
        var self = this;Resizer.superclass.constructor.call(self,config);
        self.target.bind('mouseover',self.onMouseOver.bind(self));
        self.target.bind('mousedown',self.onMouseDown.bind(self));
    };

    snap.inherit(Resizer,'snap.Component');
    snap.extend(Resizer.prototype,{

        classes:{elem:'resizer'},

        //> protected void render(Object target)
        render : function(target) {

            var self = this;

            if (self.elem = elem) return;
            else Resizer.superclass.render.call(self);

            $(document.body).prepend(elem = self.elem);
            borders = elem.frame().borders;

        },

        getCursor: function(event,target) {

            var offset = target.offset();

            var eventTop = event.pageY - offset.top;
            var eventLeft = event.pageX - offset.left;

            var top = (Math.abs(eventTop) <= 10),right = (Math.abs(eventLeft - target.width()) <= 10);
            var left = (Math.abs(eventLeft) <= 10),bottom = (Math.abs(eventTop - target.height()) <= 10);

            if (top && left) return 'nw-resize';
            else if (top && right) return 'ne-resize';
            else if (bottom && left) return 'sw-resize';
            else if (bottom && right) return 'se-resize';
            else if (top) return 'n-resize';
            else if (left) return 'w-resize';
            else if (bottom) return 's-resize';
            else if (right) return 'e-resize';

        },

        onMouseOver : function(event) {
            var self = this,cursor = self.getCursor(event,self.target);
            self.target.css('cursor',cursor?cursor:'');
        },

        onMouseDown : function(event) {
            var self = this,cursor = self.getCursor(event,self.target);
            if (self.cursor = cursor) self.onResizeStart(event);
        },

        onResizeStart : function(event) {

            var self = this,elem = self.elem;
            var target = self.target;self.offset = target.offset();

            elem.css({display:'block',cursor:self.cursor,top:0,left:0});
            elem.css({position:target.css('position'),'z-index':parseInt(target.css('z-index') + 1)});

            elem.offset({top:self.offset.top - borders.top,left:self.offset.left - borders.left});
            elem.layout({width:target.width() + borders.width,height:target.height() + borders.height});

            self.clientTop = event.clientY;self.clientLeft = event.clientX;
            self.clientWidth = elem.width();self.clientHeight = elem.height();

            $(document).bind('mouseup',self.onresizestop = self.onResizeStop.bind(self));
            $(document).bind('mousemove',self.onresizemove = self.onResizeMove.bind(self));

            $doc.disableSelect($(document.body));

        },

        onResizeMove : function(event) {

            var self = this,elem = self.elem;
            var cursor = self.cursor,target = self.target,offset = self.offset;

            var top = event.clientY - self.clientTop;
            var left = event.clientX - self.clientLeft;

            var width = self.clientWidth - borders.width;
            var height = self.clientHeight - borders.height;

            if (cursor.match(/(s|se|sw)-resize/)) {
                elem.css({height:Math.max(height + top,2)});
            }
            else if (cursor.match(/(n|ne|nw)-resize/)) {
                elem.offset({top:offset.top + Math.min(top,height - borders.height)});
                elem.css({height:Math.max(height - top - borders.height,2)});
            }

            if (cursor.match(/(e|ne|se)-resize/)) {
                elem.css({width:Math.max(width + left,2)});
            }
            else if (cursor.match(/(w|nw|sw)-resize/)) {
                elem.offset({left:offset.left + Math.min(left,width - borders.width)});
                elem.css({width:Math.max(width - left - borders.width,2)});
            }

            var scope = self.scope,offset = elem.offset();
            target.offset({top:scope.offsetTop = offset.top + borders.top,left:scope.offsetLeft = offset.left + borders.left});
            self.target.layout({width:elem.width() - borders.width,height:elem.height() - borders.height});

            scope.layout();

        },

        onResizeStop : function(event) {

            var self = this,elem = self.elem,offset = elem.offset();
            var scope = self.scope,target = self.target;

            target.offset({top:scope.offsetTop = offset.top + borders.top,left:scope.offsetLeft = offset.left + borders.left});
            self.target.layout({width:elem.width() - borders.width,height:elem.height() - borders.height});

            scope.layout();

            elem.css('display','');

            $(document).unbind('mouseup',self.onresizestop);
            $(document).unbind('mousemove',self.onresizemove);

            $doc.enableSelect($(document.body));

        }

    });

    return Resizer;

});
