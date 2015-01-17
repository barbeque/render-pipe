/**
  Represents a unit of measure.
  @constructor
  @param {string} unit - The suffix of the unit (e.g. 'm')
  @param {string} conversion_multiplier - What to multiply a measurement in meters by
                                          in order to get this unit.
*/
var Unit = function(unit, conversion_multiplier) {
  var self = this;
  self.unit = unit;
  self.conversion_multiplier = conversion_multiplier;
  self.to_meters = function(unit_value) {
    return unit_value / conversion_multiplier;
  };
  self.from_meters = function(meters) {
    return unit_value * conversion_multiplier;
  };
};

var Measure = function(measurement, unit) {
  if(typeof(unit) !== 'object') {
    throw "Expected unit argument to be an object, got " + typeof(unit);
  }

  var self = this;
  self.measurement = measurement;
  self.unit = unit;
};

var editorViewModel = {
  // A "node" is a point connecting two pipe segments within the pipeline.
  nodes: ko.observableArray(

  ),
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
  }
};

var NodeViewModel = function(x, y, z) {
  var self = this;

  if(typeof(x) !== 'object') { throw "Expected x to be an object (Measure), not " + typeof(x); }
  if(typeof(y) !== 'object') { throw "Expected y to be an object (Measure), not " + typeof(y); }
  if(typeof(z) !== 'object') { throw "Expected z to be an object (Measure), not " + typeof(z); }

  self.x = x;
  self.y = y;
  self.z = z;
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
