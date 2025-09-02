// <a>
(function ($) {
	// Which file types should be opened in a new tab?
	var browserFiles = [
		"svg",
		"jpg",
		"jpeg",
		"gif",
		"png",
		"ppt",
		"pptx",
		"xls",
		"xlsx",
		"pdf",
		"mp4"
	];

	// Expression for selecting specific files
	$.expr[':'].browserFiles = function (link) {
		if (link.pathname && link.pathname.length) {
			var pathname = link.pathname.toLowerCase();
			var ext = pathname.substring(pathname.lastIndexOf(".") + 1);

			if (browserFiles.indexOf(ext) !== -1) {
				return true;
			}
		}
		return false;
	};

	// Address old content affected by the Dewordify bug that prepended email addresses with an assets folder
	$("a[href*='assets/mailto:']").each(function () {
		var href = $(this).attr("href");
		var newHref = href.split("assets/")[1];
		$(this).attr("href", newHref);
	});

	// Expression for selecting external links
	$.expr[':'].external = function (link) {
		return !link.href.match(/^mailto\:/) &&
			(link.hostname != location.hostname);
	};

	// Set all hyperlink with no target to open link in new tab
	$("a").each(function () {
		if (!$(this).attr("target")) {
			let linkHref = $(this).attr("href");
			$(this).attr("target", "_blank");
		}
	});

	// Set specific files types to open in a new tab
	$("a:browserFiles").each(function () {
		if ($(this).attr("target") == "_self") {
			$(this).attr("target", "_blank");
			$(this).attr("rel", "external");
			$(this).attr("title", "Opens in a new tab");
		}
	});

	// Set external anchors to open in new tab
	$("a:external").each(function () {
		if ($(this).attr("target") == "_self") {
			$(this).attr("target", "_blank");
			$(this).attr("rel", "external");
			$(this).attr("title", "Opens in a new tab");
		}
	});

	// Set title of anchors with download attribute
	$("a[download]").attr("title", "Download");
}(jQuery));