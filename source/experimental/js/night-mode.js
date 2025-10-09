(function ($) {
	var _$ = window.parent.jQuery || jQuery;

	var $mask = _$("<div>");
	var $topBody = _$("body");
	var $body = $("body");
	var $button = $("<button>");

	$mask.addClass("_night-mode-mask");
	$mask.prependTo($topBody);

	$button.attr("id", "night-mode");
	$button.attr("title", "Night Mode Sucka");
	$button.prependTo($body);
	$button.on("click", function () {
		$mask.fadeToggle();
	});
}(jQuery));