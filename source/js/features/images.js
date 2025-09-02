/****************
Image Hyperlinker
*****************/
(function ($) {
	var tolerance = 0.75;

	// clicking an image will link to itself
	function imageHyperlink(e) {
		if (e.type == "click" || e.keyCode == 13 || e.keyCode == 32) {
			e.preventDefault();
			var win = window.open($(this).attr("src"), '_blank');
			win.focus();
		}
	}

	// Check display width versus natural
	// If the ratio of the display width to natural width of the image is less than the tolerance, clicking the image will take you to a full size image.
	function checkImageSizes() {
		$("._naturalWidth").each(function () {
			var currentWidth = $(this).width();
			var naturalWidth = $(this).data("naturalWidth");
			var ratio = currentWidth / naturalWidth;
			var larger;

			$(this).css("cursor","auto");
			$(this).removeAttr("tabindex");
			$(this).removeAttr("title");
			$(this).off("click keydown", imageHyperlink);

			if (ratio < tolerance) {
				larger = parseInt(((1 / ratio) - 1).toFixed(2) * 100) + "%";
				$(this).css("cursor","pointer");
				$(this).attr("tabindex", 0);
				$(this).attr("title", "View full size (" + larger + " larger)");
				$(this).on("click keydown", imageHyperlink);
			}
		});
	}

	function intializeImages() {
		// attaches natural width of image to data attribute
		$("figure > img").each(function () {
            var $img = $(this);
            $img.css("display", "block");
			var src = $img.attr("src");
			var image = new Image();

            if($img.parent().parent().hasClass("slider")) {
                return;
            }

			image.onload = function () {
				var naturalWidth = image.width;
				$img.addClass("_naturalWidth");
				$img.data("naturalWidth", image.width);
				$(window).trigger("resize");
			};
			image.src = src;
		});
	}

	intializeImages();
	$(window).on("resize", checkImageSizes);

}(jQuery));
