(function () {
	var options = [
		"bcit.css",
		"business.css",
		"energy.css",
		"health.css"
	];
	
	var $stylesheet = $("head link[href*='/css/']").not("[href*='/experimental.css']");
	var primaryStylesheet = parseStylesheetPath($stylesheet.attr("href"));
	var prefs;
	var storageKey = "bcit-learner-prefs";
	
	if (typeof (Storage) !== "undefined") {
		prefs = JSON.parse(localStorage.getItem(storageKey)) || {};
	}

	var $form = $("<form id='theme-switcher'>");
	var $select = $("<select>");
	var $submit = $("<input type='submit'>");
	
	if(options.indexOf(primaryStylesheet) === -1) {
		options.unshift(primaryStylesheet);
	}
	
	if(options.indexOf(prefs.stylesheet) === -1) {
		options.unshift(prefs.stylesheet);
	}

	for (var option in options) {
		var text = options[option];
		var $option = $("<option>");
		$option.text(parseStylesheetName(text)).val(text);
		$select.append($option);
	}

	$form.append($select, $submit);

	$(".container").prepend($form);

	$select.on("input change", function () {
		$form.submit();
	});

	$form.submit(function (e) {
		e.preventDefault();
		var stylesheet = $(this).find("select").val();
		setStylesheet(stylesheet);
		updatePrefs("stylesheet",stylesheet);
	});
	

	
	if(prefs.stylesheet) {
		$select.val(prefs.stylesheet);
		$form.submit();
	}

	function parseStylesheetPath(href) {
		return href.substring(href.indexOf("/css/") + 5);
	}
	
	function parseStylesheetName(href) {
		var name = "/" + href;
		name = name.split(".css")[0];
		name = name.substring(name.lastIndexOf("/") + 1);
		return name;
	}
	
	function setStylesheet(stylesheet) {
		console.log("changing stylesheet to",stylesheet);
		var href = $stylesheet.attr("href");
		href = href.substring(0, href.indexOf("/css/") + 5);
		href += stylesheet;
		$stylesheet.attr("href", href);
	}
		
	function updatePrefs(key, value) {
		prefs[key] = value;
		localStorage.removeItem(storageKey);
		localStorage.setItem(storageKey, JSON.stringify(prefs));
	}


}());