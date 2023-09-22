

const urlObj = new URL(window.location.href);
const urlHostname = urlObj.hostname; // 'learn.bcit.ca'
const ignoreRegexList = [
    /^localhost$/,
    /^review--.*\.ltc\.bcit\.ca$/,
    /^latest--.*\.ltc\.bcit\.ca$/
];
var isIgnore = false;

for (const regex of ignoreRegexList) {
    if (regex.test(urlHostname)) {
        isIgnore = true;
        break;
    }
}

if (isIgnore) {
    console.log(`Ignoring ${urlHostname}`);
} else {
    const urlHref = urlObj.href; // 'https://learn.bcit.ca/content/enforced/123456-course/about.html?d2lSessionVal=abcd1234&ou=123456&d2l_body_type=3'
    // const urlProtocol = urlObj.protocol; // 'https:'
    const urlPort = urlObj.port; // '8080'. (443, 80, and non-explicit ports will return empty string)
    const urlParams = urlObj.search; // '?d2lSessionVal=abcd1234&ou=123456&d2l_body_type=3'
    const urlPathname = urlObj.pathname; // '/content/enforced/123456-course/about.html' (excludes query params)

    const courseLocAndPathRegex = /\/content\/enforced\/([^\/]+)(\/.*)/;
    const matches = urlPathname.match(courseLocAndPathRegex);
    let courseLocation = null;
    let manageFilePath = null;
    if (matches && matches[1] && matches[2]) {
        courseLocation = matches[1];
        manageFilePath = matches[2];
    };

    const myApm = elasticApm.init({
        serviceName: 'sugar-suite',
        serverUrl: 'https://a7522a4e02d843c3a373ba62f6fc5436.apm.westus2.azure.elastic-cloud.com:443',
        breakdownMetrics: true
    });
    const transaction = myApm.getCurrentTransaction();
    let transactionLabels = {
        "urlPort": urlPort,
    };
    if (manageFilePath) {
        transactionLabels["manageFilePath"] = manageFilePath;
    }
    if (transaction && !transaction.ended) {
        if (courseLocation) {
            transaction.name = courseLocation;

            const parts = courseLocation.split('-');
            if (parts.length > 0) {
                const firstPart = parts[0];
                if (/^\d+$/.test(firstPart)) {
                    transactionLabels["courseOrgUnit"] = firstPart;
                }
            }

        } else if (hostname === "sugar-suite.ltc.bcit.ca") {
            transaction.name = "stable-sugar-suite";
        } else {
            transaction.name = urlHref;
        }

        const urlParamsObj = new URLSearchParams(urlParams);
        for (const [key, value] of urlParamsObj) {
            transactionLabels[`query_${key}`] = value;
        }

        transaction.addLabels(transactionLabels);

    } else {
        console.log("No active transaction or transaction has already ended.");
    }
}
