(function ($) {
    var featureSelectors = {
        sliders: ".slider",
        knowledge_checks: ".knowledge-check",
        accordions: ".accordion",
        flashcards: ".flashcards",
        tabs: ".tabs",
        line_matchings: ".line-matching",
        reveals: ".reveal",
        active_reveals: ".active-reveal",
        swappers: ".swapper",
        checklists: ".checklist",
        images: "figure.image, figure.img",
        audio: "figure.audio",
        videos: "figure.video",
        math: "figure.math",
        blockquotes: "blockquote:not(.pull-quote)",
        pull_quotes: "blockquote.pull-quote, .pullquote",
        references: ".reference, .ref",
        side_by_sides: ".side-by-side",
        tables: "figure.table"
    };

    var learningBlockTypes = [
        "activity", "case", "discussion", "group-activity", "outcome",
        "reading", "reflection", "review", "doing",
        "example", "definition", "key-point", "link", "note", "warning", "knowing",
        "assignment", "quiz"
    ];

    function getFileTypeFromUrl(url) {
        if (!url) {
            return "unknown";
        }

        var cleaned = url.split("#")[0].split("?")[0];
        var lastSlash = cleaned.lastIndexOf("/");
        var filename = lastSlash >= 0 ? cleaned.substring(lastSlash + 1) : cleaned;
        var lastDot = filename.lastIndexOf(".");

        if (lastDot <= 0 || lastDot === filename.length - 1) {
            return "unknown";
        }

        return filename.substring(lastDot + 1).toLowerCase();
    }

    function getMediaSource($root, selectors) {
        var source = "";
        selectors.some(function (selector) {
            var candidate = $root.find(selector).first().attr("src") || "";
            if (candidate) {
                source = candidate;
                return true;
            }
            return false;
        });
        return source;
    }

    $(window).on("load", function () {
        if (!window.SugarAnalytics) {
            return;
        }

        var pageCounts = {};
        Object.keys(featureSelectors).forEach(function (key) {
            var count = $(featureSelectors[key]).length;
            if (count > 0) {
                pageCounts[key] = count;
            }
        });

        if (Object.keys(pageCounts).length > 0) {
            window.SugarAnalytics.trackPageStats("features", pageCounts);
        }

        var blockCounts = {};
        learningBlockTypes.forEach(function (type) {
            var count = $("." + type).length;
            if (count > 0) {
                blockCounts[type] = count;
            }
        });

        if (Object.keys(blockCounts).length > 0) {
            window.SugarAnalytics.trackFeature("Learning Block", "learningBlocks", blockCounts);
        }

        $("figure.interaction iframe").each(function (index) {
            var src = $(this).attr("src") || "";
            window.SugarAnalytics.trackFeature("Custom Interaction", "customInteractions", {
                src: src
            }, {
                dedupeKey: "custom_interaction_" + index + "_" + src
            });
        });

        $("figure.image img, figure.img img").each(function (index) {
            var src = $(this).attr("src") || "";
            window.SugarAnalytics.trackFeature("Image", "imageLoaded", {
                file_type: getFileTypeFromUrl(src)
            }, {
                dedupeKey: "image_loaded_" + index + "_" + src
            });
        });

        $("figure.video").each(function (index) {
            var $figure = $(this);
            var src = getMediaSource($figure, ["video", "video source", "iframe"]);
            var fileType = src ? getFileTypeFromUrl(src) : "unknown";
            if (src && $figure.find("iframe").length) {
                fileType = "url";
            }

            window.SugarAnalytics.trackFeature("Responsive Video", "videoLoaded", {
                file_type: fileType
            }, {
                dedupeKey: "video_loaded_" + index + "_" + src
            });
        });

        $("figure.audio").each(function (index) {
            var $figure = $(this);
            var src = getMediaSource($figure, ["audio", "audio source"]);
            window.SugarAnalytics.trackFeature("Responsive Video", "audioLoaded", {
                file_type: getFileTypeFromUrl(src)
            }, {
                dedupeKey: "audio_loaded_" + index + "_" + src
            });
        });

        var legacySelfTestCount = $(".self-test").length;
        if (legacySelfTestCount > 0) {
            window.SugarAnalytics.trackFeature("Legacy Class Used", "legacySelfTestClass", {
                page: window.location.pathname,
                count: legacySelfTestCount
            });
        }

        var legacyImageClassCount = $("figure.image").length;
        if (legacyImageClassCount > 0) {
            window.SugarAnalytics.trackFeature("Legacy Class Used", "legacyImageClass", {
                page: window.location.pathname,
                count: legacyImageClassCount
            });
        }

        var legacyRevealMinTextCount = $(".reveal[data-min-text]").length;
        if (legacyRevealMinTextCount > 0) {
            window.SugarAnalytics.trackFeature("Legacy Class Used", "legacyRevealMinTextPattern", {
                page: window.location.pathname,
                count: legacyRevealMinTextCount
            });
        }
    });
}(jQuery));
