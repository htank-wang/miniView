/*
 * Created Date: Thursday, June 20th 2019, 5:35:55 pm
 * Author: htank-wang
 *
 * Copyright (c) 2019 --
 */

(function(root, factory) {
  if (typeof exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(factory);
  } else {
    root.MiniView = factory();
  }
})(this, function() {
  //    methods
  "use strict";

  function _instanceof(left, right) {
    if (
      right != null &&
      typeof Symbol !== "undefined" &&
      right[Symbol.hasInstance]
    ) {
      return right[Symbol.hasInstance](left);
    } else {
      return left instanceof right;
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!_instanceof(instance, Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var MiniView =
    /*#__PURE__*/
    (function() {
      function MiniView(options, $) {
        _classCallCheck(this, MiniView);

        $ = $ || window.$;
        this.$warp = options.el;
        this.$parentWarp = this.$warp.parent();
        this.$svgEl = this.$warp.find("svg");
        this.miniSize = options.miniSize || {
          height: 100,
          width: 200
        };
        this.viewZoom = options.viewZoom || 1;
        this.maxZoom = options.maxZoom || 1.5;
        this.minZoom = options.minZoom || 0.5;
        this.zoomStep = 0.05;
        this.$ = $;
        this.initEye();
        this.bindEvent();
        this.refresh();
        return this;
      }

      _createClass(MiniView, [
        {
          key: "initEye",
          value: function initEye() {
            this.$warp.after(
              '<div class="minimap">' +
                '<div class="selectWin">' +
                '<div class="selectionWin"></div>' +
                "</div>" +
                '<div class="miniview"></div>' +
                "</div>"
            );
            this.$miniMap = this.$parentWarp.find(".minimap");
            this.$miniMap.css(this.miniSize);
            this.$miniMap.find(".selectWin").css(this.miniSize);
            this.$miniMap.find(".miniview").css(this.miniSize);
            this.initScale();
            this.initMiniScale();
            console.log(this.scale, this.miniScale);
          }
        },
        {
          key: "initScale",
          value: function initScale() {
            var wd =
              this.$svgEl.width() > this.$parentWarp.width()
                ? this.$svgEl.width()
                : this.$parentWarp.width();
            var ht =
              this.$svgEl.height() > this.$parentWarp.height()
                ? this.$svgEl.height()
                : this.$parentWarp.height();
            this.scale = {
              width: wd / this.$parentWarp.width(),
              height: ht / this.$parentWarp.height()
            };
          }
        },
        {
          key: "initMiniScale",
          value: function initMiniScale() {
            var wd =
              this.$svgEl.width() > this.$parentWarp.width()
                ? this.$svgEl.width()
                : this.$parentWarp.width();
            var ht =
              this.$svgEl.height() > this.$parentWarp.height()
                ? this.$svgEl.height()
                : this.$parentWarp.height();
            this.miniScale = {
              width: this.$miniMap.width() / wd,
              height: this.$miniMap.height() / ht
            };
          }
        },
        {
          key: "bindEvent",
          value: function bindEvent() {
            var _this = this;

            var $selectionWin = this.$miniMap.find(".selectionWin"); // mini view dragg

            $selectionWin.draggable({
              // containment: "parent",
              drag: function drag() {
                var selectionLeft = parseInt($selectionWin.css("left")),
                  selectionTop = parseInt($selectionWin.css("top"));

                _this.$warp.css({
                  left: selectionLeft
                    ? -(
                        (_this.$parentWarp.width() / $selectionWin.width()) *
                        selectionLeft
                      ) * _this.viewZoom
                    : 0,
                  top: selectionTop
                    ? -(
                        (_this.$parentWarp.height() / $selectionWin.height()) *
                        selectionTop
                      ) * _this.viewZoom
                    : 0
                });
              }
            });
            this.$miniMap.bind("click", function(e) {
              if (!$(e.target).hasClass(".selectionWin")) {
                _this.$warp.css({
                  left: -e.offsetX / _this.miniScale.width,
                  top: -e.offsetY / _this.miniScale.height
                });

                _this.setSeletionPos();
              }
            });
            // this.$warp.mousewheel((event, delta, deltaX, deltaY) => {
            //   this.setViewZoom(event, delta, deltaX, deltaY);
            //   return false;
            // });
          }
        },
        {
          key: "setViewZoom",
          value: function setViewZoom(type) {
            var $ = this.$,
              el = this.$warp[0],
              zoom,
              elCurrLeft = parseInt($(this.$warp).css("left")),
              elCurrTop = parseInt($(this.$warp).css("top"));

            if (type === "zoomOut") {
              if (this.viewZoom < 1.5) {
                zoom = this.viewZoom + 0.05;
              } else {
                return;
              }
            } else {
              if (this.viewZoom > 0.5) {
                zoom = this.viewZoom - 0.05;
              } else {
                return;
              }
            }

            var p = ["webkit", "moz", "ms", "o"],
              s = "scale(" + zoom + ")",
              oString = "left top";

            for (var i = 0; i < p.length; i++) {
              el.style[p[i] + "Transform"] = s;
              el.style[p[i] + "TransformOrigin"] = oString;
            }

            el.style["transform"] = s;
            el.style["transformOrigin"] = oString;
            $(el).css("left", elCurrLeft);
            $(el).css("top", elCurrTop);
            this.viewZoom = zoom;
            this.refresh();
            return false;
          }
        },
        {
          key: "refresh",
          value: function refresh() {
            var p = ["webkit", "moz", "ms", "o"],
              oString = "left top";
            var el = this.$warp.clone().removeAttr("style"),
              s =
                "scale(" +
                this.miniScale.width +
                "," +
                this.miniScale.height +
                ")",
              parentDiv = this.$warp.parent();

            for (var i = 0; i < p.length; i++) {
              el[0].style[p[i] + "Transform"] = s;
              el[0].style[p[i] + "TransformOrigin"] = oString;
            }

            el[0].style["transform"] = s;
            el[0].style["transformOrigin"] = oString;
            this.$miniMap.find(".miniview").append(el);
            //setting seletion view size
            this.$miniMap.find(".selectionWin").css({
              width: this.$miniMap.width() / this.scale.width / this.viewZoom,
              height: this.$miniMap.height() / this.scale.height / this.viewZoom
            });
            this.setSeletionPos();
          }
        },
        {
          key: "setSeletionPos",
          value: function setSeletionPos() {
            //refresh seletion view position
            var selLeft = parseInt(this.$warp.css("left")),
              selTop = parseInt(this.$warp.css("top"));
            this.$miniMap.find(".selectionWin").css({
              left: (-selLeft * this.miniScale.width) / this.viewZoom,
              top: (-selTop * this.miniScale.height) / this.viewZoom
            });
          }
        },
        {
          key: "destory",
          value: function destory() {
            if (this.$miniMap) {
              this.$miniMap.remove();
            }
          }
        }
      ]);

      return MiniView;
    })();

  //    exposed public method
  return MiniView;
});
