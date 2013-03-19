
define('snap.form.InputText',function(snap) {

	//> public InputText(Object? config)
	var InputText = function(config) {
		var self = this;InputText.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value,size:self.size,maxLength:self.maxLength,placeholder:self.placeholder});
		self.elem.bind('change',self.onChange.bind(self));
	};

	snap.inherit(InputText,'snap.form.Input');
	snap.extend(InputText.prototype,{

		type:'text',size:6,maxLength:300,

		onChange : function(event) {
			return this.publish('change');
		}

	});

	return InputText;

});
