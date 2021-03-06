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
  	var rows = $(".youtube-result-row");
  	rows.remove();
    var youtube_header = $(".youtube-results-header-hidden");
    youtube_header.removeClass("youtube-results-header-hidden");
		$.each(result.items, function(i, item) {
  		youtube_results_add_row(item.snippet.channelId, item.snippet.channelTitle, item.snippet.description, item.snippet.publishedAt, item.snippet.thumbnails, item.snippet.title, item.id.videoId);
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

var current_mb_search;
var cancel_search_timer;


var youtube_results_add_row = function(channelId, channelTitle, description, publishedAt, thumbnails, title, videoId) {
	var new_row = $(".youtube-result-row-proto").clone();
	var thumbnail_img = new_row.find('.youtube-thumb-image');
	thumbnail_img.attr('src', thumbnails.default.url);
	var thumbnail_link = new_row.find('.youtube-link');
	thumbnail_link.attr('href', "https://www.youtube.com/watch?v=" + videoId);
	
	var title_cell = new_row.find('.youtube-title')
	title_cell.text(title);
	
	var desc_cell = new_row.find('.youtube-description')
	desc_cell.text(description);
	
	var date_cell = new_row.find('.youtube-date')
	date_cell.text(channelTitle + "  " + publishedAt);
	
	new_row.removeClass("youtube-result-row-proto");
	new_row.addClass("youtube-result-row");
	var results_table = $("#youtube-search-results");
	results_table.append(new_row);
}


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
	music_brainz_prepare_to_run_search(song);
	current_mb_search = $.ajax({
		url: "https://musicbrainz.org/ws/2/recording/",
		data: request,
		type: "GET",

	})
	.done(function(result){ 
		var header_text = 'Found ' + result.count + ' MusicBrainz results for "' + song + '"';
		if (artist) {
			header_text = header_text + ' by "' + artist + '".';
		} else {
			header_text = header_text + ".";
		}
		music_brainz_results_header_update(header_text);
		music_brainz_results_update(result);
		music_brainz_results_footer_update(result, song, artist, country);
	})
	.fail(function(jqXHR, error, errorText){ //this waits for the ajax to return with an error promise object
		showError(errorText);
	})
	.always(function() {
		music_brainz_search_ended();
  	});
  
}

var music_brainz_cancel = function() {
	if (current_mb_search) {
		current_mb_search.abort();
	}
	music_brainz_search_ended();
}

var music_brainz_prepare_to_run_search = function(song) {
	$('#search-spinner-loc').addClass('spinner');
	cancel_search_timer = window.setTimeout(function(){
		$('#orphic-search-button').val('Cancel search for ' + song);
		$( "#search-orphic" ).off('submit').submit(function( event ) {
			music_brainz_cancel();
			event.preventDefault();
		});		
	}, 1000);
}

var music_brainz_search_ended = function() {
	window.clearTimeout(cancel_search_timer);
	$('#orphic-search-button').val('Search');
	$('#search-spinner-loc').removeClass('spinner');
	$( "#search-orphic" ).off('submit').submit(function( event ) {
		run_search(0);
  		event.preventDefault();
	});
}

var music_brainz_results_header_update = function(status) {
	$("#mb-table-header").html(status);
}

var music_brainz_results_footer_update = function(results, song, artist, country) {
	$("#brainz-skip-prev").attr("disabled", "disabled").addClass("music-brainz-steppers-inactive");
	$("#brainz-skip-next").attr("disabled", "disabled").addClass("music-brainz-steppers-inactive");
	$("#music-brainz-steppers").data('offset', results.offset);
	$("#music-brainz-steppers").data('song', song);
	$("#music-brainz-steppers").data('artist', artist);
	$("#music-brainz-steppers").data('country', country);
	music_brainz_results_footer_next(results);
	music_brainz_results_footer_previous(results);
}

var music_brainz_results_footer_previous = function(results) {
	if (results.offset > 0) {
		$("#brainz-skip-prev > input").removeAttr("disabled").removeClass("music-brainz-steppers-inactive");
		$("#brainz-skip-prev").removeClass("music-brainz-steppers-inactive");
	}
}

var music_brainz_results_footer_next = function(results) {
	if (results.count > results.offset + results.recordings.length) {
		$("#brainz-skip-next > input").removeAttr("disabled").removeClass("music-brainz-steppers-inactive");
		$("#brainz-skip-next").removeClass("music-brainz-steppers-inactive");
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
	$( "#brainz-skip-prev" ).submit(function(event ) {
		brainz_skip_search(-5);
  		event.preventDefault();
	});
	$( "#brainz-skip-next" ).submit(function( event ) {
		brainz_skip_search(5);
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
  var youtubequery = song + " " + artist;
  youtubeGet(youtubequery)
}

function brainz_skip_search(newoffset) {
	var song = $("#music-brainz-steppers").data('song');
	var artist = $("#music-brainz-steppers").data('artist');
	var country = $("#music-brainz-steppers").data('country');
	var offset = Number($("#music-brainz-steppers").data('offset'));
	offset = offset + Number(newoffset);
	music_brainz_search(song, artist, country, offset);
}

