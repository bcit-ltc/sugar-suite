// SHOW/HIDE CONTENT (#REVEAL)

$(document).ready(function () {
    var revealInstanceIndex = 0;
    $(".reveal, .active-reveal").each(function () {
        var revealId = revealInstanceIndex++;
        // Reveal button text
        var buttonText = $(this).data("button") || "Reveal";
        var $button = $("<button class='reveal-button'>" + buttonText + "</button>");
        var revealType = $(this).hasClass("active-reveal") ? "active" : "regular";
        $button.attr("data-reveal-id", revealId);
        $button.attr("data-reveal-type", revealType);

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

    });


    $(".reveal-button").click(function () {
        var $target = $(this).next();
        var isOpening = !$target.is(":visible");
        if (isOpening && window.SugarAnalytics) {
            window.SugarAnalytics.trackFeature("Reveal", "revealActivated", {
                type: $(this).attr("data-reveal-type") || "regular"
            }, {
                dedupeKey: "reveal_activated_" + ($(this).attr("data-reveal-id") || "0")
            });
        }

        $(this).next().slideToggle("fast").promise().done(function () {
            if ($(this).find(".line-matching")) {
                $(window).trigger('resize');
            }
        });
    });
});