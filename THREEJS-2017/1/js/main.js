var scene;
var camera;
var renderer;
var directionalLight, ambientLight;
var mainContainer, tContainer;

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0xE3E3E3);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	var threeRendererElement = renderer.domElement;
	threeRendererElement.classList.add("main-container");
	document.body.appendChild(threeRendererElement);

	camera.position.z = 50;
	scene.add(camera);

	directionalLight = new THREE.DirectionalLight( 0xffCCff, 1 );
	directionalLight.position.set( 0, 1, 1 );
	directionalLight.castShadow = true;
	//directionalLight.intensity = 1;
	scene.add( directionalLight );

	ambientLight = new THREE.AmbientLight( 0xFFCCFF );
	ambientLight.intensity = 0.7;
	scene.add(ambientLight);

	mainContainer = new THREE.Object3D();
	scene.add(mainContainer);

	var loader = new THREE.TextureLoader();
	loader.load('img/space_texture_five.png', function(image) {
		var material1 = new THREE.MeshBasicMaterial({map:image, transparent: true});
		var geometry1 = new THREE.SphereGeometry(25, 64, 64);
		var sphere1 = new THREE.Mesh(geometry1, material1);
		mainContainer.add(sphere1);

		var material2 = new THREE.MeshBasicMaterial({map:image, transparent: true});
		var geometry2 = new THREE.SphereGeometry(26, 64, 64);
		var sphere2 = new THREE.Mesh(geometry2, material2);
		mainContainer.add(sphere2);

		var newGradientTexture = new THREE.Texture(gradientTexture());
	  newGradientTexture.needsUpdate = true;

	  var material3 = new THREE.MeshBasicMaterial({map: newGradientTexture, side: THREE.DoubleSide});
		var geometry3 = new THREE.SphereGeometry(24, 64, 64);
		var sphere3 = new THREE.Mesh(geometry3, material3);
		mainContainer.add(sphere3);
	});

	window.addEventListener("click", onMouseClick);
	window.addEventListener("resize", onWindowResize);
	TweenMax.ticker.addEventListener("tick", render);
}

// utility functions

function gradientTexture() {
	var gradientCanvas = document.createElement("canvas");
	gradientCanvas.width = 512;
	gradientCanvas.height = 512;
	var gradientCanvasContext = gradientCanvas.getContext("2d");

  var gradient = gradientCanvasContext.createLinearGradient(0,0,512,0);

  var color1 = tinycolor.random();
  var color2 = tinycolor.random();
  var color3 = tinycolor.random();

  gradient.addColorStop(0, color1.toHexString());
  gradient.addColorStop(0.25, color2.toHexString());
  gradient.addColorStop(0.5, color3.toHexString());
  gradient.addColorStop(0.75, color2.toHexString());
  gradient.addColorStop(1, color1.toHexString());

  gradientCanvasContext.fillStyle = gradient;
  gradientCanvasContext.fillRect(0,0,512,512);

  return gradientCanvas;
}


// render loop and event handlers

function render() {
	renderer.render(scene, camera);
	for(var i = 0; i < mainContainer.children.length; i++) {
		mainContainer.children[i].rotation.x+=(0.009)+(i*0.002);
		mainContainer.children[i].rotation.y+=(0.009)+(i*0.002);
		mainContainer.children[i].rotation.z+-(0.009)+(i*0.002);
	}
}

function onMouseClick(e) {

}

function onWindowResize(e) {
	camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}
