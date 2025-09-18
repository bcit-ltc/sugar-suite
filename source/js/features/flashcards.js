/*****************************************************************
Flash Cards
******************************************************************/
(function () {
    /*************
Initialization
**************/

    function createButton(className, text) {
        var $button = $("<button>");
        $button.addClass(className);
        // Add visually hidden text for accessibility, keep text out of visual flow
        $button.html('<span class="visually-hidden">' + text + '</span>');
        return $button;
    }

    // Helper to build a card from table row
    function buildCard($cells) {
        const $card = $("<div>").addClass("card");
        const $front = $("<div>").addClass("front").attr({
            "data-side": "front",
            "role": "region",
            "aria-label": "Flashcard Front",
            "aria-hidden": "false"
        }).html($cells.first().html());
        if ($front.children().length <= 1) $front.addClass("center-content");
        const $back = $("<div>").addClass("back").attr({
            "data-side": "back",
            "role": "region",
            "aria-label": "Flashcard Back",
            "aria-hidden": "true"
        }).html($cells.last().html());
        if ($back.children().length <= 1) $back.addClass("center-content");
        $card.append($front, $back);
        return $card;
    }

    $("table.flashcards").each(function () {
        const $table = $(this);
        const $cardStack = $("<section>").addClass("card-stack").attr("tabindex", "0");
        const $container = $("<article>").addClass("flashcard-container").append($cardStack);
        $container.data("flashcard-table", $table);
        $table.before($container).hide();
        $table.find("tr").each(function () {
            const $cells = $(this).children("td");
            if ($cells.length > 0) $cardStack.append(buildCard($cells));
        });

        // Hide card counter if .no-number is present
        if ($table.hasClass('no-number')) {
            $container.addClass('no-number');
        }
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



        // Card counter element
        const $counter = $("<div>").addClass("card-counter").css({
            'font-size': '1.1em',
            'font-weight': 'bold',
            'min-width': '4em',
            'margin': '1em auto',
            'text-align': 'center',
            'width': 'fit-content'
        });

        // Create controls/buttons in a loop for DRY
        const buttonConfigs = [
            { class: "prev", text: "Previous", aria: "Previous card" },
            { class: "flip", text: "Flip Card", aria: "Flip card" },
            { class: "next", text: "Next", aria: "Next card" },
            { class: "flip-all", text: "Flip All Cards", aria: "Flip all cards" },
            { class: "shuffle", text: "Shuffle Card", aria: "Shuffle cards" },
            { class: "reset", text: "Reset Cards", aria: "Reset cards" },
            { class: "view-table", text: "View as Table", aria: "View as table" }
        ];
        const $controls = $("<nav>").addClass("card-controls");
        // Place counter below card stack, above controls
        $container.append($counter);
        const $buttons = {};
        buttonConfigs.forEach(cfg => {
            const $btn = createButton(cfg.class, cfg.text).attr('aria-label', cfg.aria);
            $controls.append($btn);
            $buttons[cfg.class.replace(/-/g,"")] = $btn;
        });

        // Store the original card order for reset
        const $originalCards = $cards.clone(true, true);

        // Track current card index
        let currentCardIndex = 0;

        function updateCounter() {
            const total = $cardStack.children('.card').length;
            // Find the index of the card with class 'top-card'
            let topIndex = 0;
            $cardStack.children('.card').each(function(i) {
                if ($(this).hasClass('top-card')) topIndex = i;
            });
            currentCardIndex = topIndex;
            $counter.text((currentCardIndex + 1) + ' of ' + total);
        }

        // Helper to update counter after DOM/class changes
        function updateCounterAfterDOMChange() {
            requestAnimationFrame(updateCounter);
        }

        // Card initialization logic (used for reset, shuffle, init)
        function initializeCards() {
            currentCardIndex = 0;
            updateCounter();
            $cards = $cardStack.children();
            $cards.removeClass('flipped top-card bottom-card');
            $cards.find('.front').attr('aria-hidden', 'false');
            $cards.find('.back').attr('aria-hidden', 'true');
            $cards.first().addClass("top-card");
            $cards.last().addClass("bottom-card");
            TOP_CARD = 1000;
            BOTTOM_CARD = TOP_CARD - $cards.length + 1;
            zVal = TOP_CARD;
            // Neat stack: only five visible positions, repeating
            const offsetStep = 4;
            const baseLeft = -10; // shift all cards 10px to the left
            $cards.each(function (i) {
                let posIndex = i % 5;
                $(this).css({
                    transform: "rotate(0deg)",
                    top: (posIndex * offsetStep) + "px",
                    left: (baseLeft + posIndex * offsetStep) + "px",
                    "z-index": zVal
                });
                zVal--;
            });
        }

        $buttons.reset.on("click", function resetCards() {
            requestAnimationFrame(updateCounter);
            $cardStack.empty();
            $originalCards.each(function () {
                $cardStack.append($(this).clone(true, true));
            });
            initializeCards();
            waitForAllImagesThenSetHeight();
        });

        $buttons.flipall.on("click", function flipAll() {
            // No change to currentCardIndex
            const allFlipped = $cards.length && $cards.filter('.flipped').length === $cards.length;
            $cards.each(function () {
                const $card = $(this);
                const $front = $card.find('.front');
                const $back = $card.find('.back');
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

        $container.append($controls);

        // Init Cards
        initializeCards();

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

        // Grouped event handlers for clarity
        $buttons.viewtable.on("click", function () {
            const $table = $container.data("flashcard-table");
            if ($table && $table.length) {
                $table.stop().fadeToggle();
                $(this).toggleClass("toggled");
            }
        });
        $buttons.next.on("click", () => $cardStack.trigger("next"));
        $buttons.prev.on("click", () => $cardStack.trigger("prev"));
        $buttons.flip.on("click", () => $cardStack.trigger("flip"));
        $buttons.shuffle.on("click", () => $cardStack.trigger("shuffle"));

        $cardStack.on("shuffle", function () {
            $controls.find("button").prop("disabled", true);
            $(this).addClass('animation');
            setTimeout(function () {
                $('.card-stack').removeClass('animation');
                $controls.find("button").prop("disabled", false);
            }, 1000);

            // Shuffle logic
            const $cardsArr = $cardStack.children('.card').toArray();
            for (let i = $cardsArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [$cardsArr[i], $cardsArr[j]] = [$cardsArr[j], $cardsArr[i]];
            }
            $cardStack.empty();
            $($cardsArr).each(function () { $cardStack.append(this); });
            initializeCards();
            requestAnimationFrame(updateCounter);
        });


        swapNextDuration = getAnimationDuration("swap-next");
        swapPrevDuration = getAnimationDuration("swap-prev");
        animating = false;
        nextCardComplete = true;
        prevCardComplete = true;

        $cardStack.on("next", function () {
            if (!animating && prevCardComplete) {
                animating = true;
                nextCardComplete = false;
                var $topCard = $(this).find(".top-card");
                var $bottomCard = $(this).find(".bottom-card");
                swapNextDuration = getAnimationDuration("swap-next");

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
            if (!animating && nextCardComplete) {
                animating = true;
                prevCardComplete = false;
                var $topCard = $(this).find(".top-card");
                var $bottomCard = $(this).find(".bottom-card");
                swapPrevDuration = getAnimationDuration("swap-prev");

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
                    // No need to call updateCounter here, handled in applyTopClass
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
                    // Update counter immediately after top-card is set
                    requestAnimationFrame(updateCounter);
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