var shopfulready = false;

$(document).ready(function() {
	loadNotes();
	loadItems();
	$(".item-input").focus();

   	$( "#add-an-item" ).submit(function( event ) {
  		addItem(event);
  		event.preventDefault();
	})
	$(".checkoff-trigger").click(function(event) {
	  	checkoffEventTriggered(event);
  		event.preventDefault();
	})
	$(".quantity-button").focus(function(event) {
		checkoffButtonFocused(event);
	})
	$(".quantity-button").blur(function(event) {
		checkoffButtonBlurred(event);
	})
	$('#notes-text').bind('input propertychange', function() {
  		storeNotes();
	})
	$('#item-description').bind('input propertychange', function() {
  		validateAddButton();
	})
	$('#quantity-field').bind('input propertychange', function() {
  		validateAddButton();
	})


	shopfulready = true;
	watchForCleanupPresses($('#cleanup'));
	validateClearButton();
	validateAddButton(null);

});

function validateAddButton (event) {
	var quantity = $(".quantity-input").val();
    var itemDesc = $(".item-input").val() ;
    if (!quantity || !itemDesc) {
    	$('#add-button')[0].disabled = true;
    } else {
        $('#add-button')[0].disabled = false;
    }
    setAddButtonTitle(quantity, itemDesc);
}

function setAddButtonTitle(quantity, description) {
 	if (!quantity && !description) {
 		$('#add-button').attr('title', 'Cannot add, quantity or item description missing.');
	} else if (!quantity) {
		$('#add-button').attr('title', 'Cannot add, quantity missing.');
	} else if (!description) {
		$('#add-button').attr('title', 'Cannot add, item description missing.');
	} else {
		$('#add-button').attr('title', 'Add ' + quantity + ' ' + description + '.');
	}

}

function addItem (event) {
	var quantity = $(".quantity-input").val();
  	if( !quantity) {
  	  	beep();
  	  	$(".quantity-input").addClass("input-error");
  	  	setTimeout(function() {
  	  		$(".quantity-input").removeClass("input-error");
  	  	}, 2000);
  	  	$(".quantity-input").focus();
  	  	return;
    } 
    var itemDesc = $(".item-input").val() ;
  	if( !itemDesc ) {
  	  	beep();
  	  	$(".item-input").addClass("input-error");
  	  	setTimeout(function() {
  	  		$(".item-input").removeClass("input-error");
  	  	}, 2000);
  	  	$(".item-input").focus();
  	  	return;
    } 
    $(".item-input").removeClass("input-error");
  	$(".quantity-input").removeClass("input-error");

    /*var newitem = newListRow($(".quantity-input").val(), $(".item-input").val());*/
    var newitem = newListRow(quantity, itemDesc, false);
    addItemRowToList(newitem, 200);
    $(".item-input").val("");
    $(".item-input").focus();
    validateAddButton(null);
    saveItems();
}

function onboard() {
	addItemRowToList(newListRow(1, "Milk", false), 300);
	addItemRowToList(newListRow("3", "Asparagus", true), 300);
}

function newListRow (quantity, itemDesc, checked) {
	var newItem = $(".show-list-row-prototype").clone();
	if (checked) {
		newItem.addClass("acquired");
		newItem.find(".checked-screenreaders").text("acquired.");

	}
	var count = $(".shopping-list").children().length + 1;
	newItem.find(".quantity-button").text(quantity);
	newItem.find(".item-button").text(itemDesc);
	newItem.find("#checkoff").attr("id","#checkoff"+count);
	newItem.removeClass("show-list-row-prototype");
	newItem.removeAttr('hidden');
	return newItem;
}	

function addItemRowToList (row, fadedelay) {
	row.hide()
	var whereRowsGo = $(".shopping-list")
	whereRowsGo.append(row);
	row.fadeIn(fadedelay);
}
	
function checkoffEventTriggered (event) {
 	var target = $( event.target );
	checkoffTriggeredOn(target);
}

function checkoffTriggeredOn(target) {
 	var target = $( target );
 	var showListRow = target.parents().filter(".show-list-row"); 	
 	if (showListRow && showListRow.hasClass("acquired")) {
 		showListRow.removeClass("acquired");
 		var screenreaders = showListRow.find(".checked-screenreaders");
 		screenreaders.text("");
 	} else if (showListRow) {
 		showListRow.addClass("acquired");
 		var screenreaders = showListRow.find(".checked-screenreaders");
 		screenreaders.text("acquired.");
 	} 
 	target.blur();
 	saveItems();
}

function checkoffButtonFocused (event) {
 	var target = $( event.target );
	var showListRow = target.parents().filter(".show-list-row");
	showListRow.addClass("show-list-row-hovering");
}

function checkoffButtonBlurred (event) {
 	var target = $( event.target );
	var showListRow = target.parents().filter(".show-list-row");
	showListRow.removeClass("show-list-row-hovering");
}

function storeNotes () {
	if (typeof(Storage) == "undefined") {
    	return;
	}
	
	var notes = $('#notes-text').val();
	if (!notes) {
		localStorage.removeItem("shopful.notes");
	}
    localStorage.setItem("shopful.notes", notes);
}

function loadNotes () {
	if (typeof(Storage) == "undefined") {
    	return;
	}
	var notes = localStorage.getItem("shopful.notes");
	if (notes) {
		$('#notes-text').val(notes);
	}
}

function saveItems () {
	if (!shopfulready) {
		return;
	}
	validateClearButton();
	if (typeof(Storage) == "undefined") {
    	return;
	}
	var itemRows = $(".show-list-row").not(".show-list-holder").not(".show-list-row-prototype");
	if (!itemRows || itemRows.length == 0) {
		localStorage.removeItem("shopful.items");
		return;
	}
	
	var items = [];
	itemRows.each(function(element) {
		var item = $(this);
		var quant = item.find(".quantity-button").text();
		var itemDesc = item.find(".item-button").text();
		var checked = item.hasClass("acquired");
		var itemObj = {quant:quant, item:itemDesc, checked:checked};
		items.push(itemObj);
	})
	localStorage.setItem("shopful.items", JSON.stringify(items));
}

function loadItems () {
	if (typeof(Storage) == "undefined") {
    	return;
	}
	var items = JSON.parse(localStorage.getItem("shopful.items"));
	if (!items || items.length == 0) {
		onboard();
		return;
	}
	items.forEach(function(entitity) {
		var quantity = entitity.quant;
		var desc = entitity.item;
		var checked = entitity.checked;
		var newItem = newListRow(quantity, desc, checked);
		addItemRowToList(newItem, 100);
	})
}

/* Cleanup button actions */
function validateClearButton() {
	var itemRows = $(".show-list-row").not(".show-list-holder").not(".show-list-row-prototype").not("#shopping-list-label");

	if (itemRows.length == 0) {
		$('#cleanup')[0].disabled = true;
		$('#cleanup').addClass("bob");
		return;
	}
	$('#cleanup')[0].disabled = false;
	var nonCheckedRows = itemRows.not(".acquired");
	if (nonCheckedRows.length == itemRows.length) {
		$('#cleanup').text("Hold to clear list");
	} else {
		$('#cleanup').text("Cleanup (hold to clear)");
	}
}

function clearList (fadeTime) {
	if (!fadeTime) {
		fadeTime = 300;
	}
	var listToClean = $(".shopping-list").children().not(".show-list-holder").not("#shopping-list-label");
	listToClean.each(function(index) {
		$( this ).fadeOut(290);
		$( this ).attr('hidden');
	});

	setTimeout(function() {
		listToClean.remove();
		saveItems();
	}, 300);
}

function cleanupList() {
	var listToClean = $(".shopping-list").children(".acquired").not(".show-list-holder").not("#shopping-list-label");
/*	listToClean.each(function(index) {
		$( this ).fadeOut(290);
		$( this ).attr('hidden');
	});
	
	*/
	listToClean.fadeOut(300);
	setTimeout(function() {
		listToClean.remove();
		saveItems();
	}, 300);
}

var longpress = false;
var presstimer = null;
var pressintervaltimer = null;
var pressintervalnumber = null;
var longtarget = null;

function watchForCleanupPresses (element) {
	var node = element;	
	node.on("mousedown touchstart", function(e) {
		if (e.type === "click" && e.button !== 0) {
			return;
		}
		longpress = false;
		longpressCountdownStart();
		this.classList.add("longpress");
	
		presstimer = setTimeout(function() {
			node.removeClass("longpress");
			clearList();
			longpress = false;
			longpressCountdownStop();
		}, 1200);
		return false;
	})
	node.on("mouseout touchend touchleave touchcancel", function(e) {
		if (presstimer !== null) {
			clearTimeout(presstimer);
			presstimer = null;
		}

		this.classList.remove("longpress");
		longpressCountdownStop();
	})
	
	/* Click event */
	node.click(function(e) {
		if (presstimer !== null) {
			clearTimeout(presstimer);
			presstimer = null;
		}
	
		this.classList.remove("longpress");
	
		if (longpress) {
			return false;
		}
		cleanupList();
		longpressCountdownStop();
	})
}

function longpressCountdownStart() {
	pressintervalnumber = 5;
	longpressCountdownStep();
	pressintervaltimer = setInterval(function() {
		longpressCountdownStep();
	}, 250);
}

function longpressCountdownStop() {
	if (pressintervaltimer) {
		clearInterval(pressintervaltimer);
		pressintervaltimer = null;
	}
	$("#cleanup-timer").text("");
	validateClearButton();
}

function longpressCountdownStep() {
	if (presstimer) {
		pressintervalnumber = pressintervalnumber - 1;
		if (pressintervalnumber < -2) {
			longpressCountdownStop();
		} else if (pressintervalnumber < 1) {
			 $("#cleanup").text("Clearing...");
		} else {
			$("#cleanup").text("Clearing in " + pressintervalnumber);
		}	
	} else {
		longpressCountdownStop();
	}
}


/* BEEP */
function beep() {
    var snd = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
    snd.currentTime = 0;
    snd.play();
}