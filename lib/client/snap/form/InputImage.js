
define('snap.form.InputImage',function(snap) {

	//> public InputImage(Object? config)
	var InputImage = function(config) {
		var self = this;InputImage.superclass.constructor.call(self,config);
		self.elem.attr({name:self.name,src:self.src});
		self.elem.bind('click',self.onClick.bind(self));
	};

	snap.inherit(InputImage,'snap.form.Input');
	snap.extend(InputImage.prototype,{

		type:'image',

		onClick : function(event) {
			return this.publish('click');
		}

	});

	return InputImage;

});
