(function () {
	var $subHeadings = $("h1,h2,h3,h4,h5,h6").slice(1);
	var isAppropriate = function () {
		if ($subHeadings.length < 5) {
			return false;
		}
		if ($(".stop-nav").length) {
			return false;
		}
		return true;
	};
	
	console.log("Working");

	if (isAppropriate()) {
		var $nav = $("<nav>");
		var $title = $("<h2>On this page:</h2>");
		var $navList = $("<ul>");

		$subHeadings.each(function (i) {
			// Get the heading number
			var step = $(this).prop("tagName").charAt(1);

			// Get the anchor number
			var anchor = "__section" + i;

			// Apply the anchor number as an id
			$(this).attr("id", anchor);

			$navList.append("<li data-step='" + step + "'><a href='#" + anchor + "'>" + $(this).text() + "</a></li>");
		});

		$nav.append($title, $navList);
		$nav.attr("id", "__on-page-nav");
		$("h1").first().after($nav);
	}
}());