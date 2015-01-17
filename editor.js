var editorViewModel = {
  // A "node" is a point connecting two pipe segments within the pipeline.
  nodes: ko.observableArray(),
  // All units are internally assumed to be in meters
  diameter: 0.50,
  name: "Test Pipeline"
};

// Initialize knockout.
ko.applyBindings(editorViewModel);
