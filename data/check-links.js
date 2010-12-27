
/** Services **/
var services = {
	/** Rapidshare **/
	'rs':
		{
			enabled: true,
			regex: /^http:\/\/rapidshare\.com\/files\/([0-9]+)\/(.*)$/,
			valid: function(status) { return (status==1 || status > 50); },
			check: check_rs_links
		},
	/** Megaupload **/
	'mu':
		{
			enabled: true,
			regex: /^http:\/\/.*\.megaupload\.com\/(?:.*\/)?\?d=([A-Z0-9]{8})$/,
			regex_status: /id([0-9]+)=([0-9])/,
			regex_status_g: /id([0-9]+)=([0-9])/g,
			valid: function(status) { return (status==0); },
			check: check_mu_links
		}
};

function set_link_status(link,service,status)
{
	link.style.borderWidth='1px';
	link.style.borderStyle='solid';
	if( service.valid(status) )
	{
		link.style.backgroundColor='green';
		link.style.borderColor='green';
		link.style.color='white';
	}
	else
	{
		link.style.backgroundColor="red";
		link.style.borderColor='red';
		link.style.color="black";
	}
}

function check_rs_links(links)
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
	var req = new XMLHttpRequest();
	req.open('GET', 'http://api.rapidshare.com/cgi-bin/rsapi.cgi?sub=checkfiles_v1&'+data, true);
	req.onreadystatechange = function (aEvt) {
		if (req.readyState == 4) {
			if(req.status == 200)
			{
				var files = req.responseText.split('\n');
				for( i in links )
				{
					var info = files[i].split(',');
					set_link_status(links[i].element,services.rs,info[4]);
				}
			}
		}
	};
    req.send(null);

}

function check_mu_links(links)
{
	var data = "";
	for( i in links )
		data += 'id' + i + '=' + links[i].id + '&';
	var req = new XMLHttpRequest();
	req.open('POST', 'http://www.megaupload.com/mgr_linkcheck.php', true);
	req.onreadystatechange = function (aEvt) {
		if (req.readyState == 4) {
			if(req.status == 200)
			{
				var matches = req.responseText.match(services.mu.regex_status_g);
				for( match in matches )
				{
					var m = matches[match].match(services.mu.regex_status);
					set_link_status(links[parseInt(m[1])].element,services.mu,m[2]);
				}
			}
		}
	};
    req.send(data);
}

function check_dd_links(contentDocument)
{
	var dom_links = contentDocument.querySelectorAll('a[href]');
	var links = {};
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
					links[service].push({id:match[1],element:dom_links[link],'match':match});
					break;
				}
			}
		}
	}

	for( service in services )
		if( links[service] )
			services[service].check(links[service]);
}

check_dd_links(document);

