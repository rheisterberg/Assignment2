if (typeof window.Worker == 'undefined') {
    window.Worker = function(url){
        var ifUrl = "worker.html",
            reqUrl = url,
            oIframe = $('<iframe />').attr('id',"workerIF"+new Date().getTime()).css({width:1, height:1});
        
        var self = {
            callBack : null,
            
            load : function(){
                
                   if (typeof reqUrl == 'undefined'){
                    return;
                }
                
                oIframe.hide().appendTo('body');
                
                var fc = '<scr' + 'ipt type="text/javascript" src="http://localhost/js/jquery-1.6.1.min.js"></scr' + 'ipt>';              
                    fc += '<scr' + 'ipt type="text/javascript" src="http://localhost/js/snap/ejo/jquery/jquery.postmessage.js"></scr' + 'ipt>';
                    fc += '<scr' + 'ipt type="text/javascript" src="' + reqUrl + '"></scr' + 'ipt>',
                    fd = oIframe.get(0).contentWindow.document;            
               
                fd.open();
                fd.write(fc);
                fd.close();
            }
        };
        self.load();
        
        return {
            addEventListener : function(type, listener, capture){
                self.callBack = listener;
                $.receiveMessage(function(e){
                    if (typeof self.callBack === "function"){
                        self.callBack(e);
                    }
                });
            },
            
            postMessage : function(message){
                $.postMessage(message, ifUrl, oIframe.get(0).contentWindow);
            }
        };
    };
}