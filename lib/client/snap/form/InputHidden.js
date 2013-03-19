
define('snap.form.InputHidden',function(snap) {

	//> public InputHidden(Object? config)
	var InputHidden = function(config) {
		var self = this;InputHidden.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value});
	};

	snap.inherit(InputHidden,'snap.form.Input');
	snap.extend(InputHidden.prototype,{

		type:'hidden'

	});

	return InputHidden;

});
