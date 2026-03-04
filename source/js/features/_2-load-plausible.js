(function() {
	// When any page loads lat.js, send a custom event via LTC Plausible (utils.js).
	// Uses common.ltc.bcit.ca/js/utils.js so adblockers don't block it.
	window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments); };
	if (!window.plausible.o) window.plausible.o = { captureOnLocalhost: false, autoCapturePageviews: true };
	if (!window.ltcDomain) window.ltcDomain = { eventDomain: 'sugar-suite.ltc.bcit.ca' };
	function nonEmpty(value) {
		if (value === null || value === undefined) return '';
		return String(value).trim();
	}

	// Prefer top window URL when inside an LMS iframe (so we get the D2L view URL, not the enforced content path)
	var pageUrl = '';
	try {
		pageUrl = window.top !== window ? window.top.location.href : window.location.href;
	} catch (e) {
		pageUrl = window.location && window.location.href ? window.location.href : '';
	}
	pageUrl = nonEmpty(pageUrl)
		|| nonEmpty(window.location && window.location.href)
		|| nonEmpty(document && document.URL)
		|| nonEmpty(document && document.baseURI)
		|| nonEmpty(document && document.referrer);

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
	
	var computedLatScriptUrl = '';
	try {
		computedLatScriptUrl = new URL('js/lat.js', document.baseURI || window.location.href).href;
	} catch (e) {
		computedLatScriptUrl = '';
	}
	latScriptUrl = nonEmpty(latScriptUrl) || nonEmpty(computedLatScriptUrl);
	if (!pageUrl) return;
	var pageAndScript = pageUrl + ' | ' + latScriptUrl;

	// Avoid sending duplicate events from repeated initializations.
	var dedupeHost = window;
	try {
		if (window.top && window.top.location) dedupeHost = window.top;
	} catch (e) {
		dedupeHost = window;
	}
	dedupeHost.__latPlausibleEvents = dedupeHost.__latPlausibleEvents || {};
	if (dedupeHost.__latPlausibleEvents[pageAndScript]) return;
	dedupeHost.__latPlausibleEvents[pageAndScript] = true;

	plausible('lat.js loaded', { props: { page: pageUrl, scriptUrl: latScriptUrl, pageAndScript: pageAndScript } });
	
	var s = document.createElement('script');
	s.defer = true;
	s.src = 'https://common.ltc.bcit.ca/js/utils.js';
	document.head.appendChild(s);
}());
