(function () {
    function getStorageHost() {
        var host = window;
        try {
            if (window.top && window.top.sessionStorage) {
                host = window.top;
            }
        } catch (e) {
            host = window;
        }
        return host;
    }

    var storageHost = getStorageHost();
    var storageKey = "sugarSuiteAnalyticsSent";
    var sent = {};

    function readSent() {
        try {
            var raw = storageHost.sessionStorage.getItem(storageKey);
            if (raw) {
                sent = JSON.parse(raw) || {};
            }
        } catch (e) {
            sent = {};
        }
    }

    function saveSent() {
        try {
            storageHost.sessionStorage.setItem(storageKey, JSON.stringify(sent));
        } catch (e) {
            // ignore storage errors
        }
    }

    function buildContext(data) {
        var context = {};

        if (data && typeof data === "object") {
            Object.keys(data).forEach(function (key) {
                context[key] = data[key];
            });
        }

        return context;
    }

    function canTrack() {
        return typeof window.plausible === "function";
    }

    function dedupeId(eventName, propertyName, contextString, customDedupeKey) {
        if (customDedupeKey) {
            return eventName + "|" + propertyName + "|" + customDedupeKey;
        }
        return eventName + "|" + propertyName + "|" + contextString;
    }

    readSent();

    window.SugarAnalytics = {
        trackEvent: function (eventName, propertyName, data, options) {
            if (!canTrack()) {
                return false;
            }

            var config = options || {};
            var shouldDedupe = config.dedupe !== false;
            var context = buildContext(data);
            var contextString = JSON.stringify(context);

            if (shouldDedupe) {
                var id = dedupeId(eventName, propertyName, contextString, config.dedupeKey);
                if (sent[id]) {
                    return false;
                }
                sent[id] = true;
                saveSent();
            }

            var props = {};
            props[propertyName] = contextString;
            window.plausible(eventName, { props: props });
            return true;
        },

        trackFeature: function (featureType, actionName, data, options) {
            return this.trackEvent(featureType + " stats", actionName, data, options);
        },

        trackPageStats: function (propertyName, counts, options) {
            return this.trackEvent("Page stats", propertyName, counts, options);
        },

        makeInstanceKey: function (prefix, instanceIndex) {
            return prefix + "_" + String(instanceIndex);
        }
    };
}());
