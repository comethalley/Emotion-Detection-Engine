#!/usr/bin/env python
"""This module extends wxPython's Panel to implement a
plotting interface."""

import wx
import matplotlib
import numpy
matplotlib.use('WxAgg')

from matplotlib.backends.backend_wxagg import FigureCanvasWxAgg as FigureCanvas
from matplotlib.figure import Figure
from matplotlib.widgets import SpanSelector

class Plotter(wx.Panel):
    """Accepts data and plots it using wx.Panel and matplotlib's plotting interface.
    
    Keyword arguments:
    data (iterable) -- data to be plotted, passed to matplotlib
    zoomfactor (float) -- zooming factor for both zoomout and zoomin (default 1.25)
    """
    def __init__(self, parent, data=None, zoomfactor=1.25):

        self.data = data
        self.zoomfactor = zoomfactor
        self.scale = 1

        wx.Panel.__init__(self, parent)

        self.figure = Figure()
        self.axes = self.figure.add_subplot(111,
                axisbg='#ffffff')

        self.axes.set_yticklabels([])
        self.axes.set_xticklabels([])
        max_amp = max(numpy.amax(data), -numpy.amin(data))
        self.axes.set_ylim(-max_amp, max_amp)
        self.axes.set_xlim(0, len(data))

        self.canvas = FigureCanvas(self, -1, self.figure)

        self.canvas.Bind(wx.EVT_KEY_DOWN, self.OnKeyDown)
        self.canvas.Bind(wx.EVT_MOUSEWHEEL, self.MouseWheel)
        self.SetFocus()

        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.sizer.Add(self.canvas, 1, wx.LEFT | wx.TOP | wx.GROW)
        self.SetSizer(self.sizer)

    def draw(self, data=None):
        """Draws self.data or passed data."""
        if data is None:
            data = self.data
        self.axes.plot(data, color='#1498DB', linewidth=0.3)

    def zoom(self, factor):
        """Private function, use zoomin and zoomout instead."""
        self.scale *= factor
        x_min, x_max = self.axes.get_xlim()
        self.axes.set_xlim(x_min/factor, x_max/factor)
        self.canvas.draw()

    def zoomin(self, factor=None):
        """Zooms in plot with factor (default self.zoomfactor)"""
        if not factor:
            factor = self.zoomfactor
        self.zoom(self.zoomfactor)

    def zoomout(self, factor=None):
        """Zooms in plot with factor (default self.zoomfactor)"""
        if not factor:
            factor = self.zoomfactor
        self.zoom(1.0/self.zoomfactor)

    def span(self, direction):
        """spans 1/10th of the way left or right, based on direction parameter

        Keyword arguments:
        direction (str) -- must be equal to 'left' or 'right'
        """
        if direction == 'right':
            multiplier = 1
        elif direction == 'left':
            multiplier = -1
        x_min, x_max = self.axes.get_xlim()
        range = x_max - x_min
        step = multiplier * (range/10)
        self.axes.set_xlim(x_min + step, x_max + step)
        self.canvas.draw()

    def OnKeyDown(self, event=None):
        """Event handler for key down events."""
        keycode = event.GetKeyCode()
        if keycode == 73:
            self.zoomin()
        elif keycode == 79:
            self.zoomout()
        elif keycode == wx.WXK_LEFT:
            print 'left'
            self.span('left')
        elif keycode == wx.WXK_RIGHT:
            print 'right'
            self.span('right')
        else:
            event.Skip()

    def MouseWheel(self, event=None):
        """Event handler for mouse wheel events."""
        rotation = event.GetWheelRotation()
        if rotation > 0:
            self.zoomin()
        else:
            self.zoomout()

