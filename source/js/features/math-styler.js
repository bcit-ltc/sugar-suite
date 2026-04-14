(function ($) {
	// Wrap plain text in figure.math > p with <math> tags for MathJax rendering
	// Only wrap if the p tag doesn't already contain a math tag
	$("figure.math > p").each(function () {
		if ($(this).find('math').length === 0) {
			var text = $(this).text();
			$(this).html('<math xmlns="http://www.w3.org/1998/Math/MathML"><mtext>' + text + '</mtext></math>');
		}
	});
}(jQuery));
