(function () {
  var container;
  var camera, scene, renderer, light;
  var geometry, material;
  var clock = new THREE.Clock();
  var shapes, rings;
  var shardSize = 0.5;
  var shapeNum = 3;
  var resetting = false;

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
      //geometry = new THREE.SphereGeometry(10, 64, 64);
      //geometry = new THREE.BoxGeometry(10, 10, 10, 32, 32, 32);
      //geometry = new THREE.TorusKnotGeometry( 10, 1.5, 252, 50, 3, 11 );
      geometry = new THREE.DodecahedronGeometry(10, 3);

      material = new THREE.MeshPhongMaterial( { color: tinycolor.random().toHexString(),
    	 											  specular: tinycolor.random().toHexString(),
    	 											  emissive: 0x121212,
                              reflectivity: 10,
    	 											  shininess: 50,
    	 											  shading: THREE.FlatShading,
    	 											  needsUpdate: true });

      var mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = s * 5;
      mesh.scale.x = 1 + s * 0.02;
      mesh.scale.y = 1 + s * 0.02;
      mesh.scale.z = 1 + s * 0.02;
      mesh.verticesOrigin = new Array();
      mesh.ranRotation = 0.0009;
      mesh.ranSize = 100 + Math.random() * 400;

      mesh.castShadow = true;
    	mesh.receiveShadow = true;

      shapes.add(mesh);

      for ( var i = 0; i < geometry.vertices.length; i ++ ) {
        mesh.verticesOrigin.push({x:mesh.geometry.vertices[i].x, y:mesh.geometry.vertices[i].y, z:mesh.geometry.vertices[i].z});
  		}

      container.addEventListener('click', onClick);

      //shockwave(mesh);
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
  }

  function shockwave(shape) {
    var ranTime = 1;

    var xDirection = getRandomArbitrary(-1, 1);
    var yDirection = getRandomArbitrary(-1, 1);
    var zDirection = getRandomArbitrary(-1, 1);

    for ( var i = 0; i < shape.geometry.vertices.length; i ++ ) {
      TweenMax.to(shape.geometry.vertices[i], ranTime, {x:noise.perlin3(shape.verticesOrigin[i].x, time, shardSize * yDirection) * 10,
                                                        y:noise.perlin3(shape.verticesOrigin[i].y, time, shardSize * yDirection) * 10,
                                                        z:noise.perlin3(shape.verticesOrigin[i].z, time, shardSize * yDirection) * 10,
                                                        delay:i*(ranTime * 0.2),
                                                        ease:Elastic.easeOut});
    }

    TweenMax.delayedCall(ranTime + 1, shockwave, [shape]);
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

    for(var s = 0; s < shapes.children.length; s++) {
      var shape = shapes.children[s];
      if(!resetting) {
        for ( var i = 0; i < shape.geometry.vertices.length; i ++ ) {
          shape.geometry.vertices[i].x += noise.perlin3(shape.verticesOrigin[i].x, time, i) * 0.05;
          shape.geometry.vertices[i].y += noise.perlin3(shape.verticesOrigin[i].y, time, i) * 0.05;
          shape.geometry.vertices[i].z += noise.perlin3(shape.verticesOrigin[i].z, time, i) * 0.05;
    		}
      }

      shape.geometry.verticesNeedUpdate = true;

      shape.rotation.x += shape.ranRotation;
      shape.rotation.y += shape.ranRotation;
      shape.rotation.z += shape.ranRotation;
    }

		renderer.render( scene, camera );
  }

  function onClick(event) {
    if(resetting) {
      resetting = false;
    } else {
      resetting = true;
      for(var s = 0; s < shapes.children.length; s++) {
        var shape = shapes.children[s];
        TweenMax.to(shape.material.color, 1, {r:Math.random(), g:Math.random(), b:Math.random(), ease:Bounce.easeOut, delay:s*0.02});
        for ( var i = 0; i < shape.geometry.vertices.length; i ++ ) {
          TweenMax.to(shape.geometry.vertices[i], 1, {x:shape.verticesOrigin[i].x, y:shape.verticesOrigin[i].y, z:shape.verticesOrigin[i].z, ease:Bounce.easeOut, delay:i*0.0005});
      	}
      }
    }
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
