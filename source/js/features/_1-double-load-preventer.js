(function() {	
	// Prevent accidental double loading
	var errorMessage = "ERROR --> The file lat.js has already been loaded\nSOLUTION --> Remove duplicate script tags\nQUESTIONS --> courseproduction@bcit.ca";
	
	if(window.latFileLoaded) {
		throw new Error(errorMessage);
	} else {
		window.latFileLoaded = true;
	}
	
	// Track network errors to suppress repeated failures
	var plausibleErrorCount = 0;
	var plausibleErrorThreshold = 3;
	var plausibleDisabled = false;
	
	// Helper function to add host property to Plausible events
	window.plausibleWithHost = function(eventName, options) {
		// Skip if Plausible is disabled due to repeated errors
		if (plausibleDisabled) {
			return;
		}
		
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
			// Extract feature name from props if available for better logging
			var featureInfo = '';
			if (options && options.props) {
				if (options.props.feature) {
					featureInfo = ' (feature: ' + options.props.feature;
					if (options.props.action) {
						featureInfo += ', action: ' + options.props.action;
					}
					featureInfo += ')';
				}
			}
			console.log('Sending Plausible event:', eventName + featureInfo, options);
			try {
				// Wrap the callback to catch network errors
				var originalCallback = options.callback;
				options.callback = function(result) {
					if (result && result.error) {
						plausibleErrorCount++;
						// Suppress console errors after threshold to reduce noise
						if (plausibleErrorCount <= plausibleErrorThreshold) {
							console.warn('Plausible event failed:', eventName + featureInfo, result.error.message || result.error);
						}
						// Disable Plausible after repeated failures (likely CORS/network issue)
						if (plausibleErrorCount >= plausibleErrorThreshold) {
							plausibleDisabled = true;
							console.warn('Plausible disabled due to repeated network errors. This is normal in development or when CORS is not configured.');
						}
					} else {
						// Reset error count on success
						plausibleErrorCount = 0;
						plausibleDisabled = false;
						console.log('Plausible event sent successfully:', eventName + featureInfo);
					}
					// Call original callback if provided
					if (originalCallback && typeof originalCallback === 'function') {
						originalCallback(result);
					}
				};
				plausibleFn(eventName, options);
			} catch (error) {
				console.error('Error calling Plausible function for event:', eventName + featureInfo, error);
			}
		} else {
			console.warn('Plausible function not available for event:', eventName);
		}
	};
	
	// Load Plausible Analytics if not already loaded
	if (!window.plausible && !document.querySelector('script[data-domain]')) {
		// Configure Plausible before script loads (required for custom wrapper)
		window.plausible = window.plausible || function() { 
			(window.plausible.q = window.plausible.q || []).push(arguments);
		};
		
		// Configure: allow localhost tracking for testing
		// Set endpoint explicitly to avoid CORS issues
		var isCommonDomain = location.hostname === 'common.ltc.bcit.ca';
		window.plausible.o = { 
			captureOnLocalhost: true,
			autoCapturePageviews: true,
			logging: true,
			endpoint: isCommonDomain ? '/api/event' : 'https://common.ltc.bcit.ca/api/event'
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