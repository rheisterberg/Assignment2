
define('walmart.autofill.AutoFillInput',function(snap) {

    var cntrl = {13:1,16:1,17:1,18:1,37:1,38:1,39:1,40:1};

    var Cookies = snap.require('ebay.cookies');
    var AutoFillLayer = snap.require('walmart.autofill.AutoFillLayer');

    //> public AutoFillInput(Object? config)
    var AutoFillInput = function(config) {

    	var self = this;self.elem = snap.elem(config.auto);
        AutoFillInput.superclass.constructor.call(self,config);
        self.elem.bind("click", self.onClick.bind(self));

        self.layer = self.appendChild(new AutoFillLayer(config));
        self.layer.elem.bind('disable',self.onDisable.bind(self));

        self.files = {};self.cache = {};self.queue = [];
        self.input = $('input.afi',self.elem);self.value = self.input[0].value;

        self.input.bind('keyup',self.onKeyUp.bind(self));
        self.input.bind('keydown',self.onKeyDown.bind(self));
        self.input.bind('focus',self.onFocus.bind(self));

        self.enable = $('b',self.elem).bind('click',self.onEnable.bind(self));

        self.algo = self.algo?self.algo:'1';self.version = self.version?self.version:'1';
        self.root = self.sugg;

        self.layer.elem.bind('disable',self.onDisable.bind(self));
        self.layer.elem.bind('select',self.onSelect.bind(self));

        snap.alias(self,'vjo.darwin.domain.finding.autofill.AutoFill');

        self.disabled = self.getDisabled();

        self.displayInput = $("#" + self.disInput);
        if($.browser && $.browser.msie){
            // also a hack for breadcrumb... yuck.
            var ieClass= "ie";
            if(parseInt($.browser.version, 10) === 7){
                ieClass += " ie7";
            }

            // ie needs the cat bumped down a pixel
            $("div.fpcc div.smuy").addClass(ieClass);
            self.displayInput.addClass(ieClass);
        }

        self.subscribe('category',self.updateCategory.bind(self));
        self.updateCategory(null,self.currentCategory);

        $(window).bind('resize',self.onResize.bind(self));

        self.onResize();

        self.displayInput.bind('mouseover',self.addDispHover.bind(self));
        self.displayInput.bind('mouseout',self.removeDispHover.bind(self));

        if (self.disabled) self.onDisable();
        else self.onEnable();

    };


    snap.inherit(AutoFillInput,'snap.Container');
    snap.extend(AutoFillInput.prototype,{

        onClick: function(e){
            var self = this;

            if(e.originalEvent && e.originalEvent.srcElement && "afi" == e.originalEvent.srcElement.id){
                e.preventDefault();
                if(!self.input.is(":focus")){
                    self.input.focus();
                }
                self.input.click();

            }
        },

        getDisabled : function() {
            var cookie = Cookies.readCookie('dp1','pbf');
            return Cookies.getBitFlag(cookie,29);
        },

        setDisabled : function(value) {

            var self = this,cookie = Cookies.readCookie('dp1','pbf');
            if (value == Cookies.getBitFlag(cookie,29)) return;

            $(document).trigger('rover',{sid:value?self.trksid.hide:self.trksid.show});
            Cookies.writeCookielet('dp1','pbf',Cookies.setBitFlag(cookie,29,value));

        },

        //> private void onEnable(Event? event)
        onEnable : function(event) {

            var self = this;

            self.enable.css({display:'none'});
            self.value = self.input[0].value;

            self.setDisabled(self.disabled = 0);

            self.layer.onEnable();

            if (event) self.input[0].focus();
            if (event && $.trim(self.value)) self.onRequest(self.value);

        },

        //> private void onDisable(Event? event)
        onDisable : function(event) {

            var self = this;

            self.enable.css({display:'inline-block'});

            self.setDisabled(self.disabled = 1);

        },

        onSelect : function(event,message) {
            var self = this,text = message.text;
            self.value = self.input.val(text);
            self.onRequest(text.toLowerCase());
        },

        onKeyUp : function(event) {
            var self = this,value = self.input[0].value;
            self.enable.css({display:(self.disabled && value)?'inline-block':'none'});
            self.onResize();

            if(event.keyCode == 27){
                // hide on esc
                self.layer.hide();return;
            }

            var vis = self.layer.elem.is(":visible");
            // ensure that it will show on up/down
            if (cntrl[event.keyCode] && !self.layer.elem.is(":visible")) {self.layer.justShow(true); return; }
            if(self.disabled || cntrl[event.keyCode] || cntrl[event.keyCode]) return;
            window.setTimeout(self.onKey.bind(self),500);
        },

        onKeyDown : function(event) {
            var self = this,value = self.input[0].value;
            self.onResize();
        },

        onKey : function() {
            var self = this;
            if (self.input[0].value == self.value) return;
            else if (!(self.value = $.trim(self.input[0].value))) return self.hide();
            else self.onRequest(self.value.toLowerCase());

        },

        getFile : function(path,key) {

            var self = this,entry = self.cache[path];
            if (!entry || !entry.entries) return '';

            var root = entry.key,entries = entry.entries;
            for (var ndx = entries.length;(ndx && (root.concat(entries[ndx-1][0]) > key));ndx--);
            return (ndx > 0)?entries[ndx-1][2]:'';

        },

        getRequest : function(key) {
            var self = this,path = key,entry = self.cache[key],type = entry?entry.type:'n';
            var site = (self.site == "-1") ? "" : ("&sId=" + self.site);
            var href = "version=" + self.versions[self.version] + site + "&kwd=" + path;
            return {key:key,type:type,path:path,href:href};
        },

        nextRequest : function() {
            var self = this,queue = self.queue;
            while (self.queue.length > 1) self.queue.shift();
            return queue.length?queue[0]:null;
        },

        onRequest : function(key) {
            var self = this,queue = self.queue,request;
            queue.push(request = self.getRequest(key));
            if (queue.length == 1) self.onSend(request);

        },

        getList : function(response) {
            return (response.res)?((response.res.sug)? response.res:null):null;
        },


        getEntries : function(response) {
            var self = this,entries = response.pop();
            return entries?entries.sort(function(a,b) { return self.sortEntries(a,b); }):null;
        },

        sortEntries : function(a,b) {
            return (a[0] != b[0])?((a[0] > b[0])?1:-1):0;
        },

        cacheEntry : function(entry) {
            this.cache[entry.key] = entry;
        },

        cacheResponse : function(request,response) {
            var self = this;self.files[request.href] = true;
            var key = response.prefix,list = self.getList(response),entries = [];
            self.cacheEntry({key:key,type:"k",list:list,entries:entries});
        },

        onResponse : function(response) {

            var self = this;

            window.clearTimeout(self.timer);

            var request = self.queue.shift();
            if (response) self.cacheResponse(request,response);

            var key = request.key,entry = self.cache[key],type = entry?entry.type:'n';
            var request = !type.match(/k/)?self.getRequest(key):null;
            if (request && !self.files[request.href]) self.queue.unshift(request);

            var next = self.nextRequest();
            if (next) self.onSend(next);

            else if (type.match(/k/)) self.show(entry);
            else if (type.match(/n/)) self.show(null);

        },

        onSend : function(request) {
            var self = this,type = request.type,href = request.href;
            if (type.match(/k/) || self.files[request.href]) return self.onResponse();

            self.timer = window.setTimeout(self.onTimeout.bind(self),2000);

            var catVal = self.select?self.select.val():'0';
            var nocats = (self.isDomCats && catVal === '0')?'?nocats=1':'?nocats=0';

            $.ajax({url:[self.root.concat(nocats),href].join("&").concat('.js'),dataType:'jsonp',jsonp:false});

        },

        onTimeout : function() {

            var self = this,request = self.queue.shift();
            if (request == null) return;

            self.files[request.href] = true;

            var next = self.nextRequest();
            if (next) self.onSend(next);
            else self.show(null);

        },

        show : function(entry) {
            this.shown = true;
            this.layer.show(entry);
        },

        hide : function() {
            this.layer.hide();
        },

        onFocus: function(){
            if(!this.disabled){
                this.onResize();
                this.onRequest(this.value.toLowerCase());
            }
        },

        onResize: function() {
            var self = this, offset, setWidth,
            catDisp = self.elem.children(".afi.disabled"),
            srchButton = self.elem.children(".srch"),
            maxWidth = self.elem.innerWidth() - 30,
            cWidth = catDisp.outerWidth(true),
            padding = 10;

            if(!self.input.is(":visible") || (self.catDisplayActive && !catDisp.is(":visible"))){
                // wait until input and cat display are showing to resize
                setTimeout(self.onResize.bind(self), 100);
                return;
            }

            maxWidth -= srchButton.outerWidth(true);
            var maxOffset = maxWidth - cWidth;
            if(!self.testDiv){
                $("body").prepend("<div id='searchWidthDiv'/>");
                self.testDiv = $("#searchWidthDiv");
            }

            var testVal = self.input.val().replace(/ /g, "&nbsp;").replace(/</g, '&lt;').replace(/>/g, '&gt;');
            self.testDiv.html(testVal);

            var setWidth = maxWidth;
            if(self.catDisplayActive){
                offset = self.testDiv.width() + padding;
                if(offset >= maxOffset){
                    offset = maxOffset;
                    setWidth = maxOffset - padding;
                }
                catDisp.css("left", offset);
            }

            if(self.isVisualRef) {

            } else  {
                self.input.width(setWidth);
            }

        },

        removeCat: function(e){
            var self = this;
            e.stopPropagation();
            self.layer.currentCategory = false;
            self.layer.catInput.val(0);
            self.input.focus().val(self.input.val());
            self.currentCategory = false;
            snap.publish('rover',{an:'Dash.AutoFill.category.remove'},self);
        },

        updateCategory: function(message,newCat) {
            var self = this, catString = "", currInput = $.trim(self.input.val());
            if(newCat){
                catString = self.separator + " " + newCat + "<a class='removeCat' href='javascript:;'></a>";
            }

            if(catString == ""){
                self.displayInput.hide();
                self.catDisplayActive = false;
            } else if(self.displayInput.html() != catString){
                self.catDisplayActive = true;
                self.displayInput.show().html(catString)
                    .find(".removeCat").bind("click", function(e){
                        self.removeCat(e);
                        self.displayInput.hide();
                        self.onResize();
                    });
            }
            self.removeDispHover();
        },

        removeDispHover : function(){
            var self = this;
            self.displayInput.removeClass("hover");
        },

        addDispHover: function(){
            var self = this;
            self.displayInput.addClass("hover");
            snap.publish('rover',{an:'Dash.AutoFill.category.hover'},self);
        }

    });

    AutoFillInput.prototype._do = AutoFillInput.prototype.onResponse;
    return AutoFillInput;

});
