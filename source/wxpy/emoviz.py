#!/usr/bin/env python
"""Starting point module for the EmoViz application."""

import wx

from wavereader import WaveReader
from plotter import Plotter

class EmoViz(object):
    """Starting point for EmoViz application."""
    def __init__(self):
        app = wx.PySimpleApp()
        frame = wx.Frame(None, title="Hello, world.", size=(800, 500))
        wavereader = WaveReader('data.wav')
        plotter = Plotter(frame, wavereader.readframes())

        plotter.draw()
        frame.Show()
        app.MainLoop()

if __name__ == "__main__":
    EmoViz()
