#!/usr/bin/env python
"""Helpful tools to process WAV files."""

import wave
import numpy

class WaveReader(object):
    """Reads and processes WAV files."""

    def __init__(self, filepath):
        self.filepath = filepath

    def getframerate(self):
        """Returns framerate of WAVE file."""
        wav = wave.open(self.filepath, 'r')
        framerate = wav.getframerate()
        wav.close()
        return framerate

    def readframes(self, nframes=-1):
        """Read nframes (default -1 => all) frames from WAV file."""
        wav = wave.open(self.filepath, 'r')
        frames = numpy.fromstring(wav.readframes(nframes), 'Int16')
        wav.close()
        f = open('data', 'a')
        l = list(frames[::10])
        L = []
        for i in xrange(len(l)):
            L.append([i, l[i]])
        f.write(str(L))
        return frames
