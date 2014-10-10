#!/usr/bin/env python
"""Starting point module for the EmoViz application."""

import wx

from wavereader import WaveReader
from plotter import Plotter

class EmoViz(object):
    """Starting point for EmoViz application."""
    def __init__(self):
        app = wx.PySimpleApp()
        fr = wx.Frame(None, title="Hello, world.", size=(800, 500))
        wr = WaveReader('data.wav')
        plotter = Plotter(fr, wr.readframes())

        plotter.draw()
        fr.Show()
        app.MainLoop()

if __name == "__main__":
    EmoViz()
