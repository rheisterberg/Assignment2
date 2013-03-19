
define('snap.form.InputRadio',function(snap) {

	//> public InputRadio(Object? config)
	var InputRadio = function(config) {

		var self = this;InputRadio.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value,checked:self.checked});
		if (self.text) self.elem.after(self.text);

		self.elem.bind('click',self.onClick.bind(self));

	};

	snap.inherit(InputRadio,'snap.form.Input');
	snap.extend(InputRadio.prototype,{

		type:'radio',checked:false,

		onClick : function(event) {
			return this.publish('click',this.elem[0].checked);
		}

	});

	return InputRadio;

});
