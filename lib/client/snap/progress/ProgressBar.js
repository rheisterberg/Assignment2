
define('snap.progress.ProgressBar',function(snap) {

    //> public ProgressBar(Object? config)
    var ProgressBar = function(config) {
        var self = this;self.elem = $(self.html);
        ProgressBar.superclass.constructor.call(self,config);
    };

    snap.inherit(ProgressBar,'snap.Component');
    snap.extend(ProgressBar.prototype,{
        html:'<div class="progress"><div class="rng"></div></div>'
    });

    return ProgressBar;

});


