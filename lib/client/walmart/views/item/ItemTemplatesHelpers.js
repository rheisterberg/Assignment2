
define('walmart.views.item.ItemTemplatesHelpers',function(snap) {

	var SECOND = 100,MINUTE = 60*SECOND,HOUR = 60*MINUTE,DAY = 24*HOUR;

	var Days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

	var ItemTemplatesHelpers = snap.extend({},{

		getItemHex : function(chk,ctx) {
			return ctx.get('item').toString(16);
		},

		getBidClass : function(chk,ctx) {
			var completed = ctx.get('completed'),sold = ctx.get('sold');
			return 'g-b' + (completed?(sold?' bidsold':' binsold'):'');
		},

		getBinClass : function(chk,ctx) {
			var auction = ctx.get('auction'),completed = ctx.get('completed'),sold = ctx.get('sold');
			return auction?'':'g-b' + (completed?(sold?' bidsold':' binsold'):'');
		},

		getBids : function(chk,ctx) {
			var bids = ctx.get('bids');
			return bids + (bids != 1?' Bids':' Bid');
		},

		hasImage : function(chk,ctx) {
			var type = ctx.get('imgType');
			return type.match(/REGULAR|STOCK_IMAGE|CAMERA_ICON/);
		},

		getImageSrc : function(chk,ctx) {
			var type = ctx.get('imgType');
			if (type.match(/REGULAR/)) return ctx.get('imgUrl');
			else if (type.match(/STOCK_IMAGE|CAMERA_ICON/)) return 'http://pics.ebaystatic.com/s.gif';
		},

		getImageClass : function(chk,ctx) {
			var type = ctx.get('imgType');
			if (type.match(/REGULAR/)) return 'img';
			else if (type.match(/STOCK_IMAGE/)) return 'stockImg';
			else if (type.match(/CAMERA_ICON/)) return 'cameraIcon';
		},

		getNotSold : function(chk,ctx) {
			var sold = ctx.get('sold'),completed = ctx.get('completed');
			return (completed && !sold);
		},

		getSoldCount : function(chk,ctx) {
			var sold = ctx.get('sold'),completed = ctx.get('completed'),count = ctx.get('soldcount');
			return (!sold && !completed && (count > 0))?count:false;
		},

		getTimeClass : function(chk,ctx) {

			var current = ctx.current(),ending = ctx.get('ending');
			var remaining = Math.max(ending - new Date().getTime(),0);

			var days = Math.floor(remaining/DAY);
			var hours = Math.floor(remaining/HOUR);
			var minutes = Math.floor(remaining/MINUTE);
			var seconds = Math.floor(remaining/SECOND);

			if ((days == 0) && (hours == 0) && (minutes == 0)) {
				current.timetype = 'SECONDS';current.remaining = seconds + 1;
			} else if ((days == 0) && (hours == 0)) {
				current.timetype = 'MINUTES';current.remaining = minutes + 1;
			} else if ((days == 0)) {
				current.timetype = 'HOURS';current.remaining = hours + 1;
			} else if (days == 1) {
				current.timetype = 'HOURS';current.remaining = hours + 1;
			} else if ((days >= 2) && (days <= 6)) {
				var date = new Date(ending).toLocaleDateString();
				current.timetype = date.match(/([^,]*)/)[1];
			} else if (days >= 7) {
				current.timetype = 'DAYS';current.remaining = days + 1;
			}

			return current.timetype;

		}

	});

	return ItemTemplatesHelpers;

});
