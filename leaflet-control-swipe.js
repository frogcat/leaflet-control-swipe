(function(window) {

  L.Control.Swipe = L.Control.extend({
    options: {
      position: 'bottomleft',
      initialPoint: L.point(0.5, 1.0)
    },
    initialize: function(options) {
      L.setOptions(this, options);
      this._layers = [];
      this._point = this.options.initialPoint;
    },
    _onDrag: function() {
      var p = L.DomUtil.getPosition(this._container).unscaleBy(this._map.getSize());
      this._point = L.point(Math.min(1.0, Math.max(0, p.x)), 1.0);
      this._update();
    },
    _onLayerChange: function() {
      this._layers = [];
      this._map.eachLayer(function(layer) {
        if (layer.options.pane === "swipePane")
          this._layers.push(layer.getContainer());
      }, this);
    },
    _initContainer: function() {
      var e = L.DomUtil.create('div', 'leaflet-control-swipe');
      e.style.cursor = "pointer";
      e.style.color = "#0078A8";
      e.style.textAlign = "center";
      e.style.textShadow = "0 -1px #fff, 0 1px #000";
      e.style.marginLeft = "-1em";
      e.style.width = "2em";
      e.style.fontSize = "48px";
      e.style.lineHeight = "48px";
      e.innerHTML = '\u25C0\u25B6';
      (new L.Draggable(e)).on('drag', this._onDrag, this).enable();
      this._container = e;
    },
    onAdd: function(map) {
      this._initContainer();
      this._map.on('layeradd layerremove', this._onLayerChange, this).fire("layeradd");
      this._map.on('move', this._update, this).fire("move");
      return this._container;
    },
    onRemove: function() {
      this._map.off('move', this._update, this);
      this._map.off('layeradd layerremove', this._onLayerChange, this);
    },
    _update: function() {

      var min = this._map.containerPointToLayerPoint(L.point(0, 0));
      var max = this._map.containerPointToLayerPoint(this._map.getSize().scaleBy(this._point));

      L.DomUtil.setPosition(this._container, L.point(max.x - min.x, 0));

      var pane = this._map.getPane("swipePane");
      pane.style.left = min.x + "px";
      pane.style.top = min.y + "px";
      pane.style.width = (max.x - min.x) + "px";
      pane.style.height = (max.y - min.y) + "px";

      this._layers.forEach(function(e) {
        e.style.marginTop = (-min.y) + "px";
        e.style.marginLeft = (-min.x) + "px";
      });
    }
  });

  L.Map.addInitHook(function() {
    var e = this.createPane("swipePane");
    e.style.zIndex = 201;
    e.style.overflow = "hidden";
  });

  L.control.swipe = function(options) {
    return new L.Control.Swipe(options);
  };
})(window);
