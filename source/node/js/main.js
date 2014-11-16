var secondsPerWindow = 20;

function init() {
	var length = null;
	printer = null;

	$('#audio').on('loadedmetadata', function() {
		length = this.seekable.end(0);
	});

	var d2 = [];
	var data = [frames, d2];

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

	plot = $.plot("#placeholder", data, mainPlotOptions);
	overview = $.plot('#overview', data, overviewPlotOptions);

    var mainPlaceholder = $('#placeholder');
	var overviewPlaceholder = $('#overview');

    overviewPlaceholder.on('plotselected', function(e, ranges) {
        plot = $.plot('#placeholder', data,
            $.extend(true, {}, mainPlotOptions, {
             xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
        }));
    });

    mainPlaceholder.on('plotpan', function(e, plot, args) {
        var axes = plot.getAxes();
        var ranges = {
            xaxis: {
                from: axes.xaxis.min,
                to: axes.xaxis.max
            }
        }
        overview.setSelection(ranges, true)
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
        overview.setData(data);
        plot.getData()[1].lines.lineWidth = 3

		plot.setupGrid();
        overview.setupGrid();
        overview.draw();
		plot.draw();
	}

	replot(0);
	var prevTime = 0;

	window.setInterval(function () {
		var audio = $('#audio').get(0);
		var currentTime = audio.currentTime;
		if (currentTime != prevTime) {
			replot(currentTime/audio.seekable.end(0));
			prevTime = currentTime;
		}
	}, 100);

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

    $('#placeholder').on('dblclick', function() {
        var xaxis = plot.getAxes().xaxis;
		var xmin = xaxis.datamin;
		var xmax = xaxis.datamax;
		plot = $.plot('#placeholder', data,
            $.extend(true, {}, mainPlotOptions, {
             xaxis: { min: xmin, max: xmax }
        }));
        overview = $.plot('#overview', data,
            $.extend(true, {}, overviewPlotOptions, {
             xaxis: { min: xmin, max: xmax }
        }));
    });
}

$(document).ready(function() {
	audioState++;
	if (audioState == 2) {
		init();
	}
});
