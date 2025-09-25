/**
 * Flash Cards Feature
 * -------------------
 * Transforms tables with class "flashcards" into interactive, accessible flashcard sets.
 *
 * Features:
 * - Card flipping (single and all)
 * - Shuffle and reset
 * - Keyboard navigation
 * - Responsive sizing
 * - Accessible ARIA attributes
 *
 * Usage:
 *   1. Add a <table class="flashcards"> to your HTML with two <td>s per row (front/back).
 *   2. Include this script after jQuery is loaded.
 *   3. Cards will auto-initialize on page load.
 *
 *   - To hide the card counter, add the class <code>no-number</code> to your table:
 *       <table class="flashcards no-number"> ... </table>
 *     This will suppress the display of the card number indicator.
 *
 * Author: "BCIT LTC Course Production" <courseproduction@bcit.ca>
 * Last updated: 2025-09-18
 */
(() => {
    // Transform tables with class "flashcards" into interactive flashcard sets
    $("table.flashcards").each(function () {
        /**
         * Build a card DOM element from a table row's cells.
         * @param {jQuery} $cells - jQuery collection of <td> elements (front/back)
         * @returns {jQuery} - Card element with front and back sides
         */
        const buildCard = ($cells) => {
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
        };
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
        // Hide navigation controls if .no-nav is present
        if ($table.hasClass('no-nav')) {
            $container.addClass('no-nav');
        }

        /**
         * Create a button for flashcard controls.
         * @param {string} className - Button class
         * @param {string} text - Visually hidden label
         * @returns {jQuery} - Button element
         */
        const createButton = (className, text) => {
            const $button = $("<button>");
            $button.addClass(className);
            // Add visually hidden text for accessibility, keep text out of visual flow
            $button.html(`<span class="visually-hidden">${text}</span>`);
            return $button;
        };

        $(".flashcard-container").each(function () {
            let $cards = $(this).find(".card");
            // Helper functions must be declared before use
            /**
             * Get the animation duration (ms) for a given CSS animation class.
             * @param {string} animationClass
             * @returns {number} Duration in milliseconds
             */
            const getAnimationDuration = (animationClass) => {
                const $temp = $("<div>");
                $("body").append($temp);
                $temp.addClass(animationClass);
                const seconds = $temp.css("animation-duration");
                $temp.remove();
                const milliseconds = parseFloat(seconds.substring(0, seconds.length - 1)) * 1000;
                return milliseconds;
            };

            /**
             * Apply a class to the card with the given z-index.
             * @param {string} className
             * @param {number} zTarget
             * @param {Function} [afterFn]
             */
            const applyZClass = (className, zTarget, afterFn) => {
                $cardStack.find(`.${className}`).removeClass(className);
                $cards.each((_, el) => {
                    const zIndex = parseInt($(el).css("z-index"));
                    if (zIndex === zTarget) {
                        $(el).addClass(className);
                        if (afterFn) afterFn();
                        return false;
                    }
                    return;
                });
            };

            /**
             * Increment z-index for all cards, wrapping to BOTTOM_CARD if needed.
             */
            const zIncrement = () => {
                $cards.each((_, el) => {
                    let zVal = parseInt($(el).css("z-index"));
                    zVal++;
                    if (zVal > TOP_CARD) {
                        zVal = BOTTOM_CARD;
                    }
                    $(el).css("z-index", zVal);
                });
            };

            /**
             * Decrement z-index for all cards, wrapping to TOP_CARD if needed.
             */
            const zDecrement = () => {
                $cards.each((_, el) => {
                    let zVal = parseInt($(el).css("z-index"));
                    zVal--;
                    if (zVal < BOTTOM_CARD) {
                        zVal = TOP_CARD;
                    }
                    $(el).css("z-index", zVal);
                });
            };

            // Animation Variables
            let swapNextDuration,
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
                $buttons[cfg.class.replace(/-/g, "")] = $btn;
            });

            // Store the original card order for reset
            const $originalCards = $cards.clone(true, true);

            // Track current card index
            let currentCardIndex = 0;


            /**
             * Update the card counter display and currentCardIndex.
             */
            const updateCounter = () => {
                const total = $cardStack.children('.card').length;
                // Find the index of the card with class 'top-card'
                let topIndex = 0;
                $cardStack.children('.card').each((i, el) => {
                    if ($(el).hasClass('top-card')) topIndex = i;
                });
                currentCardIndex = topIndex;
                $counter.text(`${currentCardIndex + 1} of ${total}`);
            };

            // Helper to update ARIA attributes for card faces
            /**
             * Set ARIA attributes for card faces based on flipped state.
             * @param {jQuery} $card
             * @param {boolean} flipped
             */
            const setCardAria = ($card, flipped) => {
                const $front = $card.find('.front');
                const $back = $card.find('.back');
                if (flipped) {
                    $front.attr('aria-hidden', 'true');
                    $back.attr('aria-hidden', 'false');
                } else {
                    $front.attr('aria-hidden', 'false');
                    $back.attr('aria-hidden', 'true');
                }
            };
            // Card initialization logic (used for reset, shuffle, init)
            /**
             * Initialize card stack: reset order, ARIA, and z-indexes.
             */
            const initializeCards = () => {
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
                $cards.each((i, el) => {
                    let posIndex = i % 5;
                    $(el).css({
                        transform: "rotate(0deg)",
                        top: `${posIndex * offsetStep}px`,
                        left: `${baseLeft + posIndex * offsetStep}px`,
                        "z-index": zVal
                    });
                    zVal--;
                });
            };


            $buttons.reset.on("click", () => {
                requestAnimationFrame(updateCounter);
                $cardStack.empty();
                $originalCards.each((_, el) => {
                    $cardStack.append($(el).clone(true, true));
                });
                initializeCards();
                setCardStackHeight();
            });


            $buttons.flipall.on("click", () => {
                // No change to currentCardIndex
                const allFlipped = $cards.length && $cards.filter('.flipped').length === $cards.length;
                $cards.each((_, el) => {
                    const $card = $(el);
                    if (allFlipped) {
                        $card.removeClass('flipped');
                        setCardAria($card, false);
                    } else {
                        $card.addClass('flipped');
                        setCardAria($card, true);
                    }
                });
            });

            // Create Controls

            $container.append($controls);


            // Init Cards
            initializeCards();

            // --- Swipe gesture support for mobile/tablet when .no-nav is present ---
            if ($container.hasClass('no-nav')) {
                let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
                const minSwipeDist = 40; // px
                $cardStack.on('touchstart', function(e) {
                    if (e.originalEvent.touches && e.originalEvent.touches.length === 1) {
                        touchStartX = e.originalEvent.touches[0].clientX;
                        touchStartY = e.originalEvent.touches[0].clientY;
                    }
                });
                $cardStack.on('touchend', function(e) {
                    if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length === 1) {
                        touchEndX = e.originalEvent.changedTouches[0].clientX;
                        touchEndY = e.originalEvent.changedTouches[0].clientY;
                        const dx = touchEndX - touchStartX;
                        const dy = touchEndY - touchStartY;
                            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDist) {
                                e.preventDefault();
                                if (dx < 0) {
                                    $cardStack.trigger('prev'); // swipe left triggers prev
                                } else {
                                    $cardStack.trigger('next'); // swipe right triggers next
                                }
                        } else if (Math.abs(dy) > minSwipeDist) {
                            // Vertical swipe
                            $cardStack.trigger('flip');
                        }
                    }
                });
            }


            // Modularized height/image logic

            /**
             * Set the height of the card stack to fit the tallest card (including images).
             * Handles async image loading.
             */
            const setCardStackHeight = () => {
                const $cards = $cardStack.children('.card');
                const $imgs = $cards.find('img');
                const setHeights = () => {
                    let maxHeight = 0;
                    $cards.css({ 'height': '', 'min-height': '' });
                    $cards.find('.front, .back').css({ 'height': '', 'min-height': '', 'display': '' });
                    $cards.each((_, el) => {
                        const $front = $(el).find('.front');
                        const $back = $(el).find('.back');
                        const origFront = $front.css('display');
                        const origBack = $back.css('display');
                        $front.css('display', 'block');
                        $back.css('display', 'block');
                        const frontHeight = $front.outerHeight(true);
                        const backHeight = $back.outerHeight(true);
                        const h = Math.max(frontHeight, backHeight);
                        if (h > maxHeight) maxHeight = h;
                        $front.css('display', origFront);
                        $back.css('display', origBack);
                    });
                    $cards.css('min-height', `${maxHeight}px`);
                    $cards.find('.front, .back').css('min-height', `${maxHeight}px`);
                    $cardStack.height(maxHeight);
                };
                if ($imgs.length === 0) {
                    setHeights();
                    return;
                }
                let loaded = 0;
                const total = $imgs.length;
                const checkAllLoaded = () => {
                    loaded++;
                    if (loaded === total) setHeights();
                };
                $imgs.each(function () {
                    if (this.complete && this.naturalHeight !== 0) {
                        loaded++;
                    } else {
                        $(this).one('load error', checkAllLoaded);
                    }
                });
                if (loaded === total) setHeights();
            };

            setCardStackHeight();
            // Update on window resize

            $(window).on('resize', setCardStackHeight);
            // Also update after shuffle, reset, or flip all
            $cardStack.on('shuffle reset flipAll', setCardStackHeight);

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
            }); // 'this' is needed here for the button
            $buttons.next.on("click", () => $cardStack.trigger("next"));
            $buttons.prev.on("click", () => $cardStack.trigger("prev"));
            $buttons.flip.on("click", () => $cardStack.trigger("flip"));
            $buttons.shuffle.on("click", () => $cardStack.trigger("shuffle"));


            $cardStack.on("shuffle", function () {
                $controls.find("button").prop("disabled", true);
                $(this).addClass('animation');
                setTimeout(() => {
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
                $($cardsArr).each((_, el) => { $cardStack.append(el); });
                initializeCards();
                requestAnimationFrame(updateCounter);
            });


            swapNextDuration = getAnimationDuration("flashcards-swap-next");
            swapPrevDuration = getAnimationDuration("flashcards-swap-prev");
            animating = false;
            nextCardComplete = true;
            prevCardComplete = true;

            $cardStack.on("next", function () {
                if (!animating && prevCardComplete) {
                    animating = true;
                    nextCardComplete = false;
                    var $topCard = $(this).find(".top-card");
                    var $bottomCard = $(this).find(".bottom-card");
                    swapNextDuration = getAnimationDuration("flashcards-swap-next");

                    $topCard.addClass("flashcards-swap-next");
                    $topCard.removeClass("top-card");

                    setTimeout(function () {
                        zIncrement();
                        applyZClass('top-card', TOP_CARD, () => { requestAnimationFrame(updateCounter); });
                        animating = false;
                    }, (swapNextDuration / 2));

                    setTimeout(() => {
                        $bottomCard.removeClass("bottom-card");
                        applyZClass('bottom-card', BOTTOM_CARD);
                        $topCard.removeClass("flashcards-swap-next");
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
                    const $topCard = $(this).find(".top-card");
                    const $bottomCard = $(this).find(".bottom-card");
                    swapPrevDuration = getAnimationDuration("flashcards-swap-prev");

                    $bottomCard.addClass("flashcards-swap-prev");
                    $bottomCard.removeClass("bottom-card");

                    setTimeout(() => {
                        zDecrement();
                        applyZClass('bottom-card', BOTTOM_CARD);
                        animating = false;
                        return;
                    }, (swapPrevDuration / 2));

                    setTimeout(() => {
                        applyZClass('top-card', TOP_CARD, () => { requestAnimationFrame(updateCounter); });
                        $bottomCard.removeClass("flashcards-swap-prev");
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
                    const $topCard = $(this).find(".top-card");
                    $topCard.toggleClass("flipped");
                    setCardAria($topCard, $topCard.hasClass("flipped"));
                }
            });

            // Flip card on click
            $cardStack.on('click', '.card.top-card', function () {
                $cardStack.trigger('flip');
            });

            $cardStack.on("unflip", function () {
                const $flipped = $(this).find(".flipped");
                if ($flipped.length) {
                    $flipped.removeClass("flipped");
                    setCardAria($flipped, false);
                }
            });

            //makes it so you can use desktop key controls for cards 
            $cardStack.on("keydown", function (e) {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    $cardStack.trigger("flip");
                    e.preventDefault();
                    return false;
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

        });

    });

})();