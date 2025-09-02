(function ($) {

	var _$ = window.parent.jQuery;
	var _$window = $(window.parent);
	var isD2L = !!_$("body.d2l-body").length;

	// get and set scrollTop both inside and outside of D2L
	function getScrollTop() {
		if (isD2L) {
			return _$(window.parent).scrollTop() - _$(".d2l-iframe").offset().top;
		} else {
			return $(window).scrollTop();
		}
	}
	
	function getModalTop(height) {
		var scrollTop = getScrollTop();
		if(scrollTop < 0) {
			return 0;
		}
		if(scrollTop + height > $(window).height()) {
			return $(window).height() - height;
		}
		return scrollTop;
	}

	function getMaxModalHeight() {
		var mins = [];
		mins.push($(window).height());

		if (isD2L) {
			mins.push(_$(window.parent).height());
		}

		var max = Math.min(mins);

		return max;
	}


	// GALLERY 1
	(function ($) {
		var count = 1;
		$(".gallery1").each(function () {
			var $figures = $(this).children("figure");
			var galHeight = $(this).height();
			var galWidth = $(this).width();

			$figures.each(function () {
				var $image = $(this).children("img");
				$image.addClass("__photo");
				$image.each(function () {
					$(this).css({
						top: getRandomInt(20, galHeight - $(this).height() - 20),
						left: getRandomInt(20, galWidth - $(this).width() - 20)
					});
				});

			});
		});


		$(".__photo").on("click", function (e) {
			$(".__photo-active").remove();
			var $clone = $(this).clone();
			$clone.removeClass("__photo");
			$clone.removeAttr("style");
			$clone.addClass("__photo-active");
			$clone.css({
				position: "absolute",
				left: "50%",
				transform: "translateX(-50%)",
				margin: "0 auto",
				"z-index": 99999,
				"pointer-events": "none"
			});
			$("body").append($clone);
			$clone.css("top", e.pageY - $(this).height() / 2);
		});


		// Drag & Drop
		$(".__photo").on("dragstart", function (e) {
			e.preventDefault();
			var $thisGallery = $(this).closest(".gallery1");
			var $thisPhoto = $(this);
			var top0 = parseInt($(this).css("top"));
			var left0 = parseInt($(this).css("left"));
			var mouseX0 = e.pageX;
			var mouseY0 = e.pageY;

			$thisPhoto.css("z-index", ++count);


			$thisGallery.on("mousemove", function (e) {
				var mouseX1 = e.pageX;
				var mouseY1 = e.pageY;

				var left1 = left0 + (mouseX1 - mouseX0);
				var top1 = top0 + (mouseY1 - mouseY0);

				$thisPhoto.css({
					left: left1,
					top: top1
				});
			});

			$("body").one("mouseup", function () {
				denit();
			});
			$thisGallery.one("mouseout", function () {
				//denit();
			});

			function denit() {
				$thisPhoto.off("mousemove");
				$thisGallery.off("mousemove");
			}
		});


		/**
		 * Returns a random integer between min (inclusive) and max (inclusive)
		 * Using Math.round() will give you a non-uniform distribution!
		 */
		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
	}(jQuery));


	// GALLERY 2
	(function ($) {
		var $body = $("body");
		var $galleries = $(".gallery2");
		var $navButtons;
		var $navigations;
		var $figures;
		var $figNavButtons;


		// Normalize the gallery items
		$galleries.each(function () {
			// Wrap solitary images with figures
			$(this).children("img").wrap("<figure>");

			var $figs = $(this).children("figure");

			// Avoid styling conflicts
			$figs.removeClass("image left right small smaller smallest large larger largest");

			// Remove unexpected tags from figures
			$figs.children().not("img, figcaption").hide();

			$figs.each(function () {
				var $img = $(this).children("img");
				var $figcap = $(this).children("figcaption");

				// If there are no images, remove the figure
				if ($img.length === 0) {
					$(this).remove();
					return true;
				}

				// If there is no figcaption, use the alt text instead
				if ($figcap.length === 0) {
					var alt = $img.attr("alt");
					if (alt) {
						$img.removeAttr("alt");
						$(this).append("<figcaption>" + alt + "</figcaption>");
					}
				}

				// If the figcaption is the first item, move it
				if ($(this).children().index($figcap) === 0) {
					$img.after($figcap);
				}
			});
		});


		// Setup
		$galleries.each(function () {
			var $figs = $(this).children("figure");
			var galHeight = $(this).height();
			var galWidth = $(this).width();
			var $nav = $("<nav>");
			$nav.addClass("__gallery-nav");

			$figs.each(function (index) {
				var $figureNav = $("<nav>");
				$figureNav.addClass("__gallery-figure-nav");
				var $prevButton = $("<button>");
				var $nextButton = $("<button>");
				$prevButton.addClass("prev").attr("title", "Previous");
				$nextButton.addClass("next").attr("title", "Next");
				$figureNav.prepend($prevButton, $nextButton);

				$(this).prepend($figureNav);

				var $image = $(this).children("img");
				var src = $image.attr("src");

				var $button = $("<button>");
				$button.text("Item " + index);
				$button.data("index", index);
				$button.attr("title", $(this).text());
				$button.css({
					"background-image": "url(" + src + ")"
				});
				$nav.append($button);
				$(this).hide();
			});

			$(this).prepend($nav);
		});


		// Assign newly created elements to variables
		$figures = $galleries.children("figure");
		$navigations = $galleries.children("nav");
		$navButtons = $navigations.children("button");
		$figNavButtons = $figures.find("button");


		// Prev/Next buttons in the figure
		$figNavButtons.on("click", function () {
			var $figure = $(this).closest($figures);
			var $prev;
			var $next;
			$figure.trigger("hide");
			if ($(this).hasClass("prev")) {
				$prev = $figure.prev("figure");
				if (!$prev.length) {
					$prev = $figure.siblings("figure").last();
				}
				$prev.trigger("show", $figure.data("pageY"));
			}
			if ($(this).hasClass("next")) {
				$next = $figure.next("figure");
				if (!$next.length) {
					$next = $figure.siblings("figure").first();
				}
				$next.trigger("show", $figure.data("pageY"));
			}
		});


		// Show a figure
		$figures.on("show", function (e) {
			var $this = $(this);
			var maxHeight = getMaxModalHeight();
			$this.css({
				position: "absolute",
				top: getModalTop(maxHeight),
				left: "50%",
				transform: "translateX(-50%)",
				margin: "0 auto",
				"z-index": 99999,
				"height": maxHeight
			});

			$figures.trigger("hide");
			$this.fadeIn();
		});


		// Hide the figures
		$figures.on("hide", function () {
			$(this).hide();
		});


		// When buttons are clicked
		$navButtons.on("click", function (e) {
			// If the galery is on, turn it off
			if ($(".__gallery-mask").length) {
				$body.trigger("gallery-off");
				return false;
			}

			var buttonIndex = $(this).data("index");
			var $gallery = $(this).closest($galleries);
			var $figure = $gallery.children("figure").eq(buttonIndex);

			$figure.trigger("show");
			$body.trigger("gallery-on");
		});


		// Create mask and event listener
		$body.on("gallery-on", function () {
			var $mask = $("<div>");
			$mask.addClass("__gallery-mask");
			$body.prepend($mask);
			setTimeout(function () {
				$mask.addClass("active");
			}, 100);

			$(".__gallery-mask").on("click", function () {
				$body.trigger("gallery-off");
				//$(this).off(); Are event listeners removed with the element?
			});
		});


		// Remove mask and hide figures
		$body.on("gallery-off", function () {
			var $mask = $(this).find(".__gallery-mask");
			$mask.fadeOut(function () {
				$mask.remove();
			});
			$figures.trigger("hide");
		});


		_$(window.parent).on("scroll", function () {
			$body.trigger("gallery-off");
		});

		$(window).on("scroll", function () {
			$body.trigger("gallery-off");
		});


		// Animated navigation buttons
		$navButtons.on("hover focus mouseenter", function () {
			var $siblings = $(this).siblings();
			$siblings.removeAttr("class");
			$(this).addClass("__current");
			$(this).prev().addClass("__adjacent1");
			$(this).next().addClass("__adjacent1");
			$(this).prev().prev().addClass("__adjacent2");
			$(this).next().next().addClass("__adjacent2");
		});
		$navigations.on("mouseout", function () {
			$(this).children().removeAttr("class");
		});
	}(jQuery));
}(jQuery));