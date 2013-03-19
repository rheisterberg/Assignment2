
define('snap.form.InputButton',function(snap) {

	//> public InputButton(Object? config)
	var InputButton = function(config) {
		var self = this;InputButton.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,value:self.value});
		self.elem.bind('click',self.onClick.bind(self));
	};

	snap.inherit(InputButton,'snap.form.Input');
	snap.extend(InputButton.prototype,{

		type:'button',

		onClick : function(event) {
			return this.publish('click');
		}

	});

	return InputButton;

});
