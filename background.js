// Copyright (c) 2012,2013 Peter Coles - http://mrcoles.com/ - All rights reserved.
// Use of this source code is governed by the MIT License found in LICENSE

//
// console object for debugging
//

//
// URL Matching test - to verify we can talk to this URL
//
var matches = ['http://*/*', 'https://*/*', 'ftp://*/*', 'file://*/*'],
    noMatches = [/^https?:\/\/chrome.google.com\/.*$/];
function testURLMatches(url) {
    // couldn't find a better way to tell if executeScript
    // wouldn't work -- so just testing against known urls
    // for now...
    var r, i;
    for (i=noMatches.length-1; i>=0; i--) {
        if (noMatches[i].test(url)) {
            return false;
        }
    }
    for (i=matches.length-1; i>=0; i--) {
        r = new RegExp('^' + matches[i].replace(/\*/g, '.*') + '$');
        if (r.test(url)) {
            return true;
        }
    }
    return false;
}


chrome.runtime.onMessage.addListener(function(request, sender, callback) {

    if (request.msg === 'saveList') {
        blocks = request.value.split(/\r\n|\n\r|\n|\r/);
        callback();
    }

    return true;
});

var blocks=[];

chrome.storage.sync.get({"list":['*twitter.com*', '*facebook1.*']}, function(val){
	blocks = val.list;
});


function testURLBlocks(url) {
    var r, i;
	if( !testURLMatches(url) ) return;
    for (i=blocks.length-1; i>=0; i--) {
		
		// Implement for the Google URL Patterns: 
		// https://developer.chrome.com/extensions/match_patterns
		
		//http://stackoverflow.com/questions/4607745/split-string-only-on-first-instance-of-specified-character
		var part_a = blocks[i].split( /\/\/(.*)?/ );
		if( part_a.length<2 ) {
			part_a.unshift("*");
		}
		if(part_a[0]=="") part_a[0]="*";
		var part_b = part_a[1].split(/\/(.*)?/);	

		var regStr = part_a[0].replace(/\*/g, '[^/]*').replace(/\./g,"\\.");
		regStr += "//"+ ( part_b[0].replace(/\*/g, '[^/]*').replace(/\./g,"\\.") );
		regStr += "/" + ( part_b.length>1 ? part_b[1].replace(/\*/g, '.*') : ".*" );

		r = new RegExp('^' + regStr + '$');
		if(url == 'http://news.china.com/zh_cn/hd/11127798/20150502/19617582.html') console.log(r);

        if (r.test(url)) {
            return true;
        }
    }
    return false;
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var isBlock = details.tabId>=0 && testURLBlocks(details.url);

        if(isBlock) console.info("Blocked: ", details.url);
        return {cancel: isBlock  };
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);

function addToHeader(obj, name, value){
    var v = _.findWhere(obj, {"name":name} );
    if(v) v.value=value;
    else obj.push({name:name, value:value});
}


chrome.webRequest.onHeadersReceived.addListener(
    function(e){

        //if( /image|object/.test(e.type) ) return; 
        var headers = e.responseHeaders;

        addToHeader(headers, "Access-Control-Allow-Origin", "*" );
        addToHeader(headers, "Access-Control-Allow-Credentials", "false" );
        //addToHeader(headers, "Access-Control-Allow-Headers", "X-Requested-With" );

        return {responseHeaders: headers};
    },
    {urls: ["<all_urls>"]}, // types:["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"] 
    ["blocking", "responseHeaders"]
);


chrome.webNavigation.onErrorOccurred.addListener(onErrorOccurred, {urls: ["http://*/*", "https://*/*"]});

function onErrorOccurred(err)
{

	return;

    if( ! testURLMatches(err.url) ) return;

    chrome.tabs.get(err.tabId, function(tab){

        if (chrome.runtime.lastError) return;

        if (err.frameId==0 && tab.url==err.url && !/ERR_ABORTED|ERR_BLOCKED_BY_CLIENT/.test(err.error) ) {
            console.log("load error: " + err.url);
            setTimeout(function(){ chrome.tabs.reload(err.tabId); }, 1000);
        }

        if (err.error == "net::ERR_NAME_NOT_RESOLVED")
            chrome.tabs.update(err.tabId, {url: "about:blank"});
    
    });
}





chrome.browserAction.onClicked.addListener(function(tab) {
	//blocks = $('txtlist').value.split('\n');
    alert(1234);
});


