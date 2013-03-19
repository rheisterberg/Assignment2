
define('snap.form.InputFile',function(snap) {

	//> public InputFile(Object? config)
	var InputFile = function(config) {
		var self = this;InputFile.superclass.constructor.call(this,config);
		self.elem.attr({name:self.name,method:self.method,enctype:self.enctype});
		self.elem.bind('click',self.onClick.bind(self));
	};

	snap.inherit(InputFile,'snap.form.Input');
	snap.extend(InputFile.prototype,{

		type:'file',method:'post',enctype:'multipart/form-data',
	
		onClick : function(event) {
			return this.publish('click');
		}
	
	});
	
	return InputFile;
	
});
