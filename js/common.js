var vd = {};
vd.fourKDataExpTimeFree = 6000 * 6000 * 100000; // 1 hour
vd.fourKDataExpTimePremium = 5000 * 6000 * 100000; // 5 minutes
vd.fourKEmptyDataExpTime = 5000 * 6000 * 100000; // 5 minutes
vd.bg4KVideoCheckForAllUsers = false; // values: true, false
vd.allVideoFormats = ['mp4', "mov", "flv", "webm", "3gp", "ogg", "m4a", "mp3", "wav", "bin"];
vd.defaultVideoFormats = ['.mp4', ".mov", ".flv", ".webm", ".3gp", ".ogg", ".m4a", ".wav", ".bin"];
vd.minVideoSizes = {
    "1": {
        bytes: 100 * 1024,
        text: "100 KB",
        id: "1"
    },
    "2": {
        bytes: 1024 * 1024,
        text: "1 MB",
        id: "2"
    },
    "3": {
        bytes: 2 * 1024 * 1024,
        text: "2 MB",
        id: "3"
    },
};
vd.premiumVideoFormats = [""];
vd.nonePremiumVideoFormats = ['.mp4', ".mov", ".flv", ".webm", ".3gp", ".ogg", ".m4a", ".wav", ".bin", ".mp3"];
vd.serverUrl = '';
vd.serverUrl2 = '';
vd.version = "PAID";
vd.extension = "chrome";

vd.isVideoLinkTypeValid = function (videoLink, videoTypes) {
    let isValidType = true;
    if (videoTypes.length > 0) {
        isValidType = ($.inArray(videoLink.extension + "", videoTypes) !== -1);
    }
    return isValidType;
};

vd.isVideoSizeValid = function (data, minVideoSize) {
    minVideoSize = vd.minVideoSizes[minVideoSize].bytes;
    var isValid = true;
    if (!data) { return isValid }
    var vSize = parseInt(data.filesize ? data.filesize : data.size);
    if (isNaN(vSize)) {
        return isValid;
    }
    return (vSize > minVideoSize);
};

vd.ignoreError = function () {
    if (chrome.runtime.lastError) {
        console.log("error: ", chrome.runtime.lastError);
    } else {
    }
};

vd.convertToJson = function (str) {
    return typeof str === "string" ? JSON.parse(str) : str;
};



vd.isLoggedInAndUpgraded = function (callback) {
    chrome.storage.sync.get({
        logged_in: true,
        upgraded: 'true'
    }, function (items) {
        callback(items.logged_in && items.upgraded !== "true");
    });
};

vd.is4KDataValid = function (fourKData) {
    // console.log("Validation check", fourKData);
    var isValid = fourKData && (fourKData.title != null || (fourKData.value && fourKData.value.title != null)) && fourKData.ext !== 'unknown_video';
    // console.log(!!isValid);
    return !!isValid;
};

vd.storeFourKData = function (fourKData) {
    // console.log("Saving data");
    // console.log(fourKData);
    var url = fourKData.tabUrl ? fourKData.tabUrl : fourKData.webpage_url;
    var urlId = md5(url);
    // console.log(url, urlId);
    localStorage.setItem(urlId, JSON.stringify({
        "id": urlId,
        "url": fourKData.webpage_url,
        "value": fourKData,
        "time": new Date().getTime()
    }));
};

vd.get4KData = function (videoUrl, callback) {
    $.ajax({
        url: vd.serverUrl2 + "getinfo.php",
        type: "GET",
        contentType: "json",
        data: { videourl: encodeURIComponent(videoUrl) },
        success: function (data) {
            if (!data) {
                callback(false);
                return;
            }
            callback(data);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            callback(false);
        }
    });
};


vd.is4KDataExpired = function (fourKData, callback) {
    // console.log(fourKData);
    if (!fourKData || !fourKData.time) {
        // console.log("YYYY");
        callback(true);
        return;
    }
    // console.log(new Date(fourKData.time));
    if (!vd.is4KDataValid(fourKData)) {
        callback(new Date().getTime() - fourKData.time > vd.fourKEmptyDataExpTime);
        return;
    }
    vd.isLoggedInAndUpgraded(function (bool) {
        // console.log("upgraded", bool);
        if (bool) {
            callback(new Date().getTime() - fourKData.time > vd.fourKDataExpTimePremium);
        } else {
            callback(new Date().getTime() - fourKData.time > vd.fourKDataExpTimeFree);
        }
    });

};


vd.getStoredSettings = function (callback) {
    chrome.storage.sync.get({
        videoTypes: vd.defaultVideoFormats,
        minVideoSize: '1',
        logged_in: true,
        login_token: true,
        upgraded: 'true'
    }, function (items) {
        // console.log(items);
        callback(items);
    });
};
