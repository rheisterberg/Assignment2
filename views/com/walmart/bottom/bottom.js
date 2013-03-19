
snap.define('com.walmart.bottom',function(snap) {

    var Bottom = function(config) {
        Bottom.superclass.constructor.call(this,config);
    };

    snap.inherit(Bottom,'snap.Component');
    snap.extend(Bottom.prototype,{

        classes:{elem:'bottom'}

    });

    return Bottom;

});

