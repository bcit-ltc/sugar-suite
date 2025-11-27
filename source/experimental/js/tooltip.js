(function ($) {
    if ($(".tooltip").length) {
        $('.tooltip-content, [id^="tooltip-content-"]').hide();

        $.when(
            $.getScript("https://unpkg.com/@popperjs/core@2/dist/umd/popper.min.js")
        ).done(function () {
            $.when(
                $.getScript("https://unpkg.com/tippy.js@6/dist/tippy-bundle.umd.js")
            ).done(function () {

                $(".tooltip").each(function () {
                    let $tooltip = $(this);
                    let tooltipContent = null;

                    // First check for data-content-id
                    let contentId = $tooltip.data("content-id");
                    if (contentId) {
                        tooltipContent = $("#" + contentId)[0];
                    }
                    
                    // If no content ID, check for data-tooltip-content
                    if (!tooltipContent) {
                        tooltipContent = $tooltip.data("tooltip-content");
                    }
                    
                    // If still no content, look for adjacent .tooltip-content elements
                    if (!tooltipContent) {
                        // Look for next sibling
                        tooltipContent = $tooltip.next(".tooltip-content")[0];
                        
                        // If not found, look for parent's next sibling
                        if (!tooltipContent) {
                            tooltipContent = $tooltip.parent().next(".tooltip-content")[0];
                        }
                    }

                    if (tooltipContent) {
                        if (tooltipContent.tagName == "SPAN") {
                            let text = tooltipContent.innerHTML;
                            tooltipContent.innerHTML = text.trim();
                            if (text.startsWith("(") && text.endsWith(")")) {
                                tooltipContent.innerHTML = text.substring(1, text.length - 1);
                            }
                        }

                        let tippyProps = {
                            content: tooltipContent,
                            allowHTML: true,
                            trigger: "click",
                            interactive: true,
                            placement: 'auto',
                            onCreate(instance) {
                                if (instance.props.content && instance.props.content.style) {
                                    instance.props.content.style.display = "";
                                }
                            }
                        };

                        if ($tooltip.data("tooltip-props")) {
                            let addProps = JSON.stringify($tooltip.data("tooltip-props"));
                            addProps = JSON.parse(addProps);
                            if (addProps) {
                                tippyProps = Object.assign(tippyProps, addProps);
                            }
                        }

                        tippy($tooltip[0], tippyProps);
                    }

                });

            });
        });
    }


}(jQuery));