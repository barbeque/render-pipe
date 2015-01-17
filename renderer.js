var canvas = document.querySelector("#renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

/// Creates "background" elements for the renderer (camera, lights). Returns scene.
var createConstants = function() {
  // Create scene
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  // Create camera and attach to canvas
  var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, false);

  var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  return scene;
};

/// Creates pipeline geometry which will be changed during execution
var createPipelineGeometry = function(scene) {
  // TODO: Delete existing pipeline geometry before continuing

  var vertices = convertNodesIntoVertices();

  // TODO: Could this be more efficient, or at least organized better?
  for(var i = 0; i < vertices.length; ++i) {
    var sphere = new BABYLON.Mesh.CreateSphere('pipenode' + i, 8, 0.5, scene);
    sphere.position = vertices[i];
  }

  // Create all the debugging lines in one shot
  var lines = BABYLON.Mesh.CreateLines('debuglines', vertices, scene);

  return scene;
};

var convertNodesIntoVertices = function() {
  var out = [];
  for(var i = 0; i < editorViewModel.nodes().length; ++i) {
    var node = editorViewModel.nodes()[i];
    var x = node.x().get_measurement_in_meters();
    var y = node.y().get_measurement_in_meters();
    var z = node.z().get_measurement_in_meters();

    out.push(new BABYLON.Vector3(x, y, z));
  }
  return out;
};

var scene = createPipelineGeometry(createConstants());

engine.runRenderLoop(function() {
  scene.render();
});
