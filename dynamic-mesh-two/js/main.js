(function () {
  var container;
  var camera, scene, renderer, light;
  var geometry, material;
  var clock = new THREE.Clock();
  var shapes, rings;
  var shardSize = 0.5;
  var shapeNum = 3;

  // phone movement

  var hX = 0;
  var hY = 0;
  var hZ = 0;

  var ohX = 0;
  var ohY = 0;
  var ohZ = 0;

  function init() {
    container = document.querySelector('#three-container');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 35;

    scene = new THREE.Scene();

    light = new THREE.AmbientLight(0xFFFFFF);
    scene.add(light);
    light.intensity = 0.5;

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 350, 0 );
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.right  =  5;
    directionalLight.shadow.camera.left   = -5;
    directionalLight.shadow.camera.top    =  5;
    directionalLight.shadow.camera.bottom = -5;

    scene.add( directionalLight );

    shapes = new THREE.Object3D();
    scene.add(shapes);

    var ranColor = tinycolor.random();
    var ranColors = ranColor.triad();

    for(var s = 0; s < shapeNum; s++) {
      geometry = new THREE.SphereGeometry(10, 64, 64);
      //geometry = new THREE.BoxGeometry(10, 10, 10, 20, 20, 20);
      //geometry = new THREE.TorusKnotGeometry( 10, 1.5, 252, 20, 3, 11 );
      //geometry = new THREE.DodecahedronGeometry(10);

      material = new THREE.MeshPhongMaterial( { color: ranColors[s].toHexString(),
    	 											  specular: tinycolor.random().toHexString(),
    	 											  emissive: 0x121212,
    	 											  shininess: 50,
    	 											  shading: THREE.FlatShading,
    	 											  needsUpdate: true });

      var mesh = new THREE.Mesh(geometry, material);
      //mesh.rotation.x = s * 180;
      mesh.scale.x = 1 + s * 0.02;
      mesh.scale.y = 1 + s * 0.02;
      mesh.scale.z = 1 + s * 0.02;
      mesh.verticesOrigin = new Array();
      mesh.ranRotation = 0.0009 + Math.random() * 0.0001;
      mesh.ranSize = 100 + Math.random() * 400;

      mesh.castShadow = true;
    	mesh.receiveShadow = true;

      shapes.add(mesh);

      for ( var i = 0; i < geometry.vertices.length; i ++ ) {
        mesh.verticesOrigin.push(mesh.geometry.vertices[i]);
  		}

      shockwave(mesh);
    }

    rings = new THREE.Object3D();
    scene.add(rings);

    for(var t = 0; t < 10; t++) {
      var torusMaterial = new THREE.MeshPhongMaterial( { color: tinycolor({h:t/10*360, s:Math.random()*100, l:50}).toHexString(),
                              specular: tinycolor.random().toHexString(),
                              emissive: 0x121212,
                              shininess: 50,
                              shading: THREE.FlatShading,
                              needsUpdate: true });

      var torusGeometry = new THREE.TorusGeometry(14 + t * 0.5, 0.3, 6, 6);

      var torus = new THREE.Mesh(torusGeometry, torusMaterial);

      torus.rotation.x = 2;

      torus.castShadow = true;
    	torus.receiveShadow = true;

      rings.add(torus);

      //randomRotation(torus);
    }



    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setClearColor(0xCCFF00, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    TweenMax.ticker.addEventListener('tick', render);
    window.addEventListener('devicemotion', onPhoneMovement);
  }

  function shockwave(shape) {
    var ranTime = 3;

    for ( var i = 0; i < shape.geometry.vertices.length; i ++ ) {
      TweenMax.to(shape.geometry.vertices[i], ranTime, {x:getRandomArbitrary(shape.verticesOrigin[i].x - Math.random() * shardSize, shape.verticesOrigin[i].x + Math.random() * shardSize),
                                                 y:getRandomArbitrary(shape.verticesOrigin[i].y - Math.random() * shardSize, shape.verticesOrigin[i].y + Math.random() * shardSize),
                                                 z:getRandomArbitrary(shape.verticesOrigin[i].z - Math.random() * shardSize, shape.verticesOrigin[i].z + Math.random() * shardSize),
                                                 delay:i*(ranTime * 0.0002),
                                                 ease:Elastic.easeInOut,
                                                 yoyo:true,
                                                 repeat:-1});
    }
  }

  function randomRotation(shape) {

    var animationTime = 10 + Math.random() * 20;

    //shape.rotation.x = 0;
    //shape.rotation.y = 0;
    //shape.rotation.z = 0;

    var ranNum = Math.floor(Math.random() * 3);

    switch(ranNum) {
      case 0:
      TweenMax.to(shape.rotation, animationTime, {x:2 + Math.random() * 0.09, ease:Elastic.easeInOut});
      break;

      case 1:
      TweenMax.to(shape.rotation, animationTime, {y:Math.random() * 0.09, ease:Elastic.easeInOut});
      break;

      case 2:
      TweenMax.to(shape.rotation, animationTime, {z:Math.random() * 0.09, ease:Elastic.easeInOut});
      break;
    }

    TweenMax.delayedCall(animationTime, randomRotation, [shape]);
  }

  function render() {
    var delta = clock.getDelta(),
				time = clock.getElapsedTime() * 10;

    for(var i = 0; i < shapes.children.length; i++) {
      var shape = shapes.children[i];
      // for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
      //   // shape.geometry.vertices[i].x = getRandomArbitrary((shape.verticesOrigin[i].x - 0.05), (shape.verticesOrigin[i].x + 0.05));
      //   // shape.geometry.vertices[i].y = getRandomArbitrary((shape.verticesOrigin[i].y - 0.05), (shape.verticesOrigin[i].y + 0.05));
      //   // shape.geometry.vertices[i].z = getRandomArbitrary((shape.verticesOrigin[i].z - 0.05), (shape.verticesOrigin[i].z + 0.05));
      //
      //   shape.geometry.vertices[i].x = shape.verticesOrigin[i].x + noise.simplex3(shape.verticesOrigin[i].x, i, time/shape.verticesOrigin[i].x) * 0.9;
      //   shape.geometry.vertices[i].y = shape.verticesOrigin[i].y + noise.simplex3(shape.verticesOrigin[i].y, i, time/shape.verticesOrigin[i].y) * 0.9;
      //   shape.geometry.vertices[i].z = shape.verticesOrigin[i].z + noise.simplex3(shape.verticesOrigin[i].z, i, time/shape.verticesOrigin[i].z) * 0.9;
  		// }

      shape.geometry.verticesNeedUpdate = true;

      shape.rotation.x += shape.ranRotation;
      shape.rotation.y += shape.ranRotation;
      shape.rotation.z += shape.ranRotation;
    }

		renderer.render( scene, camera );
  }

  function onPhoneMovement(e) {
  	var x = e.accelerationIncludingGravity.y;
  	var y = e.accelerationIncludingGravity.x;
  	var z = e.accelerationIncludingGravity.z;

  	hX += (x - ohX) / 50;
  	hY += (y - ohY) / 50;
  	hZ += (z - ohZ) / 50;

  	for(var i = 0; i < rings.children.length; i++) {
  		var shape = rings.children[i];
  		shape.rotation.x = hX*(i*0.07);
  		shape.rotation.y = hY*(i*0.07);
  		shape.rotation.z = hZ*(i*0.07);
  	}

  	ohX = hX;
  	ohY = hY;
  	ohZ = hZ;
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
	  camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

  function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
  }

  init();
})();
