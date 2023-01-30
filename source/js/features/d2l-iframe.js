(function ($) {
    setD2lIframeHeight();

    function setD2lIframeHeight() {
        var iframeHeight = 0;
        setTimeout(function () {
            $('iframe.d2l-iframe', window.parent.document).contents().height(function (index, height) {
                iframeHeight = height - $('iframe', window.parent.document).height();
                return height;
            });
            $('iframe.d2l-iframe', window.parent.document).height(function (index, height) {
                return height + iframeHeight;
            });
        }, 1000);
    }

})(jQuery);