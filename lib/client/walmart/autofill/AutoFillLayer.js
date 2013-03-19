
define('walmart.autofill.AutoFillLayer',function(snap) {

    var Cookies = snap.require('ebay.cookies');

    //> public AutoFillLayer(Object? config)
    var AutoFillLayer = function(config) {

        var self = this;AutoFillLayer.superclass.constructor.call(self,config);
        self.auto = snap.elem(self.auto);self.input = snap.elem(self.input);
        self.elem.css('z-index',self.auto.css('z-index')).prependTo(document.body);
    
        self.elem.bind('click',self.onClick.bind(self));
        self.input.bind('focus',self.onFocus.bind(self));

        self.elem.bind('mouseover',self.onMouseOver.bind(self));
        self.elem.bind('mouseout',self.onMouseOut.bind(self));

        self.sugg = $('div.sugg',self.elem);
        self.prod = $('div.prod',self.elem);
        self.logo = $('div.logo',self.elem);

        self.none = $('div.none',self.elem);
        self.foot = $('div.foot',self.elem);

        $('a',self.foot).bind('click',self.onDisable.bind(self));
        $("body").bind("hidePopOvers", function(e, data){
            if(!data || data.from != "afi") self.hide();
        });

    };

    snap.inherit(AutoFillLayer,'snap.Component');
    snap.extend(AutoFillLayer.prototype,{

        keys:{13:true,38:true,39:true,40:true},

        getLast : function(list,key) {

            var self = this,cookie = Cookies.readCookie('ds2','alss').split('.')[1];
            var last = cookie?cookie.substring(0,cookie.length - 8).replace(/\+/g,' '):null;

            for (var ndx = 0,words = last?last.split(/\s/):[],num = words.length;(ndx < num);ndx++) {
                if (words[ndx].match(key)) return self.showLast(list,last);
            }

            return list;

        },

        showLast : function(list,last) {
            var entries = [];entries.push(last);
            for (var ndx = 0,num = list.length;(ndx < num);ndx++) {
                if (list[ndx] != last) entries.push(list[ndx]);
            }
            return entries;
        },

        getSugg : function(event) {
            var targ = event.target,self = this,elem = self.elem[0];
            while ((targ != elem) && !targ.className.match(/afe/)) targ = targ.parentNode;
            return (targ != elem)?targ:null;
        },

        highlight : function(sugg) {
            var self = this;sugg.className = 'afe hl';
            if (self.selected) self.selected.className = 'afe';self.selected = sugg;
        },

        onSelect : function(sugg) {
            var self = this;self.highlight(sugg);
            self.input[0].value = sugg.type.match(/sugg/)?$('span.keys',sugg).text():self.value;
            self.elem.trigger('category',sugg.cat);
            self.publish('category',sugg.catName);
        },

        onBlur : function(event) {
            var self = this,related = self.related;
            if (related && $.contains(self.elem[0],related)) return;
            else self.timer = window.setTimeout(self.hide.bind(self),100);
        },

        onFocus : function(e){
            var self = this;
            clearTimeout(self.timer);
        },

        onKeyDown : function(event) {

            var self = this,key = event.keyCode,suggs = self.suggs;
            if (!self.keys[key] || (suggs.length <= 0)) return;

            var selected = self.selected,num = suggs.length;
            if ((key == 13) && selected) return self.onKeyEnter(selected);
            else if (key == 38) self.onSelect(suggs[selected?((selected.ndx - 1 + num) % num):num - 1]);
            else if (key == 40) self.onSelect(suggs[selected?((selected.ndx + 1) % num):0]);
            else if ((key == 39) && selected) self.onKeyRight(selected);

        },

        onKeyEnter : function(sugg) {

            var self = this;

            if (sugg.type.match(/sugg/)) self.onSugg(sugg);
            else if (sugg.type.match(/prod/)) self.onProd(sugg);
            else if (sugg.type.match(/logo/)) self.onLogo(sugg);
            else if (sugg.type.match(/auto/)) return;

            return self.hide();

        },

        onKeyRight : function(sugg) {
            var suggText = sugg.type.match(/sugg/)?$('span.keys',sugg).text():null;
            if (suggText) this.elem.trigger('select',{text:suggText,request:true});
        },

        onMouseOver : function(event) {
            if (!this.mouseovers++) return;
            var self = this,sugg = self.getSugg(event),selected = self.selected;
            if (sugg && (sugg != selected)) {
                self.highlight(sugg);
            }

        },

        onMouseOut : function(event) {

            var self = this;self.related = event.relatedTarget;
            if ($.contains(self.elem[0],self.related) || !self.selected) return;

            self.selected.className = 'afe';
            self.selected = null;
            self.input[0].value = self.value;

        },

        onClick : function(event) {
            var self = this,sugg = self.getSugg(event);
            if($(this).closest(".related").size() > 0){
                document.location = $(this).attr("href");
                return false;
            }
            if (sugg == null) return false;

            if (sugg.type.match(/prod/)) self.onProd(sugg);
            else if (sugg.type.match(/logo/)) self.onLogo(sugg);
            else self.onSugg(sugg);

            return self.hide();

        },

        onSugg : function(sugg) {
            var self = this;self.input[0].value = $('span.keys',sugg).text();
            self.elem.trigger('submit',{trksid:($('span.cat',sugg).length)?self.trksid.catsugg:self.trksid.sugg});
        },

        onProd : function(sugg) {

            var self = this,href = $uri(self.prodURL);href.appendParam('_pid',sugg.pid);
            if (self.trksid.prod) href.appendParam('_trksid',self.trksid.prod);

            window.location = href.getUrl();

        },

        onLogo : function(sugg) {

            var self = this,link = $('a',sugg),href = $uri(link[0].href);
            if (self.trksid.logo) href.appendParam('_trksid',self.trksid.logo);

            window.location = href.getUrl();

        },

        offsetTop : function(elem,parent) {
            for (var offsetTop = 0;(elem && (elem !== parent));elem = elem.offsetParent) { offsetTop += elem.offsetTop; }
            return offsetTop;
        },

        offsetLeft : function(elem,parent) {
            for (var offsetLeft = 0;(elem && (elem !== parent));elem = elem.offsetParent) { offsetLeft += elem.offsetLeft; }
            return offsetLeft;
        },

        //> protected void onResize(Event? event)
        onResize : function(event) {
            var self = this,elem = self.parent.elem,offset = elem.offset();
            self.elem.css({top:offset.top + elem.height() + 8,left:offset.left,width:elem.width() + 1});
        },

        onDisable : function(event) {
            this.elem.css({display:'none'});
            this.elem.trigger('disable');
            this.disabled = true;
        },

        //> protected void show(Object? entry)
        show : function(entry) {
            $("body").trigger("hidePopOvers", {from:"afi"});

            var self = this,elem = self.elem;self.mouseovers = 0;
            self.value = $.trim(self.input[0].value),self.suggs = [];self.selected = null;
            $('a',self.foot).attr({'class':'show'});

            self.onResize();

            self.sugg.css('display','none');
            self.prod.css('display','none');
            self.logo.css('display','none');
            self.none.css('display','none');

            var hide = true;
            if ((entry && entry.list) || self.currentCategory){
                entry = entry || {};
                self.showEntry(entry);
                elem.css('display','block');
            }
            if(self.suggs.length == 0){
                self.hide();
            }
            self.bind();
        },

        justShow : function(highlightFirst) {
            $("body").trigger("hidePopOvers", {from: "afi"});
            var self = this, suggs = self.sugg.find(".afe").hide();

            self.onResize();

            // highlight the first one
            self.sugg.find(".hl").removeClass("hl");
            if(highlightFirst){
                self.sugg.find(".afe:first").addClass("hl");
            }

            var show = false;
            suggs.each(function(){
                if($.trim($(this).text()) != ""){
                    show = true;
                    $(this).show();
                }
            });
            if(show){
                self.sugg.css('display','block');

                self.elem.css('display','block');

                self.bind();
            }
        },

        bind: function(){

            var self = this;

            $(window).unbind('resize',self.onresize);
            $(window).bind('resize',self.onresize = self.onResize.bind(self));

            self.input.unbind('blur').bind('blur',self.onBlur.bind(self));
            self.input.unbind('keydown').bind('keydown',self.onKeyDown.bind(self));

        },

        showNone : function() {
            var self = this;self;self.none.css('display','block');
            self.timer = window.setTimeout(self.hide.bind(self),3000);
        },

        showEntry : function(entry) {
            var self = this,keys = (entry.key) ? entry.key.split(' ') : [];
            for (var kdx = 0,num = keys.length;(kdx < num);kdx++) {
                if(keys[kdx] == '.') keys[kdx]='\\.';
                keys[kdx] = new RegExp('(' + '(^|\\s+)' + keys[kdx] + ')','i');
            }

            if (entry.list){
                self.showSugg(entry,keys);
                if (entry.list.prd && self.prod) self.showProd(entry,keys);
                if (entry.list.td) self.showLogo(entry,keys);
                self.suggs.push({type:'auto',ndx:self.suggs.length,catName: (self.currentCategory) ? self.currentCategory : ""});
            }
        },

        onAddSugg : function(suggs,sug,cat,force) {
                var afe = $('<div/>').attr({'class':'afe'}).html(sug);
                afe[0].type = 'sugg';afe[0].ndx = suggs.length;suggs.push(afe[0]);

                if(force || cat){
                    afe[0].cat = cat[0];
                    afe[0].catName = cat[1];
                    afe.append($('<span class="cat">&nbsp;<b>in ' + cat[1] + '</b></span>'));
                }
                return afe;
        },

        showSugg : function(entry,keys) {
            var self = this,suggs = self.suggs,sugg = self.sugg.css('display','block').html('');
            var list = entry.list,cats = list.categories,list = list.sug?list.sug:list;list = self.getLast(list,entry.key);
            var maxEntries = 6;

            self.showAllCatSuggest();

            for (var ndx = 0; ndx < maxEntries;ndx++) {
                var sug = list[ndx];
                if (cats && (ndx == 0)){
                    if(sug != $.trim(self.value)){
                        sugg.append(self.onAddSugg(suggs,self.setHighlight(sug,keys)));
                    }

                    for(var ci = 0, cn = cats.length; (ci < cn); ci++) {
                                        if(cats[ci][1]==null || cats[ci][1]=='' || cats[ci] == self.currentCategory) continue;
                                        sugg.append(self.onAddSugg(suggs,self.setHighlight(sug,keys),cats[ci]));
                                 }
                                 continue;
                }
                if(!sug || sug == "" || sug == $.trim(self.value)){
                    continue;// only add if it isn't the same as the value in the box
                }

                sugg.append(self.onAddSugg(suggs,self.setHighlight(sug,keys)));
            }
        },

        showAllCatSuggest: function(){
            // when we're in a category, show an option to go to all categories
            var self = this, sugg = self.sugg.css('display','block').html(''), val = $.trim(self.input.val());
            self.suggs = self.suggs || [];

            if(self.currentCategory && val != ""){
                sugg.append(self.onAddSugg(self.suggs, "<span class='keys nobold'>" + val + "</span>", [0,"All Categories"], true));
            }
        },

        showProd : function(entry,keys) {

            var self = this;

            var prod = self.prod.css('display','block');
            var body = $('div.body',prod).html('');

            var tabl = $('<table/>').attr({cellSpacing:0,cellPadding:0}).css({width:'100%'}).appendTo(body);
            var list = entry.list.prd,suggs = self.suggs,tbody = $('<tbody/>').appendTo(tabl);

            for (var ndx = 0,num = list.length;(ndx < num);ndx++) {

                var prod = list[ndx];

                var row = $('<tr/>').attr({'class':'afe'}).appendTo(tbody);
                var icon = $('<td/>').attr({'class':'img'}).appendTo(row);

                $('<img/>').attr({'class':'img'}).attr({src:prod[2]}).appendTo(icon);
                $('<td/>').html(self.setHighlight(prod[1],keys)).appendTo(row);

                row[0].type = 'prod';row[0].pid = prod[0];row[0].ndx = suggs.length;
                suggs.push(row[0]);

            }

        },

        showLogo : function(entry,keys) {

            var self = this,logo = self.logo.css('display','block').html('');

            var tabl = $('<table/>').attr({cellSpacing:0,cellPadding:0}).appendTo(logo);
            var list = entry.list.td,suggs = self.suggs,tbody = $('<tbody/>').appendTo(tabl);

            for (var ndx = 0,num = list.length;(ndx < num);ndx++) {

                var logo = list[ndx];

                var row = $('<tr/>').attr({'class':'afe'}).appendTo(tbody);
                var cell = $('<td/>').appendTo(row),link = $('<a/>').attr({href:logo[2]}).appendTo(cell);

                var image = $('<img/>').attr({src:logo[1]}).css('max-width',self.auto.outerWidth() - 22).appendTo(link);
                $(document).trigger('rover',{imp:5276,rpg:self.pid,kw:self.value,td:logo[0]});

                row[0].type = 'logo';row[0].ndx = suggs.length;
                suggs.push(row[0]);
            }

        },

        setHighlight : function(text,keys) {
            var kdx = 0,len = keys.length;
            if(text){
                while (kdx < len) text = text.replace(keys[kdx++],'<i>$1</i>');
            }
            return $('<span class="keys"/>').append(text);
        },

        //> private boolean hide(Event? event)
        hide : function(event) {
            this.selected = null;
            this.elem.css('display','none');
            return false;
        },

        onEnable: function() {
            this.disabled = false;
        }

    });

    snap.extend(AutoFillLayer,{

        template : function(config,context) {
            context.render(AutoFillLayer.getName());
            context.queue(config);
        }

    });

    return AutoFillLayer;

});
