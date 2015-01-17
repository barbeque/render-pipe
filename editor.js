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
    var meters = this.units[1];
    var nv = new NodeViewModel(0, meters, 0, meters, 0, meters);
    this.nodes.push(nv);
  }
};

var NodeViewModel = function(x, x_unit, y, y_unit, z, z_unit) {
  var self = this;

  // TODO: add display observables to handle unit conversion?

  self.x = ko.observable(x);
  self.x_unit = ko.observable(x_unit);
  self.y = ko.observable(y);
  self.y_unit = ko.observable(y_unit);
  self.z = ko.observable(z);
  self.z_unit = ko.observable(z_unit);
};

/*editorViewModel.prototype.addDemoNodes = function() {

};*/

//editorViewModel.addDemoNodes();

editorViewModel.init();

// Initialize knockout.
ko.applyBindings(editorViewModel);
