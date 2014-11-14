plot = null;
$(document).ready(function () {
	var length = null;
	$('#audio').on('loadedmetadata', function() {
		length = this.seekable.end(0);
	});

	var d2 = [];

	var data = [frames, d2];

	var options = {
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
		colors: ['#057cb8', 'orange'],
        grid: {
            hoverable: true,
            autoHighlight: false
        },
        pan: {
            interactive: true
        }
	};

	plot = $.plot("#placeholder", data, options);

    var overview = $.plot('#overview', data, {
        xaxis: {
            ticks: 0
        },
        yaxis: {
            ticks: 0
        },
        colors: ['#057cb8', 'orange'],
        lines: {
            lineWidth: 1
        },selection: {
			mode: "x",
			color: '#057cb8'
		}
        });

    var placeholder = $('#placeholder');
    $('#overview').on('plotselected', function(e, ranges) {
        plot = $.plot('#placeholder', data,
            $.extend(true, {}, options, {
             xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
        }));
    });

    //.on('plothover', function(e, pos) {
    placeholder.on('plotpan', function(e, plot, args) {
        var axes = plot.getAxes();
        var ranges = {
            xaxis: {
                from: axes.xaxis.min,
                to: axes.xaxis.max
            }
        }
        overview.setSelection(ranges, true)
    });


	var axes = plot.getAxes();
	var xmin = axes.xaxis.datamin;
	var xmax = axes.xaxis.datamax;
	var ymin = axes.yaxis.datamin;
	var ymax = axes.yaxis.datamax;

	function replot(elapsedFraction) {
		data[1] = [[elapsedFraction * (xmax - xmin), ymin], [elapsedFraction * (xmax - xmin), ymax]];
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
		var currentTime = $('#audio').get(0).currentTime;
		if (currentTime != prevTime) {
			replot(currentTime/length);
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
        $('#audio').data('playpart', true)
        var audio = $('#audio').get(0);
        audio.pause();
        var end = audio.seekable.end(0);
        audio.currentTime = fraction * end;
        audio.play();
    });

    $('#placeholder').on('dblclick', function() {
        plot = $.plot('#placeholder', data,
            $.extend(true, {}, options, {
             xaxis: { min: xmin, max: xmax }
        }));
        overview = $.plot('#overview', data,
            $.extend(true, {}, options, {
             xaxis: { min: xmin, max: xmax }
        }));
    });
});
