/** Services **/
var services = {
	/** Rapidshare **/
	'rs':
		{
			enabled: true,
			regex: /^http:\/\/rapidshare\.com\/files\/([0-9]+)\/(.*)$/,
		},
	/** Megaupload **/
	'mu':
		{
			enabled: true,
			regex: /^http:\/\/.*\.megaupload\.com\/(?:.*\/)?\?d=([A-Z0-9]{8})$/,
		},
	/** Hotfile **/
	'hf':
		{
			enabled: false,
			regex: /^http:\/\/hotfile\.com\/dl\/(.*)$/,
		}
};
var links = {};

function set_link_status(link,valid)
{
	link.style.borderWidth='1px';
	link.style.borderStyle='solid';
	link.style.borderRadius='5px';
	link.style.padding='1px';
	if( valid )
	{
		link.style.backgroundColor='#00ff00';
		link.style.borderColor='#0e6400';
		link.style.color='#0e6400';
	}
	else
	{
		link.style.backgroundColor='#ff8080';
		link.style.borderColor='#8f0d00';
		link.style.color='#640a00';
	}
}

function check_dd_links(contentDocument)
{
	var dom_links = contentDocument.querySelectorAll('a[href]');
	for(link in dom_links)
	{
		for( service in services )
		{
			if( services[service].enabled && dom_links[link].href )
			{
				var match = dom_links[link].href.match( services[service].regex );
				if( match )
				{
					if( !links[service] )
						links[service] = [];
					links[service].push({id:match[1],element:dom_links[link],'match':match,url: dom_links[link].href});
					break;
				}
			}
		}
	}

	self.postMessage(links);
}

self.on('message', function(chklinks)
{
	for( service in chklinks )
		for( link in chklinks[service] )
		{
			if( chklinks[service][link].status != undefined )
				set_link_status( links[service][link].element, chklinks[service][link].status );
		}
});

check_dd_links(document);
