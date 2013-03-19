
define('walmart.categories.CategoryPanel',function(snap) {

	var Content = snap.require('snap.Content');

	//> public CategoryPanel(Object? config)
	var CategoryPanel = function(config) {

		var self = this;CategoryPanel.superclass.constructor.call(self,config);
		self.head = $('<div class="cat-ph"/>').appendTo(self.elem);
		self.buildCategory(config,self.head);

		self.body = $('<div class="cat-pb"/>').appendTo(self.elem);
		if (config.visible) self.buildCategories(config.visible,self.body);
		if (!config.hidden) return;

		self.more = $('<div class="cat-pm"/>').appendTo(self.body);
		self.buildCategories(config.hidden,self.more);

		self.option = $('<div class="cat-pl"/>').appendTo(self.body);

		var more = $('<span class="cat-po more"/>').append(Content.get('srp_snap/Categories.More'));
		var option = $('<a class="cat-po"/>').append(more).append('<span/>').appendTo(self.option).bind('click',self.onOption.bind(self));

	};

	snap.inherit(CategoryPanel,'snap.Container');
	snap.extend(CategoryPanel.prototype,{

		classes:{elem:'cat-p'},

		buildCategories : function(categories,target) {
			for (var self = this,idx = 0,category;(category = categories[idx]);idx++) {
				self.buildCategory(category,target);
			}
		},

		buildCategory : function(config,target) {
			var self = this,category = $('<div class="cat-pl"/>').appendTo(target);
			category.append($('<span class="cat-pc"/>').append(self.formatter.format(config.count)));
			category.append($('<a class="cat-pa"/>').append(config.name).attr({href:config.url}));
			$('a.cat-pa',category).bind('click',self.onCategory.bind(self));
		},

		onCategory : function(event) {
			var self = this,target = $(event.target),uri = $uri(target.attr('href'));
			snap.publish('query',uri.getUrl(),self);
			return false;
		},

		onOption : function(event) {
			
			var self = this,option = $('span.cat-po',self.option),top = self.option.position().top;
			var more = option.hasClass('more');option.toggleClass('more fewer');self.more.css({display:more?'block':'none'});
			
			option.text(Content.get(more?'srp_snap/Categories.Fewer':'srp_snap/Categories.More'));
			self.publish(more?'more':'fewer',{scroll:top - self.option.position().top},true);

		}

	});

	return CategoryPanel;

});
