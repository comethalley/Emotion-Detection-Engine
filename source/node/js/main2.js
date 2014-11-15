plot = null;
function prepareFrames(frames) {
	var i = 5;
	var ret = frames.splice(0.2 * (frames.length - 200), 200, null);
	console.log(frames, ret);
	return [frames, ret];
}

$(document).ready(function () {
	var length = null;
	$('#audio').on('loadedmetadata', function() {
		length = this.seekable.end(0);
	});

	var d2 = [];
	//var preparedFrames = prepareFrames(frames);
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
			ticks: 0,
			min: 0,
			max: 11000
		},
		colors: ['#057cb8', 'orange', 'red', 'green'],
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
        lines: {
            lineWidth: 1
        },selection: {
			mode: "x",
			color: '#057cb8'
		},
		colors: ['#057cb8', 'orange', 'red', 'green']
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

	i = 0;

	function replot(elapsedFraction) {
		data[1] = [[elapsedFraction * (xmax - xmin), ymin], [elapsedFraction * (xmax - xmin), ymax]];
		data[0] = frames.slice(0, elapsedFraction * frames.length);
		//data[1] = frames.slice(0, elapsedFraction * frames.length);
		++i;
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
             xaxis: { min: xmin, max    : xmax },
             pan: {interactive: false}
        }));
    });
});
