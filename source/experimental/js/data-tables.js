(function ($) {
	var $dataTables = $("table.data-table");
	var scriptURL = "https://cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js";
	if ($dataTables.length) {
		$.getScript(scriptURL, function () {
			init();
		});
	}

	function init() {
		var $stylesheet = $("<link>");
		$stylesheet.attr("rel", "stylesheet");
		$stylesheet.attr("href", "https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css");
		$("head").append($stylesheet);
		$dataTables.addClass("unstyled");
		$dataTables.each(function () {
			var $table = $(this);
			var options = {
				"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
				"paging": false,
				"ordering": true,
				"info": false				
			};
			
			if($table.hasClass("paging")) {
				options.paging = true;
			}
			if($table.hasClass("static")) {
				options.ordering = false;
			}
			if($table.hasClass("info")) {
				options.info = true;
			}
			
			$(this).DataTable(options);
		});
	}
}(jQuery));
