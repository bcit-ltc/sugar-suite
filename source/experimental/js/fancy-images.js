(function ($) {
	"use strict";

	// Widest
	$(window).on("load resize", function () {
		$(".widest").trigger("refit");
	});

	$(".widest").on("refit", function () {
		$(this).addClass("active");
		$(this).next(".ghost").remove();
		var $ghost = $("<div class='ghost'>");
		$(this).after($ghost);
		$ghost.css({
			height: $(this).height() + 10
		});
	});



	// Filters
	$(".saturate").each(function () {
		var currentFilters = $(this).css("filter");
		var filter = "saturate(200%)";
		if (currentFilters !== "none") {
			filter = currentFilters + " " + filter;
		}
		$(this).css("filter", filter);
	});



	// Shape Outside
	$(".shape-outside").each(function () {
		var prop = "url('" + $(this).attr("src") + "')";
		$(this).css("shape-outside", prop);
		$(this).closest("figure").css({
			margin: 0,
		});
	});
}(jQuery));