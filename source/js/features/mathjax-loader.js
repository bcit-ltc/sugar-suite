// Load MathJax v4 from CDN if <math> tags found on page
// https://docs.mathjax.org/en/latest/web/configuration.html
(function(){
	if($("math").length) {
		// Configure MathJax 4 - using defaults
		// window.MathJax = {
		// 	options: {
		// 		enableMenu: true,
		// 		enableExplorer: true
		// 	}
		// };
		
		// Load MathJax v4 from jsDelivr CDN
		var script = document.createElement('script');
		script.id = 'MathJax-script';
		script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js';
		document.head.appendChild(script);
	}
}());