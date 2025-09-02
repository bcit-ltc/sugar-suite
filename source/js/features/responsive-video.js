// Responsive Youtube

(function () {
	// finds youtube/vimeo iframes and wraps them with figure.video tags
	$("iframe").each(function () {
		if ($(this).is("[src*='youtu']") || $(this).is("[src*='vimeo']")) {
			
			if($(this).closest("figure").length === 0) {
				$(this).wrap("<figure class='video'>");
			}
		}
	});
	
	// finds iframes inside figure.video tags prepares them to be responsive (see also: _media.scss)
	$("figure.video iframe").each(function () {
		$(this).removeAttr("width").removeAttr("height");
		$(this).wrap("<div class='video-wrapper'></div>");
		if ($(this).hasClass("square") || $(this).closest(".square").length) {
			$(this).closest(".video-wrapper").addClass("square");
		}
	});
}());