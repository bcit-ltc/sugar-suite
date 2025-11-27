// Responsive Youtube

(function () {
	// finds youtube/vimeo iframes and wraps them with figure.video tags
	$("iframe").each(function () {
		if ($(this).is("[src*='youtu']") || $(this).is("[src*='vimeo']")) {
			
			if($(this).closest("figure").length === 0) {
				$(this).wrap("<figure class='video'>");
			}
		}
	});
	
	// finds iframes inside figure.video tags prepares them to be responsive (see also: _media.scss)
	$("figure.video iframe").each(function () {
		var $iframe = $(this);
		$iframe.removeAttr("width").removeAttr("height");
		$iframe.wrap("<div class='video-wrapper'></div>");
		if ($iframe.hasClass("square") || $iframe.closest(".square").length) {
			$iframe.closest(".video-wrapper").addClass("square");
		}
		
		// Track video loaded - website/platform
		if (window.plausible) {
			// Helper function to extract website from URL
			var getWebsite = function(src) {
				if (!src) {
					return "unknown";
				}
				
				// Check if it's a relative path (starts with / or ./)
				if (src.indexOf("/") === 0 || src.indexOf("./") === 0) {
					return window.location.hostname.replace("www.", "");
				}
				
				try {
					var url = new URL(src, window.location.href);
					return url.hostname.replace("www.", "");
				} catch (e) {
					// If URL parsing fails, try to extract domain manually
					var match = src.match(/https?:\/\/(?:www\.)?([^\/]+)/);
					if (match && match[1]) {
						return match[1];
					}
				}
				return "unknown";
			}
			
			var src = $iframe.attr("src") || "";
			var website = getWebsite(src);
			
			window.plausible('Feature Used', {
				props: { feature: 'figure-video', action: 'loaded', mediaType: 'iframe', website: website }
			});
		}
	});
	
	// Track HTML5 video elements inside figure.video tags
	$("figure.video video").each(function () {
		if (window.plausible) {
			var $video = $(this);
			var src = $video.attr("src") || "";
			var fileType = "unknown";
			
			if (src) {
				var ext = src.split('.').pop().toLowerCase();
				fileType = ext;
			}
			
			window.plausible('Feature Used', {
				props: { feature: 'figure-video', action: 'loaded', mediaType: 'video', fileType: fileType }
			});
		}
	});
	
	// Track HTML5 audio elements inside figure.audio tags (styled feature)
	$("figure.audio audio").each(function () {
		if (window.plausible) {
			var $audio = $(this);
			var src = $audio.attr("src") || "";
			var fileType = "unknown";
			
			if (src) {
				var ext = src.split('.').pop().toLowerCase();
				fileType = ext;
			}
			
			window.plausible('Feature Used', {
				props: { feature: 'figure-audio', action: 'loaded', mediaType: 'audio', fileType: fileType }
			});
		}
	});
}());