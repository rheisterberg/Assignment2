
define('snap.form.InputPassword',function(snap) {

	//> public InputPassword(Object? config)
	var InputPassword = function(config) {
		var self = this;InputPassword.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value});
		self.elem.bind('change',self.onChange.bind(self));
	};

	snap.inherit(InputPassword,'snap.form.Input');
	snap.extend(InputPassword.prototype,{

		type:'password',

		onChange : function(event) {
			return this.publish('change');
		}

	});

	return InputPassword;

});
