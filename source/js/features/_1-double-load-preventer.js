(function() {	
	// Prevent accidental double loading
	var errorMessage = "ERROR --> The file lat.js has already been loaded\nSOLUTION --> Remove duplicate script tags\nQUESTIONS --> courseproduction@bcit.ca";
	
	if(window.latFileLoaded) {
		throw new Error(errorMessage);
	} else {
		window.latFileLoaded = true;
	}
	
	// Load Plausible Analytics if not already loaded
	if (!window.plausible && !document.querySelector('script[data-domain]')) {
		var script = document.createElement('script');
		script.defer = true;
		script.setAttribute('data-domain', 'ltc.bcit.ca');
		script.src = 'https://common.latest.ltc.bcit.ca/js/utils.js'; // Hosted on your own domain
		
		// Debug: Log script loading
		script.onload = function() {
			console.log('Plausible script loaded. window.plausible type:', typeof window.plausible);
			console.log('window.plausible value:', window.plausible);
		};
		script.onerror = function() {
			console.error('Failed to load Plausible script from:', script.src);
		};
		
		document.head.appendChild(script);
	} else {
		console.log('Plausible already exists or script tag already present');
		console.log('window.plausible type:', typeof window.plausible);
	}
}());