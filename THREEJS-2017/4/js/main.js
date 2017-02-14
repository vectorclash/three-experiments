var scene;
var camera;
var renderer;
var directionalLight, ambientLight;
var mainContainer;
var fonts = [];
var textGeometry;
var textMaterial;
var hue1 = 0;
var hue2 = 20;
var word = '';
var oldWord = '';
var maxWords = 100;

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0xE3E3E3);
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	var threeRendererElement = renderer.domElement;
	threeRendererElement.classList.add("main-container");
	document.body.appendChild(threeRendererElement);

	camera.position.z = 500;
	scene.add(camera);

	directionalLight = new THREE.DirectionalLight( 0xffCCff, 1 );
	directionalLight.position.set( 0, 1, 1 );
	directionalLight.castShadow = true;
	//directionalLight.intensity = 1;
	scene.add( directionalLight );

	ambientLight = new THREE.AmbientLight( 0xFFCCFF );
	ambientLight.intensity = 0.5;
	scene.add(ambientLight);

	mainContainer = new THREE.Object3D();
	scene.add(mainContainer);

	loadFonts();

	if(annyang) {
		annyang.start();
		annyang.addCallback('result', function(userSaid, commandText, phrases) {
		  for(var i = 0; i < userSaid.length; i++) {
				var wordSplit = userSaid[i].split(' ');
				for(var j = 0; j < wordSplit.length; j++) {
					TweenMax.delayedCall((i*0.5) + (j*0.5), createText, [wordSplit[j], false]);
				}
			}
		});
	}

	document.addEventListener('keydown', onKeyDown);
	threeRendererElement.addEventListener("click", onMouseClick);
	window.addEventListener("resize", onWindowResize);
	TweenMax.ticker.addEventListener("tick", render);
}

function loadFonts() {
	var loader = new THREE.FontLoader();
	loader.load('fonts/Roboto_Regular.json', fontLoaded);
	loader.load('fonts/Roboto_Bold.json', fontLoaded);
	loader.load('fonts/Roboto_Bk_Bold.json', fontLoaded);
	loader.load('fonts/Roboto_Bold Italic.json', fontLoaded);
	loader.load('fonts/Roboto_Lt_Bold Italic.json', fontLoaded);
	loader.load('fonts/Roboto_Lt_Regular.json', fontLoaded);
	loader.load('fonts/Roboto_Th_Italic.json', fontLoaded);
	loader.load('fonts/Roboto_Th_Regular.json', fontLoaded);
}

function fontLoaded(response) {
	fonts.push(response);
}

function createText(text, remove = false) {
	if(fonts.length > 0 && text != '') {
		var color1 = tinycolor('hsl(' + hue1 + ', 100%, 50%)');
		var color2 = tinycolor('hsl(' + hue2 + ', 100%, 50%)');

		textMaterial = new THREE.MultiMaterial( [
			new THREE.MeshPhongMaterial( { color: color1.toHexString(), shading: THREE.FlatShading } ), // front
			new THREE.MeshPhongMaterial( { color: color2.toHexString(), shading: THREE.SmoothShading } ) // side
		] );

		// textMaterial = new THREE.MeshPhongMaterial( { color: color2.toHexString(), shading: THREE.SmoothShading } );

		textGeometry = new THREE.TextGeometry(text, {font:fonts[Math.floor(Math.random()*fonts.length)], size:40, height:10, curveSegments:4, bevelThickness:2, bevelSize:1.5, bevelEnabled:true, material: 0, extrudedMaterial: 1});
		var myText = new THREE.Mesh(textGeometry, textMaterial);

		textGeometry.computeBoundingBox();
		textGeometry.computeVertexNormals();

		myText.position.x = getRandomArbitrary(-500, 500);
		myText.position.y = getRandomArbitrary(-500, 500);
		myText.position.z = getRandomArbitrary(-500, 500);

		myText.rotation.x = getRandomArbitrary(-5, 5);
		myText.rotation.y = getRandomArbitrary(-5, 5);
		myText.rotation.z = getRandomArbitrary(-5, 5);

		TweenMax.from(myText.position, 2, {x:getRandomArbitrary(-200, 200), y:getRandomArbitrary(-200, 200), z:getRandomArbitrary(-200, 200), ease:Bounce.easeOut});
		TweenMax.from(myText.scale, 4, {y:0.01, ease:Elastic.easeOut});
		TweenMax.to(myText.rotation, 10, {y:10, ease:Back.easeInOut, yoyo:true, repeat:-1});

		if(remove) {
			TweenMax.to(myText.scale, 1, {x:0.01, y:0.01, z:0.01, ease:Bounce.easeOut, delay:10, onComplete:deleteText, onCompleteParams:[myText]});
			TweenMax.to(myText.position, 1, {x:0, y:0, z:0, ease:Bounce.easeOut, delay:10});
		}

		mainContainer.add(myText);

		hue1 += 2;
		hue2 += 2;

		if(hue1 >= 360) {
			hue1 = 0;
		}

		if(hue2 >= 360) {
			hue2 = 0;
		}
	}
}

// utility functions

function deleteText(text) {
	mainContainer.remove(text);
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
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


// render loop and event handlers

function render() {
	renderer.render(scene, camera);

	mainContainer.rotation.x += 0.005;
	mainContainer.rotation.y += 0.002;
	mainContainer.rotation.z += 0.005;

	if(mainContainer.children.length > maxWords) {
		for(var i = 0; i < mainContainer.children.length - maxWords; i++) {
			var shape = mainContainer.children[i];
			if(shape) {
				mainContainer.remove(shape);
			}
		}
	}
}

function onMouseClick(e) {
	createText(oldWord, false);
}

function onKeyDown(event) {
	if(event.key == 'Enter' && word) {
		createText(word, false);
		oldWord = word;
		word = '';
	} else if(event.key != 'Enter' && event.key != 'Tab' && event.key != 'CapsLock' && event.key != 'Shift' && event.key != 'Control' && event.key != 'Alt' && event.key != 'Meta' && event.key != 'Delete' && event.key != 'End' && event.key != 'PageUp' && event.key != 'PageDown' && event.key != 'Home' && event.key != 'Clear' && event.key != 'Backspace') {
		word += event.key;
	} else if(event.key == 'Backspace') {
		word = '';
		oldWord = '';
	}
}

function onWindowResize(e) {
	camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}
