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


/****** music brainz **************/
var music_brainz_search = function(release, artist, country, skip) {
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
		fmt: 'json',
		limit: 5,
		offset: offset
	};
		
	$.ajax({
		url: "http://musicbrainz.org/ws/2/release/",
		data: request,
		type: "GET",

	})
	.done(function(result){ 
		console.log("finished with result: ", result);
		music_brainz_header_update(result);
		music_brainz_results_update(result);
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
}

var music_brainz_header_update = function(results) {
	if (results.count > 0) {
		$('#mb-total-results').text(results.count);
	}
}
var music_brainz_results_update = function(results) {
	if (results.count == 0) {
		music_brainz_table_reset();
		return;
	}
	music_brainz_results_update_rows_from_results(results);
	music_brainz_table_set_active(true);
}

var music_brainz_results_update_rows_from_results = function(results) {
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
			title = release.title + "(" + release.id + ")";
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
	new_row.addClass(identifier);
	var results_table = $("#brainz-results-table");
	results_table.append(new_row);
	$("." + identifier).click(function(event) {
		music_brainz_table_row_clicked(event);
		event.preventDefault();
	});
}

var music_brainz_table_row_clicked = function(event) {
	var curTarget = event.currentTarget;
	var identifier_cell = $(curTarget).find('.brainz-result-id-cell');
	var identifier = identifier_cell.text();
	music_brainz_table_clear_selected_row();
	music_brainz_table_mark_selected_row(curTarget);
	music_brainz_get_detail(identifier);
}

var music_brainz_table_clear_selected_row = function() {
	var selected_row = $("#music-brainz-selected-row");
	if (selected_row) {
		selected_row.removeAttr('id');
	}
}

var music_brainz_table_mark_selected_row = function(row) {
	if (row) {
		$(row).attr('id', 'music-brainz-selected-row');
	}	
}

var music_brainz_get_detail = function(identifier) {
	console.log("Getting detail == identifier: " + identifier);
	var request = { 
		fmt: 'json',
		inc: 'aliases+artist-credits+discids+labels+recordings'
	};	
	$.ajax({
		url: "http://musicbrainz.org/ws/2/release/" + identifier,
		data: request,
		type: "GET",

	})
	.done(function(result){ 
		console.log("finished detail with result: ", result);
		music_brainz_detail_parse(result);
		
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
}

var music_brainz_detail_parse = function(release) {
	var artist = release['artist-credit'][0].artist.name;
	var release_date = release.date;
	var media = release['media'][0].format;
	music_brainz_details_update(artist, release_date, media);
	var coverart_avail = release['cover-art-archive'].artwork;
	if (coverart_avail) {
		//music_brainz_get_cover(release.id);
		var htmlstring = '<img src="http://coverartarchive.org/release/' + release.id + '/front" alt="Picture of front cover of ' + release.title + '" width="250" height="250">'
		$("#brainz-cover-image").html(htmlstring);
	} else {
		var htmlstring = empty_cover_image(release.title)
		console.log(htmlstring);
		$("#brainz-cover-image ").html(htmlstring);
	}
}

var music_brainz_details_update = function(artist, release_date, media) {
	if (!artist && !release_date && !media) {
		$("#brainz-result").removeClass("brainz-active").addClass("brainz-inactive");
		return;
	}
	$("#brainz-artist").text(artist);
	$("#brainz-release-date").text(release_date);
	$("#brainz-media").text(media);
	$("#brainz-result").removeClass("brainz-inactive").addClass("brainz-active");
}

var empty_cover_image = function(title) {
	if (title) {
		title = '"'+title+'"';
	}
	var img = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="250" height="250"  xml:space="preserve" id="canvas1"><rect id="canvas1-rectangle" stroke="none" fill="rgb(235, 232, 232)" x="0" y="0" width="250" height="250" /><text  fill="rgb(170, 170, 170)" font-family="Comfortaa, sans-serif" font-size="16" x="94.69" y="0" text-anchor="middle"><tspan x="125" y="119">' + title + '</tspan><tspan x="125" y="137.6">cover image not available</tspan></text></svg>'
	return img;

}
$(document).ready( function() {
	$( "#search-orphic" ).submit(function( event ) {
  		music_brainz_search($('#orphic-song-search').val(), $('#orphic-artist-search').val(), $('#orphic-country-search').val(), 0);
  		event.preventDefault();
	});
});

