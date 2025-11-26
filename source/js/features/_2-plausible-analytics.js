(function() {	
	// Track network errors to suppress repeated failures
	var plausibleErrorCount = 0;
	var plausibleErrorThreshold = 3;
	var plausibleDisabled = false;
	
	// Creates a callback function that handles errors and calls the original callback
	// Follows Plausible's callback pattern: https://plausible.io/docs/custom-event-goals#trigger-custom-events-manually-with-a-javascript-function
	function handleEventCallback(eventName, options, originalCallback) {
		return function(result) {
			// Extract feature info for logging
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
			
			// Follow Plausible's callback pattern exactly
			if (result && result.status) {
				// Success: Request to plausible done
				plausibleErrorCount = 0;
				plausibleDisabled = false;
				console.log('Plausible event received:', eventName + featureInfo, 'Status:', result.status);
			} else if (result && result.error) {
				// Error: Error handling request
				plausibleErrorCount++;
				if (plausibleErrorCount <= plausibleErrorThreshold) {
					var errorMessage = result.error.message || result.error.toString() || result.error;
					if (plausibleErrorCount === 1) {
						console.warn('Plausible event failed (this is normal in development if CORS is not configured):', eventName + featureInfo, errorMessage);
					}
				}
				if (plausibleErrorCount >= plausibleErrorThreshold) {
					plausibleDisabled = true;
					console.warn('Plausible disabled due to repeated network errors. This is normal in development or when CORS is not configured.');
				}
			} else {
				// Ignored: Request was ignored
				console.log('Plausible event ignored:', eventName + featureInfo);
			}
			
			// Call original callback if provided (pass through the result as-is)
			if (originalCallback && typeof originalCallback === 'function') {
				originalCallback(result);
			}
		};
	}
	
	// Enhances the plausible function with host tracking, callbacks, and error handling
	function enhancePlausible(originalPlausibleFn) {
		return function(eventName, options) {
			// Skip if Plausible is disabled due to repeated errors
			if (plausibleDisabled) {
				return;
			}
			
			if (!options) options = {};
			if (!options.props) options.props = {};
			// Add host as custom property to track which website the event came from
			options.props.host = window.location.hostname;
			
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
				// Add error handling to the callback
				var originalCallback = options.callback;
				options.callback = handleEventCallback(eventName, options, originalCallback);
				// Call the original plausible function
				return originalPlausibleFn(eventName, options);
			} catch (error) {
				console.error('Error calling Plausible function for event:', eventName + featureInfo, error);
			}
		};
	}
	
	// Load Plausible Analytics if not already loaded
	if (!window.plausible && !document.querySelector('script[data-domain]')) {
		// Configure Plausible before script loads (required for custom wrapper)
		// Create queue function and enhance it immediately so all events get host property
		var queueFunction = function() { 
			(window.plausible.q = window.plausible.q || []).push(arguments);
		};
		window.plausible = enhancePlausible(queueFunction);
		
		// Configure Plausible settings before script loads
		// The endpoint is automatically handled by the Plausible script based on hostname
		window.plausible.o = { 
			captureOnLocalhost: true, // Allow tracking on localhost for testing
			logging: false // Disable Plausible's built-in logging - we handle it in our wrapper
		};
		
		var script = document.createElement('script');
		script.defer = true;
		script.setAttribute('data-domain', 'ltc.bcit.ca');
		script.src = 'https://common.ltc.bcit.ca/js/utils.js'; // Hosted on your own domain
		
		// Debug: Log script loading
		script.onload = function() {
			console.log('Plausible script loaded. window.plausible type:', typeof window.plausible);
			console.log('window.plausible value:', window.plausible);
			
			// Enhance window.plausible IMMEDIATELY before queue is processed
			// The script processes the queue synchronously, so we need to enhance before that happens
			var originalPlausible = window.plausible;
			var queuedEvents = originalPlausible && originalPlausible.q ? originalPlausible.q.slice() : [];
			
			if (typeof originalPlausible === 'function') {
				window.plausible = enhancePlausible(originalPlausible);
				// Preserve any properties from the original plausible object
				if (originalPlausible.init) {
					window.plausible.init = originalPlausible.init;
				}
				if (originalPlausible.q) {
					window.plausible.q = originalPlausible.q;
				}
			} else if (originalPlausible && typeof originalPlausible.init === 'function') {
				// If plausible is an object with init method, enhance the init method
				var originalInit = originalPlausible.init;
				originalPlausible.init = enhancePlausible(originalInit);
			}
			
			// If there were queued events, they've already been processed by Plausible
			// But their callbacks should still be called by Plausible's processing
			
			// Try to send a pageview after script loads
			setTimeout(function() {
				if (window.plausible && typeof window.plausible === 'function') {
					console.log('Sending pageview...');
					window.plausible('pageview', {});
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
		
		// Enhance existing plausible function to add host property, callback support, and error handling
		var existingPlausible = window.plausible;
		if (typeof existingPlausible === 'function') {
			window.plausible = enhancePlausible(existingPlausible);
			// Preserve any properties
			if (existingPlausible.init) window.plausible.init = existingPlausible.init;
			if (existingPlausible.q) window.plausible.q = existingPlausible.q;
		} else if (existingPlausible && typeof existingPlausible.init === 'function') {
			var originalInit = existingPlausible.init;
			existingPlausible.init = enhancePlausible(originalInit);
		}
	}
}());
