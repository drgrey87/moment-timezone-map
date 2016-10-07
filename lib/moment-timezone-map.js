// moment-timezone-map
// -------------------
// v0.0.1
//
// https://github.com/drgrey87/moment-timezone-map

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    let necessaryModules = ['moment', 'jquery'];
    if (require.defined('moment-timezone')) {
      necessaryModules.push('moment-timezone');
    }
    define(necessaryModules, function (moment, $, momentTimezone) {// AMD
      return factory(moment, $, momentTimezone);
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

  var $mapWrap;
  var $map;
  var $labelName;
  var $labelTime;
  var $axisX;
  var $axisY;
  var width;
  var height;
  var url;
  var lastCenter;
  var centers = [];
  var guess = moment.tz ? moment.tz.guess() : Intl.DateTimeFormat().resolvedOptions().timeZone;

  var checkResiseWindow = function() {
    $(window).resize(function () {
      width = $map.outerWidth();
      height = $map.outerHeight();
    }).resize();
  };

  var changeCenter = function (center) {
    if (center === lastCenter) {
      return;
    }
    if (lastCenter) {
      lastCenter.deactivate();
    }
    center.activate();
    lastCenter = center;
  };

  var checkMouseMove = function() {
    $('.map-inset').mousemove(function (e) {
      var offset = $(this).offset();
      var x = e.pageX - offset.left;
      var y = e.pageY - offset.top;
      var px = x / width;
      var py = y / height;
      var dist;
      var closestDist = 100;
      var closestCenter;
      var i;

      for (i = 0; i < centers.length; i++) {
        dist = centers[i].distSqr(px, py);
        if (dist < closestDist) {
          closestCenter = centers[i];
          closestDist = dist;
        }
      }

      if (closestCenter) {
        changeCenter(closestCenter);
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
    if (this.name === guess) {
      changeCenter(this);
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

  function MomentTimezoneMap(option) {
    this.getData(url);
  }

  MomentTimezoneMap.prototype.getData = function() {
    $.getJSON(url).then(function (data) {
      for (var name in data.zones) {
        centers.push(new Center(data.zones[name]));
      }
    });
  };

  $.fn.timezoneMapper = function(options) {
    $mapWrap = this;
    $map = this.find(options.map);
    $labelName = this.find(options.labelName);
    $labelTime = this.find(options.labelTime);
    $axisX = this.find(options.axisX);
    $axisY = this.find(options.axisY);
    width = $map.outerWidth();
    height = $map.outerHeight();
    url = options.url;
    checkResiseWindow();
    checkMouseMove();
    return new MomentTimezoneMap(options);
  };
}));
