// This content script sends header titles from the page to the add-on:
/*var script = "var elements = document.querySelectorAll('h2 > span'); " +
			 "for (var i = 0; i < elements.length; i++) { " +
			 "  postMessage(elements[i].textContent) " +
			 "}";*/
var element = document.querySelector('#download_file tr:first-child td:first-child');
if( element && element.innerHTML.search(/removed/) == -1 )
	postMessage(true);
else
	postMessage(false);
