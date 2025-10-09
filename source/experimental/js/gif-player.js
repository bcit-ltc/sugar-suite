(function ($) {
	// libgif documentation: https://github.com/buzzfeed/libgif-js
	var scriptLocation = "../js/vendor/libgif.js";
	var $gifs = $("img[src*='.gif'][controls]");

	if ($gifs.length) {
		loadScript(scriptLocation, function () {
			init();
		});
	}

	function loadScript(src, callback) {
		var script = document.createElement('script');
		script.src = src;
		script.onload = function() {
			if (callback) callback();
		};
		script.onerror = function() {
			console.log("Failed to load script:", src);
		};
		document.head.appendChild(script);
	}

	function init() {

		// Loop through the gifs
		$gifs.each(function () {
			var $gif = $(this);
			var $frameCount = $("<p>");
			var $controls = $("<nav>");

			var $pause = createButton("pause", "Pause");
			var $back = createButton("back", "Back");
			var $forward = createButton("forward", "Forward");
			var $slider = $("<input type='range' min='0' max='200' step='1' value='100'>");

			var interval;

			$controls.append($back, $pause, $forward);
			$gif.after($frameCount, $controls, $slider);
			$controls.hide();

			var src = $(this).attr("src");
			var options = {
				gif: this,
				progressbar_height: 5,
				rubbable: true,
				progressbar_foreground_color: "cyan",
				max_width: $gif.parent().width()
			};
			var gif = new SuperGif(options);
			gif.load(function () {
				$controls.fadeIn();
				gif.pause();
				play();
			});

			$pause.on("click", function () {
				if ($(this).is(".pause")) {
					pause();
					$(this).removeClass("pause");
					$(this).addClass("play");
					$(this).text("Play");
				} else {
					$(this).removeClass("play");
					$(this).addClass("pause");
					$(this).text("Pause");
					play();
				}
			});

			$back.on("click", function () {
				pause();
				if (gif.get_current_frame() === 0) {
					gif.move_to(gif.get_length() - 1);
				} else {
					gif.move_relative(-1);
				}
			});
			$forward.on("click", function () {
				pause();
				if (gif.get_current_frame() > gif.get_length()) {
					gif.move_to(0);
				} else {
					gif.move_relative(1);
				}
			});

			$slider.on("input change", function() {
				pause();
				play();
			});

			function pause() {
				gif.pause();
				clearInterval(interval);						
			}

			function play() {
				interval = setInterval(function() {
					$forward.trigger("click");
				}, $slider.val());
			}

			//					function updateFrameCount() {
			//						$frameCount.text("" + (gif.get_current_frame() + 1) + "/" + gif.get_length());
			//					}
		});



		function createButton(className, text) {
			var $button = $("<button>");
			$button.addClass(className);
			$button.text(text);
			return $button;
		}
	}

}(jQuery));
