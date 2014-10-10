#!/usr/bin/env python
"""Helpful tools to process WAV files."""

import wave
import numpy

class WaveReader(object):
    """Reads and processes WAV files."""

    def __init__(self, filepath):
        self.filepath = filepath

    def readframes(self, nframes=-1):
        """Read nframes (default -1 => all) frames from WAV file."""
        wav = wav.open(self.filepath, 'r')
        frames = numpy.fromstring(wav.readframes(nframes), 'Int16')
        wav.close()
        return frames
