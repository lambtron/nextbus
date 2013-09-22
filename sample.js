/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

var page = require('webpage').create(), testindex = 0, loadInProgress = false;

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.onLoadStarted = function() {
    loadInProgress = true;
    console.log('load started');
};

page.onLoadFinished = function() {
    loadInProgress = false;
    console.log('load finished');
};

var steps = [
    // function() {
    //     // Load login page.
    //     page.open('http://matrix.itasoftware.com/', function(status) {
    //         page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js', function() {
    //             // Check for page load success.
    //             if (status !== 'success') {
    //                 console.log('Unable to access network.');
    //             } else {
    //                 // Wait for submit button to appear.
    //                 waitFor(function() {
    //                     return page.evaluate(function() {
    //                         return $('button#advanced_searchSubmitButton').is(':visible');
    //                     });
    //                 }, function() {
    //                     // Fully loaded.
    //                     console.log('Everything is visible now.');
    //                 });
    //             }
    //         });
    //     });
    // },
    function() {
        // Enter flight search fields.
        page.evaluate(function() {
            // var form = document.getElementById('advancedSearchForm');
            document.getElementById('advanced_from2').value = 'SFO';
            document.getElementById('advanced_to2').value = 'JFK';
            document.getElementById('widget_ita_form_date_DateTextBox_1').value = '8/3/2013';
        });
    },
    function() {
        // Submit form.
        page.evaluate(function() {
            var form = document.getElementById('advancedSearchForm');
            form.submit();
        });
    },
    function() {
        // Output content of page to stdout after form has been submitted.
        page.evaluate(function() {
            console.log(document.querySelectorAll('html')[0].outerHTML);
        });
    }
];


// interval = setInterval(function() {
//     if (!loadInProgress && typeof steps[testindex] == 'function') {
//         console.log('step ' + (testindex + 1));
//         steps[testindex]();
//         testindex++;
//     }
//     if (typeof steps[testindex] != 'function') {
//         console.log('test complete!');
//         phantom.exit();
//     }
// }, 50);


page.open('http://matrix.itasoftware.com/', function(status) {
	page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js', function() {
		// Check for page load success.
		if (status !== 'success') {
			console.log('Unable to access network.');
		} else {
			// Wait for submit button to appear.
			waitFor(function() {
				return page.evaluate(function() {
					// return $('button#advanced_searchSubmitButton').is(':visible');
                    return $('#advancedSearchForm').is(':visible');
                    // return $('form#advancedSearchForm').is(':visible') && $('#widget_advanced_to2').is(':visible') && $('#widget_advanced_from2').is(':visible') && $('widget_ita_form_date_DateTextBox_3').is(':visible');
				});
			}, function() {
				// Fully loaded.
                console.log('Everything is visible now.');

                // Run series of step functions.
                interval = setInterval(function() {
                    console.log('.');
                    if (!loadInProgress && typeof steps[testindex] == 'function') {
                        console.log('step ' + (testindex + 1));
                        steps[testindex]();
                        testindex++;
                    }
                    if (typeof steps[testindex] != 'function') {
                        console.log('test complete!');
                        phantom.exit();
                    }
                }, 50);
			});
		}
	});
});