// Direct-Download Links Checker
// by Daniel Grosso
//
// TODO: 
//    - context menu
//    - gui
//

var pageMod = require("page-mod");
var pageWorkers = require("page-worker");
var extData = require("self").data;
var tabs = require("tabs");
var Request = require('request').Request;

var services = {
	'rs':{
		valid: function(status) { return (status==1 || status > 50); }
	},
	'mu':{
		regex_status_g: /id([0-9]+)=([0-9])/g,
		regex_status: /id([0-9]+)=([0-9])/,
		valid: function(status) { return (status==0); }
	},
	'hf':{
		valid: function(status) { return (status==1); },
		script: 'hotfile.js'
	}
};

services.hf.check = function(links,worker)
{
	var count = links.length;
	for( i in links )
	{
		// Create a page worker that loads the link
		pageWorkers.Page({
			contentURL: links[i].url,
			contentScriptFile: extData.url(this.script),
			contentScriptWhen: "ready",
			onMessage: function(message) {
				links[i].status = message;
				count--;
				if( count == 0 )
					worker.postMessage({'hf':links});
			}
		});
	}
}

services.rs.check = function(links,worker)
{
	var data_files = "files=";
	var data_filenames = "filenames=";
	for( i in links )
	{
		data_files += links[i].id + ',';
		data_filenames += encodeURI(links[i].match[2]) + ',';
	}
	data_files=data_files.substr(0,data_files.length-1);
	data_filenames=data_filenames.substr(0,data_filenames.length-1);
	var data = data_files+'&'+data_filenames;
	Request({
		url: 'http://api.rapidshare.com/cgi-bin/rsapi.cgi?sub=checkfiles_v1&'+data,
		onComplete: function(response)
		{
			var files = response.text.split('\n');
			for( i in links )
			{
				var info = files[i].split(',');
				links[i].status = services.rs.valid(info[4]);
			}
			worker.postMessage({'rs':links});
		}
	}).get();
}

services.mu.check = function(links,worker)
{
	var data = "";
	for( i in links )
		data += 'id' + i + '=' + links[i].id + '&';
	Request({
		url: 'http://www.megaupload.com/mgr_linkcheck.php',
		onComplete: function(response)
		{
			var matches = response.text.match(services.mu.regex_status_g);
			for( match in matches )
			{
				var m = matches[match].match(services.mu.regex_status);
				links[parseInt(m[1])].status = services.mu.valid(m[2]);
			}
			worker.postMessage({'mu':links});
		}
	}).post(data);
}

exports.main = function(options,callbacks) {

	function checkLinks( links )
	{
		for( service in links )
			services[service].check( links[service], this );
	}

	new pageMod.PageMod({
		include: ["http://*"],
		contentScriptWhen: 'ready',
		contentScriptFile: extData.url('check-links.js'),
		onAttach: function onAttach(worker) {
			if( worker.tab )
				worker.on('message',checkLinks);
		}
	});

};

