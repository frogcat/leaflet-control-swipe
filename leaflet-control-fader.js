(function(window) {

  L.Control.Fader = L.Control.extend({
    options: {
      position: 'bottomleft',
      orientation: 'horizontal',
      initialRatio: 0.5
    },
    initialize: function(layers, options) {
      L.Util.setOptions(this, options);
      this._layers = [];
      this._clazz = "leaflet-control-fader-" + this.options.orientation;
      layers.forEach(function(layer) {
        if (layer.getContainer) {
          L.DomUtil.addClass(layer.getContainer(), this._clazz);
          this._layers.push(layer);
        }
      }, this);
      this._ratio = this.options.initialRatio;
    },
    _initContainer: function() {
      var container = L.DomUtil.create('div', this._clazz);
      if (this.options.orientation == "vertical")
        container.innerHTML = "&#x25B2;<br/>&#x25BC;";
      else
        container.innerHTML = "&#x25C4;&#x25BA;";

      var draggable = new L.Draggable(container);
      draggable.enable();
      draggable.on('drag', this._onDrag, this);
      this._container = container;
    },
    _onDrag: function() {
      var size = this._map.getSize();
      var position = L.DomUtil.getPosition(this._container);
      if (this.options.orientation == "vertical")
        this._ratio = Math.min(1, Math.max(0, position.y / size.y));
      else
        this._ratio = Math.min(1, Math.max(0, position.x / size.x));
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

      var outer = this._map.getSize();
      var inner = outer.multiplyBy(this._ratio);
      var min = this._map.containerPointToLayerPoint([0, 0]);
      var max = this._map.containerPointToLayerPoint([inner.x, outer.y]);
      if (this.options.orientation == "vertical") {
        max = this._map.containerPointToLayerPoint([outer.x, inner.y]);
        L.DomUtil.setPosition(this._container, L.point(0, inner.y));
      } else {
        L.DomUtil.setPosition(this._container, L.point(inner.x, 0));
      }

      this._layers.forEach(function(layer) {
        var e = layer.getContainer();
        e.style.left = min.x + "px";
        e.style.top = min.y + "px";
        e.style.width = (max.x - min.x) + "px";
        e.style.height = (max.y - min.y) + "px";
        for (var f = e.firstChild; f; f = f.nextSibling) {
          if (f.style) {
            f.style.marginTop = (-min.y) + "px";
            f.style.marginLeft = (-min.x) + "px";
          }
        }
      });
    }
  });
  L.control.fader = function(layers, options) {
    return new L.Control.Fader(layers, options);
  };
})(window);