/**
  Represents a unit of measure.
  @constructor
  @param {string} unit - The suffix of the unit (e.g. 'm')
  @param {string} conversionMultiplier - What to multiply a measurement in meters by
                                          in order to get this unit.
*/
var Unit = function(unit, conversionMultiplier) {
  var self = this;
  self.unit = unit;
  self.conversionMultiplier = conversionMultiplier;
  self.toMeters = function(unit_value) {
    return unit_value / conversionMultiplier;
  };
  self.from_meters = function(meters) {
    return unit_value * conversionMultiplier;
  };
};

var Measure = function(measurement, unit) {
  if(typeof(unit) !== 'object') {
    throw "Expected unit argument to be an object, got " + typeof(unit);
  }

  var self = this;
  self.measurement = ko.observable(measurement);
  self.unit = ko.observable(unit);

  self.getMeasurementInMeters = function() {
    return self.unit().toMeters(self.measurement());
  };

  self.onChangedStub = function() {
    if(onNodesChanged) { onNodesChanged(); }
  };

  self.measurement.subscribe(self.onChangedStub);
  self.unit.subscribe(self.onChangedStub);
};

var RendererSettingsViewModel = function() {
  var self = this;

  self.isGridEnabled = ko.observable(true);
};

var editorViewModel = {
  // A "node" is a point connecting two pipe segments within the pipeline.
  nodes: ko.observableArray(),
  // Defines the available units and their conversion strategies.
  units: ko.observableArray([
    new Unit('ft', 3.28084),
    new Unit('m', 1.0),
    new Unit('in', 39.3701)
  ]),
  // Pipeline metadata.
  name: "Test Pipeline",
  // All units are internally assumed to be in meters
  diameter: ko.observable(),
  // Methods
  init: function() {
    // TODO: Has to be a cleaner way to do these defaults.
    this.diameter = ko.observable(new Measure(0.50, this.units()[1]));
  },
  addNodeRow: function() {
    var meters = this.units()[1];
    var nv = new NodeViewModel(new Measure(0, meters), new Measure(0, meters), new Measure(0, meters));

    this.nodes.push(nv);
  },
  deleteNodeRow: function(node) {
    // TODO: Clean up this reference - something odd with the assignment of 'this' when it returns.
    // Probably because editorViewModel isn't an instance of a class.
    editorViewModel.nodes.remove(node);
  },
  renderingSettings: new RendererSettingsViewModel()
};

var NodeViewModel = function(x, y, z) {
  var self = this;

  if(typeof(x) !== 'object') { throw "Expected x to be an object (Measure), not " + typeof(x); }
  if(typeof(y) !== 'object') { throw "Expected y to be an object (Measure), not " + typeof(y); }
  if(typeof(z) !== 'object') { throw "Expected z to be an object (Measure), not " + typeof(z); }

  self.x = ko.observable(x);
  self.y = ko.observable(y);
  self.z = ko.observable(z);
};

var injectDemoPoints = function() {
  // Using coordinates from the demo code
  var feet = editorViewModel.units()[0];
  editorViewModel.nodes.push(new NodeViewModel(new Measure(0, feet), new Measure(0, feet), new Measure(0, feet)));
  editorViewModel.nodes.push(new NodeViewModel(new Measure(5, feet), new Measure(0, feet), new Measure(0, feet)));
  editorViewModel.nodes.push(new NodeViewModel(new Measure(5, feet), new Measure(20, feet), new Measure(0, feet)));
  editorViewModel.nodes.push(new NodeViewModel(new Measure(5, feet), new Measure(20, feet), new Measure(-2, feet)));
  editorViewModel.nodes.push(new NodeViewModel(new Measure(10, feet), new Measure(20, feet), new Measure(-2, feet)));
  editorViewModel.nodes.push(new NodeViewModel(new Measure(10, feet), new Measure(2, feet), new Measure(-2, feet)));
  editorViewModel.nodes.push(new NodeViewModel(new Measure(18, feet), new Measure(2, feet), new Measure(-2, feet)));
  editorViewModel.nodes.push(new NodeViewModel(new Measure(18, feet), new Measure(2, feet), new Measure(4, feet)));
};

editorViewModel.init();
injectDemoPoints();

// Initialize knockout.
ko.applyBindings(editorViewModel);
