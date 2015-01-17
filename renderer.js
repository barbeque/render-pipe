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

  var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);
  sphere.position.y = 1;

  return scene;
};

var scene = createPipelineGeometry(createConstants());

engine.runRenderLoop(function() {
  scene.render();
});
