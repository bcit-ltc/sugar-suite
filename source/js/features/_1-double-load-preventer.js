(function() {	
	// Prevent accidental double loading
	var errorMessage = "ERROR --> The file lat.js has already been loaded\nSOLUTION --> Remove duplicate script tags\nQUESTIONS --> courseproduction@bcit.ca";
	
	if(window.latFileLoaded) {
		throw new Error(errorMessage);
	} else {
		window.latFileLoaded = true;
	}
	
	// Helper function to add host property to Plausible events
	window.plausibleWithHost = function(eventName, options) {
		if (!options) options = {};
		if (!options.props) options.props = {};
		// Add host as custom property to track which website the event came from
		options.props.host = window.location.hostname;
		
		// Get the correct Plausible function
		var plausibleFn = null;
		if (typeof window.plausible === 'function') {
			plausibleFn = window.plausible;
		} else if (window.plausible && typeof window.plausible.init === 'function') {
			plausibleFn = window.plausible.init;
		}
		
		if (plausibleFn) {
			console.log('Calling Plausible with:', eventName, options);
			try {
				plausibleFn(eventName, options);
				console.log('Plausible function called successfully');
			} catch (error) {
				console.error('Error calling Plausible function:', error);
			}
		} else {
			console.warn('Plausible function not available');
		}
	};
	
	// Load Plausible Analytics if not already loaded
	if (!window.plausible && !document.querySelector('script[data-domain]')) {
		// Configure Plausible before script loads (required for custom wrapper)
		window.plausible = window.plausible || function() { 
			(window.plausible.q = window.plausible.q || []).push(arguments);
		};
		
		// Configure: allow localhost tracking for testing
		window.plausible.o = { 
			captureOnLocalhost: true,
			autoCapturePageviews: true,
			logging: true,
		};
		
		var script = document.createElement('script');
		script.defer = true;
		script.setAttribute('data-domain', 'ltc.bcit.ca');
		script.src = 'https://common.ltc.bcit.ca/js/utils.js'; // Hosted on your own domain
		
		// Debug: Log script loading
		script.onload = function() {
			console.log('Plausible script loaded. window.plausible type:', typeof window.plausible);
			console.log('window.plausible value:', window.plausible);
			
			// Try to send a pageview after script loads
			setTimeout(function() {
				if (window.plausibleWithHost) {
					console.log('Sending pageview...');
					window.plausibleWithHost('pageview', {});
				} else if (window.plausible) {
					// Try standard Plausible pageview
					var plausibleFn = typeof window.plausible === 'function' ? window.plausible : (window.plausible.init || null);
					if (plausibleFn) {
						console.log('Sending pageview (direct)...');
						try {
							plausibleFn('pageview', {});
						} catch (e) {
							console.error('Error sending pageview:', e);
						}
					}
				}
			}, 500);
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