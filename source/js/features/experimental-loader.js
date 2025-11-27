(function ($) {
	if ($("body").hasClass("experimental")) {
		loadExperimentalFiles($);
	}

	function loadExperimentalFiles($) {
		// var hostname = window.location.hostname;
		// var serverPath = "https://ltc.bcit.ca/public/v1";
		var cssPath = "../../css/experimental.css";
		var jsPath = "../../js/experimental.js";
		// var isLocal = hostname === "localhost" || hostname === "127.0.0.1";

		// if (!isLocal) {
		// 	cssPath = serverPath + cssPath;
		// 	jsPath = serverPath + jsPath;
		// }

		attachStylesheet($, cssPath);
		loadScript(jsPath);
	}

	function attachStylesheet($, cssPath) {
		var $stylesheet = $("<link>");
		var $head = $("head");

		$stylesheet.attr("rel", "stylesheet");
		$stylesheet.attr("type", "text/css");
		$stylesheet.attr("href", cssPath);
		$stylesheet.appendTo($head);
	}

	function loadScript(jsPath) {
		// Use a more reliable method for loading scripts with file:// protocol
		var script = document.createElement('script');
		script.src = jsPath;
		script.onload = function() {
			console.log("Experimental script loaded successfully");
		};
		script.onerror = function() {
			console.log("Failed to load experimental script from", jsPath);
		};
		document.head.appendChild(script);
	}
}(jQuery));
