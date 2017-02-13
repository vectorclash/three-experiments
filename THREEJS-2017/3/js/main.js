var scene;
var camera;
var renderer;
var directionalLight, ambientLight;
var mainContainer, tContainer;
var clock = new THREE.Clock();
var roughSphere;
var sphereSize = 20;
var gradientDepth = 4;
var gradientImageDensity = 512;

var modBase = 1.5;
var xMod = 1.5;
var yMod = 1.5;
var zMod = 1.5;

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

	var newGradientTexture = new THREE.Texture(gradientTexture(gradientDepth));
	newGradientTexture.needsUpdate = true;

	var material3 = new THREE.MeshBasicMaterial({map: newGradientTexture, side: THREE.DoubleSide});
	var geometry3 = new THREE.SphereGeometry(sphereSize, 64, 64);
	roughSphere = new THREE.Mesh(geometry3, material3);
	roughSphere.verticesOrigin = new Array();
	for ( var i = 0; i < geometry3.vertices.length; i ++ ) {
		roughSphere.verticesOrigin.push({x:roughSphere.geometry.vertices[i].x, y:roughSphere.geometry.vertices[i].y, z:roughSphere.geometry.vertices[i].z});
	}
	mainContainer.add(roughSphere);

	var loader = new THREE.TextureLoader();
	loader.load('img/line-texture.png', createTexturedSphere);
	loader.load('img/space_texture_two.png', createTexturedSphere);
	loader.load('img/space_texture_four.png', createTexturedSphere);
	loader.load('img/space_texture_three.png', createTexturedSphere);
	loader.load('img/space_texture_one.png', createTexturedSphere);

	threeRendererElement.addEventListener("click", onMouseClick);
	window.addEventListener("resize", onWindowResize);
	TweenMax.ticker.addEventListener("tick", render);
}

// utility functions

function createTexturedSphere(image) {
	sphereSize += 1;
	var material = new THREE.MeshLambertMaterial({map:image, transparent: true, opacity: 0.8});
	var geometry = new THREE.SphereGeometry(sphereSize, 64, 64);
	var sphere = new THREE.Mesh(geometry, material);
	sphere.verticesOrigin = new Array();
	for ( var i = 0; i < geometry.vertices.length; i ++ ) {
		sphere.verticesOrigin.push({x:sphere.geometry.vertices[i].x, y:sphere.geometry.vertices[i].y, z:sphere.geometry.vertices[i].z});
	}

	// modify UVs to accommodate MatCap texture
	// var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
	// for ( j = 0; j < faceVertexUvs.length; j ++ ) {
	// 	var uvs = faceVertexUvs[ j ];
	// 	var face = geometry.faces[ j ];
	// 	for ( var k = 0; k < 3; k ++ ) {
	// 		uvs[ k ].x = face.vertexNormals[ k ].x * 0.5 + 0.5;
	// 		uvs[ k ].y = face.vertexNormals[ k ].y * 0.5 + 0.5;
	// 	}
	// }

	mainContainer.add(sphere);
}

function gradientTexture(colorNum) {
	var gradientCanvas = document.createElement("canvas");
	gradientCanvas.width = gradientImageDensity;
	gradientCanvas.height = gradientImageDensity;
	var gradientCanvasContext = gradientCanvas.getContext("2d");

  var gradient = gradientCanvasContext.createLinearGradient(0,0,gradientImageDensity,0);

  var color1 = tinycolor.random();
  gradient.addColorStop(0, color1.toHexString());

	for(var i = 1; i < colorNum; i++) {
		var newColor = tinycolor.random();
		var spread = i/colorNum;
		gradient.addColorStop(spread, newColor.toHexString());
		if(i == (gradientDepth-1)) {
			gradient.addColorStop(1, color1.toHexString());
		}
	}

  gradientCanvasContext.fillStyle = gradient;
  gradientCanvasContext.fillRect(0,0,gradientImageDensity,gradientImageDensity);

  return gradientCanvas;
}

function changeGradientColor() {
	var newGradientTexture = new THREE.Texture(gradientTexture(gradientDepth));
	newGradientTexture.needsUpdate = true;
	roughSphere.material = new THREE.MeshBasicMaterial({map: newGradientTexture, side: THREE.DoubleSide});
}


// render loop and event handlers

function render() {
	renderer.render(scene, camera);
	for(var i = 0; i < mainContainer.children.length; i++) {
		mainContainer.children[i].rotation.x+=(0.002)+(i*0.0008);
		mainContainer.children[i].rotation.y+=(0.002)+(i*0.0008);
		mainContainer.children[i].rotation.z+=(0.002)+(i*0.0008);
	}

	var delta1 = clock.getDelta(),
			time1 = clock.getElapsedTime() * 1.2;

	var delta2 = clock.getDelta(),
			time2 = clock.getElapsedTime() * 1.3;

	var delta3 = clock.getDelta(),
			time3 = clock.getElapsedTime() * 1.4;

	if(roughSphere) {
		for ( var i = 0; i < roughSphere.geometry.vertices.length; i ++ ) {
			roughSphere.geometry.vertices[i].x = roughSphere.verticesOrigin[i].x * 0.9 + (0.5 + noise.perlin3(roughSphere.verticesOrigin[i].x, 10, noise.perlin2(time1, 29)) * xMod);
			roughSphere.geometry.vertices[i].y = roughSphere.verticesOrigin[i].y * 0.9 + (0.5 + noise.perlin3(roughSphere.verticesOrigin[i].y, 20, noise.perlin2(time1, 39)) * yMod);
			roughSphere.geometry.vertices[i].z = roughSphere.verticesOrigin[i].z * 0.9 + (0.5 + noise.perlin3(roughSphere.verticesOrigin[i].z, 30, noise.perlin2(time1, 49)) * zMod);
		}
		roughSphere.geometry.verticesNeedUpdate = true;
	}
}

function onMouseClick(e) {
	var ranMod = 5+Math.random()*20;
	TweenMax.to(window, 0.5, {xMod:ranMod, yMod:ranMod, zMod:ranMod, ease:Back.easeOut});
	TweenMax.to(window, 0.5, {xMod:modBase, yMod:modBase, zMod:modBase, delay:0.5, ease:Elastic.easeOut});
	TweenMax.delayedCall(0.5, changeGradientColor);
}

function onWindowResize(e) {
	camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}
