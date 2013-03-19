
(function() {
	var tags = 'abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video'.split('|');
	for (var idx = 0,len = tags.length;(idx < len);idx++) document.createElement(tags[idx]);
}());

