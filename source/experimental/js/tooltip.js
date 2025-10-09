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
                    let tooltipContent = $tooltip.next(".tooltip-content")[0] || $tooltip.parent().next(".tooltip-content")[0] || $tooltip.data("tooltip-content");

                    let contentId = $tooltip.data("content-id");
                    if (contentId) {
                        tooltipContent = $("#" + contentId)[0];
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
                            //hideOnClick: false,
                            appendTo: $("body>.container")[0],
                            interactive: true,
                            placement: 'auto',
                            onCreate(instance) {
                                instance.props.content.style.display = "";
                                //console.log(" ", instance.props);


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