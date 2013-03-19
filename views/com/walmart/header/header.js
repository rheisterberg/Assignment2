
define('com.walmart.header',function() {

    var Header = function(config) {
        Header.superclass.constructor.call(this,config);
    };

    snap.inherit(Header,'snap.Component');
    snap.extend(Header.prototype,{

        classes:{elem:'head'}

    });

    return Header;

});
