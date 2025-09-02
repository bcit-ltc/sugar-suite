// Load MathJax if <math> tags found on page
// https://www.mathjax.org/MathJax-v2-7-9-available/
(function(){
	if($("math").length) {
		$.getScript("https://cdn.jsdelivr.net/npm/mathjax@2.7.9/MathJax.js?config=TeX-AMS-MML_HTMLorMML");
	}
}());