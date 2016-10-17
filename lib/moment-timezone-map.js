// moment-timezone-map
// -------------------
// v0.0.1
//
// https://github.com/drgrey87/moment-timezone-map

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['moment', 'jquery'], function (moment, $) {// AMD
      return factory(moment, $);
    });
  } else if (typeof exports !== 'undefined') {
    var moment = require('moment');
    var $ = require('jquery');
    var momentTimezone = require('moment-timezone');
    module.exports = factory(moment, $, momentTimezone); //Common
  } else {
    factory(root.moment, root.$);
  }

}(this, function (moment, $, momentTimezone) {
  'use strict';
  moment.locale("en");

  function MomentTimezoneMap(options) {
    var $mapWrap = $(options.mapWrap);
    var $map = $mapWrap.find(options.map);
    var $labelName = $mapWrap.find(options.labelName);
    var $labelTime = $mapWrap.find(options.labelTime);
    var $axisX = $map.find(options.axisX);
    var $axisY = $map.find(options.axisY);
    var width = $map.outerWidth();
    var height = $map.outerHeight();
    var data = options.coordinates;
    var that = this;
    // var lastCenter;
    this._centers = [];
    this.zone = options.zone || (moment.tz ? moment.tz.guess() : Intl.DateTimeFormat().resolvedOptions().timeZone);
    this._meta = data;

    var checkResiseWindow = function() {
      $(window).resize(function () {
        width = $map.outerWidth();
        height = $map.outerHeight();
      }).resize();
    };

    // var changeCenter = function (center) {
    //   // if (center === lastCenter) {
    //   if (center === that.lastCenter) {
    //     return;
    //   }
    //   // if (lastCenter) {
    //   if (that.lastCenter) {
    //     // lastCenter.deactivate();
    //     that.lastCenter.deactivate();
    //   }
    //   center.activate();
    //   // lastCenter = center;
    //   that.lastCenter = center;
    // };

    var checkMouseMove = function() {
      $map.mousemove(function (e) {
        var offset = $(this).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;
        var px = x / width;
        var py = y / height;
        var dist;
        var closestDist = 100;
        var closestCenter;
        var i;
        var centers = that._centers;

        for (i = 0; i < centers.length; i++) {
          dist = centers[i].distSqr(px, py);
          if (dist < closestDist) {
            closestCenter = centers[i];
            closestDist = dist;
          }
        }

        if (closestCenter) {
          // changeCenter(closestCenter);
          that._changeCenter(closestCenter);
        }
      });
    };

    function Center(data) {
      this.name = data.name;
      this.x = (180 + data.long) / 360;
      this.y = (90 - data.lat) / 180;
      this.dom = $('<span>').appendTo($map).css({
        left: this.x * 100 + '%',
        top: this.y * 100 + '%'
      });
      if (this.name === that.zone) {
        // changeCenter(this);
        that._changeCenter(this);
      }
    }

    Center.prototype = {
      distSqr: function (x, y) {
        var dx = this.x - x;
        var dy = this.y - y;
        return dx * dx + dy * dy;
      },
      activate: function () {
        if (moment.tz) {
          var m = moment().tz(this.name);
          $labelTime.text(m.format("hh:mm a ") + m.zoneAbbr());
        }
        $labelName.text(this.name);
        $axisX.css('left', this.x * 100 + '%');
        $axisY.css('top', this.y * 100 + '%');
      },
      deactivate: function () {
        this.dom.removeClass('active');
      }
    };

    checkResiseWindow();
    checkMouseMove();

    for (var name in data.zones) {
      this._centers.push(new Center(data.zones[name]));
    }

  };

  MomentTimezoneMap.prototype._changeCenter = function(center) {
    if (center === this.lastCenter) {
      return;
    }
    // if (lastCenter) {
    if (this.lastCenter) {
      // lastCenter.deactivate();
      this.lastCenter.deactivate();
    }
    center.activate();
    // lastCenter = center;
    this.lastCenter = center;
  };

  MomentTimezoneMap.prototype._getZone = function() {
    return this.zone;
  };

  MomentTimezoneMap.prototype._setZone = function(zone) {
    var newCenter;
    var i = this._centers.length - 1;
    this.zone = zone;
    while (i >= 0) {
      if (zone === this._centers[i].name) {
        newCenter = this._centers[i];
        break;
      }
      --i;
    }
    this._changeCenter(newCenter);
  };

  MomentTimezoneMap.prototype._guess = function() {
    return moment.tz ? moment.tz.guess() : Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  $.fn.timezoneMapper = function(options) {
    options.mapWrap = this;
    var momentTimezonemap = new MomentTimezoneMap(options);
    return momentTimezonemap;
  };

  // $.fn.timezoneMapper._meta = data;
  $.fn.timezoneMapper.guess = function() {
    return moment.tz ? moment.tz.guess() : Intl.DateTimeFormat().resolvedOptions().timeZone;
  };
}));
