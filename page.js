// Copyright (c) 2012,2013 Peter Coles - http://mrcoles.com/ - All rights reserved.
// Use of this source code is governed by the MIT License found in LICENSE

//
// console object for debugging
//

//
// utility methods
//
function $(id) { return document.getElementById(id); }
function show(id) { $(id).style.display = 'block'; }
function hide(id) { $(id).style.display = 'none'; }
function message (txt) {
	$("message").innerHTML=txt;
}

chrome.storage.local.get({"list":['*twitter.com*', '*facebook1.*']}, function(val){
	$("txtlist").value = val.list.join("\n");
});

function saveChanges() {
    var theValue = $("txtlist").value.replace(/^\s*|\s*$/img,"");
    if (!theValue) {
      message('错误: 列表未指定');
      return;
    }
    chrome.storage.local.set({'list': theValue.split(/\r\n|\n\r|\n|\r/) }, function() {
      message('列表已保存');
      chrome.runtime.sendMessage({msg:"saveList", value: theValue }, function(){
      	
      });

    });
}

$("okBtn").onclick = saveChanges;