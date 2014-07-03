$(document).ready(function () {
	/*
	 Three.js "tutorials by example"
	 Author: Lee Stemkoski
	 Date: July 2013 (three.js v59dev)
	 */

// MAIN

// standard global variables
	var container, scene, camera, renderer, controls, stats;
	var clock = new THREE.Clock();

// custom global variables
	var mesh;

	init();
	animate();

// FUNCTIONS
	function init()
	{
		// SCENE
		scene = new THREE.Scene();
		// CAMERA
		var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
		var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
		camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
		scene.add(camera);
		camera.position.set(0,150,400);
		camera.lookAt(scene.position);
		// RENDERER
		renderer = new THREE.WebGLRenderer( {antialias:true} );
		renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		container = document.getElementById( 'container' );
		container.appendChild( renderer.domElement );
		// CONTROLS
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		// STATS
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );
		// LIGHT
		var light = new THREE.PointLight(0xffffff);
		light.position.set(100,250,100);
		scene.add(light);
		// FLOOR
		//var floorTexture = new THREE.ImageUtils.loadTexture( '/images/bman_v1.svg' );
		//floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
		//floorTexture.repeat.set( 10, 10 );
		//var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
		//var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
		//var floor = new THREE.Mesh(floorGeometry, floorMaterial);
		//floor.position.y = -0.5;
		//floor.rotation.x = Math.PI / 2;
		//scene.add(floor);
		// SKYBOX
		var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
		var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
		var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
		scene.add(skyBox);

		////////////
		// CUSTOM //
		////////////
		var playerTexture = THREE.ImageUtils.loadTexture( '/images/bman_v2.svg' );

		var ballMaterial = new THREE.SpriteMaterial( { map: playerTexture, useScreenCoordinates: true  } );
		var sprite = new THREE.Sprite( ballMaterial );
		sprite.position.set( 50, 50, 0 );
		sprite.scale.set( 510, 607, 1 ); // imageWidth, imageHeight
		scene.add( sprite );
		//var geometry = new THREE.SphereGeometry( 30, 32, 16 );
		//var material = new THREE.MeshLambertMaterial( { color: 0x000088 } );
		//mesh = new THREE.Mesh( geometry, material );
		//mesh.position.set(0,40,0);
		//scene.add(mesh);

	}


	function animate()
	{
		requestAnimationFrame( animate );
		render();
		update();
	}

	function update()
	{

		controls.update();
		stats.update();
	}

	function render()
	{
		renderer.render( scene, camera );
	}


});