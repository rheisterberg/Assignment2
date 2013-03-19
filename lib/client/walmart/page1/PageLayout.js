
define('search.page.PageLayout',function(snap) {

    var bits = [25,26,40,41];

    var layouts = [
        {name:'sz760',minWidth:760,maxWidth:940,value:1},
        {name:'sz940',minWidth:940,maxWidth:1200,value:0},
        {name:'sz1200',minWidth:1200,maxWidth:1200,value:5}
    ];

    var Cookies = snap.require('ebay.cookies');

    var PageLayout = snap.extend(function() {},{

        setLayout : function(layout) {

            var self = this,cookie = Cookies.readCookie('dp1','pbf') || '#';
            for (var ndx = 0,value = layout.value,num = bits.length;(ndx < num);ndx++,value >>= 1)
                cookie = Cookies.setBitFlag(cookie,bits[ndx],value & 1);

            Cookies.writeCookielet('dp1','pbf',cookie);
            return layout;

        },

        computeLayout : function(event) {

            var self = this,width = $(window).width(),current = self.current;
            for (var idx = layouts.length - 1;(idx && (width < layouts[idx].minWidth));idx--);
            if (layouts[idx] != current) current = self.setLayout(self.current = layouts[idx]);

            var match = document.body.className.match(current.name);
            if (match == null) document.body.className = current.name;

            // Write GMT Timezone Offset
            Cookies.writeCookielet('dp1','tzo',new Date().getTimezoneOffset().toString(16));

        },

        setFixedGridLayout: function() {
        }

    });

    $(window).bind('resize beforeunload',PageLayout.computeLayout.bind(PageLayout));

    PageLayout.computeLayout();
    return PageLayout;

});

snap.require('search.page.PageLayout');