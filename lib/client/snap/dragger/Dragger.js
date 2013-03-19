
define('snap.dragger.Dragger',function(snap) {

    //> public Dragger(Object? config)
    var Dragger = function(config) {

        var self = this;Dragger.superclass.constructor.call(self,config);
        self.dragger.bind('mousedown',self.onDragStart.bind(self)).addClass('drag');

        self.dragger.bind('click',self.onCancel.bind(self));
        self.dragger.bind('dragstart',self.onCancel.bind(self));

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

    };

    snap.inherit(Dragger,'snap.Observable');
    snap.extend(Dragger.prototype,{

        onCancel : function(event) {
            return false;
        },

        onDragStart : function(event) {

            var self = this;
            var target = self.target,offset = target.offset();

            self.clientTop = event.clientY - offset.top;
            self.clientLeft = event.clientX - offset.left;;

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            $doc.disableSelect($(document.body));

        },

        onDragMove : function(event) {
            var self = this,target = self.target;
            target.offset({top:event.clientY - self.clientTop,left:event.clientX - self.clientLeft});
            return false;
        },

        onDragStop : function(event) {

            var self = this,scope = self.scope,offset = self.target.offset();
            scope.offsetTop = offset.top;scope.offsetLeft = offset.left;

            $(document).unbind('mouseup',self.ondragstop);
            $(document).unbind('mousemove',self.ondragmove);

            $doc.enableSelect($(document.body));

        }

    });

    return Dragger;

});
