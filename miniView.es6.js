class MiniView {
  constructor(options, $) {
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
  initEye() {
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

  initScale() {
    const wd =
      this.$svgEl.width() > this.$parentWarp.width()
        ? this.$svgEl.width()
        : this.$parentWarp.width();
    const ht =
      this.$svgEl.height() > this.$parentWarp.height()
        ? this.$svgEl.height()
        : this.$parentWarp.height();
    this.scale = {
      width: wd / this.$parentWarp.width(),
      height: ht / this.$parentWarp.height()
    };
  }

  initMiniScale() {
    const wd =
      this.$svgEl.width() > this.$parentWarp.width()
        ? this.$svgEl.width()
        : this.$parentWarp.width();
    const ht =
      this.$svgEl.height() > this.$parentWarp.height()
        ? this.$svgEl.height()
        : this.$parentWarp.height();

    this.miniScale = {
      width: this.$miniMap.width() / wd,
      height: this.$miniMap.height() / ht
    };
  }

  bindEvent() {
    const $selectionWin = this.$miniMap.find(".selectionWin");
    // mini view dragg
    $selectionWin.draggable({
      // containment: "parent",
      drag: () => {
        const selectionLeft = parseInt($selectionWin.css("left")),
          selectionTop = parseInt($selectionWin.css("top"));
        this.$warp.css({
          left: selectionLeft
            ? -(
                (this.$parentWarp.width() / $selectionWin.width()) *
                selectionLeft
              ) * this.viewZoom
            : 0,
          top: selectionTop
            ? -(
                (this.$parentWarp.height() / $selectionWin.height()) *
                selectionTop
              ) * this.viewZoom
            : 0
        });
      }
    });

    this.$miniMap.bind("click", e => {
      if (!$(e.target).hasClass(".selectionWin")) {
        this.$warp.css({
          left: -e.offsetX / this.miniScale.width,
          top: -e.offsetY / this.miniScale.height
        });
        this.setSeletionPos();
      }
    });

    // this.$warp.mousewheel((event, delta, deltaX, deltaY) => {
    //   this.setViewZoom(event, delta, deltaX, deltaY);
    //   return false;
    // });
  }

  setViewZoom(type) {
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

  refresh() {
    var p = ["webkit", "moz", "ms", "o"],
      oString = "left top";

    var el = this.$warp.clone().removeAttr("style"),
      s = "scale(" + this.miniScale.width + "," + this.miniScale.height + ")",
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
  /**
   * refresh seletion view position
   *
   * @memberof MiniView
   */
  setSeletionPos() {
    var selLeft = parseInt(this.$warp.css("left")),
      selTop = parseInt(this.$warp.css("top"));
    this.$miniMap.find(".selectionWin").css({
      left: (-selLeft * this.miniScale.width) / this.viewZoom,
      top: (-selTop * this.miniScale.height) / this.viewZoom
    });
  }
  destory() {
    if (this.$miniMap) {
      this.$miniMap.remove();
    }
  }
}
