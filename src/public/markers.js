(function ($, video, undefined) {
    //default setting
    var duration,x;
    var defaultSetting = {
        markerStyle: {
            'border-radius': '0%',
        },
        markerTip: {
            display: true,
            text: function (marker) {
                return "Break: " + marker.text;
            },
            time: function (marker) {
                return marker.time;
            }
        },
        breakOverlay: {
            display: false,
            displayTime: 3,
            text: function (marker) {
                return "Break overlay: " + marker.overlayText;
            },
            style: {
                'width': '100%',
                'height': '20%',
                'background-color': 'rgba(0,0,0,0.7)',
                'color': 'white',
                'font-size': '17px'
            }
        },
        onMarkerClick: function (marker) {
        },
        onMarkerReached: function (marker) {
        },
        markers: []
    };

    // create a non-colliding random number
    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    function registerVideoJsMarkersPlugin(options) {
        /**
         * register the markers plugin (dependent on jquery)
         */

        var setting = $.extend(true, {}, defaultSetting, options), //Merge the contents of two or more objects together into the first object ({}).
            markersMap = {},
            markersList = [], // list of markers sorted by time
            videoWrapper = $(this.el()),
            currentMarkerIndex = -1,
            player = this,
            markerTip = null,
            breakOverlay = null,
            overlayIndex = -1;

        function sortMarkersList() {
            // sort the list by time in asc order
            markersList.sort(function (a, b) {
                return setting.markerTip.time(a) - setting.markerTip.time(b);
            });
        }

        function addMarkers(newMarkers) {
            // create the markers
            $.each(newMarkers, function (index, marker) {
                //console.log(index);
                // console.log(marker);
                marker.key = generateUUID();
                //console.log(marker.key);

                videoWrapper.find('.vjs-progress-control').append(
                    createMarkerDiv(marker));

                // store marker in an internal hash map
                markersMap[marker.key] = marker;
                //  console.log(markersMap);  //commented later
                markersList.push(marker);

            });

            sortMarkersList();
        }



        function getPosition(marker) {
            return (setting.markerTip.time(marker) / player.duration()) * 100
        }

        function createMarkerDiv(marker, duration) {
            var markerDiv = $("<div class='vjs-marker'></div>");
            // console.log(marker.length);

            //console.log("Hey"+player.markers.key);
            //var markerLength = (marker.stopTime - marker.time)*1.84414951246;
            var markerLength = (marker.stopTime - marker.time) * x; //Fast
            //var markerLength = (marker.stopTime - marker.time) * 6.68829902492; //Fast
            //var markerLength = (marker.stopTime - marker.time)*3.74098901099;  //RUstom
           // var markerLength = (marker.frame_in - marker.frame_out)*10.0793;  //RamanRaghav
            //console.log("marker length is " + markerLength);

            //var markerLength = (marker.endTime - marker.time)*1.859777898;  //Dhoom
            markerDiv.css(setting.markerStyle)
                .css({
                    "width": markerLength + '%', "margin-left": -parseFloat(markerDiv.css("width")) / 2 + 'px',
                    "left": getPosition(marker) + '%',
                })
                .attr("data-marker-key", marker.key)
                .attr("data-marker-time", setting.markerTip.time(marker));

            console.log(marker.text);
            //console.log("break");

            switch (marker.tagname) {
                case "car":
                    markerDiv.css(setting.markerStyle)
                        .css({"background-color": "#FF0000"});
                    break;
                case "Car":
                    markerDiv.css(setting.markerStyle)
                        .css({"background-color": "#FF0000"});
                    break;
                case "smoking":
                    markerDiv.css(setting.markerStyle)
                        .css({"background-color": "#FF0000"});
                    break;
                case "alcohol":
                    markerDiv.css(setting.markerStyle)
                        .css({"background-color": "#FFFF00"});
                    break;
                default:
                    markerDiv.css(setting.markerStyle)
                        .css({"background-color": "#0000FF"});
            }
            // console.log(setting.markerTip.time(marker));  //commented later

            // add user-defined class to marker
            if (marker.class) {
                markerDiv.addClass(marker.class);
            }

            // bind click event to seek to marker time
            markerDiv.on('click', function (e) {

                var preventDefault = false;
                if (typeof setting.onMarkerClick === "function") {
                    // if return false, prevent default behavior
                    preventDefault = setting.onMarkerClick(marker) == false;
                }

                if (!preventDefault) {
                    var key = $(this).data('marker-key');
                    player.currentTime(setting.markerTip.time(markersMap[key]));
                }
            });

            if (setting.markerTip.display) {
                registerMarkerTipHandler(markerDiv);
            }


            return markerDiv;
        }

        function updateMarkers() {
            // update UI for markers whose time changed

            for (var i = 0; i < markersList.length; i++) {
                var marker = markersList[i];
                var markerDiv = videoWrapper.find(".vjs-marker[data-marker-key='" + marker.key + "']");
                var markerTime = setting.markerTip.time(marker);

                if (markerDiv.data('marker-time') != markerTime) {
                    markerDiv.css({"left": getPosition(marker) + '%'})
                        .attr("data-marker-time", markerTime);
                }
            }
            sortMarkersList();
        }

        function removeMarkers(indexArray) {
            // reset overlay
            if (breakOverlay) {
                overlayIndex = -1;
                breakOverlay.css("visibility", "hidden");
            }
            currentMarkerIndex = -1;

            for (var i = 0; i < indexArray.length; i++) {
                var index = indexArray[i];
                var marker = markersList[index];
                if (marker) {
                    // delete from memory
                    delete markersMap[marker.key];
                    markersList[index] = null;

                    // delete from dom
                    videoWrapper.find(".vjs-marker[data-marker-key='" + marker.key + "']").remove();
                }
            }

            // clean up array
            for (var i = markersList.length - 1; i >= 0; i--) {
                if (markersList[i] === null) {
                    markersList.splice(i, 1);
                }
            }

            // sort again
            sortMarkersList();
        }


        // attach hover event handler
        function registerMarkerTipHandler(markerDiv) {

            markerDiv.on('mouseover', function () {
                var marker = markersMap[$(this).data('marker-key')];

                markerTip.find('.vjs-tip-inner').text(setting.markerTip.text(marker));

                // margin-left needs to minus the padding length to align correctly with the marker
                markerTip.css({
                    "left": getPosition(marker) + '%',
                    "margin-left": -parseFloat(markerTip.css("width")) / 2 - 5 + 'px',
                    "visibility": "visible"
                });

            }).on('mouseout', function () {
                markerTip.css("visibility", "hidden");
            });
        }

        function initializeMarkerTip() {
            markerTip = $("<div class='vjs-tip'><div class='vjs-tip-arrow'></div><div class='vjs-tip-inner'></div></div>");
            videoWrapper.find('.vjs-progress-control').append(markerTip);
        }

        // show or hide break overlays
        function updateBreakOverlay() {
            if (!setting.breakOverlay.display || currentMarkerIndex < 0) {
                return;
            }

            var currentTime = player.currentTime();
            var marker = markersList[currentMarkerIndex];
            var markerTime = setting.markerTip.time(marker);

            if (currentTime >= markerTime &&
                currentTime <= (markerTime + setting.breakOverlay.displayTime)) {
                if (overlayIndex != currentMarkerIndex) {
                    overlayIndex = currentMarkerIndex;
                    breakOverlay.find('.vjs-break-overlay-text').html(setting.breakOverlay.text(marker));
                }

                breakOverlay.css('visibility', "visible");

            } else {
                overlayIndex = -1;
                breakOverlay.css("visibility", "hidden");
            }
        }

        // problem when the next marker is within the overlay display time from the previous marker
        function initializeOverlay() {
            breakOverlay = $("<div class='vjs-break-overlay'><div class='vjs-break-overlay-text'></div></div>")
                .css(setting.breakOverlay.style);
            videoWrapper.append(breakOverlay);
            overlayIndex = -1;
        }

        function onTimeUpdate() {
            onUpdateMarker();
            updateBreakOverlay();
        }

        function onUpdateMarker() {
            /*
             check marker reached in between markers
             the logic here is that it triggers a new marker reached event only if the player
             enters a new marker range (e.g. from marker 1 to marker 2). Thus, if player is on marker 1 and user clicked on marker 1 again, no new reached event is triggered)
             */

            var getNextMarkerTime = function (index) {
                if (index < markersList.length - 1) {
                    return setting.markerTip.time(markersList[index + 1]);
                }
                // next marker time of last marker would be end of video time
                return player.duration();
            }
            var currentTime = player.currentTime();
            var newMarkerIndex;

            if (currentMarkerIndex != -1) {
                // check if staying at same marker
                var nextMarkerTime = getNextMarkerTime(currentMarkerIndex);
                if (currentTime >= setting.markerTip.time(markersList[currentMarkerIndex]) &&
                    currentTime < nextMarkerTime) {
                    return;
                }

                // check for ending (at the end current time equals player duration)
                if (currentMarkerIndex === markersList.length - 1 &&
                    currentTime === player.duration()) {
                    return;
                }
            }

            // check first marker, no marker is selected
            if (markersList.length > 0 &&
                currentTime < setting.markerTip.time(markersList[0])) {
                newMarkerIndex = -1;
            } else {
                // look for new index
                for (var i = 0; i < markersList.length; i++) {
                    nextMarkerTime = getNextMarkerTime(i);

                    if (currentTime >= setting.markerTip.time(markersList[i]) &&
                        currentTime < nextMarkerTime) {
                        newMarkerIndex = i;
                        break;
                    }
                }
            }

            // set new marker index
            if (newMarkerIndex != currentMarkerIndex) {
                // trigger event
                if (newMarkerIndex != -1 && options.onMarkerReached) {
                    options.onMarkerReached(markersList[newMarkerIndex]);
                }
                currentMarkerIndex = newMarkerIndex;
            }

        }

        // setup the whole thing
        function initialize() {
            if (setting.markerTip.display) {
                initializeMarkerTip();
            }

            // remove existing markers if already initialized
            //player.markers.removeAll();
            addMarkers(options.markers);

            if (setting.breakOverlay.display) {
                initializeOverlay();
            }
            onTimeUpdate();
            player.on("timeupdate", onTimeUpdate);
        }

        // setup the plugin after we loaded video's meta data
        player.on("loadedmetadata", function () {
            initialize();
        });

        //exposed plugin API
        player.markers = {
            getMarkers: function () {
                return markersList;
            },

            getSpecificMarkers: function (i) {
                return markersList[i];
            },
            next: function () {
                // go to the next marker from current timestamp
                var currentTime = player.currentTime();
                for (var i = 0; i < markersList.length; i++) {
                    var markerTime = setting.markerTip.time(markersList[i]);
                    if (markerTime > currentTime) {
                        player.currentTime(markerTime);
                        break;
                    }
                }
            },

            jumpToSpecificMarker: function (i) {
                var markerTime = setting.markerTip.time(markersList[i]);
                // add a threshold
                player.currentTime(markerTime);
            },

            prev: function () {
                // go to previous marker
                var currentTime = player.currentTime();
                for (var i = markersList.length - 1; i >= 0; i--) {
                    var markerTime = setting.markerTip.time(markersList[i]);
                    // add a threshold
                    if (markerTime + 0.5 < currentTime) {
                        player.currentTime(markerTime);
                        break;
                    }
                }
            },
            add: function (newMarkers) {
                // add new markers given an array of index
                addMarkers(newMarkers);
            },
            remove: function (indexArray) {
                // remove markers given an array of index
                removeMarkers(indexArray);
            },
            removeAll: function () {
                var indexArray = [];
                for (var i = 0; i < markersList.length; i++) {
                    indexArray.push(i);
                }
                removeMarkers(indexArray);
            },
            updateTime: function () {
                // notify the plugin to update the UI for changes in marker times
                updateMarkers();
            },
            reset: function (newMarkers) {
                // remove all the existing markers and add new ones
                player.markers.removeAll();
                addMarkers(newMarkers);
            },
            destroy: function () {
                // unregister the plugins and clean up even handlers
                player.markers.removeAll();
                breakOverlay.remove();
                markerTip.remove();
                player.off("timeupdate", updateBreakOverlay);
                delete player.markers;
            },
            getVideoDuration: function(i) {
            duration = i;
           // x = 777.203/duration;
                x = 100/duration;
            console.log("time is this" + x)
        }
        };
    }

    videojs.plugin('markers', registerVideoJsMarkersPlugin);


})(jQuery, window.videojs);