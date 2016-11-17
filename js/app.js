// http://musicbrainz.org/ws/2/release/?query=happy&artist:Pharrell%20Williams&fmt=json&country:US

var youtubeGet = function(search) {
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		part: 'snippet',
		key: 'AIzaSyATFOByRDvvLMx1dDK5t-HSKnP1t4YbVvo',
		q: 'like a virgin madonna'
	};
	
	$.ajax({
		url: "https://www.googleapis.com/youtube/v3/search",
		data: request,
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET",
		safesearch: 'strict',
		type: 'video',
		videoEmbeddable: true,
		
	})
	.done(function(result){ 

		$.each(result.items, function(i, item) {
			console.dir(item);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};


var youtube_iframe_player = function (video_id) {
	var player = '<iframe id="ytplayer" type="text/html" width="640" height="390" src="https://www.youtube.com/embed/' + video_id + '?autoplay=1"frameborder="0"></iframe>';
	return player;
};

var music_brainz = function(release, artist, country, skip) {
	console.log("release: " + release + "  artist: " + artist + " country: " + country + " skip: " + skip);
	if (!release) {
		return;
	}
	var offset = 0;
	if (skip > 0) {
		offset = skip;
	}
	var search_query = release;
	if (country) {
		var search_query = release + ' AND country:' + country;
	}
	if (artist) {
		search_query = search_query + ' AND artist:' + artist;
	}
	var request = { 
		query: search_query,
		//query: release_search,
		fmt: 'json',
		limit: 5,
		offset: offset
	};
	
	console.dir(request);
	
	$.ajax({
		url: "http://musicbrainz.org/ws/2/release/",
		data: request,
		//dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET",

	})
	.done(function(result){ 
		console.log("finished with result: ", result);
		/*$.each(result.releases, function(i, item) {
			console.dir(item);
		});*/
		update_music_brainz_header(result)
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
	
}

var update_music_brainz_header = function(result) {
	if (result.count > 0) {
		$('#mb-total-results').text(result.count);
	}
}
$(document).ready( function() {
	$( "#search-orphic" ).submit(function( event ) {
  		music_brainz($('#orphic-song-search').val(), $('#orphic-artist-search').val(), $('#orphic-country-search').val(), 0);
  		event.preventDefault();
	})
	
});

