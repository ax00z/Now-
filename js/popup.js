var currentVolume = 0.5;
var cookieName;
var videoTypes = [];
var tabUrlMd5 = '';
var savedVideos = {};
var storedSettings = {};
vd.sendMessage = function (message, callback) {
    chrome.runtime.sendMessage(message, callback);
};

vd.videoLinks = [];

vd.createDownloadSection = function (videoData) {
    var mathFloor = Math.floor(videoData.size * 100 / 1024 / 1024) / 100;
    var chromeCostString = "";

    return '<li class="video" data-thumb="" data-link="' + videoData.webpage_url + '" data-title="' + videoData.title + '">\
    <div class="video_list_L"> <a class="play-button" href="' + videoData.url + '" target="_blank"></a> </div>\
    <div class="title" title="' + videoData.fileName + '">' + videoData.fileName + '</div>\
    <div class="video_list_R">' + chromeCostString + '<a class="download-button btn-instant-download btn btn-sm btn33 " href="' + videoData.url + '" data-file-name="' + videoData.fileName + videoData.extension + '">Download Size: ' + mathFloor + ' MB</a> </div>\
    <div class=" clearfix"></div>\
    <div class="sep"></div>\
</li>';

};

vd.removeParams = function (url) {
    return url.replace(/[#\?].*$/, '');
};

vd.addYoutubeInfo = function (data) {
    // console.log("Adding youtube info for chrome");
    let fourKData = typeof data === 'string' ? JSON.parse(data) : data;
    let videoList = $("#video-list");
    let fourKString = '';
    let fourKDownloadUrl;
    let dButtonStr;
    dButtonStr = '<a class="btn btn-default btn33 btn-sm btn34" href="' + fourKDownloadUrl + '" target="_blank">More Info</a>';
    fourKString = '<li class="video" data-thumb="' + fourKData.thumbnail + '" data-link="' + fourKData.webpage_url + '" data-title="' + fourKData.title + '">' +
        '<a class="play-button" href="' + fourKData.webpage_url + '" target="_blank"></a>' +
        '<div class="title" title="' + fourKData.title + ' ' + fourKData.formatTtile + ' (' + fourKData.ext + ')">' + fourKData.title + ' ' + fourKData.formatTtile + ' (' + fourKData.ext + ')</div>' +
        '<div class="video_list_R">' + dButtonStr + '</div>' +
        '<div class=" clearfix"></div>' +
        '<div class="sep"></div>' +
        '</li>';
    videoList.prepend(fourKString);
    if (videoList.find("li").length > 0) {
        vd.showVideoList();
    } else {
        vd.emptyVideoList();
        vd.sendMessage({ message: "activate-ext-icon", activate: false });
        $("#no-video-found").css('display', 'block');
    }
    // console.log("Hiding after youtube info");
    $("#loading").hide();
};

vd.add4KLink = function (data, settings, callback) {
    // console.log(data);
    let fourKData = typeof data === 'string' ? JSON.parse(data) : data;
    let videoList = $("#video-list");
    let size = " Premiem";
    let duration = 0;
    let fourKString = '';
    let fourKDownloadUrl = '';
    let dButtonStr = '';
    if (fourKData.webpage_url.includes("https://www.youtube.com") && vd.extension === "chrome") {
        settings.isYoutube = false;
    }

    if (fourKData && !fourKData.streaming_url) {
        fourKData.streaming_url = fourKData.baseurl;
    }

};

vd.on4KDataReceived = function (result, settings, callback) {
    let fourKData = typeof result === 'string' ? JSON.parse(result) : result;
    vd.add4KLink(fourKData, settings, callback);
};

vd.getValidYtLink = function (links) {
    let validLink = {};
    links.some(function (link) {
        if (link.thumbnail) {
            validLink = link;
            return true
        }
    });
    // console.log(validLink);
    return validLink;
};

vd.createDownloadSection4KVideo = function (videoPageUrl, settings, callback) {
    console.log("Creating 4K link");
    $("#video-list").append('<li class="loader22"> <img  style="height:60px"  src="https://cdn.dribbble.com/users/225707/screenshots/2958729/attachments/648705/straight-loader.gif"  alt=""/></li>');
    settings.isYoutube = settings.isYoutube && vd.extension === "chrome";
    if (settings.isYoutube) {
        // console.log("Youtube >>>");
        chrome.tabs.query({ active: true }, function (tabs) {
            let tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, { message: 'get-youtube-data', userType: 'paid' }, function () {
                // Data will be received asynchronously to the chrome.runtime.onMessage listener
            });
        });
        return;
    }
    // console.log("Not chrome");
    let urlId = md5(videoPageUrl);
    let videoData = JSON.parse(localStorage.getItem(urlId));
    // console.log(urlId);
    vd.is4KDataExpired(videoData, function (expired) {
        // console.log("Expired", expired);
        if (videoData && !expired) {
            let fourKData = videoData.value;
            vd.add4KLink(fourKData, settings, callback);
        } else {
            localStorage.removeItem(urlId);
            vd.get4KData(videoPageUrl, function (result) {
                // console.log(videoPageUrl);
                result = vd.convertToJson(result);
                if (!result) {
                    localStorage.removeItem(urlId);
                    callback();
                    return;
                }
                result.tabUrl = videoPageUrl;
                vd.storeFourKData(result);
                vd.on4KDataReceived(result, settings, callback);
            })
        }
    });

};


vd.onVideoListChanged = function () {
};

vd.emptyVideoList = function () {
    let videoList = $("#video-list");
    videoList.html("");
    videoList.css('display', 'none');

};

vd.showVideoList = function () {
    let videoList = $("#video-list");
    vd.sendMessage({ message: "activate-ext-icon", activate: true });

    $("#no-video-found").css('display', 'none');
    videoList.css('display', 'block');

};



vd.showSaveVideoLoading = function () {
    $(".fa-bookmark").hide();
    $("#loading2").show();
};

vd.hideSaveVideoLoading = function () {
    // console.log("Hiding loading");
    $(".fa-bookmark").show();
    $("#loading2").hide();
};


vd.initializeUpgradedUI = function (items) {
    $.each(items.videoTypes, function (key, val) {
        $('.video_type[value="' + val + '"]').attr('checked', 'checked');
    });
    var upgradeBtn = $(".upgrade");
    upgradeBtn.hide();

};


vd.getSavedVideoData = function () {
    // console.log("Checking if video is saved", tabUrlMd5);
    vd.sendMessage({ message: "is-video-saved", tabUrlMd5: tabUrlMd5 }, function (video) {
        // console.log(video);
        if (video) {
            vd.changeSaveVideoBtnStatus(false);
            // console.log(video);
            $('.btn-save-video').attr('data-video-id', video.id);
        }
        vd.hideSaveVideoLoading();
    })
};

vd.afterDataLoaded = function () {
    // console.log("After downloading finished");
    console.trace("Hid >>>");
    let videoList = $("#video-list");
    vd.getStoredSettings(function (items) {
        let videoCount = videoList.find("li").length;
        $("#loading").hide();
        if (!items.logged_in) {
            $("#loading2").hide();
        }
        if (videoCount) {
            vd.showVideoList();
        } else {
            $("#no-video-found").css('display', 'block');
        }
        if (!items.logged_in || (vd.version !== "FREE" && items.upgraded === 'false')) {
            $(".my-list").hide();
        }
    });

};

$(document).ready(function () {
    let body = $('body');
    $(".my-list-a").attr('href', vd.serverUrl + "video_list");
    vd.showSaveVideoLoading();

    vd.getStoredSettings(function (items) {
        // console.log("LLL");
        // console.log(items);
        storedSettings = items;

    });


    let videoList = $("#video-list");
    $('#go-to-options').on('click', function () {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('html/options.html'));
        }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // console.log(tabs);
        tabUrlMd5 = md5(tabs[0].url);
        vd.sendMessage({ message: 'get-video-links', tabId: tabs[0].id }, function (tabsData) {
            // console.log(tabsData);
            vd.videoLinks = tabsData.videoLinks;
            if (!tabsData.url) {
                // console.log("Hiding after video links received>>>>");
                vd.emptyVideoList();
                $("#no-video-found").css('display', 'block');
                $("#loading").hide();
                return
            }
            
            vd.emptyVideoList();
            vd.getStoredSettings(function (items) {
                let isYoutube = false;
                let isLoggedInAndUpgraded = true;
                if ((!items.logged_in || (items.upgraded === 'false' && vd.version !== "FREE"))) {
                    chrome.tabs.query({ active: true }, function (tabs) {
                        let tabId = tabs[0].id;
                        chrome.tabs.sendMessage(tabId, { message: 'get-youtube-data', userType: 'paid' }, function () {
                            // Data will be received asynchronously to the chrome.runtime.onMessage listener
                        });
                    });
                    vd.getSavedVideoData();
                    // vd.sendMessage({message: 'show-youtube-warning'});
                    if (vd.extension === "chrome") {
                        vd.afterDataLoaded();
                        return 0;
                    }
                }
                // console.log("Continuing since it's not chrome");
                videoTypes = items.videoTypes;
                vd.videoLinks.forEach(function (videoLink) {
                    // console.log(videoLink);
                    if (!vd.isVideoLinkTypeValid(videoLink, items.videoTypes) || !vd.isVideoSizeValid(videoLink, items.minVideoSize) || (isYoutube && vd.extension === "chrome")) {
                        return
                    }
                    videoList.append(vd.createDownloadSection(videoLink));
                });
                // console.log(videoList);
                vd.getSavedVideoData();
                if (videoList.find("li").length > 0) {
                    vd.showVideoList();
                }
                vd.createDownloadSection4KVideo(tabsData.url, {
                    isYoutube: isYoutube,
                    minVideoSize: items.minVideoSize
                }, vd.afterDataLoaded);
                if (!items.logged_in || (items.upgraded === 'false' && vd.version !== "FREE")) {
                    $(".my-list").hide();
                }
            });
        });
    });


    body.on('click', '.btn-instant-download', function (e) {
        e.preventDefault();
        vd.sendMessage({
            message: 'download-video-link',
            url: $(this).attr('href'),
            fileName: $(this).attr('data-file-name')
        });
    });

    body.on('click', '.btn-four-k-download', function (e) {
        e.preventDefault();
        let videoUrl = $(this).data('web-page');
        $.post(vd.serverUrl + "video", { videoUrl: videoUrl }, function (response) {
            response = vd.convertToJson(response);
            if (!response.status) {
                return
            }
            var downloadPageUrl = vd.serverUrl + "video/download/?id=" + response.data;
            // console.log(downloadPageUrl);
            chrome.tabs.create({ url: encodeURI(downloadPageUrl) });

        });
    });

});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.message) {
        case "add-video-links":
            if (!request.videoLinks[0]) { return }
            vd.add4KLink(request.videoLinks[0], {
                isYoutube: false,
                minVideoSize: storedSettings.minVideoSize
            }, vd.afterDataLoaded);
            break;
        case "add-youtube-info-for-chrome":
            vd.addYoutubeInfo(request.videoLinks[0]);
            break;
    }
});