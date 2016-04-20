(function(window) {

  L.Control.Fader = L.Control.extend({
    options: {
      position: 'bottomleft'
    },
    initialize: function(layers) {
      this._layers = layers;
      this._ratio = 0.5;
    },
    onAdd: function(map) {
      var sz = this._map.getSize();
      var ll = map.containerPointToLatLng([sz.x * this._ratio, sz.y]);
      this._map = map;
      this._map.on("move", this._update, this);

      var e = document.createElement('div');
      e.innerHTML = "&#9668;&#9658;";
      var css = "text-shadow: 1px 0px white, 0px 1px white, -1px 0px white, 0px -1px white;";
      css += "text-align:center;";
      css += "font-size:28px;";
      css += "cursor:pointer;";
      css += "color:#0078A8;";
      css += "margin-left:-1em;";
      css += "width:2em;";
      e.setAttribute("style", css);
      this._container = e;
      var draggable = new L.Draggable(e);
      draggable.enable();
      draggable.on("drag", function(event) {
        this._ratio = L.DomUtil.getPosition(e).x / this._map.getSize().x;
        this._ratio = Math.min(1, Math.max(0, this._ratio));
        this._update();
      }, this);
      this._update();
      return this._container;
    },
    onRemove: function() {
      this._map.off("move", this._update, this);
    },
    _update: function() {
      var sz = this._map.getSize();
      var cb = L.bounds([0, 0], [sz.x * this._ratio, sz.y]);
      var lb = L.bounds(
        this._map.containerPointToLayerPoint(cb.min),
        this._map.containerPointToLayerPoint(cb.max)
      );
      L.DomUtil.setPosition(this._container, L.point(sz.x * this._ratio, 0));
      this._layers.forEach(function(layer) {
        var e = layer.getContainer();
        e.style["overflow"] = "hidden";
        e.style["background"] = "rgba(0,0,0,0.25)";
        e.style["border-right"] = "1px solid #0078A8";
        e.style["left"] = lb.min.x + "px";
        e.style["top"] = lb.min.y + "px";
        e.style["width"] = lb.getSize().x + "px";
        e.style["height"] = lb.getSize().y + "px";
        for (var f = e.firstChild; f; f = f.nextSibling) {
          if (f.style) {
            f.style["margin-top"] = (-lb.min.y) + "px";
            f.style["margin-left"] = (-lb.min.x) + "px";
          }
        }
      });
    }
  });
  L.control.fader = function(layers) {
    return new L.Control.Fader(layers);
  };
})(window);
