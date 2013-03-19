(function($) {
  $.fn.autofocus = function() {
	
	var isAutoFocusSupported = 'autofocus' in document.createElement('input');
	
    //Test to see if autofocus is natively supported before proceeding
    return(!isAutoFocusSupported) ? this.focus() : this;
  };
})(jQuery);

$(document).ready(function(){
	$("[autofocus]").autofocus();
});