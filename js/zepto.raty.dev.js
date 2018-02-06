;(function ($) {
  'use strict';

  var defaults = {
    click: undefined,           //单击回掉函数
    number: 5,                  //默认评分的个数
    numberMax: 10,              //默认评分的最大个数
    path: 'raty/images',        //默认评分图标路径
    readOnly: false,            //是否是只读状态
    size: 'small',              //大小分为：small：16*16像素，normal：32*32像素，large：64*64像素
    score: undefined,           //实际评分的大小
    space: true,                //图标之间是否需要空格
    starOff: 'star-off.png',    //指定没选中状态下的图标
    starOn: 'star-on.png'       //指定选中状态下的图标
  };

  var raty = {
    init: function (options) {
      return this.each(function () {
        this.self = $(this);
        this.opt = $.extend(true, {}, defaults, options);

        raty._destroy.call(this.self);

        this.opt.score = raty._adjustedScore.call(this, this.opt.score);
        raty._adjustNumber.call(this);
        raty._adjustStarSize.call(this);
        raty._adjustPath.call(this);
        raty._createStars.call(this);
        raty._fill.call(this, this.opt.score);

        if (this.opt.readOnly) {
          this.style.cursor = '';
          this.self.data('readonly', true);
        } else {
          this.style.cursor = 'pointer';
          raty._bindClick.call(this);
        }
      });
    },

    _adjustedScore: function (score) {
      if (score) {
        return raty._between(score, 0, this.opt.number);
      }

      return score;
    },

    _adjustNumber: function () {
      this.opt.number = raty._between(this.opt.number, 1, this.opt.numberMax);
    },

    _adjustPath: function () {
      this.opt.path = this.opt.path || '';

      if (this.opt.path && this.opt.path.charAt(this.opt.path.length - 1) !== '/') {
        this.opt.path += '/';
      }
    },

    _adjustStarSize: function () {
      var replaces = ['starOff', 'starOn'];

      if (this.opt['size'] === 'small')
        return;

      for (var i = 0; i < replaces.length; i++) {
        if (this.opt['size'] === 'normal') {
          this.opt[replaces[i]] = this.opt[replaces[i]].substring(0, this.opt[replaces[i]].lastIndexOf('.')) + '32.png';
        }
        else if (this.opt['size'] === 'large') {
          this.opt[replaces[i]] = this.opt[replaces[i]].substring(0, this.opt[replaces[i]].lastIndexOf('.')) + '64.png';
        }
      }
    },

    _between: function (value, min, max) {
      return Math.min(Math.max(parseFloat(value), min), max);
    },

    _bindClick: function () {
      var that = this;

      that.stars.on('click.raty', function (evt) {
        var execute = true,
            score = this.alt || $(this).data('alt');

        if (that.opt.click) {
          execute = that.opt.click.call(that, +score, evt);
        }

        if (execute || execute === undefined) {
          raty._fill.call(that, score);
        }
      });
    },

    _createStars: function () {
      for (var i = 1; i <= this.opt.number; i++) {
        var name = this.opt.score && this.opt.score >= i ? 'starOn' : 'starOff',
            attrs = {alt: i, src: this.opt.path + this.opt[name]};

        $('<' + 'img' + ' />', attrs).appendTo(this);

        if (this.opt.space) {
          this.self.append(i < this.opt.number ? '&#160;' : '');
        }
      }

      this.stars = this.self.children('img');
    },

    _fill: function (score) {
      for (var i = 1; i <= this.stars.length; i++) {
        var icon,
            star = this.stars[i - 1],
            turnOn = (i <= score);

        icon = this.opt[turnOn ? 'starOn' : 'starOff'];
        star['src'] = this.opt.path + icon;
      }
    },

    _destroy: function () {
      return this.each(function () {
        var self = $(this),
            raw = self.data('raw');

        if (raw) {
          self.off('.raty').empty();
        } else {
          self.data('raw', self.clone()[0]);
        }
      });
    }
  };

  $.fn.raty = function (options) {
    if (typeof options === 'object' || !options) {
      return raty.init.apply(this, arguments);
    }
  };

})(Zepto);
