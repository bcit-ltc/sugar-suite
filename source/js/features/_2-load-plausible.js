(function() {
	// When any page loads lat.js, send a custom event via LTC Plausible (utils.js).
	// Uses common.ltc.bcit.ca/js/utils.js so adblockers don't block it.
	window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments); };
	if (!window.plausible.o) window.plausible.o = { captureOnLocalhost: false, autoCapturePageviews: true };
	if (!window.ltcDomain) window.ltcDomain = { eventDomain: 'sugar-suite.ltc.bcit.ca' };

	// Prefer top window URL when inside an LMS iframe (so we get the D2L view URL, not the enforced content path)
	var pageUrl;
	try {
		pageUrl = window.top !== window ? window.top.location.href : location.href;
	} catch (e) {
		pageUrl = location.href;
	}

	// Track the URL of the currently executing bundled JS file.
	var latScriptUrl = '';
	if (document.currentScript && document.currentScript.src) {
		latScriptUrl = document.currentScript.src;
	} else {
		// Fallback for environments where currentScript is unavailable.
		var scripts = document.scripts || document.getElementsByTagName('script');
		for (var i = scripts.length - 1; i >= 0; i--) {
			if (scripts[i].readyState === 'interactive') {
				latScriptUrl = scripts[i].src || '';
				break;
			}
		}
	}
	var pageAndScript = pageUrl + ' ' + latScriptUrl;
	plausible('lat.js loaded', { props: { page: pageUrl, script: latScriptUrl, pageAndScript: pageAndScript } });
	
	var s = document.createElement('script');
	s.defer = true;
	s.src = 'https://common.ltc.bcit.ca/js/utils.js';
	document.head.appendChild(s);
}());
