// The goods... Mocked AJAX responses provided by the Mockjax jQuery plugin (http://enterprisejquery.com/2010/07/mock-your-ajax-requests-with-mockjax-for-rapid-development/)
// author: arch || pulsegrenade@gmail.com

// Mocked AJAX call (using a wildcard. Anything that start with the url 'data/' will trigger this mock)
$.mockjax({
	url: 'server*',
	responseTime: 1700,
	contentType: 'text/json',
	responseText: {
		status: 'success',
		message: 'Do you like turtles?'
  }
});

// Mocked fail call (change the data-id attribute on the li's to start with "error" to see this in action)
$.mockjax({
	url: 'error*',
	 responseTime: 2000,
	status: 500,
	contentType: 'text/json'
});

function startServerCluster(maxRestarts, cluster) {

	// set up some global vars. Need to know the maximum number of simulaneous restarts allowed, etc
	var totalRestartsAllowed = maxRestarts
		, section = cluster
		, servers = $('.ready',cluster)
		, totalServersInCluster = $('.ready',cluster).length
		, totalServersToStart = totalRestartsAllowed
		, serverIndex = 0;
	
	// adjust the totalServersToStart if there are less in the cluster than the max allowed
	if (totalServersInCluster < totalServersToStart) {
		totalServersToStart = totalServersInCluster;
	} 

	// disable all checkboxes so the user can't interupt the application
	$('section input').attr('disabled','disabled')

	// handle some edge cases (not all sections may have checked servers in them)
	if (totalServersToStart == 0) {
		
		// if nothing is selected, tell the user to select something and try again
		if ($('section input:checked').length == 0) {
			displayMessage('error','Please select at least one server to restart.');
		} else if (section.hasClass('cluster-a')) {
			section.addClass('complete');
			startServerCluster($('.controls select').val(),$('.cluster-b'));
		} else if (section.hasClass('cluster-b')) {
			section.addClass('complete');
			startServerCluster($('.controls select').val(),$('.cluster-c'));
		} else {
			// you must be done. display success message
			section.addClass('complete');
			displayMessage('success','All servers successfully re-started.');
		}
	} else {
		servers.each(function(i) {
			var element = $(this);

			// only make an AJAX request if we're under the total allowed restarts
			if ((i+1) <=  totalRestartsAllowed) {

				// add a spinner to each server that we start
				element.addClass('loading');

				$.ajax({
					type: "POST",
					dataType: "json",
					url: element.attr('data-id'),
				}).success(function(data) {
					// incriment the serverIndex
					serverIndex++;

					// remove the loading class and set the class to 'success'
					element.attr('class','success');
				}).error(function(data) {
					// incriment the serverIndex
					serverIndex++;

					// remove the loading class and set the class to 'error'
					element.attr('class','error');
				}).complete(function(data,status) {

					// check if we've reached totalServersToStart. If we have... check if there are more to start.
					if (serverIndex == totalServersToStart) {
						// run complete. Check if we need to start more servers
						if ((totalServersInCluster - totalServersToStart) != 0) {
							startServerCluster($('.controls select').val(),section);
						} else {
							// we're done. check if we have an error and move to the next one
							if ($('.error', section).length > 0) {
								section.addClass('error');
							} else {
								section.addClass('complete');
							}

							// check which section we just finished, and move to the next one
							if (section.hasClass('cluster-a')) {
								// go to cluster-b
								startServerCluster($('.controls select').val(),$('.cluster-b'));
							} else if (section.hasClass('cluster-b')) {
								// go to cluster-c
								startServerCluster($('.controls select').val(),$('.cluster-c'));
							} else {
								// done. create a new function for showing a success message or a fail message if errors were detected
								if ($('li.error').length > 0) {
									displayMessage('error','Some servers failed to re-start.');
								} else {
									displayMessage('success','All servers successfully re-started.');
								}
							}
						}
					}
				});
			}
		});
	}
}

// funtion that we'll use to display error messages
function displayMessage(messageType,messageString) {
	var errorDiv = $('.message');

	if (messageType == 'success') {
		errorDiv.removeClass('error');
		errorDiv.addClass('success');
	} else {
		errorDiv.removeClass('success');
		errorDiv.addClass('error');
	}

	$('span',errorDiv).html(messageString);
	errorDiv.fadeIn();
}

function prepDom(element) {
	// here we will add a class to each row when a checkbox is checked so we can track a 'ready' state when restarting servers
	if (element.is(':checked')) {
		element.parent().parent().attr('class','ready');
	} else {
		element.parent().parent().attr('class','');
	}
}

$(document).ready(function() {
	// unselect all checkboxes on page load (IE remembers form inputs. This will always ensure we have a fresh start)
	$('section input:checkbox').removeAttr('checked');
	$('section input:checkbox').removeAttr('disabled');

	// set up the checkboxes to prep them for the AJAX calls.
	$('section input:checkbox').click(function(e) {
		prepDom($(this));
	});

	// start the application when clicking on the "Restart" button
	$('footer .controls a').click(function(e) {
		e.preventDefault();
		startServerCluster($('.controls select').val(),$('.cluster-a'));
	});

});
