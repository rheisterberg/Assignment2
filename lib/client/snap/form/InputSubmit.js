
define('snap.form.InputSubmit',function(snap) {

	//> public InputSubmit(Object? config)
	var InputSubmit = function(config) {
		var self = this;InputSubmit.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value});
		self.elem.bind('click',self.onClick.bind(self));
	};

	snap.inherit(InputSubmit,'snap.form.Input');
	snap.extend(InputSubmit.prototype,{

		type:'submit',

		onClick : function(event) {
			return this.publish('click');
		}

	});

	return InputSubmit;

});
