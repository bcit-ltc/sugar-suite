(function ($) {
	var hasMath = false;
	$("figure.math > p").each(function () {
		scanContents($(this));
		hasMath = true;
	});
	
	// Track math content loaded
	if (window.plausible && hasMath) {
		window.plausible('Feature Used', {
			props: { feature: 'math-styler', action: 'loaded' }
		});
	}

	function scanContents($parent) {
		var $children = $parent.children();
		var $textNodes = $parent.contents().filter(function () {
			return this.nodeType === 3;
		});

		$textNodes.each(function () {
			wrapNumbersAndSymbols($(this));
		});

		$children.each(function () {
			scanContents($(this));
		});
	}

	function wrapNumbersAndSymbols($textNode) {
		var html = $textNode.text();
		/* var matches = html.match(/(\d|\+|\-|\(|\)|\=)+/g);
		console.log(matches);
		for (var i in matches) {
			if (matches.hasOwnProperty(i)) {
				var string = matches[i];
				var re = new RegExp(string, "g");
				html = html.replace(re, "<span class='fake-mathjax-numbers'>" + string + "</span>");
			}
		} */
		$textNode.replaceWith(html);
	}
}(jQuery));
