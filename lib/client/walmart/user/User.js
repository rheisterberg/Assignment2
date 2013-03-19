
define('ebay.user',function(snap) {

    var Utf8 = snap.require('Utf8');
    var Base64 = snap.require('Base64');

    var Cookies = snap.require('ebay.cookies');

    var User = snap.extend(function(){},{

        getUserId : function() {
            var u1p = Utf8.decode(Base64.decode(Cookies.readCookie('dp1','u1p')));
            return !u1p.match(/@@__@@__@@/)?u1p:null;
        },

        isSignedIn : function() {
            var v1 = Cookies.readCookie('ebaysignin');
            var v2 = Cookies.readCookie('keepmesignin');
            return !snap.isNull((v1.match(/in/) || v2.match(/in/)));
        }

    });

    return User;

});
