
define('snap.form.InputReset',function(snap) {

	//> public InputReset(Object? config)
	var InputReset = function(config) {
		var self = this;InputReset.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value});
		self.elem.bind('click',self.onClick.bind(self));
	};

	snap.inherit(InputReset,'snap.form.Input');
	snap.extend(InputReset.prototype,{

		type:'reset',

		onClick : function(event) {
			return this.publish('click');
		}

	});

	return InputReset;

});
