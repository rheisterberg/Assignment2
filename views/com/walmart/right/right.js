
snap.define('com.walmart.right',function(snap) {

    var Right = function(config) {
        Right.superclass.constructor.call(this,config);
    };

    snap.inherit(Right,'snap.Component');
    snap.extend(Right.prototype,{

        classes:{elem:'right'}

    });

    return Right;

});

