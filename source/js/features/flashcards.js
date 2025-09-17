/*****************************************************************
Flash Cards
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
        // Add visually hidden text for accessibility, keep text out of visual flow
        $button.html('<span class="visually-hidden">' + text + '</span>');
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
        $container.data("flashcard-table", $table);
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
                $front.attr({
                    "data-side": "front",
                    "role": "region",
                    "aria-label": "Flashcard Front",
                    "aria-hidden": "false"
                });
                $front.html($cells.first().html());
                // Center content if only one child or one text node
                if ($front.children().length <= 1) {
                    $front.addClass("center-content");
                }

                $back = $("<div>");
                $back.addClass("back");
                $back.attr({
                    "data-side": "back",
                    "role": "region",
                    "aria-label": "Flashcard Back",
                    "aria-hidden": "true"
                });
                $back.html($cells.last().html());
                if ($back.children().length <= 1) {
                    $back.addClass("center-content");
                }

                $card.append($front, $back);
                $cardStack.append($card);
            }

            // Utility function to check which side is visible for a given card
            function getVisibleSide($card) {
                if ($card.hasClass("flipped")) {
                    return "back";
                } else {
                    return "front";
                }
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
            $flipAllButton,
            $shuffleButton,
            $resetButton,
            $viewTableButton;

        // Create Buttons
        $prevButton = createButton("prev", "Previous");
        $flipButton = createButton("flip", "Flip Card");
        $nextButton = createButton("next", "Next");
        $flipAllButton = createButton("flip-all", "Flip All Cards");
        $shuffleButton = createButton("shuffle", "Shuffle Card");
        $resetButton = createButton("reset", "Reset Cards");
        $viewTableButton = createButton("view-table", "View as Table");

        $prevButton.attr('aria-label', 'Previous card');
        $nextButton.attr('aria-label', 'Next card');
        $flipButton.attr('aria-label', 'Flip card');
        $flipAllButton.attr('aria-label', 'Flip all cards');
        $shuffleButton.attr('aria-label', 'Shuffle cards');
        $resetButton.attr('aria-label', 'Reset cards');
        $viewTableButton.attr('aria-label', 'View as table');


        // Store the original card order for reset
        var $originalCards = $cards.clone(true, true);

        $resetButton.on("click", function resetCards() {
            $cardStack.empty();
            $originalCards.each(function () {
                var $card = $(this).clone(true, true);
                $card.removeClass('flipped top-card bottom-card');
                $card.find('.front').attr('aria-hidden', 'false');
                $card.find('.back').attr('aria-hidden', 'true');
                $cardStack.append($card);
            });
            // Re-select $cards and reapply top/bottom classes and z-index
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
        });

        $flipAllButton.on("click", function flipAll() {
            var allFlipped = $cards.length && $cards.filter('.flipped').length === $cards.length;
            $cards.each(function () {
                var $card = $(this);
                var $front = $card.find('.front');
                var $back = $card.find('.back');
                if (allFlipped) {
                    $card.removeClass('flipped');
                    $front.attr('aria-hidden', 'false');
                    $back.attr('aria-hidden', 'true');
                } else {
                    $card.addClass('flipped');
                    $front.attr('aria-hidden', 'true');
                    $back.attr('aria-hidden', 'false');
                }
            });
        });

        // Create Controls
        $controls = $("<nav>");
        $controls.addClass("card-controls");
        // Order: Prev, Flip, Next, Flip All, Shuffle, View as Table
        $controls.append($prevButton, $flipButton, $nextButton, $flipAllButton, $shuffleButton, $resetButton, $viewTableButton);

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

        // Set .card-stack height to match the first .card
        function setAllCardsSameHeight() {
            var $cards = $cardStack.children('.card');
            var maxHeight = 0;
            $cards.css({ 'height': '', 'min-height': '' });
            $cards.find('.front, .back').css({ 'height': '', 'min-height': '', 'display': '' });
            $cards.each(function () {
                var $front = $(this).find('.front');
                var $back = $(this).find('.back');
                // Temporarily show both faces for measurement
                var origFront = $front.css('display');
                var origBack = $back.css('display');
                $front.css('display', 'block');
                $back.css('display', 'block');
                var frontHeight = $front.outerHeight(true);
                var backHeight = $back.outerHeight(true);
                var h = Math.max(frontHeight, backHeight);
                if (h > maxHeight) maxHeight = h;
                $front.css('display', origFront);
                $back.css('display', origBack);
            });
            $cards.css('min-height', maxHeight + 'px');
            $cards.find('.front, .back').css('min-height', maxHeight + 'px');
            $cardStack.height(maxHeight);
        }

        function waitForAllImagesThenSetHeight() {
            var $cards = $cardStack.children('.card');
            var $imgs = $cards.find('img');
            if ($imgs.length === 0) {
                setAllCardsSameHeight();
                return;
            }
            var loaded = 0;
            var total = $imgs.length;
            function checkAllLoaded() {
                loaded++;
                if (loaded === total) setAllCardsSameHeight();
            }
            $imgs.each(function () {
                if (this.complete && this.naturalHeight !== 0) {
                    loaded++;
                } else {
                    $(this).one('load error', checkAllLoaded);
                }
            });
            if (loaded === total) setAllCardsSameHeight();
        }

        waitForAllImagesThenSetHeight();
        // Update on window resize
        $(window).on('resize', waitForAllImagesThenSetHeight);
        // Also update after shuffle, reset, or flip all
        $cardStack.on('shuffle reset flipAll', waitForAllImagesThenSetHeight);

        /*****
        Events
        ******/
        $viewTableButton.on("click", function () {
            var $table = $container.data("flashcard-table");
            if ($table && $table.length) {
                $table.stop().fadeToggle();
                $(this).toggleClass("toggled");
            }
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
        $shuffleButton.on("click", function shuffle() {
            $cardStack.trigger("shuffle");
        });

        $cardStack.on("shuffle", function () {
            $controls.find("button").prop("disabled", true);
            $(this).addClass('animation');
            setTimeout(function () {
                $('.card-stack').removeClass('animation');
                $controls.find("button").prop("disabled", false);
            }, 1000);

            var $cards = $cardStack.children('.card');
            var cardArray = $cards.toArray();

            // Fisher-Yates shuffle
            for (let i = cardArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cardArray[i], cardArray[j]] = [cardArray[j], cardArray[i]];
            }

            // Remove all cards and append in new order
            $cardStack.empty();
            $(cardArray).each(function () {
                $cardStack.append(this);
            });

            // Re-select $cards and reapply top/bottom classes and z-index
            $cards = $cardStack.children();
            $cards.removeClass('flipped top-card bottom-card');
            $cards.find('.front').attr('aria-hidden', 'false');
            $cards.find('.back').attr('aria-hidden', 'true');
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

        });


        swapNextDuration = getAnimationDuration("swap-next");
        swapPrevDuration = getAnimationDuration("swap-prev");
        animating = false;
        nextCardComplete = true;
        prevCardComplete = true;

        $cardStack.on("next", function () {
            var $topCard = $(this).find(".top-card");
            var $bottomCard = $(this).find(".bottom-card");
            swapNextDuration = getAnimationDuration("swap-next");
            if (!animating && prevCardComplete) {
                animating = true;
                nextCardComplete = false;

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
            swapPrevDuration = getAnimationDuration("swap-prev");
            if (!animating && nextCardComplete) {
                animating = true;
                prevCardComplete = false;

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
                var $topCard = $(this).find(".top-card");
                $topCard.toggleClass("flipped");
                // ARIA: update aria-hidden on front/back
                var isFlipped = $topCard.hasClass("flipped");
                var $front = $topCard.find('.front');
                var $back = $topCard.find('.back');
                if (isFlipped) {
                    $front.attr('aria-hidden', 'true');
                    $back.attr('aria-hidden', 'false');
                } else {
                    $front.attr('aria-hidden', 'false');
                    $back.attr('aria-hidden', 'true');
                }
            }
        });

        // Flip card on click
        $cardStack.on('click', '.card.top-card', function (e) {
            $cardStack.trigger('flip');
        });

        $cardStack.on("unflip", function () {
            var $flipped = $(this).find(".flipped");
            if ($flipped.length) {
                $flipped.removeClass("flipped");
                // ARIA: update aria-hidden on front/back
                var $front = $flipped.find('.front');
                var $back = $flipped.find('.back');
                $front.attr('aria-hidden', 'false');
                $back.attr('aria-hidden', 'true');
            }
        });

        //makes it so you can use desktop key controls for cards 
        $cardStack.on("keydown", function (e) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                $cardStack.trigger("flip");
            } else if (e.key === "ArrowLeft") {
                $cardStack.trigger("prev");
                e.preventDefault();
                return false;
            } else if (e.key === "ArrowRight") {
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