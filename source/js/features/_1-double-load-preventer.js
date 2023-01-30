(function() {	
	// Prevent accidental double loading
	var errorMessage = "ERROR --> The file lat.js has already been loaded\nSOLUTION --> Remove duplicate script tags\nQUESTIONS --> courseproduction@bcit.ca";
	
	if(window.latFileLoaded) {
		throw new Error(errorMessage);
	} else {
		window.latFileLoaded = true;
	}
}());