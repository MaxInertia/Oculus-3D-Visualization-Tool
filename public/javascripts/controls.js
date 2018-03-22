/**
 * Handles controller input for interactions in the VR space.
 */

var handControlL; // Left hand Oculus controller
var handControlR; // Right hand Oculus controller

//This is gross, We'll probably put the listeners in pointSelection instead of
//having global booleans.
var AisPressed;
var XisPressed;

// ~~~~~~~~~~~~~~~ INITIALIZE HAND CONTROLS ~~~~~~~~~~~~~~~~~~~
/**
 * The following is an event listener for when a hand held controller is connected
 */
window.addEventListener('vr controller connected', function(event) {

  handControlL = scene.getObjectByName("Oculus Touch (Left)");
  handControlR = scene.getObjectByName("Oculus Touch (Right)");

  controller = event.detail;
  scene.add(controller);

  //Ensure controllers appear at the right height
  //controller.standingMatrix = renderer.vr.getStandingMatrix();
  controller.head = window.camera;

  //Add a visual for the controllers
  var
    meshColorOff = 0xDB3236, //  Red.
    meshColorOn = 0xF4C20D, //  Yellow.
    controllerMaterial = new THREE.MeshStandardMaterial({
      color: meshColorOff
    }),
    controllerMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.05, 0.1, 6),
      controllerMaterial
    ),
    handleMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.1, 0.03),
      controllerMaterial
    );

  controllerMaterial.flatShading = true;
  controllerMesh.rotation.x = -Math.PI / 2;
  handleMesh.position.y = -0.05;
  controllerMesh.add(handleMesh);
  controller.userData.mesh = controllerMesh;//  So we can change the color later.
  controller.add(controllerMesh);
  castShadows(controller);
  receiveShadows(controller);

  //  Allow this controller to interact with DAT GUI.
  var guiInputHelper = dat.GUIVR.addInputObject(controller);
  scene.add(guiInputHelper);

  setListeners();

  //Add selection controls
  initializeSelectionControls();
  //Add movement controls
  initializeMovementControls();

  // temporary booleans
  AisPressed = false;
  XisPressed = false;

});
/*

*/
// ~~~~~~~~~~~~~~~ MOVEMENT CONTROLS ~~~~~~~~~~~~~~~~~~~

var movementControllerL; //Object representing the left Oculus controlls.
var movementControllerR; //Object representing the right Oculus controlls.
var movementSpeedCoeff = 0.3;

/**
 * This gets called when a controller wakes up or is plugged in, providing
 * a reference to the left and right controller objects.
 */
function initializeMovementControls(){
  movementControllerL = scene.getObjectByName("Oculus Touch (Left)");
  movementControllerR = scene.getObjectByName("Oculus Touch (Right)");

  // Example event listener for button press/touch/near-touch
  // Look at VRController.js:956 for how to define other events
  // by passing strings to .addEventListener()
  if (movementControllerL) {
    movementControllerL.addEventListener('X press began', function (event) {
      //console.log("X Button Pressed!");
      // Function calls go here...
    });
  }
}

/**
 * This gets called in the main update() loop.
 */
function updateMovementControls(){
  // Check that the left controller is initialized
  if (movementControllerL){
    // Check that the dataset has been drawn
    if (datasetAndAxisLabelGroup){
      // TODO: Left hand controls go here:
      // Just a quick test
      datasetAndAxisLabelGroup.position.x += movementControllerL.getAxis(0) * movementSpeedCoeff * -1;
      datasetAndAxisLabelGroup.position.z += movementControllerL.getAxis(1) * movementSpeedCoeff * -1;
    }
  }

  // Check that the right controller is initialized
  if (movementControllerR){
    if (datasetAndAxisLabelGroup) {
      // TODO: Right hand controls go here:
    }
  }
}


// ~~~~~~~~~~~~~~~ SELECTION CONTROLS ~~~~~~~~~~~~~~~~~~~

function setListeners(){
  //Button events. This is currently just using the primary button
  // Trigger presses print controller debug info.
  // LEFT CONTROLLER
  if (controllerL) {
    controllerL.addEventListener('primary press began', function (event) {

      event.target.userData.mesh.material.color.setHex(meshColorOn);
      console.log("Left controller trigger press detected, Printing Controller Object");
      guiInputHelper.pressed(true)
    });
    controllerL.addEventListener('primary press ended', function (event) {

      event.target.userData.mesh.material.color.setHex(meshColorOff);
      guiInputHelper.pressed(false)
    });
  }
  // RIGHT CONTROLLER
  if (controllerR) {
    controllerL.addEventListener('primary press began', function (event) {

      event.target.userData.mesh.material.color.setHex(meshColorOn);
      console.log("Left controller trigger press detected, Printing Controller Object");
      guiInputHelper.pressed(true)
    });
    controllerL.addEventListener('primary press ended', function (event) {

      event.target.userData.mesh.material.color.setHex(meshColorOff);
      guiInputHelper.pressed(false)
    });
  }

  //On controller removal
  // LEFT CONTROLLER
  if (controllerL) {
    controllerL.addEventListener('disconnected', function (event) {

      controllerL.parent.remove(controller)
    });
  }
  // RIGHT CONTROLLER
  if (controllerR) {
    controllerR.addEventListener('disconnected', function (event) {

      controllerR.parent.remove(controller)
    });
  }

  //Press 'A' (Right Controller)(select/deselect a point)
  if (controllerR) {
    controllerR.addEventListener('A press began', function (event) {
      AisPressed = true;
      if (intersects) {
        selectPoint(intersects.index);
      }
      if (selectedPoints.length > 0) {
        console.log(getSelectedPointPositions());
      }
    });
    controllerR.addEventListener('A press ended', function (event) {
      AisPressed = false;
    });
  }

  //Press 'B' (Right Controller) to hide a point
  if (controllerR) {
    controllerR.addEventListener('B press began', function (event) {

      //TODO: Point hiding.
    });
    controllerR.addEventListener('B press ended', function (event) {

    });
  }
  //Press 'A' (Right Controller) and 'X' (Left Controller) to select/deselect all
  if (controllerL) {
    controllerL.addEventListener('X press began', function (event) {
      XisPressed = true;
    });
    controllerL.addEventListener('X press ended', function (event) {
      XisPressed = false;
    });
  }
  //Hold 'B' and 'Y' hide/unhide all
  if (controllerL) {
    controllerL.addEventListener('Y press began', function (event) {

    });
    controllerL.addEventListener('Y press ended', function (event) {

    });
  }


  //'Click right thumbstick' to invert selection.
  if (controllerR) {
    controllerR.addEventListener('thumbstick press began', function (event) {
      invertSelection();
    });
    controllerR.addEventListener('thumbstick press ended', function (event) {

    });
  }
}


// ~~~~~~~~~~~~~~~ KEYBOARD CONTROLS ~~~~~~~~~~~~~~~~~~~

function onAKeyPress(event){
  var keyCode = event.which;
  var translationSpeed = 0.1;
  var rotationSpeed = 0.1;
  var cameraDirection = new THREE.Vector3();
  var theta // Angle between x and z
  var inverseTheta
  var gamma // Angle between x and y
  //A == 65 Left
  if(keyCode == 65){
    camera.position.z -= translationSpeed;
  }
  //D == 68 Right
  else if (keyCode == 68){
    camera.position.z += translationSpeed;
  }
  //W == 87 Forward
  else if (keyCode == 87){
    camera.getWorldDirection(cameraDirection);
    theta = Math.atan2(cameraDirection.x, cameraDirection.z);
    camera.position.x += (translationSpeed*Math.sin(theta));
    camera.position.z += (translationSpeed*Math.cos(theta));
  }
  //S == 83 Backward
  else if(keyCode == 83){
    camera.getWorldDirection(cameraDirection);
    theta = Math.atan2(cameraDirection.x, cameraDirection.z);
    camera.position.x -= (translationSpeed*Math.sin(theta));
    camera.position.z -= (translationSpeed*Math.cos(theta));
  }
  //space == 32 Up
  else if(keyCode == 32){
    camera.position.y += translationSpeed;
  }
  //ctrl == 17  Down
  else if(keyCode == 17){
    camera.position.y -= translationSpeed;
  }
  //Q == 81 Look left
  else if(keyCode == 81){
    camera.rotation.y += rotationSpeed;
  }
  //E == 69 Look right
  else if(keyCode == 69){
    camera.rotation.y -= rotationSpeed;
  }
  //Look up and look down might be unnecasary when this is converted to occulus controller
  //Doesnt work anyway tho

  //R == 82 Look Up
  //else if(keyCode == 82){
  //theta = Math.atan2(cameraDirection.x, cameraDirection.z);
  //inverseTheta = Math.PI /2 - theta;
  //gamma = Math.PI - (inverseTheta + Math.PI /2);
  //camera.rotation.z += (rotationSpeed*Math.sin(gamma));
  //camera.rotation.x += (rotationSpeed*Math.cos(gamma));
  //camera.rotation.x += rotationSpeed;
  // }
}