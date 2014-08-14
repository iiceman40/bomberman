<!DOCTYPE html>

<html>

<head>
	<title>Collisions - Physijs</title>

	<script type="text/javascript" src="js/vendor/three.min.js"></script>
	<script type="text/javascript" src="js/vendor/stats.min.js"></script>
	<script type="text/javascript" src="js/vendor/physi.js"></script>

	<script type="text/javascript">

		'use strict';

		Physijs.scripts.worker = 'js/vendor/physijs_worker.js';
		Physijs.scripts.ammo = 'ammo.js';

		var initScene, render, box, dirtyBox,
			renderer, render_stats, physics_stats, scene, ground_material, ground, light, camera;

		initScene = function() {
			renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.shadowMapEnabled = true;
			renderer.shadowMapSoft = true;
			document.getElementById( 'viewport' ).appendChild( renderer.domElement );

			render_stats = new Stats();
			render_stats.domElement.style.position = 'absolute';
			render_stats.domElement.style.top = '0px';
			render_stats.domElement.style.zIndex = 100;
			document.getElementById( 'viewport' ).appendChild( render_stats.domElement );

			physics_stats = new Stats();
			physics_stats.domElement.style.position = 'absolute';
			physics_stats.domElement.style.top = '50px';
			physics_stats.domElement.style.zIndex = 100;
			document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );



			scene = new Physijs.Scene(/*{ reportsize: 1, fixedTimeStep: 1 / 120 }*/);
			scene.setGravity(new THREE.Vector3( 0, -1, 0 ));


			camera = new THREE.PerspectiveCamera(
				35,
				window.innerWidth / window.innerHeight,
				1,
				1000
			);
			camera.position.set( -2, 4, -6 );
			camera.lookAt( scene.position );
			scene.add( camera );

			// Light
			light = new THREE.DirectionalLight( 0xFFFFFF );
			light.position.set( 2, 4, -1.5 );
			light.target.position.copy( scene.position );
			light.castShadow = true;
			light.shadowCameraLeft = -6;
			light.shadowCameraTop = -6;
			light.shadowCameraRight = 6;
			light.shadowCameraBottom = 6;
			light.shadowCameraNear = 2;
			light.shadowCameraFar = 20;
			//light.shadowBias = -.0001
			light.shadowMapWidth = light.shadowMapHeight = 2048;
			light.shadowDarkness = .7;
			scene.add( light );

			// Ground
			ground_material = Physijs.createMaterial(
				new THREE.MeshLambertMaterial({ color: 0xaa0099 }),
				.0, // friction
				.0 // restitution
			);

			ground = new Physijs.BoxMesh(
				new THREE.BoxGeometry(10, 1, 10),
				ground_material,
				0 // mass
			);
			ground.position.y = -1
			ground.receiveShadow = true;
			scene.add( ground );

			var box_geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
			var blue = Physijs.createMaterial(
				new THREE.MeshLambertMaterial({ color: 0x0000ff }),
				.0, // friction
				.3 // restitution
			);
			var red = Physijs.createMaterial(
				new THREE.MeshLambertMaterial({ color: 0xff0000 }),
				.0, // friction
				.3 // restitution
			);
			var yellow = Physijs.createMaterial(
				new THREE.MeshLambertMaterial({ color: 0xffff00 }),
				.0, // friction
				.3 // restitution
			);
			var gray = Physijs.createMaterial(
				new THREE.MeshLambertMaterial({ color: 0xaaaaaa }),
				.0, // friction
				.3 // restitution
			);
			var green = Physijs.createMaterial(
				new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
				.0, // friction
				.3 // restitution
			);

			// wall
			var wall_geometry = new THREE.BoxGeometry( 0.5, 0.5, 10 );
			var wall = new Physijs.BoxMesh(
				wall_geometry,
				gray,
				0
			);

			wall.castShadow = true;
			wall.position.set(3, 0, 0);
			scene.add( wall );

			// spawn boxes
			var physiBox1 = spawnBox(box_geometry, red, -5, 1, 0);
			physiBox1.setLinearVelocity(new THREE.Vector3(1,0,0));

			var physiBox2 = spawnBox(box_geometry, green, -5, 1, 1);
			physiBox2.applyCentralImpulse(new THREE.Vector3(1,0,0));

			var physiBox3 = spawnBox(box_geometry, blue, -5, 1, 2);
			physiBox3.applyCentralForce(new THREE.Vector3(150,0,0));

			//dirtyBox = spawnBox(box_geometry, gray, -5,0.5, 3);
			//dirtyBox.setAngularFactor(new THREE.Vector3(0,0,0));

			// no physics box
			box = new THREE.Mesh( box_geometry, yellow );
			box.position.set(-6, 0.5, -1);
			box.castShadow = true;
			scene.add( box );

			// start animation/ simulation
			requestAnimationFrame( render );
			scene.simulate();
		};

		render = function() {

			box.position.x = box.position.x + 0.02;

			//dirtyBox.setAngularVelocity(new THREE.Vector3(0,0,0));

			//dirtyBox.position = new THREE.Vector3(dirtyBox.position.x + 0.02, 0.25, 3);
			//dirtyBox.__dirtyPosition = true;
			scene.simulate();
			requestAnimationFrame( render );
			renderer.render( scene, camera );

			render_stats.update();

		};

		window.onload = initScene;

		function spawnBox(box_geometry, material, x, y, z){
			box = new Physijs.BoxMesh(
				box_geometry,
				material,
				100
			);

			box.rotation.set(
				Math.random() * Math.PI,
				Math.random() * Math.PI,
				Math.random() * Math.PI
			);

			box.castShadow = true;
			box.position.set(x, y, z);
			scene.add( box );

			return box;
		}

	</script>
</head>

<body>
	<div id="viewport"></div>
</body>

</html>