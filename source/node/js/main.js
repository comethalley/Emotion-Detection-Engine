$(document).ready(function() {
    audioState++;
    if (audioState == 2) {
        init();
    }
});

function init(config) {

    //configuration options for main plot and overview
    var secondsPerWindow = 20;
    var baseOptions = {
        series: {
            lines: {
                show: true,
                lineWidth: 1
            }
        },
        yaxis: {
            autoscaleMargin: 0.01,
            ticks: 0,
            panRange: false
        },
        xaxis: {
            ticks: 0
        },
        colors: ['#057cb8', 'orange', 'red', 'green'],
        grid: {
            hoverable: true,
            autoHighlight: false
        }
    };

    var mainPlotOptions = $.extend(true, {}, baseOptions, {
        xaxis: {
            min: 0,
            max: 10 * secondsPerWindow
        },
        pan: {
            interactive: true
        }
    });

    var overviewPlotOptions = $.extend(true, {}, baseOptions, {
        selection: {
            mode: "x",
            color: '#057cb8'
        }
    });

    //state and data variables
    var streamed = false;
    var data = [frames, []];
    var audio = document.getElementById('audio');

    //jQuery elements for containers
    var plotContainer = $('#placeholder');
    var overviewContainer = $('#overview');

    //Flot objects for plots
    var plot = $.plot(plotContainer, data, mainPlotOptions);
    var overview = $.plot(overviewContainer, data, overviewPlotOptions);

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
        plot = $.plot(plotContainer, data,
            $.extend(true, {}, mainPlotOptions, {
             xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
        }));
    });

    plotContainer.on('plotpan', function(e, plot, args) {
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

        data[0] = frames.slice(0, elapsedFraction * frames.length);

        data[1] = [[(xmax - xmin), ymin], [(xmax - xmin), ymax]];

        plot.setData(data);
        plot.getData()[1].lines.lineWidth = 3
        overview.setData(data);

        plot.setupGrid();
        plot.draw();
        overview.setupGrid();
        overview.draw();
    }

    replot(0);
}
