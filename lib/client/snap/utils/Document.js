
define('snap.utils.Document',function(snap) {

	var Document = snap.extend(function() {},{

		// Compute Element Offset Top

		//> public int offsetTop(Object elem,Object? parent)
		offsetTop : function(elem,parent) {
			for (var offsetTop = 0;(elem && (elem !== parent));elem = elem.offsetParent) { offsetTop += elem.offsetTop; }
			return offsetTop;
		},

		// Compute Element Offset Left

		//> public int offsetLeft(Object elem,Object? parent)
		offsetLeft : function(elem,parent) {
			for (var offsetLeft = 0;(elem && (elem !== parent));elem = elem.offsetParent) { offsetLeft += elem.offsetLeft; }
			return offsetLeft;
		},

		// Disable/Enable Text Selection

		//> public void disableSelect(Object elem)
		disableSelect: function(elem) {

			if (document.all) {
				elem.bind('dragstart selectstart',this.cancelSelect.bind(this));
			}
			else {
				elem.css({'-webkit-user-select':'none','-moz-user-select':'none','user-select':'none'});
			}

		},

		//> public void enableSelect(Object elem)
		enableSelect: function(elem) {

			if (document.all) {
				elem.unbind('dragstart selectstart');
			}
			else {
				elem.css({'-webkit-user-select':'','-moz-user-select':'','user-select':''});
			}

		},

		cancelSelect : function(event) {
			return false;
		}

	});

	snap.alias(Document,'$doc');

	// Define Text Range Select Prototype

	if (document.createRange) {
		$doc.selectRange = function(node) { var range = document.createRange(); range.selectNode(node); window.getSelection().addRange(range); };
	}
	else if (document.all) {
		$doc.selectRange = function(node) { var range = document.body.createTextRange(); range.moveToElementText(node); range.select(); };
	}

	// Define ActiveX Version

	if (window.ActiveXObject) {
		$doc.ActiveXVersion = function(versions) {
			for (var idx = 0,len = versions.length;(idx < len);idx++) {
				try { new ActiveXObject(versions[idx]);return versions[idx]; }
				catch(except) {}
			}
		};
	}

	return Document;

});

snap.require('snap.utils.Document');