
define('snap.form.InputCheckbox',function(snap) {

	//> public InputCheckbox(Object? config)
	var InputCheckbox = function(config) {
		var self = this;InputCheckbox.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value,checked:self.checked});
		if (self.text) self.elem.after(self.text);
		self.elem.bind('click',self.onClick.bind(self));

	};

snap.inherit(InputCheckbox,'snap.form.Input');
	snap.extend(InputCheckbox.prototype,{

		type:'checkbox',checked:false,

		onClick : function(event) {
			return this.publish('click',this.elem[0].checked);
		}

	});

	return InputCheckbox;

});
