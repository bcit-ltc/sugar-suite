(function ($) {
	var _$ = window.parent.jQuery || jQuery;

	var $mask = _$("<div>");
	var $topBody = _$("body");
	var $body = $("body");
	var $button = $("<button>");

	$mask.addClass("_night-mode-mask");
	$mask.css({
		"pointer-events": "none",
		"display": "none",
		"z-index": 9999,
		transition: "background 1s ease",
		background: "rgba(44, 0, 0, 0.27)",
		height: "100%",
		width: "100%",
		position: "fixed",
	});
	$mask.prependTo($topBody);

	$button.attr("id", "night-mode");
	$button.attr("title", "Night Mode Sucka");
	$button.prependTo($body);
	$button.on("click", function () {
		$mask.fadeToggle();
	});
}(jQuery));