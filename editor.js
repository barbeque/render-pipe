var editorViewModel = {
  // A "node" is a point connecting two pipe segments within the pipeline.
  nodes: ko.observableArray(

  ),
  // Defines the available units and their conversion strategies.
  units: ko.observableArray([
    {
      unit: 'ft',
      converter_to: function(meters) { return meters * 3.28084; },
      converter_from: function(feet) { return feet / 3.28084; } // TODO: clean this up; no reason to write this twice.
    },
    {
      unit: 'm',
      converter_to: function(meters) { return meters; },
      converter_from: function(meters) { return meters; }
    },
    {
      unit: 'in',
      converter_to: function(meters) { return meters * 39.3701; },
      converer_from: function(inches) { return inches / 39.3701; }
    }
  ]),
  // Pipeline metadata.
  name: "Test Pipeline",
  // All units are internally assumed to be in meters
  diameter: 0.50,
  diameter_unit: ko.observable()//ko.observable(units[0])
};

var nodeViewModel = function(x, x_unit, y, y_unit, z, z_unit) {
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

// Initialize knockout.
ko.applyBindings(editorViewModel);
