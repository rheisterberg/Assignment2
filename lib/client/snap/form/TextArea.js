
define('snap.form.TextArea',function(snap) {

    //> public v(Object? config)
    var TextArea = function(config) {
        var self = this;TextArea.superclass.constructor.call(self,config);
        self.elem.attr({name:self.name,value:self.value});
        self.elem.bind('change',self.onChange.bind(self));
    };

    snap.inherit(TextArea,'snap.Component');
    snap.extend(TextArea.prototype,{

        cols:40,rows:5,

        onChange : function(event) {
            return this.publish('change');
        }

    });

    snap.extend(TextArea,{

        template : function(config,context) {
            context.render(TextArea.getName());
            context.queue(config);
        }

    });

    return TextArea;

});
