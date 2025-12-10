// Load MathJax if <math> tags found on page
// https://www.mathjax.org/MathJax-v2-7-9-available/
(function(){
	if($("math").length) {
		fetch('./js/vendor/MathJax-2.7.9.js?config=TeX-AMS-MML_HTMLorMML')
			.then(response => response.text())
			.then(code => {
				eval(code);
			});
	}
}());