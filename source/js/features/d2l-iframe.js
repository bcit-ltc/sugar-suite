(function ($) {
    setD2lIframeHeight();

    function setD2lIframeHeight() {
        var iframeHeight = 0;
        setTimeout(function () {
            var $iframes = $('iframe.d2l-iframe', window.parent.document);
            
            // Track D2L iframe loaded
            if (window.plausible && $iframes.length > 0) {
                window.plausible('Feature Used', {
                    props: { feature: 'd2l-iframe', action: 'loaded' }
                });
            }
            
            $iframes.contents().height(function (index, height) {
                iframeHeight = height - $('iframe', window.parent.document).height();
                return height;
            });
            $iframes.height(function (index, height) {
                return height + iframeHeight;
            });
        }, 1000);
    }

})(jQuery);