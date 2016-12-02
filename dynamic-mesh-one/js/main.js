(function () {
  var container;
  var camera, scene, renderer, light;
  var geometry, material;
  var clock = new THREE.Clock();
  var shapes;
  var shardSize = 1;

  function init() {
    container = document.querySelector('#three-container');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 35;

    scene = new THREE.Scene();

    light = new THREE.AmbientLight(0x00CCFF);
    scene.add(light);
    light.intensity = 0.2;

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( -2, 0, 10 );
    scene.add( directionalLight );

    shapes = new THREE.Object3D();
    scene.add(shapes);

    var ranColor = tinycolor.random();
    var ranTriad = ranColor.triad();

    for(var s = 0; s < 3; s++) {
      geometry = new THREE.TorusKnotGeometry( 10, 1.5, 252, 20, 3, 11 );

      material = new THREE.MeshPhongMaterial( { color: ranTriad[s].toHexString(),
    	 											  specular: Math.random()*0xFFFFFF,
    	 											  emissive: Math.random()*0xFFFFFF,
    	 											  shininess: 50,
    	 											  shading: THREE.FlatShading,
    	 											  needsUpdate: true });

      var mesh = new THREE.Mesh(geometry, material);
      //mesh.rotation.x = s * 180;
      //mesh.scale.x = 1 + s * 0.1;
      //mesh.scale.y = 1 + s * 0.1;
      //mesh.scale.z = 1 + s * 0.1;
      mesh.verticesOrigin = new Array();
      mesh.ranRotation = 0.005;
      mesh.ranSize = 100 + Math.random() * 400;

      mesh.castShadow = true;
    	mesh.receiveShadow = true;

      shapes.add(mesh);

      for ( var i = 0; i < geometry.vertices.length; i ++ ) {
        mesh.verticesOrigin.push(mesh.geometry.vertices[i]);
  		}

      shockwave(mesh);
    }

    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setClearColor(0xCCFF00, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    TweenMax.ticker.addEventListener('tick', render);
  }

  function shockwave(shape) {
    var ranTime = 1 + Math.random() * 3;

    for ( var i = 0; i < shape.geometry.vertices.length; i ++ ) {
      TweenMax.to(shape.geometry.vertices[i], ranTime, {x:getRandomArbitrary(shape.verticesOrigin[i].x - Math.random() * shardSize, shape.verticesOrigin[i].x + Math.random() * shardSize),
                                                 y:getRandomArbitrary(shape.verticesOrigin[i].y - Math.random() * shardSize, shape.verticesOrigin[i].y + Math.random() * shardSize),
                                                 z:getRandomArbitrary(shape.verticesOrigin[i].z - Math.random() * shardSize, shape.verticesOrigin[i].z + Math.random() * shardSize),
                                                 delay:i*(ranTime * 0.0005),
                                                 ease:Elastic.easeInOut,
                                                 yoyo:true,
                                                 repeat:-1});
    }
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
