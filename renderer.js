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
    zLine.isVisible = false;
    var xLine = BABYLON.Mesh.CreateLines('xzGrid_x_' + x, [ new BABYLON.Vector3(start, 0, x), new BABYLON.Vector3(end, 0, x) ], scene);
    BABYLON.Tags.EnableFor(xLine);
    xLine.material = material;
    xLine.isVisible = false;
    xLine.addTags('reference-grid');
  }
};

var createCylinderBetweenPoints = function(pointA, pointB, name, diameter, scene) {
  var distance = BABYLON.Vector3.Distance(pointA, pointB);
  var cylinder = BABYLON.Mesh.CreateCylinder(name, distance, diameter, diameter, 20, scene, true);

  // Pivot from the end of the cylinder, not the centre
  cylinder.setPivotMatrix(BABYLON.Matrix.Translation(0, -distance / 2, 0));

  // Move the cylinder to start at pointB
  cylinder.position = pointB;

  // Find direction vector between points (v1) and cross it with a y-up vector (v2)
  // to find the pivot axis for our quaternion
  var v1 = pointB.subtract(pointA);
  v1.normalize();
  var v2 = new BABYLON.Vector3(0, 1, 0);
  var axis = BABYLON.Vector3.Cross(v1, v2);
  axis.normalize();

  // Now figure out what the angle should be with a dot product
  if(vectorEqualsCloseEnough(v1, v2.negate())) {
    console.log("It happened.");
    console.log("Problem points are " + pointA + ", " + pointB);
    console.log("Trying to bail out now.");
    cylinder.position = pointA;
    return;
  }
  var angle = BABYLON.Vector3.Dot(v1, v2);

  // Generate the quaternion
  cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, -Math.PI / 2 + angle);
};

/// BABYLON Vector3.Equals seems to use exact float comparisons, so here's an idea more tolerant of float oddness
var vectorEqualsCloseEnough = function(v1, v2, tolerance) {
  if(typeof(v2) !== 'object') { throw("v2 is supposed to be an object"); }
  if(typeof(v1) !== 'object') { throw("v1 is supposed to be an object"); }

  if(!tolerance) {
    tolerance = 0.00002;
  }

  if(v1.x < v2.x - tolerance || v1.x > v2.x + tolerance ) {
    return false;
  }
  if(v1.y < v2.y - tolerance || v1.y > v2.y + tolerance ) {
    return false;
  }
  if(v1.z < v2.z - tolerance || v1.z > v2.z + tolerance ) {
    return false;
  }
  return true;
};

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
  var diameter = computeDiameter();

  // TODO: Could this be more efficient, or at least organized better?
  for(var i = 0; i < vertices.length; ++i) {
    var sphere = new BABYLON.Mesh.CreateSphere(pipelineNodePrefix + i, 8, diameter, scene);
    sphere.position = vertices[i];

    if(i + 1 < vertices.length) {
      // TODO: Correct name later
      var spanningCylinder = createCylinderBetweenPoints(vertices[i], vertices[i + 1], 'debuglines' + i, diameter, scene);
    }
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

var computeDiameter = function() {
  return editorViewModel.diameter().getMeasurementInMeters();
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

editorViewModel.renderingGridEnabled.subscribe(setGridEnabled);

engine.runRenderLoop(function() {
  scene.render();
});
