
define('Utf8',function(snap) {

    var Utf8 = function() {};

    snap.extend(Utf8,{

        decode : function(value) {

            var idx = 0,len = value.length,decoded = '',c0,c1,c2;
            while (idx < len) {
                c0 = value.charCodeAt(idx);
                if (c0 < 128) { decoded += String.fromCharCode(c0);idx++; }
                else if ((c0 > 191) && (c < 224)) { c2 = value.charCodeAt(i + 1);decoded += String.fromCharCode(((c0 & 31) << 6) | (c2 & 63));idx += 2; }
                else { c2 = value.charCodeAt(idx + 1);c3 = value.charCodeAt(idx + 2);decoded += String.fromCharCode(((c0 & 15)<< 12) | ((c2 & 63) << 6 ) | (c3 & 63));idx += 3; }
            }
            return decoded;
        }

    });

    return Utf8;

});

snap.require('Utf8');
