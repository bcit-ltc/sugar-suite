/********************
DEVELOPMENT-DEBUGGING
********************/
(function ($) {
	"use strict";
	
	var $body = $("body");

	if ($body.hasClass("under-construction")) {
		$body.prepend("<button id='debug'>Scan for Errors</button>");
	}

	$("button#debug").on("click", function () {
		if ($body.hasClass("debug")) {
			deactivate();
		} else {
			activate();
		}
	});
	
	$(document).bind('DOMSubtreeModified', function () {
		if ($("body").hasClass("debug")) {
			deactivate();
			activate();
		} 			
		if (!$("body").hasClass("debug")) {
			deactivate();
		}
	});

	function activate() {
		$body.addClass("debug");
		showBreaks();
		showWrongHeadings();
		showEmptyTags();
	}

	function deactivate() {
		$body.removeClass("debug");
		hideBreaks();
		hideWrongHeadings();
		hideEmptyTags();
	}

	function showBreaks() {
		$("br").each(function () {
			$(this).before("<i class='break'>Break Tag</i>");
		});
	}

	function hideBreaks() {
		$(".break").remove();
	}

	function headingValue(tagName) {
		return parseInt(tagName.charAt(1));
	}

	function showWrongHeadings() {
		var prevHeading = headingValue("H1");
		$("h1,h2,h3,h4,h5,h6").each(function () {
			var thisHeading = headingValue($(this).prop("tagName"));
			if (thisHeading - prevHeading >= 2) {
				$(this).addClass("_wrong-heading");
				$(this).attr("data-message", "Current: <h" + thisHeading + ">, Max: <h" + (prevHeading + 1) + ">");
			}
			prevHeading = thisHeading;
		});
	}

	function hideWrongHeadings() {
		$("._wrong-heading").removeClass("_wrong-heading");
	}

	function showEmptyTags() {
		$("*:not(a,img,td,th,tr,br,hr,.night-mode,#night-mode,.night-mask)").each(function () {
			var contents = $(this).html();
			if (contents === "" || contents === " ") {
				$(this).attr("data-tag", $(this).prop("tagName").toLowerCase());
				$(this).addClass("_empty-tag");
			}
		});
	}

	function hideEmptyTags() {
		$("._empty-tag").removeClass("_empty-tag");
	}

	function displayStructure() {
		// Print heading structure to the console
		$("h1,h2,h3,h4,h5,h6").each(function () {
			var tagName = $(this).prop("tagName");
			var spaces = headingValue(tagName);
			// Add indentation
			while (spaces > 0) {
				tagName = " " + tagName;
				spaces--;
			}
			console.log(tagName + ":	" + $(this).text());
		});
	}
})(jQuery);