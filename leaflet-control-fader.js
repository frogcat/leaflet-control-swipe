(function(window) {

  L.Control.Fader = L.Control.extend({
    options: {
      position: 'bottomleft',
      orientation: 'horizontal',
      initialScale: 0.5,
    },
    initialize: function(layers, options) {
      L.Util.setOptions(this, options);
      this._layers = [];
      layers.forEach(function(layer) {
        if (layer.getContainer) {
          L.DomUtil.addClass(layer.getContainer(), 'leaflet-control-fader-layer');
          this._layers.push(layer);
        }
      }, this);
    },
    _initContainer: function() {
      var o = this.options;
      var e = L.DomUtil.create('div', 'leaflet-control-fader');
      if (o.orientation == "vertical") {
        L.DomUtil.addClass(e, "leaflet-control-fader-vertical");
        this._scale = L.point(1.0, o.initialScale);
      } else {
        L.DomUtil.addClass(e, "leaflet-control-fader-horizontal");
        this._scale = L.point(o.initialScale, 1.0);
      }
      var d = new L.Draggable(e);
      d.on('drag', this._onDrag, this);
      d.enable();
      this._container = e;
    },
    _onDrag: function() {
      var p = L.DomUtil.getPosition(this._container).unscaleBy(this._map.getSize())
      this._scale = (this.options.orientation == "vertical" ? L.point(1.0, p.y) : L.point(p.x, 1.0));
      this._scale.x = Math.min(1, Math.max(0, this._scale.x));
      this._scale.y = Math.min(1, Math.max(0, this._scale.y));
      this._update();
    },
    onAdd: function(map) {
      this._initContainer();
      this._map = map;
      this._map.on('move', this._update, this);
      this._update();
      return this._container;
    },
    onRemove: function() {
      this._map.off('move', this._update, this);
    },
    _update: function() {

      var b = L.bounds(
        this._map.containerPointToLayerPoint(L.point(0, 0)),
        this._map.containerPointToLayerPoint(this._map.getSize().scaleBy(this._scale))
      );
      var x = b.min.x;
      var y = b.min.y;
      var w = b.getSize().x;
      var h = b.getSize().y;

      if (this.options.orientation == "vertical")
        L.DomUtil.setPosition(this._container, L.point(0, h));
      else
        L.DomUtil.setPosition(this._container, L.point(w, 0));

      this._layers.forEach(function(layer) {
        var e = layer.getContainer();
        e.style.left = x + "px";
        e.style.top = y + "px";
        e.style.width = w + "px";
        e.style.height = h + "px";
        for (var f = e.firstChild; f; f = f.nextSibling) {
          if (f.style) {
            f.style.marginTop = (-y) + "px";
            f.style.marginLeft = (-x) + "px";
          }
        }
      });
    }
  });
  L.control.fader = function(layers, options) {
    return new L.Control.Fader(layers, options);
  };
})(window);