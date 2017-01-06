(function () {
  var container;
  var camera, scene, renderer, light;
  var clock = new THREE.Clock();
  var shapes, rings;
  var shardSize = 2;
  var shapeNum = 10;
  var resetting = false;
  var bgColor1 = {r:251, g:68, b:19};
  var bgColor2 = {r:18, g:224, b:252};

  // phone movement

  var phoneMovement = false;

  var hX = 0;
  var hY = 0;
  var hZ = 0;

  var ohX = 0;
  var ohY = 0;
  var ohZ = 0;

  function init() {
    setRandomBackgroundGradient();

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

    scene.add( directionalLight );

    shapes = new THREE.Object3D();
    scene.add(shapes);

    // load external model

    var loader = new THREE.ObjectLoader();

    loader.load(
        // resource URL
        "models/crocus.json",

        // pass the loaded data to the onLoad function.
        //Here it is assumed to be an object
        function ( obj ) {
    		//add the loaded object to the scene
            //shapes.add( obj );
            //console.log(obj);
        },

        // Function called when download progresses
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // Function called when download errors
        function ( xhr ) {
            console.error( 'An error happened' );
        }
    );

    // end model load

    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setClearColor(0xCCFF00, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    container.addEventListener('click', onClick);
    //window.addEventListener('devicemotion', onPhoneMovement);
    window.addEventListener('resize', onWindowResize, false);
    TweenMax.ticker.addEventListener('tick', render);
  }

  function setRandomBackgroundGradient() {
    TweenMax.to(bgColor1, 1, {r:Math.round(Math.random()*255), g:Math.round(Math.random()*255), b:Math.round(Math.random()*255), ease:Quad.easeInOut, delay:1});
    TweenMax.to(bgColor2, 2, {r:Math.round(Math.random()*255), g:Math.round(Math.random()*255), b:Math.round(Math.random()*255), ease:Quad.easeInOut, onUpdate:updateBackgroundGradient});
  }

  function updateBackgroundGradient() {
    document.querySelector('body').style.backgroundImage = 'url(img/nebula_stars.png), linear-gradient(320deg, ' + formatColor(bgColor1) + ', ' + formatColor(bgColor2) + ')';
  }

  function formatColor(color) {
    return 'rgb(' + Math.round(color.r) + ', ' + Math.round(color.g) + ', ' + Math.round(color.b) + ')';
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
		    time = clock.getElapsedTime() * 1;

    for(var s = 0; s < shapes.children.length; s++) {
      var shape = shapes.children[s];
      if(!resetting) {
        for ( var i = 0; i < shape.geometry.vertices.length; i ++ ) {
          shape.geometry.vertices[i].x = shape.verticesOrigin[i].x + noise.perlin3(shape.verticesOrigin[i].x, i, time) * noise.perlin3(shape.verticesOrigin[i].y, time/s, hX) * shardSize;
          shape.geometry.vertices[i].y = shape.verticesOrigin[i].y + noise.perlin3(shape.verticesOrigin[i].y, i, time) * noise.perlin3(shape.verticesOrigin[i].z, time/s, hY) * shardSize;
          shape.geometry.vertices[i].z = shape.verticesOrigin[i].z + noise.perlin3(shape.verticesOrigin[i].z, i, time) * noise.perlin3(shape.verticesOrigin[i].x, time/s, hZ) * shardSize;
    		}
      }

      shape.geometry.verticesNeedUpdate = true;

      if(hX != 0) {
        shape.rotation.x = hX*(s*0.05);
    		shape.rotation.y = hY*(s*0.02);
    		shape.rotation.z = hZ*(s*0.03);
      } else {
        shape.rotation.x += shape.ranRotation;
        shape.rotation.y += shape.ranRotation;
        shape.rotation.z += shape.ranRotation;
      }
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

  	ohX = hX;
  	ohY = hY;
  	ohZ = hZ;
  }

  function onClick(event) {
    if(resetting) {
      resetting = false;
      shardSize = 0.5 + Math.random() * 10;
      for(var s = 0; s < shapes.children.length; s++) {
        var shape = shapes.children[s];
        setRandomBackgroundGradient();
        TweenMax.to(shape.material.color, 1, {r:Math.random(), g:Math.random(), b:Math.random(), ease:Bounce.easeOut, delay:s*0.02});
      }
    } else {
      resetting = true;
      var ranR = Math.random();
      var ranG = Math.random();
      var ranB = Math.random();
      for(var s = 0; s < shapes.children.length; s++) {
        var shape = shapes.children[s];
        ranR += getRandomArbitrary(-0.2, 0.2);
        if(ranR > 1.0) {
          ranR = 1.0;
        }

        ranG += getRandomArbitrary(-0.2, 0.2);
        if(ranG > 1.0) {
          ranG = 1.0;
        }
        TweenMax.to(shape.material.color, 1, {r:ranR, g:ranG, b:ranB, ease:Bounce.easeOut, delay:s*0.02});
        for ( var i = 0; i < shape.geometry.vertices.length; i ++ ) {
          TweenMax.to(shape.geometry.vertices[i], 1, {x:shape.verticesOrigin[i].x, y:shape.verticesOrigin[i].y, z:shape.verticesOrigin[i].z, ease:Bounce.easeOut, delay:i*0.005});
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
