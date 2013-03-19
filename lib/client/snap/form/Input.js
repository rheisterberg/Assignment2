
define('snap.form.Input',function(snap) {

    //> public InputButton(Object? config)
    var Input = function(config) {
        Input.superclass.constructor.call(this,config);
    };

    snap.inherit(Input,'snap.Component');

    snap.extend(Input,{

        template : function(config,context) {
            context.render(Input.getName());
            context.queue(config);
        }

    });

    return Input;

});
