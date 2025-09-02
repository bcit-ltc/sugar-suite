(function ($) {
	var $button = $("<button>");
	$button.addClass("__fullscreen-button");
	$button.text("Toggle Full Screen");
	$(".container").prepend($button);

	$button.on("click", function (e) {
		toggleFullScreen();
	});

	$(document).keypress(function (e) {
		onKeyDown(e);
	});

	function toggleFullScreen() {
		var d = document;
		var el = d.documentElement;

		// Cross-Browser test if fullscreen is active
		var isFullScreen = (d.fullScreenElement &&
				d.fullScreenElement !== null) ||
			(!d.mozFullScreen &&
				!d.webkitIsFullScreen);

		// Safari may need to be disabled...
		// var isSafari = /Safari/.test(navigator.userAgent);

		// Use appropriate request method
		var requestMethod = el.requestFullScreen ||
			el.webkitRequestFullScreen ||
			el.mozRequestFullScreen ||
			el.msRequestFullScreen;

		// Use appropriate cancel method
		var cancelMethod = d.cancelFullScreen ||
			d.mozCancelFullScreen ||
			d.webkitCancelFullScreen;

		// Call appropriate method for toggle
		if (isFullScreen) {
			// The second option may need to be conditional
			requestMethod.call(el, Element.ALLOW_KEYBOARD_INPUT);
		} else {
			cancelMethod.call(d);
		}
	}

}(jQuery));

function onKeyDown(event) {
	evt = window.event ? window.event : arguments[0];
	if ((evt.altKey) || ((evt.keyCode == 8) && (evt.srcElement.type != "text" && evt.srcElement.type != "textarea" && evt.srcElement.type != "password")) ||
		((evt.ctrlKey) && ((evt.keyCode == 82))) ||
		(evt.keyCode == 122)) {
		evt.keyCode = 0;
		evt.returnValue = false;
	}
}