(function ($) {
	var $timers = $("[data-timer]");
	var $displays;

	$timers.each(function () {
		var time = $(this).data("timer");
		var $display = $("<div>");
		var $background = $("<div>");
		$display.addClass("_timer-display");
		$display.text(time);
		$background.addClass("_timer-background");
		
		$background.prepend($display);
		$(this).prepend($background);
	});

	$displays = $("._timer-display");

	$displays.one("click", function () {
		var originalTime = parseInt($(this).closest($timers).data("timer"));
		var $display = $(this);
		var $background = $(this).parent();
		var interval;
		
		$display.css("cursor","auto");

		function tick() {
			var time = getTime();
			time--;
			setTime(time);
		}

		function setTime(time) {
			$display.text(time);
		}

		function getTime() {
			return parseInt($display.text());
		}

		function updateColor() {
			var percent = (getTime() / originalTime);
			var color = "green";
			switch (true) {
			case (percent > 0.6):
				color = "green";
				break;
			case (percent > 0.3):
				color = "orange";
				break;
			case (percent > 0):
				color = "red";
				break;
			default:
				color = "black";
			}
			$display.css("color", color);
		}

		interval = setInterval(function () {
			if (getTime() === 1) {
				clearInterval(interval);
				$background.css({
					transition: "transform 15s ease"
				});
				$background.css({
					"transform": "scale(2) rotate(0turn)"
				});
				$background.css({
					transform: "scale(0) rotate(30turn)"
				});
				clearInterval(interval);
			}
			updateColor();
			tick();
		}, 100 * 60);
		updateColor();
		//tick();
	});

}(jQuery));