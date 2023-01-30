(function ($) {
	// Adjust these as needed
	var config = {
		commentTag: "<section>",
		commentClass: "_developer-comments",
		isAppropriate: function() {
			var bodyClass = "under-construction";
			return $("body").hasClass(bodyClass);
		}
	};
	
	// Reduces a selection to the comments contained within them
	$.fn.filterComments = function() {
		return $(this).contents().filter(function () {
			var isCorrectNode = this.nodeType === 8;
			var isNotFunctional = !/endif/.test(this.textContent);
			return isCorrectNode && isNotFunctional;
		});
	};
	

	function displayComments() {
		var $comments = $("body *").filterComments();

		$comments.each(function () {
			var $comment = $(config.commentTag);
			$comment.addClass(config.commentClass);
			$comment.text(this.textContent);
			$(this).before($comment);
			$(this).remove();
		});
	}
	
	if (config.isAppropriate()) {
		displayComments();
	}
}(jQuery));