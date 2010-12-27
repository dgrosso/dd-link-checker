var tabs = require("tabs");
var pageMod = require("page-mod");
var data = require("self").data;
var xhr  = require("xhr");

/** Settings **/
var autocheck   = true;   // check links automatically when tab loads
var contextmenu = false;  // add an item in the page context-menu

exports.main = function() {

	if( autocheck )
	{
		pageMod.PageMod({
			include: ["*"],
			contentScriptWhen: 'ready',
			contentScriptFile: data.url('check-links.js')
		});
		//tabs.on('ready', check_dd_links);
	}
	
	if( contextmenu )
	{
		var pageContextMenu = contextMenu.Item({
			label: 'Check Direct-Download links',
			contentScript: 'on( "click", function() { postMessage({tab:}); });',
			onMessage:function( info )
			{
				console.log( info.tab );
            	check_dd_links(info.tab); 
            }
        });
		//contextMenu.add( pageContextMenu );
	}

};

