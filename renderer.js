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

  var gridMaterial = new BABYLON.StandardMaterial('textureGrid', scene);
  gridMaterial.wireframe = true;
  createReferenceGrid(scene, gridMaterial);

  return scene;
};

var createReferenceGrid = function(scene, material) {
  // TODO: Might be better to make square polys and run them as wireframe as lines can be expensive.
  var start = -100;
  var end = 100;

  for(var x = start; x <= end; ++x) {
    var zLine = BABYLON.Mesh.CreateLines('xzGrid_z_' + x, [ new BABYLON.Vector3(x, 0, start), new BABYLON.Vector3(x, 0, end) ], scene);
    BABYLON.Tags.EnableFor(zLine);
    zLine.addTags('reference-grid');
    zLine.material = material;
    var xLine = BABYLON.Mesh.CreateLines('xzGrid_x_' + x, [ new BABYLON.Vector3(start, 0, x), new BABYLON.Vector3(end, 0, x) ], scene);
    BABYLON.Tags.EnableFor(xLine);
    xLine.material = material;
    xLine.addTags('reference-grid');
  }
}

/// Creates pipeline geometry which will be changed during execution
var createPipelineGeometry = function(scene) {
  // Delete existing pipeline geometry before continuing
  var pipelineNodePrefix = 'pipenode';
  var debugLinePrefix = 'debuglines';
  var pipelineNodes = findGeometryWithPrefix(scene, pipelineNodePrefix); // TODO: Refactor to use tags.
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
    var x = node.x().getMeasurementInMeters();
    var y = node.y().getMeasurementInMeters();
    var z = node.z().getMeasurementInMeters();

    out.push(new BABYLON.Vector3(x, y, z));
  }
  return out;
};

var scene = createPipelineGeometry(createConstants());

var setGridEnabled = function(isEnabled) {
  var grid = scene.getMeshesByTags('reference-grid');
  ko.utils.arrayForEach(grid, function(mesh) {
    mesh.isVisible = isEnabled;
  });
};

var onNodesChanged = function() {
  scene = createPipelineGeometry(scene);
};

var subscribe = editorViewModel.nodes.subscribe(onNodesChanged);

editorViewModel.renderingSettings.isGridEnabled.subscribe(setGridEnabled);

engine.runRenderLoop(function() {
  scene.render();
});
