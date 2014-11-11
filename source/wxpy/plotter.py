#!/usr/bin/env python
"""This module extends wxPython's Panel to implement a
plotting interface."""

import wx
import matplotlib
import numpy
matplotlib.use('WxAgg')
import random
from matplotlib.backends.backend_wxagg import FigureCanvasWxAgg as FigureCanvas
from matplotlib.figure import Figure

# pylint: disable=R0904
class Plotter(wx.Panel):
    """Accepts data and plots it using wx.Panel and matplotlib.

    Keyword arguments:
    data (iterable) -- data to be plotted, passed to matplotlib
    zoomfactor (float) -- zooming factor for plot (default 1.25)
    """
    def __init__(self, parent, data=None, zoomfactor=1.25):

        self.data = data
        self.zoomfactor = zoomfactor
        self.scale = 1
        self.prev_mouse_location = None
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

        self.canvas.Bind(wx.EVT_KEY_DOWN, self._on_key_down)
        self.canvas.Bind(wx.EVT_MOUSEWHEEL, self._on_mouse_wheel)
        #self.canvas.Bind(wx.EVT_MOTION, self._on_mousemove)
        self.SetFocus()

        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.sizer.Add(self.canvas, 1, wx.LEFT | wx.TOP | wx.GROW)
        self.SetSizer(self.sizer)

    def draw(self, data=None):
        """Draws self.data or passed data."""
        if data is None:
            data = self.data
        self.axes.plot(data, color='#1498DB', linewidth=0.3)

    def _zoom(self, factor, system=None):
        """Private function, use zoomin and zoomout instead."""
        self.scale *= factor
        x_min, x_max = self.axes.get_xlim()
        if not system:
            self.axes.set_xlim(x_min/factor, x_max/factor)
        else:
            width = x_max - x_min
            point = system[0]
            ratio = system[1]
            new_width = width/factor

            new_x_min = (point - ratio * new_width)
            self.axes.set_xlim(new_x_min, new_x_min + new_width)

        self.canvas.draw()

    def zoomin(self, factor=None, system=None):
        """Zooms in plot with factor (default self.zoomfactor)"""
        if not factor:
            factor = self.zoomfactor
        self._zoom(self.zoomfactor, system)

    def zoomout(self, factor=None, system=None):
        """Zooms in plot with factor (default self.zoomfactor)"""
        if not factor:
            factor = self.zoomfactor
        self._zoom(1.0/self.zoomfactor, system)

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
        data_range = x_max - x_min
        step = multiplier * (data_range/10)
        self.axes.set_xlim(x_min + step, x_max + step)
        self.canvas.draw()

    def _on_key_down(self, event=None):
        """Event handler for key down events."""
        keycode = event.GetKeyCode()
        if keycode == 73:
            self.zoomin()
        elif keycode == 79:
            self.zoomout()
        elif keycode == wx.WXK_LEFT:
            self.span('left')
        elif keycode == wx.WXK_RIGHT:
            self.span('right')
        else:
            event.Skip()

    def _on_mouse_wheel(self, event=None):
        """Event handler for mouse wheel events."""
        rotation = event.GetWheelRotation()

        w = self.canvas.GetClientSize()[0]
        x_pos = round(event.GetX() - 0.125 * w) - 1
        rx = x_pos / (0.75 * w)

        x_min, x_max = self.axes.get_xlim()
        width = x_max - x_min
        point = rx * width + x_min

        if rotation > 0:
            self.zoomin(system=(point, rx))
        else:
            self.zoomout(system=(point, rx))
"""
    def _on_mousemove(self, event=None):
        w = self.canvas.GetClientSize()[0]
        x_pos = round(event.GetX() - 0.125 * w) - 1
        if self.prev_mouse_location and event.LeftIsDown():
            x_min, x_max = self.axes.get_xlim()
            self.axes.set_xlim(x_min + (x_pos - self.prev_mouse_location), x_max + (x_pos - self.prev_mouse_location))
        self.prev_mouse_location = x_pos
"""
