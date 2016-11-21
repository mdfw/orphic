// http://musicbrainz.org/ws/2/release/?query=happy&artist:Pharrell%20Williams&fmt=json&country:US

var showError = function(error) {
	console.log("Showing error: " + error);
	if (errorText) {
		$("#errorText").text("Error: " + error);
		$("#errorAlert").removeClass("error-inactive").addClass("error-active");
		
	}
}

var clearError = function(event) {
	$("#errorText").text("");
	$("#errorAlert").removeClass("error-active").addClass("error-inactive");
}

var youtubeGet = function(search) {
	var request = { 
		part: 'snippet',
		key: 'AIzaSyATFOByRDvvLMx1dDK5t-HSKnP1t4YbVvo',
		q: search
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
		showError(error);
	});
};


var youtube_iframe_player = function (video_id) {
	var player = '<iframe id="ytplayer" type="text/html" width="640" height="390" src="https://www.youtube.com/embed/' + video_id + '?autoplay=1"frameborder="0"></iframe>';
	return player;
};


/****** music brainz **************/
var music_brainz_search = function(song, artist, country, skip) {
	if (!song) {
		showError("Must include at least a song to search for.");
		return;
	}
	var offset = 0;
	if (skip > 0) {
		offset = skip;
	}
	var search_query = song;
	var search_description = song;
	if (country) {
		search_query = search_query + ' AND country:' + country;
	}
	if (artist) {
		search_query = search_query + ' AND artist:' + artist;
		search_description = search_description + ' by ' + artist;
	}
	var request = { 
		query: search_query,
		fmt: 'json',
		limit: 5,
		offset: offset
	};
	music_brainz_results_header_update("Searching", "for " + search_description + ".");
	music_brainz_results_footer_prepare(song, artist, country);
	$.ajax({
		url: "https://musicbrainz.org/ws/2/recording/",
		data: request,
		type: "GET",

	})
	.done(function(result){ 
		console.log("finished with result: ", result);
		music_brainz_results_header_update("Found " + result.count + " MusicBrainz results ");
		music_brainz_results_update(result);
		music_brainz_results_footer_update(result);
	})
	.fail(function(jqXHR, error, errorText){ //this waits for the ajax to return with an error promise object
		showError(errorText);
	});
}

var music_brainz_results_header_update = function(status, forwhat) {
	$("#mb-total-results").html(status);
	if (forwhat) {
		$('#mb-searching-for').html(forwhat);
	}
}

var music_brainz_results_footer_prepare = function(song, artist, country) {
	$("#brainz-skip-prev").attr("disabled", "disabled").addClass("music-brainz-steppers-inactive");
	$("#brainz-skip-next").attr("disabled", "disabled").addClass("music-brainz-steppers-inactive");
	$("#brainz-skip-song").val(song);
	$("#brainz-skip-artist").val(artist);
	$("#brainz-skip-country").val(country);
}

var music_brainz_results_footer_update = function(results) {
	$("#brainz-skip-offset").val(results.offset);
	music_brainz_results_footer_next(results);
	music_brainz_results_footer_previous(results);
}

var music_brainz_results_footer_previous = function(results) {
	if (results.offset > 0) {
		$("#brainz-skip-prev").removeAttr("disabled").removeClass("music-brainz-steppers-inactive");
	}
}

var music_brainz_results_footer_next = function(results) {
	if (results.count > results.offset + results.recordings.length) {
		$("#brainz-skip-next").removeAttr("disabled").removeClass("music-brainz-steppers-inactive");
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
	var artist = "No artist";
	var title = "No title";
	var release_set = "No releases";
	var recordingslen = results.recordings.length;
	for (r=0; r<recordingslen; ++r) {
		if (r in results.recordings) {
    		recording = results.recordings[r];
			title = recording.title;
			artist = recording['artist-credit'][0].artist.name
			release_set = '';
			if (recording.releases && recording.releases[0].title) {
				release_set = '"' + recording.releases[0].title + '"';
				if (recording.releases.length > 1) {
					var nummore = recording.releases.length - 1;
					release_set = release_set + " <i>and " + nummore + " more.</i>"
				}
			}
			identifier = recording.id;
			music_brainz_table_add_row(title, artist, release_set, identifier, recording);
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
	music_brainz_table_add_row("Happy", "Pharrell Williams", "Bob");
}

var music_brainz_table_clear = function() {
	var rows = $(".music-brainz-result-row");
	rows.remove();
}

var music_brainz_table_add_row = function(release, artist, releases, identifier, recording_info) {
	var new_row = $(".music-brainz-proto-row").clone();
	var release_cell = new_row.find('.brainz-result-recording-cell')
	release_cell.text(release);
	var artist_cell = new_row.find('.brainz-result-artist-cell')
	artist_cell.text(artist);
	var releases_cell = new_row.find('.brainz-result-releases-cell')
	releases_cell.html(releases);
	var identifier_cell = new_row.find('.brainz-result-id-cell')
	identifier_cell.text(identifier);
	
	new_row.removeClass("music-brainz-proto-row");
	new_row.addClass("music-brainz-result-row");
	new_row.addClass(identifier);
	new_row.data("recording", recording_info);
	new_row.data("inflated", false);
	var results_table = $("#brainz-results-table");
	results_table.append(new_row);
	$("." + identifier).click(function(event) {
		music_brainz_table_row_clicked(event);
		event.preventDefault();
	});
}

var music_brainz_build_releases = function(releases) {
	var releases_set = [];
	releaseslen = releases.length;
	for (i=0; i<releaseslen; ++i) {
		if (i in releases) {
    		release = releases[i];
			var releaseattr = [];
			if (release.date) {
				releaseattr.push(release.date);
			}
			var title = '"' + release.title + '"';
			if (releaseattr.length > 0) {
				title = title + " (" + releaseattr.join(" ,") + ")";
			}
			releases_set.push(title);
  		}
	}
	return releases_set.join("<br />");
}

var music_brainz_table_row_clicked = function(event) {
	var curTarget = event.currentTarget;
	var identifier_cell = $(curTarget).find('.brainz-result-id-cell');
	var identifier = identifier_cell.text();
	//music_brainz_table_clear_selected_row();
	//music_brainz_table_mark_selected_row(curTarget);
	if ($("." + identifier).data("inflated")) {
		music_brainz_deflate_row(identifier);
	} else {
		music_brainz_inflate_row(identifier);
	}
}

var music_brainz_inflate_row = function(identifier) {
	var this_row = $("." + identifier);
	var recording = this_row.data("recording");
	var all_releases = music_brainz_build_releases(recording.releases);
	var releases_cell = this_row.find('.brainz-result-releases-cell')
	releases_cell.html(all_releases);
	this_row.data("inflated", true);
}

var music_brainz_deflate_row = function(identifier) {
	var this_row = $("." + identifier);
	var recording = this_row.data("recording");
	var release_set = '';
	if (recording.releases && recording.releases[0].title) {
		release_set = '"' + recording.releases[0].title + '"';
		if (recording.releases.length > 1) {
			var nummore = recording.releases.length - 1;
			release_set = release_set + " <i>and " + nummore + " more.</i>"
		}
	}
	var releases_cell = this_row.find('.brainz-result-releases-cell')
	releases_cell.html(release_set);
	this_row.data("inflated", false);
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


$(document).ready( function() {
	$( "#search-orphic" ).submit(function( event ) {
		run_search(0);
  		event.preventDefault();
	});
	$( "#brainz-skip" ).submit(function( event ) {
		brainz_skip_search(event);
  		event.preventDefault();
	});

	$("#errorAck").click(function(event) {
		clearError(event);
		event.preventDefault();
	});

});

function run_search(skip) {
	var song = $('#orphic-song-search').val();
	var artist = $('#orphic-artist-search').val();
	var country = $('#orphic-country-search').val();
	if (!song) {
		showError("Must include at least a song to search for.");
		return;
	}

	music_brainz_search(song, artist, country, skip);
	//var youtubequery = song + " " + artist;
  	//youtubeGet(youtubequery)
}

function brainz_skip_search(event) {
	var song = $('#brainz-skip-song').val();
	var artist = $('#brainz-skip-artist').val();
	var country = $('#brainz-skip-country').val();
	var offset = Number($('#brainz-skip-offset').val());
	var button_id = document.activeElement.getAttribute('id');
	if (button_id === "brainz-skip-next") {
		offset = offset + 5;
	} else if (button_id === "brainz-skip-prev") {
		offset = offset - 5;
	}
	music_brainz_search(song, artist, country, offset);
}