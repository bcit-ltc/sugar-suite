(function ($) {
	if ($("body").hasClass("experimental")) {
		loadExperimentalFiles($);
	}

	function loadExperimentalFiles($) {
		// var hostname = window.location.hostname;
		// var serverPath = "https://ltc.bcit.ca/public/v1";
		var cssPath = "../css/experimental.css";
		var jsPath = "../js/experimental.js";
		// var isLocal = hostname === "localhost" || hostname === "127.0.0.1";

		// if (!isLocal) {
		// 	cssPath = serverPath + cssPath;
		// 	jsPath = serverPath + jsPath;
		// }

		attachStylesheet($, cssPath);
		getScript($, jsPath);
	}

	function attachStylesheet($, cssPath) {
		var $stylesheet = $("<link>");
		var $head = $("head");

		$stylesheet.attr("rel", "stylesheet");
		$stylesheet.attr("type", "text/css");
		$stylesheet.attr("href", cssPath);
		$stylesheet.appendTo($head);
	}

	function getScript($, jsPath) {
		$.getScript(jsPath).fail(handleFail);

		function handleFail() {
			console.log("Failed to load experimental script from", jsPath);
		}
	}
}(jQuery));
