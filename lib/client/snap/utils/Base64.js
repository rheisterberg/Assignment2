
define('Base64',function(snap) {

    var codes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=*';

    var Base64 = function() {};

    snap.extend(Base64,{

        decode :  function(value) {

            var len = value.length,ret = '';
            if (len <= 0) return ret;

            var test = new RegExp('[^A-Za-z0-9+/=*]');
            if (test.exec(value)) return ret;

            var idx = 0,len = value.length,decoded = '';
            var enc1,enc2,enc3,enc4,dec1,dec2,dec3;

            while (idx < len) {

                var enc1 = codes.indexOf(value.charAt(idx++));
                var enc2 = codes.indexOf(value.charAt(idx++));
                var enc3 = codes.indexOf(value.charAt(idx++));
                var enc4 = codes.indexOf(value.charAt(idx++));

                dec1 = (enc1 << 2) | (enc2 >> 4);
                dec2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                dec3 = ((enc3 & 3) << 6) | enc4;

                decoded += String.fromCharCode(dec1);
                if (!(enc3 >= 64)) decoded += String.fromCharCode(dec2);
                if (!(enc4 >= 64)) decoded += String.fromCharCode(dec3);

            }

            return decoded;

        }

    });

    return Base64;

});

snap.require('Base64');
