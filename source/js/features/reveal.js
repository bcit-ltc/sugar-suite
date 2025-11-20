// SHOW/HIDE CONTENT (#REVEAL)

$(document).ready(function () {
    // Track legacy usage: .reveal with data-min-text
    if (window.plausible) {
        var $revealWithMinText = $(".reveal[data-min-text]");
        
        if ($revealWithMinText.length > 0) {
            window.plausible('Legacy Class Used', {
                props: { 
                    feature: 'active-reveal', 
                    action: 'loaded',
                    url: window.location.href,
                    count: $revealWithMinText.length
                }
            });
        }
    }
    
    $(".reveal, .active-reveal").each(function () {
        // Reveal button text
        var buttonText = $(this).data("button") || "Reveal";
        var $button = $("<button class='reveal-button'>" + buttonText + "</button>");

        // Minimum length needed in order to enable reveal button
        var inputLength = $(this).data("min-text");

        // active-reveal component
        if (inputLength) {
            // Textarea placeholder text
            var placeholder = $(this).data("placeholder") || "Type your answer here";

            // Number of rows of the textarea
            var rows = $(this).data("rows") || 5;

            var $textarea = $("<textarea class='reveal-textarea'></textarea>");
            $textarea.attr("placeholder", placeholder);

            if (rows) {
                $textarea.attr("rows", rows);
                $(this).before($textarea);
            }

            $button.attr("disabled", true);

            // Listen to changes textarea
            $textarea.on('keyup', function (event) {
                var currentLength = $(this).val();
                if (currentLength.length < inputLength) {
                    $button.attr("disabled", true);
                } else {
                    $button.attr("disabled", false);
                }
            });

            // Turn off textarea listener after reveal button is clicked
            $button.one("click", function (event) {
                $textarea.off();
            });
        }

        $(this).before($button);
        $(this).hide();
        
        // Track reveal loaded
        if (window.plausible) {
            var revealType = inputLength ? "active-reveal" : "reveal";
            window.plausible('Feature Used', {
                props: { feature: 'reveal', action: 'loaded', revealType: revealType }
            });
        }

    });


    $(".reveal-button").click(function () {
        var $revealContent = $(this).next();
        
        $revealContent.slideToggle("fast").promise().done(function () {
            if ($(this).find(".line-matching")) {
                $(window).trigger('resize');
            }
        });
    });
});