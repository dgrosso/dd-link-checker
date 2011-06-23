var element = document.querySelector('#download_file tr:first-child td:first-child');
self.postMessage( element && (element.innerHTML.search(/removed/) == -1) );