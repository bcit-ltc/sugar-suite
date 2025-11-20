// Load MathJax if <math> tags found on page
// https://www.mathjax.org/MathJax-v2-7-9-available/
(function(){
	if($("math").length) {
		$.getScript("https://cdn.jsdelivr.net/npm/mathjax@2.7.9/MathJax.js?config=TeX-AMS-MML_HTMLorMML").done(function() {
			// Track MathJax loaded
			if (window.plausible) {
				window.plausible('Feature Used', {
					props: { feature: 'mathjax-loader', action: 'loaded' }
				});
			}
		}).fail(function(jqxhr, settings, exception) {
			// Track MathJax load error
			if (window.plausible) {
				var errorMessage = exception ? exception.toString() : "Unknown error";
				window.plausible('Feature Used', {
					props: { feature: 'mathjax-loader', action: 'load-error', error: errorMessage }
				});
			}
		});
	}
}());