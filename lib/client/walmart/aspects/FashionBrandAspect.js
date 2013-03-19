
define('walmart.aspects.FashionBrandAspect',function(snap) {

    var Content = snap.require('snap.Content');

    var Component = snap.require('snap.Component');
    var Checkbox = snap.require('snap.checkbox.Checkbox');

    var VerticalScroller = snap.require('snap.scrollbar.vertical.VerticalScroller');

    //> public FashionBrandAspect(Object? config)
    var FashionBrandAspect = function(config) {
        FashionBrandAspect.superclass.constructor.call(this,config);
    };

    snap.inherit(FashionBrandAspect,'walmart.aspects.DefaultAspect');
    snap.extend(FashionBrandAspect.prototype,{

        getTarget : function() {
            return this.brands || (this.brands = $('div.brnd',this.elem));
        },

        buildValues : function(values) {

            var self = this;self.uri = $uri(self.action);
            self.uri.appendParam('_bsrch','1');self.uri.appendParam('fashion','1');

            self.input = $('input.search',self.body);
            self.input.bind('focus',self.onLoad.bind(self));
            self.input.bind('paste',self.onSearch.bind(self));
            self.input.bind('keyup',self.onSearch.bind(self));

            self.scroller = new VerticalScroller({scrollable:self,target:self.brands});

            self.layout(true);

        },

        buildBrands : function(values,expr) {
            var self = this;self.removeChildren();
            for (var idx = 0,value;(value = values[idx]);idx++) {
                var match = expr?value.title.match(expr):true;
                if (match) self.buildBrand(value,expr);
            }
            self.scroller.scroll(0);
            self.layout(true);
        },

        buildBrand : function(value,expr) {
            var self = this,title = expr?value.title.replace(expr,'<i class="hl">$1</i>'):value.title;
            self.appendChild(new Checkbox({data:value,name:self.name,value:value.param,text:title,selected:value.selected}),true);
        },

        onSelect : function(message,href) {
            var self = this,uri = $uri(href),brand = uri.params['Brand'];
            if (snap.isArray(brand)) uri.params['Brand'] = brand.join('|');
            delete uri.params['_ssan'];delete uri.params['_bsrch'];delete uri.params['fashion'];
            uri.params['_dcat'] = self.uri.params['_dcat'];
            snap.publish('query',uri.getUrl(),self);
        },

        onLoad : function(event) {
            var self = this,success = self.onLoaded.bind(self),error = self.onError.bind(self);
            $.ajax({url:self.uri.getUrl(),dataType:'json',success:success,error:error});
        },

        onLoaded : function(response) {
            var self = this;self.values = response.values;
            self.input.unbind('focus');
        },

        onError : function(request,error,status) {
            snap.log('debug','FashionBrandAspect.onError',status);
            this.input.unbind('focus');
        },

        onSearch : function(event) {
            var self = this,value = self.input.val();
            self.buildBrands(self.values,value?new RegExp('(' + '(^|-|\\s+)' + value + ')','gi'):null);
            if (self.children.length <= 0) self.appendChild(self.onEmpty());
        },

        onEmpty : function() {
            var self = this,error = new Component({});
            var content = Content.get('srp_snap/Aspects.noMatchingAspectMsg');
            error.elem.append($('<div class="err">'+content[self.config.name]+'</div>'));
            return error;
        }

    });

    snap.extend(FashionBrandAspect,{

        template : function(config,context) {

            var content = Content.get('srp_snap/Aspects.FashionBrandPlaceholder');
            config.placeholder = Content.render(content[config.name]);

            var name = config.name,tiled = config.display.match(/TILED/);
            var nodes = config.children = config.children || config.values;delete config.values;
            for (var idx = 0,node;(node = nodes[idx]);idx++) {
                node.name = name;node.text = node.title;node.href = node.url;
                node.tid = 'snap.checkbox.Checkbox';
            }

            context.render(FashionBrandAspect.getName());

            delete config.children;
            context.queue(config);

        }

    });

    return FashionBrandAspect;

});
