var stream = require('stream');
var wav = require('wav');
var fs = require('fs');
var br = require('buffer-reader');
var path = require('path');

var printer = new stream.Transform();
var source = fs.createReadStream('data.wav');
var reader = new wav.Reader();

var blockAlign;
var endianness;
var signedness;

var values = [];

printer._transform = function(chunk, encoding, done) {
    var waver = new br(chunk);
    var i;
    this.length |= 0;
    var fnName = 'nextInt' + (blockAlign * 16) + endianness;
    this.fnName = fnName;
    var fn = waver[fnName].bind(waver);
    this.fname |= fnName;

    while (true) {
        try {
            i = fn();
            this.length++;
            if (! (this.length % 1000)) {
                values.push(i);
            }
        }
        catch (e) {
            //console.log('break');
            break;
        }
    }
    done();
}

var frames = [];

printer._flush = function(done) {

    var vlen = values.length;

    for (var i = 0; i < vlen; ++i) {
        frames.push([i, values[i]/1000]);
    }
    //console.log(frames);
    //console.log(audioState);
    audioState++;

    if (audioState == 2) {
        init();
    }
}

printer.on('end', function() {
});

reader.on('format', function(format) {
    (blockAlign = format.blockAlign);
    (endianness = format.endianness);
    (signedness = format.signed);
    //console.log(format);
});

reader.on('readable', function() {
    reader.pipe(printer);
});

source.pipe(reader);
