(function() {
	// When any page loads lat.js, send a custom event via LTC Plausible (utils.js).
	// Uses common.ltc.bcit.ca/js/utils.js so adblockers don't block it.
	window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments); };
	if (!window.plausible.o) window.plausible.o = { captureOnLocalhost: false, autoCapturePageviews: true };
	if (!window.ltcDomain) window.ltcDomain = { eventDomain: 'sugar-suite.latest.ltc.bcit.ca' };

	plausible('lat.js loaded', { props: { page: location.href } });

	var s = document.createElement('script');
	s.defer = true;
	s.src = 'https://common.ltc.bcit.ca/js/utils.js';
	document.head.appendChild(s);
}());
