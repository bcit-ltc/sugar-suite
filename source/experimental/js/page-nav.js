(function ($) {
	// Select D2L's jQuery object
	var _$ = window.parent.jQuery;
	var isD2L = _$("body.d2l-body").length;
	
	//isD2L = true; // For dev purposes
	if(isD2L) {
		var $pageNav = $("<nav>");
		var $nextButton = $("<button>");
		var $prevButton = $("<button>");
		var $topButton = $("<button>");
		var _$prevButton = _$("[role='button'][title='Previous ']").eq(0);
		var _$nextButton = _$("[role='button'][title='Next']").eq(0);
		
		_$.fn.visuallyHide = function () {
			$(this).css({
				"display": "none",
				"visibility": "hidden",
				"height": 0,
				"width": 0,
				padding: 0,
				margin: 0,
			});
		};
		
		// Hide D2L's unecessary UI buttons
		_$(".d2l-iterator").last().visuallyHide();
		_$("[title='View content in new window']").visuallyHide();
		_$("[role='button']:contains(Print)").visuallyHide();

		$pageNav.addClass("__page-nav");
		$pageNav.append($prevButton, $topButton, $nextButton);

		$prevButton.text("Prev Page");
		$nextButton.text("Next Page");
		$topButton.text("Back to top");

		// Connect buttons to D2L's hidden buttons
		$prevButton.on("click", function () {
			_$prevButton.each(function () {
				this.click();
			});
		});
		$nextButton.on("click", function () {
			_$nextButton.each(function () {
				this.click();
			});
		});
		
		$topButton.on("click", function() {
			_$("html,body").animate({
				scrollTop: 0
			},1000);
		});

		// Add the buttons to the page
		$(".container").append($pageNav);
	}

}(jQuery));

