

var format = 'image/png';

var wmsSource = new ol.source.ImageWMS({
  url: 'http://localhost:6080/geoserver/brMalls/wms',
  params: {'LAYERS': 'brMalls:vw_polygon'},
  serverType: 'geoserver',
  crossOrigin: 'anonymous'
});

var wmsLayer = new ol.layer.Image({
  source: wmsSource
});

var view = new ol.View({
  center: [0, 0],
  zoom: 1
});

var map = new ol.Map({
  layers: [wmsLayer],
  target: 'map',
  view: view
});


map.on('singleclick', function(evt) {
  document.getElementById('info').innerHTML = '';
  var viewResolution = /** @type {number} */ (view.getResolution());
  var url = wmsSource.getFeatureInfoUrl(
    evt.coordinate, viewResolution, 'EPSG:4326',
    {'INFO_FORMAT': 'text/html'});
  if (url) {
    fetch(url)
      .then(function (response) { return response.text(); })
      .then(function (html) {
        document.getElementById('info').innerHTML = html;
      });
  }
});

map.on('pointermove', function(evt) {
  if (evt.dragging) {
    return;
  }
  var pixel = map.getEventPixel(evt.originalEvent);
  var hit = map.forEachLayerAtPixel(pixel, function() {
    return true;
  });
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});