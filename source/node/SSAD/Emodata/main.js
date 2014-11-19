$(document).ready(function() {
    audioState++;
    if (audioState == 2) {
        init();
    }
});

function prepareFrames(frames, sections) {
    var b = [];
    for (var i = 0; i < sections.length; ++i) {
        var start = sections[i][0];
        var end = sections[i][1];
        var last = frames[end];
        b = b.concat(frames.splice(start, end - start, frames[start], null).concat([last, null]));
    }
    console.log(frames.length, frames, "\n", b.length, b);
    return [frames, b];
}

function init(config) {

    //prepare dummy data
    var sections = [[20, 30], [60, 70]];
    frames = prepareFrames(frames, sections);

    //configuration options for main plot and overview
    var secondsPerWindow = 5;
    var framesPerSecond = 10;
    var baseOptions = {
        series: {
            lines: {
                show: true,
                lineWidth: 2
            }
        },
        yaxis: {
            autoscaleMargin: 0.4,
            ticks: 0,
            panRange: false
        },
        xaxis: {
            ticks: 0
        },
        colors: ['#057cb8', 'red', 'orange', 'green'],
        grid: {
            hoverable: true,
            autoHighlight: false
        }
    };

    var mainPlotOptions = $.extend(true, {}, baseOptions, {
        xaxis: {
            min: 0,
            max: framesPerSecond * secondsPerWindow
        }
    });

    var mainPlotOptionsAfterStreaming = $.extend(true, {}, mainPlotOptions, {
        xaxis: {
            max: null
        },
        pan: {
            interactive: true
        }
    });

    var overviewPlotOptions = baseOptions;

    var overviewPlotOptionsAfterStreaming = $.extend(true, {}, overviewPlotOptions, {
        selection: {
            mode: "x",
            color: '#057cb8'
        }
    });

    //state and data variables
    var streamed = false;
    var data = [frames[0], frames[1], []];
    var audio = document.getElementById('audio');

    //jQuery elements for containers
    var plotContainer = $('#placeholder');
    var overviewContainer = $('#overview');

    //Flot objects for plots
    var plot = $.plot(plotContainer, [], mainPlotOptions);
    var overview = $.plot(overviewContainer, [], overviewPlotOptions);

    //main timed loop for replotting
    var prevTime = 0;
    window.setInterval(function () {
        var currentTime = audio.currentTime;
        if (currentTime != prevTime) {
            //pass elapsed fraction of audio play to replot()
            replot(currentTime/audio.seekable.end(0));
            prevTime = currentTime;
        }
    }, 100);

    //event handlers on plot containers
    overviewContainer.on('plotselected', function(e, ranges) {
        if (!streamed) {
            return;
        }
        plot = $.plot(plotContainer, data,
            $.extend(true, {}, mainPlotOptions, {
             xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
        }));
    });

    plotContainer.on('plotpan', function(e, plot, args) {
        if (!streamed) {
            return;
        }
        var axes = plot.getAxes();
        var ranges = {
            xaxis: {
                from: axes.xaxis.min,
                to: axes.xaxis.max
            }
        }
        overview.setSelection(ranges, true);
    });

    plotContainer.on('dblclick', function() {
        if (!streamed) {
            return;
        }
        var xaxis = plot.getAxes().xaxis;
        var xmin = xaxis.datamin;
        var xmax = xaxis.datamax;
        plot = $.plot(plotContainer, data,
            $.extend(true, {}, mainPlotOptions, {
             xaxis: { min: xmin, max: xmax }
        }));
        overview = $.plot(overviewContainer, data,
            $.extend(true, {}, overviewPlotOptions, {
             xaxis: { min: xmin, max: xmax }
        }));
    });

    //play selection part button event handler
    $('#playpart').on('click', function() {
        if (!streamed) {
            return;
        }
        $('#audio').on('timeupdate', function(e) {
            var startFraction = (axes.xaxis.max - axes.xaxis.datamin)/(axes.xaxis.datamax - axes.xaxis.datamin);
            if ((this.currentTime/this.seekable.end(0)) > startFraction) {
                this.pause();
                $('#audio').off('timeupdate');
            }
        });
        var axes = plot.getAxes();
        var fraction = (axes.xaxis.min - axes.xaxis.datamin)/(axes.xaxis.datamax - axes.xaxis.datamin);
        $('#audio').data('playpart', true);
        var audio = $('#audio').get(0);
        audio.pause();
        var end = audio.seekable.end(0);
        audio.currentTime = fraction * end;
        audio.play();
    });

    function replot(elapsedFraction) {
        var axes = plot.getAxes();
        var xmin = axes.xaxis.datamin;
        var xmax = axes.xaxis.datamax;
        var ymin = axes.yaxis.datamin;
        var ymax = axes.yaxis.datamax;

        if (elapsedFraction == 1 && !streamed) {
            streamed = true;
            if (xmax > framesPerSecond * secondsPerWindow) {
                var xaxis = mainPlotOptions.xaxis;
                xaxis.max = xmax;
                xaxis.min = xmax - (framesPerSecond * secondsPerWindow);
            }
            plot = $.plot(plotContainer, data, $.extend(true, {}, mainPlotOptionsAfterStreaming, {
                xaxis: {
                    //max: null
                }
            }));
            overview = $.plot(overviewContainer, data, overviewPlotOptionsAfterStreaming);
        }

        else if (!streamed) {
            var lastFrame = elapsedFraction * (frames[0].length + frames[1].length);
            var lastAIndex = 0;
            var lastBIndex = 0;
            for (var i = 0; i < frames[0].length; ++i) {
                if (frames[0][i] == null) {
                    continue;
                }
                if (frames[0][i][0] <= lastFrame) {
                    lastAIndex = i;
                }
            }
            for (var i = 0; i < frames[1].length; ++i) {
                if (frames[1][i] == null) {
                    continue;
                }
                if (frames[1][i][0] <= lastFrame) {
                    lastBIndex = i;
                }
            }
            data[0] = frames[0].slice(0, lastAIndex + 1);
            data[1] = frames[1].slice(0, lastBIndex + 1);
            if (xmax > framesPerSecond * secondsPerWindow) {
                var xaxis = mainPlotOptions.xaxis;
                xaxis.max = xmax;
                xaxis.min = xmax - (framesPerSecond * secondsPerWindow);
            }
            plot = $.plot(plotContainer, data, mainPlotOptions);
            overview = $.plot(overviewContainer, data, overviewPlotOptions);
        }

        else if (streamed) {
            data[2] = [[elapsedFraction * (xmax - xmin), ymin], [elapsedFraction * (xmax - xmin), ymax]];
            data[0] = frames[0];
            data[1] = frames[1];
            plot = $.plot(plotContainer, data, mainPlotOptionsAfterStreaming);
            overview = $.plot(overviewContainer, data, overviewPlotOptionsAfterStreaming);
        }
    }

    replot(0);
}
