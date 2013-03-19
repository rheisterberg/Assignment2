
define('walmart.views.item.ItemTemplatingHelpers',function(snap) {

	var SECOND = 100,MINUTE = 60*SECOND,HOUR = 60*MINUTE,DAY = 24*HOUR;

	var Days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

	var ItemTemplatingHelpers = snap.extend({},{

		getItemHex : function(data) {
			return data.item.toString(16);
		},

		getBidClass : function(data) {
			var completed = data.completed,sold = data.sold;
			return 'g-b' + (completed?(sold?' bidsold':' binsold'):'');
		},

		getBinClass : function(data) {
			var auction = data.auction,completed = data.completed,sold = data.sold;
			return auction?'':'g-b' + (completed?(sold?' bidsold':' binsold'):'');
		},

		getBids : function(data) {
			var bids = data.bids;
			return bids + (bids != 1?' Bids':' Bid');
		},

		hasImage : function(data) {
			var type = data.imgType;
			return type.match(/REGULAR|STOCK_IMAGE|CAMERA_ICON/);
		},

		getImageSrc : function(data) {
			var type = data.imgType;
			if (type.match(/REGULAR/)) return data.imgUrl;
			else if (type.match(/STOCK_IMAGE|CAMERA_ICON/)) return 'http://pics.ebaystatic.com/s.gif';
		},

		getImageClass : function(data) {
			var type = data.imgType;
			if (type.match(/REGULAR/)) return 'img';
			else if (type.match(/STOCK_IMAGE/)) return 'stockImg';
			else if (type.match(/CAMERA_ICON/)) return 'cameraIcon';
		},

		getNotSold : function(data) {
			var sold = data.sold,completed = data.completed;
			return (completed && !sold);
		},

		getSoldCount : function(data) {
			var sold = data.sold,completed = data.completed,count = data.soldcount;
			return (!sold && !completed && (count > 0))?count:false;
		},

		getTimeClass : function(data) {

			var ending = data.ending;
			var remaining = Math.max(ending - new Date().getTime(),0);

			var days = Math.floor(remaining/DAY);
			var hours = Math.floor(remaining/HOUR);
			var minutes = Math.floor(remaining/MINUTE);
			var seconds = Math.floor(remaining/SECOND);

			if ((days == 0) && (hours == 0) && (minutes == 0)) {
				data.timetype = 'SECONDS';data.remaining = seconds + 1;
			} else if ((days == 0) && (hours == 0)) {
				data.timetype = 'MINUTES';data.remaining = minutes + 1;
			} else if ((days == 0)) {
				data.timetype = 'HOURS';data.remaining = hours + 1;
			} else if (days == 1) {
				data.timetype = 'HOURS';data.remaining = hours + 1;
			} else if ((days >= 2) && (days <= 6)) {
				var date = new Date(ending).toLocaleDateString();
				data.timetype = date.match(/([^,]*)/)[1];
			} else if (days >= 7) {
				data.timetype = 'DAYS';data.remaining = days + 1;
			}

			return data.timetype;

		}

	});

	return ItemTemplatingHelpers;

});
