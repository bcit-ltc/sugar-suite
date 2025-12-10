// Automatically adds striping to larger tables
(function ($) {
	var stripedColumnTolerance = 5; // Number of columns required for striped tables
	var stripedRowTolerance = 5; // Number of columns required for striped tables

	// 
	$("table:not(.unstyled):not(.unstriped)").each(function () {
		var columns = $(this).find("tbody tr:first-child").children().length;
		var rows = $(this).find("tbody").children().length;
		if (columns >= stripedColumnTolerance && rows >= stripedRowTolerance) {
			$(this).addClass("striped");
		}
	});

	// Allows tables to scroll when the content is too large for the screen width
	$("table").each(function () {
        if($(this).hasClass("flashcards")){
            // Don't wrap flashcards tables - they get replaced by flashcard-container
            return;
        } else {
            $(this).wrap("<div class='overflow-x'>");
        }
	});

	// Adds additional styling to the minimal table
	$("table.minimal").each(function () {
		var $thead = $(this).find("thead");
		var $tbody = $(this).find("tbody");
		if ($thead && $tbody) {
			if ($tbody.find("tr").length === $tbody.find("th").length) {
				var borderRight = $tbody.find("th").eq(0).css("border-right");
				$thead.children().children().eq(0).css("border-right", borderRight);
			}
		}
	});

	// Column based text alignment
	$("table").each(function () {
		var $firstRowCells = $(this).find("tr").first().children("td, th");
		var $alignedCells = $firstRowCells.filter(".left, .center, .centre, .right");

		var isComplex = !!$(this).find("[rowspan],[colspan]").length;
		if (isComplex) {
			// skip complex tables
			return;
		}

		$alignedCells.each(function () {
			var columnIndex = $(this).closest("tr").find("td, th").index($(this));
			var $rows = $(this).closest("table").find("tbody").children("tr");
			var columnClass = "center";
			if ($(this).hasClass("left")) {
				columnClass = "left";
			} else if ($(this).hasClass("right")) {
				columnClass = "right";
			}

			$rows.each(function () {
				var $cell = $(this).find("td, th").eq(columnIndex);
				if (!$cell.is(".left, .center, .centre, .right")) {
					$cell.addClass(columnClass);
				}
			});
		});
	});
}(jQuery));
