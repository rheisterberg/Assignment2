
define('snap.form.Form',function(snap) {

    //> public Form(Object? config)
    var Form = function(config) {
        var self = this;Form.superclass.constructor.call(self,config);
        self.elem.bind('submit',self.onSubmit.bind(self));
    };

    snap.inherit(Form,'snap.Container');
    snap.extend(Form.prototype,{

        method:'get',

        onSubmit : function(event) {
            return this.publish('submit');
        }

    });

    snap.extend(Form,{

        template : function(config,context) {
            context.render(Form.getName());
            context.queue(config);
        }

    });

    return Form;

});
