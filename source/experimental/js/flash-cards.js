/*****************************************************************
CARD SLIDER
******************************************************************/
(function () {
	/*************
Initialization
**************/
	var keyCodes = {
		backspace: 8,
		tab: 9,
		enter: 13,
		shift: 16,
		ctrl: 17,
		alt: 18,
		escape: 27,
		space: 32,
		left: 37,
		up: 38,
		right: 39,
		down: 40
	};

	function createButton(className, text) {
		var $button = $("<button>");
		$button.addClass(className);
		$button.text(text);
		return $button;
	}

	$("table.flashcards").each(function () {
		// Components
		var $table = $(this),
			$container,
			$cardStack,
			$cards;

		// Create Stack
		$cardStack = $("<section>");
		$cardStack.addClass("card-stack");
		$cardStack.attr("tabindex", "0");

		// Create Container
		$container = $("<article>");
		$container.addClass("flashcard-container");
		$container.append($cardStack);

		// Deal with table
		$table.before($container);
		$table.hide();
		$table.find("tr").each(function () {
			var $cells = $(this).children("td"),
				$front,
				$back,
				$card;

			if ($cells.length > 0) {
				$card = $("<div>");
				$card.addClass("card");

				$front = $("<div>");
				$front.addClass("front");
				$front.html($cells.first().html());

				$back = $("<div>");
				$back.addClass("back");
				$back.html($cells.last().html());

				$card.append($front, $back);
				$cardStack.append($card);
			}
		});
	});


	$(".flashcard-container").each(function () {
		var $container = $(this);
		var $cards = $(this).find(".card");
		var $cardStack = $(this).find(".card-stack");
		// Animation Variables
		var swapNextDuration,
			swapPrevDuration,
			TOP_CARD,
			BOTTOM_CARD,
			animating,
			nextCardComplete,
			prevCardComplete,
			zVal;

		var $controls,
			$prevButton,
			$nextButton,
			$flipButton,
			$viewTableButton;

		// Create Buttons
		$prevButton = createButton("prev", "Previous");
		$nextButton = createButton("next", "Next");
		$flipButton = createButton("flip", "Flip Card");
		$viewTableButton = createButton("view-table", "View as Table");

		// Create Controls
		$controls = $("<nav>");
		$controls.addClass("card-controls");
		$controls.append($prevButton, $flipButton, $nextButton, $viewTableButton);

		$container.append($controls);

		// Init Cards
		$cards = $cardStack.children();
		$cards.first().addClass("top-card");
		$cards.last().addClass("bottom-card");
		TOP_CARD = 1000;
		BOTTOM_CARD = TOP_CARD - $cards.length + 1;
		zVal = TOP_CARD;
		$cards.each(function () {
			$(this).css({
				transform: "rotate(" + getRandomFloat(-5, 5, 2) + "deg)",
				top: getRandomInt(-20, 20) + "px",
				left: getRandomInt(-20, 20) + "px",
				"z-index": zVal
			});
			zVal--;
		});


		/*****
		Events
		******/
		$viewTableButton.on("click", function () {
			var $table = $container.next("table");
			$table.stop().fadeToggle();
			$(this).toggleClass("toggled");
		});

		$nextButton.on("click", function nextCard() {
			$cardStack.trigger("next");
		});
		$prevButton.on("click", function prevCard() {
			$cardStack.trigger("prev");
		});
		$flipButton.on("click", function flipCard() {
			$cardStack.trigger("flip");
		});





		/* !!!!!!!!NOTE!!!!!!!!!!!  
		The timing is different in Chrome and Firefox
		Currently, Firefox appears to stop animating halfway through.
		What's really happening is it hasn't been given enough time to
		Complete the animation.
	
		Adding more time for Firefox allows it to finish animating
		but some of the other times are thrown off.
		*/
		swapNextDuration = getAnimationDuration("swap-next");
		swapPrevDuration = getAnimationDuration("swap-prev");
		animating = false;
		nextCardComplete = true;
		prevCardComplete = true;

		$cardStack.on("prev", function () {

		});

		$cardStack.on("next", function () {
			var $topCard = $(this).find(".top-card");
			var $bottomCard = $(this).find(".bottom-card");
			if (!animating && prevCardComplete) {
				animating = true;
				nextCardComplete = false;
				$cardStack.trigger("unflip");

				$topCard.addClass("swap-next");
				$topCard.removeClass("top-card");

				setTimeout(function () {
					zIncrement();
					applyTopClass();
					animating = false;
				}, (swapNextDuration / 2));

				setTimeout(function () {
					$bottomCard.removeClass("bottom-card");
					applyBottomClass();
					$topCard.removeClass("swap-next");
					if (!animating) {
						nextCardComplete = true;
					}
				}, swapNextDuration);
			}
		});

		$cardStack.on("prev", function () {
			var $topCard = $(this).find(".top-card");
			var $bottomCard = $(this).find(".bottom-card");
			if (!animating && nextCardComplete) {
				animating = true;
				prevCardComplete = false;
				$cardStack.trigger("unflip");

				$bottomCard.addClass("swap-prev");
				$bottomCard.removeClass("bottom-card");

				setTimeout(function () {
					zDecrement();
					applyBottomClass();
					animating = false;
					return;
				}, (swapPrevDuration / 2));

				setTimeout(function () {
					applyTopClass();
					$bottomCard.removeClass("swap-prev");
					if (!animating) {
						prevCardComplete = true;
					}
					return;
				}, swapPrevDuration);
			}
		});

		$cardStack.on("flip", function () {
			if (nextCardComplete && prevCardComplete) {
				$(this).find(".top-card").toggleClass("flipped");
			}
		});

		$cardStack.on("unflip", function () {
			$(this).find(".flipped").removeClass("flipped");
		});

		$cardStack.on("keydown", function (e) {
			if (e.keyCode === keyCodes.left || e.keyCode === keyCodes.right) {
				$cardStack.trigger("flip");
			} else if (e.keyCode === keyCodes.down) {
				prevCard();
				e.preventDefault();
				return false;
			} else if (e.keyCode === keyCodes.up) {
				$(this).trigger("next");
				e.preventDefault();
				return false;
			}
			return true;
		});


		function applyTopClass() {
			$cardStack.find(".top-card").removeClass("top-card");
			$cards.each(function () {
				var zIndex = parseInt($(this).css("z-index"));
				if (zIndex === TOP_CARD) {
					$(this).addClass("top-card");
					return;
				}
				return;
			});
			return;
		}

		function applyBottomClass() {
			$cardStack.find(".bottom-card").removeClass("bottom-card");
			$cards.each(function () {
				var zIndex = parseInt($(this).css("z-index"));
				if (zIndex === BOTTOM_CARD) {
					$(this).addClass("bottom-card");
					return;
				}
				return;
			});
			return;
		}

		function getAnimationDuration(animationClass) {
			var $temp = $("<div>"),
				seconds,
				milliseconds;

			$("body").append($temp);
			$temp.addClass(animationClass);
			seconds = $temp.css("animation-duration");
			$temp.remove();
			milliseconds = parseFloat(seconds.substring(0, seconds.length - 1)) * 1000;

			return milliseconds;
		}

		function zIncrement() {
			$cards.each(function () {
				var zVal = parseInt($(this).css("z-index"));
				zVal++;
				if (zVal > TOP_CARD) {
					zVal = BOTTOM_CARD;
				}
				$(this).css("z-index", zVal);
			});
		}

		function zDecrement() {
			$cards.each(function () {
				var zVal = parseInt($(this).css("z-index"));
				zVal--;
				if (zVal < BOTTOM_CARD) {
					zVal = TOP_CARD;
				}
				$(this).css("z-index", zVal);
			});
		}
	});

	function getRandomFloat(min, max, digits) {
		return (Math.random() * (max - min) + min).toFixed(digits);
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}());