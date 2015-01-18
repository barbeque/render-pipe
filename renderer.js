var canvas = document.querySelector("#renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

/// Creates "background" elements for the renderer (camera, lights). Returns scene.
var createConstants = function() {
  // Create scene
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  // Create camera and attach to canvas
  /*var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
  camera.setTarget(new BABYLON.Vector3(0, 3.8, 0));*/

  var camera = new BABYLON.ArcRotateCamera('arc', 1, 0.8, 10, new BABYLON.Vector3(0, 3.8, 0), scene);
  camera.attachControl(canvas, false);

  var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  return scene;
};

/// Creates pipeline geometry which will be changed during execution
var createPipelineGeometry = function(scene) {
  // Delete existing pipeline geometry before continuing
  var pipelineNodePrefix = 'pipenode';
  var debugLinePrefix = 'debuglines';
  var pipelineNodes = findGeometryWithPrefix(scene, pipelineNodePrefix);
  var debugLineGeometry = findGeometryWithPrefix(scene, debugLinePrefix);
  deleteMeshes(scene, pipelineNodes);
  deleteMeshes(scene, debugLineGeometry);

  // Generate new geometry.
  var vertices = convertNodesIntoVertices();

  // TODO: Could this be more efficient, or at least organized better?
  for(var i = 0; i < vertices.length; ++i) {
    var sphere = new BABYLON.Mesh.CreateSphere(pipelineNodePrefix + i, 8, 0.25, scene);
    sphere.position = vertices[i];
  }

  // Create all the debugging lines in one shot
  var lines = BABYLON.Mesh.CreateLines(debugLinePrefix, vertices, scene);

  return scene;
};

var findGeometryWithPrefix = function(scene, prefix) {
  return scene.meshes.filter(function(mesh) {
    return mesh.name.indexOf(prefix) >= 0;
  }); // TODO: This and the function below could be optimized into a single call
};

var deleteMeshes = function(scene, geometryList) {
  for(var i = 0; i < geometryList.length; ++i) {
    var index = scene.meshes.indexOf(geometryList[i]);
    if(index >= 0) {
      scene.meshes.splice(index, 1);
    }
  }
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

var onNodesChanged = function() {
  // TODO: Chain up the subscriptions so changing individual nodes changes them.
  console.log("node collection has changed!");

  scene = createPipelineGeometry(scene);
};

var subscribe = editorViewModel.nodes.subscribe(onNodesChanged);

engine.runRenderLoop(function() {
  scene.render();
});
