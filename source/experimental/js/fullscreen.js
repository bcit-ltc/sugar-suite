(function ($) {
	const $button = $("<button>");
	$button.addClass("__fullscreen-button");
	$button.attr("title", "Toggle Full Screen");
	$button.prependTo($("body"));

	$button.on("click", function (e) {
		e.preventDefault();
		toggleFullScreen();
	});

	document.addEventListener("keydown", function (e) {
		onKeyDown(e);
	});

	function onKeyDown(event) {
		if ((event.altKey) || 
			((event.key === "Backspace") && (event.target.type !== "text" && event.target.type !== "textarea" && event.target.type !== "password")) ||
			((event.ctrlKey) && (event.key === "r")) ||
			(event.key === "F11")) {
			event.preventDefault();
		}
	}

	function toggleFullScreen() {
		const doc = document;
		const el = doc.documentElement;

		// Check if currently in fullscreen
		const isFullScreen = !!doc.fullscreenElement;

		if (!isFullScreen) {
			// Enter fullscreen
			if (el.requestFullscreen) {
				el.requestFullscreen().catch(err => {
					console.log(`Error attempting to enable fullscreen: ${err.message}`);
				});
			}
		} else {
			// Exit fullscreen
			if (doc.exitFullscreen) {
				doc.exitFullscreen().catch(err => {
					console.log(`Error attempting to exit fullscreen: ${err.message}`);
				});
			}
		}
	}

}(jQuery));