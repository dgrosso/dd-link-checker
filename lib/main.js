var pageMod = require("page-mod");
var data = require("self").data;

/** Settings **
// TODO: context menu
var autocheck   = true;   // check links automatically when tab loads
var contextmenu = false;  // add an item in the page context-menu
/**/

exports.main = function() {

	//if( autocheck )
	//{
		pageMod.PageMod({
			include: ["*"],
			contentScriptWhen: 'ready',
			contentScriptFile: data.url('check-links.js')
		});
	//}
	
};

