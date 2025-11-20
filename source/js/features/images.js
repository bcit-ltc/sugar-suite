/****************
Image Hyperlinker
*****************/
(function ($) {
	var tolerance = 0.75;

	// clicking an image will link to itself
	function imageHyperlink(e) {
		if (e.type == "click" || e.keyCode == 13 || e.keyCode == 32) {
			e.preventDefault();
			var $img = $(this);
			var src = $img.attr("src");
			var win = window.open(src, '_blank');
			win.focus();
			
			// Track image clicked
			if (window.plausible) {
				var fileType = "unknown";
				if (src) {
					var ext = src.split('.').pop().toLowerCase();
					fileType = ext;
				}
				window.plausible('Feature Used', {
					props: { feature: 'images', action: 'clicked', fileType: fileType }
				});
			}
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
		// Track .image class usage (old class, should be .img)
		if (window.plausible) {
			var $imageFigures = $("figure.image");
			if ($imageFigures.length > 0) {
				window.plausible('Legacy Class Used', {
					props: { 
						feature: 'image-class', 
						action: 'loaded',
						url: window.location.href,
						count: $imageFigures.length
					}
				});
			}
		}
		
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
				
				// Track image loaded
				if (window.plausible) {
					var fileType = "unknown";
					if (src) {
						var ext = src.split('.').pop().toLowerCase();
						fileType = ext;
					}
					window.plausible('Feature Used', {
						props: { feature: 'images', action: 'loaded', fileType: fileType }
					});
				}
			};
			image.src = src;
		});
	}

	intializeImages();
	$(window).on("resize", checkImageSizes);

}(jQuery));
