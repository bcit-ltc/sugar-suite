// Load MathJax if <math> tags found on page
(function(){
	if($("math").length) {
		$.getScript("https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML");
	}
}());