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
	console.log("Search release: " + release + "  artist: " + artist + " country: " + country + " skip: " + skip);
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
		update_music_brainz_header(result);
		update_music_brainz_results(result);
		
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
	
}

var update_music_brainz_header = function(results) {
	if (results.count > 0) {
		$('#mb-total-results').text(results.count);
	}
}
var update_music_brainz_results = function(results) {
	if (results.count == 0) {
		music_brainz_table_reset();
		return;
	}
	update_rows_from_results(results);
	music_brainz_table_set_active(true);
}

var update_rows_from_results = function(results) {
	music_brainz_table_clear();
	console.log("+++++++ update_rows_from_results ++++++++");
	var artist = "No artist";
	var title = "No title";
	var date = "No date";
	console.log("Results:");
	console.dir(results);
	len = results.releases.length;
	for (i=0; i<len; ++i) {
		if (i in results.releases) {
    		release = results.releases[i];
			title = release.title;
			title = title;
			artist = release['artist-credit'][0].artist.name
			date = release.date;
			identifier = release.id;
			music_brainz_table_add_row(title, artist, date, identifier);
  		}
	}
}

var music_brainz_table_set_active = function(active) {
	if (active) {
		var results_table = $("#brainz-results-table");
		results_table.removeClass("inactive-table").addClass("active-table");
	} else {
		var results_table = $("#brainz-results-table");
		results_table.removeClass("active-table").addClass("inactive-table");

	}
}
var music_brainz_table_reset = function() {
	music_brainz_table_set_active(false);
	music_brainz_table_clear();
	music_brainz_table_add_row("Happy", "Pharrell Williams", "2014-01-24");
}

var music_brainz_table_clear = function() {
	var rows = $(".music-brainz-result-row");
	console.log(rows);
	rows.remove();
}

var music_brainz_table_add_row = function(release, artist, date, identifier) {
	var new_row = $(".music-brainz-proto-row").clone();
	var release_cell = new_row.find('.brainz-result-release-cell')
	release_cell.text(release);
	var artist_cell = new_row.find('.brainz-result-artist-cell')
	artist_cell.text(artist);
	var date_cell = new_row.find('.brainz-result-date-cell')
	date_cell.text(date);
	var identifier_cell = new_row.find('.brainz-result-id-cell')
	identifier_cell.text(identifier);
	
	new_row.removeClass("music-brainz-proto-row");
	new_row.addClass("music-brainz-result-row");
	var results_table = $("#brainz-results-table");
	results_table.append(new_row);
	$(".music-brainz-result-row").click(function(event) {
		music_brainz_table_row_clicked(event);
	});
}

var music_brainz_table_row_clicked = function(event) {
	var curTarget = event.currentTarget;
	var identifier_cell = $(curTarget).find('.brainz-result-id-cell');
	var identifier = identifier_cell.text();
	console.log("identifier: " + identifier);
	music_brainz_load_detail(identifier);
}

var music_brainz_load_detail = function(identifier) {
	var request = { 
		fmt: 'json',
		inc: 'aliases+artist-credits+discids+labels+recordings'
	};
	
	console.dir(request);
	
	$.ajax({
		url: "http://musicbrainz.org/ws/2/release/" + identifier,
		data: request,
		type: "GET",

	})
	.done(function(result){ 
		console.log("finished detail with result: ", result);
		
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
}

$(document).ready( function() {
	$( "#search-orphic" ).submit(function( event ) {
  		music_brainz($('#orphic-song-search').val(), $('#orphic-artist-search').val(), $('#orphic-country-search').val(), 0);
  		event.preventDefault();
	});
});

