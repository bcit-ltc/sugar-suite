
(function () {
	// Accordion 
	var accordionInstanceIndex = 0;

	var keycodes = {
		space: 32,
		enter: 13,
		esc: 27
	};
	// Check if event is an activation event
	function isActivationEvent(e) {
		if (e.type == "click") return true;
		if (e.keyCode == keycodes.enter) return true;
		if (e.keyCode == keycodes.space) return true;
		return false;
	}
	
	// Transform Accordion
    $(".accordion").each(function (index) {
        $(this).attr("data-accordion-instance", accordionInstanceIndex++);
        var toggleTag = $(this).children().first().prop("tagName");

        $(this).children(toggleTag).each(function () {
            $(this).addClass("accordion-button");
            $(this).attr("tabindex", 0).attr("role", "button");
            //Wraps content sections that will be toggled 
            $(this).next()
                .nextUntil(toggleTag)
                .addBack()
                .wrapAll("<div class='_bellow'></div>");
        });
		
		if(!$(this).hasClass("no-toggle")) {
			$(this).prepend("<button class='accordion-toggle' title='toggle'></button>");
		}
		
	});
	
	// Accordion button click logic
	$(".accordion-button").on("click keyup", function(e, isToggle) {
		if (isActivationEvent(e)) {
			e.preventDefault();
			var $accordion = $(this).closest(".accordion");
			var accordionId = $accordion.attr("data-accordion-instance") || "0";
			var totalPanels = $accordion.find(".accordion-button").length;
			var $bellow = $(this).next("._bellow");
			var $siblings = $(this).siblings(".accordion-button.open");
			var isCollapsing = $(this).closest(".accordion").hasClass("collapsing");
			var isOpen = $(this).hasClass("open");

			if(isOpen) {
				if(isCollapsing && !isToggle) {
					$siblings.trigger("click",true);
				}
                $(this).removeClass("open").attr("aria-pressed", "false");
				$bellow.trigger("close");
			}
			if(!isOpen) {
				if(isCollapsing && !isToggle) {
                    $siblings.trigger("click",true);
                }
                
				$(this).addClass("open").attr("aria-pressed", "true");
				$(this).attr("data-accordion-opened", "true");
				$bellow.trigger("open");

				if (window.SugarAnalytics) {
					var openedCount = $accordion.find('.accordion-button[data-accordion-opened="true"]').length;
					if (openedCount === totalPanels && !$accordion.attr("data-accordion-completed")) {
						$accordion.attr("data-accordion-completed", "true");
						window.SugarAnalytics.trackFeature("Accordion", "accordionCompleted", {
							total_panels: totalPanels
						}, {
							dedupeKey: "accordion_completed_" + accordionId
						});
					}
				}
			}
		}
	});
	
	// Accordion toggle button logic
	$(".accordion-toggle").on("click keydown", function(e) {
		if(isActivationEvent(e)) {
			e.preventDefault();
			var $accordion = $(this).closest(".accordion");
			var accordionId = $accordion.attr("data-accordion-instance") || "0";
			var $closed = $(this).siblings(".accordion-button:not(.open)");
			var action = $closed.length ? "expand_all" : "collapse_all";

			if (window.SugarAnalytics) {
				window.SugarAnalytics.trackFeature("Accordion", "accordionToggleAll", {
					action: action
				}, {
					dedupe: false,
					dedupeKey: "accordion_toggle_" + accordionId + "_" + Date.now()
				});
			}

			if($closed.length) {
				$closed.trigger("click",true);
			} else {
				$(this).siblings(".accordion-button").trigger("click",true);
			}
			
		}
	});
	
	// Accordion panel open
	$("._bellow").on("open",function() {
        if($(this).hasClass("_hidden")){
            $(this).hide();
        }
		$(this).stop().removeClass("_hidden").addClass("open").slideDown().promise().done(function(){
			if($(this).find(".line-matching")){
				$(window).trigger('resize');
			}
		});
		
	});
	
	// Accordion panel close
	$("._bellow").on("close",function(e) {
        $(this).stop().removeClass("open").slideUp();
        e.stopPropagation();
	});
    
    $("._bellow").each(function () {
        var $_bellow = $(this);
        var $interaction = $_bellow.find(".interaction");

        if ($interaction.length) {
            var regex = new RegExp(/(h5p.org)/);
            var isH5P = regex.test($(this).find("iframe").attr("src"));

            if (!isH5P) {
                $_bellow.addClass("_hidden");
            } else {
                $interaction.children("iframe").on('load', function () {
                    var frameWidth = $(this).css("width");
                    var frameHeight = $(this).css("height");
                    $(this).css({
                        width: frameWidth,
                        height: frameHeight
                    });
                    $_bellow.hide();
                });
            }
        } else {
            $_bellow.hide();
        }
    });
    
})();
