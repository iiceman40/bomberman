$(document).ready(function() {
	Physijs.scripts.worker = '/js/vendor/physijs_worker.js';
	Physijs.scripts.ammo = '/js/vendor/ammo.js';
	
	var clientClickX, clientClickY;
	
	var container;

	var camera, scene, renderer, objects;
	var keyboard = new KeyboardState();
	var playerObj;

	var clock = new THREE.Clock();
	var maxAnisotropy = 16;
	
	var particleMaterial;
	
	var objects = [];
	var bombs = [];
	var light;
	
	var crateTexture;
	
	// NEW
	var allow_diagonals = true;
	var board = [];
	var map = [];
	var fields = new Array();
	
	//Set the number of rows and columns for the board
	var rows = 20;
	var columns = 15;
	
	var litCube;
	
	var particleSystem;
	// create the particle variables
	var particleCount = 1800;
	var particles = new THREE.Geometry();
	var pMaterial = new THREE.ParticleBasicMaterial({
		color: 0xFFFFFF,
		opacity: 0.3,
		size: 20,
		map: THREE.ImageUtils.loadTexture("images/particle.png"),blending: THREE.AdditiveBlending, transparent: true
	});

	createMap();
	
	init();
	animate();
	
	var player1 = new Object();
	player1.bombrange = 110;
	player1.bomblimit = 1;
	

	function init() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		scene = new Physijs.Scene;
		scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
		
		// Camera
		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 0, 730, 50 );
		camera.lookAt(scene.position);

		controls = new THREE.OrbitControls( camera );
		
		// Materials
		var crate2Texture = new THREE.ImageUtils.loadTexture("textures/crate2.jpg");
		crate2Texture.wrapS = crate2Texture.wrapT = THREE.RepeatWrapping;
		crate2Texture.repeat.set( rows, columns );
		crate2Texture.anisotropy = maxAnisotropy;
		var materialFloor = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: crate2Texture }),
			.9, // high friction
			.0 // low restitution
		);
		
		crateTexture = new THREE.ImageUtils.loadTexture("textures/crate.jpg");
		crateTexture.anisotropy = maxAnisotropy;
		var materialWall = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: crateTexture }),
			.9, // high friction
			.0 // low restitution
		);
		
		// build plane
		plane = new Physijs.BoxMesh(
			new THREE.CubeGeometry(rows*50, 1, columns*50),
			materialFloor,
			0 // mass
		);
		plane.position.y = -1;
		scene.add( plane );
		
		plane2 = new THREE.Mesh( new THREE.PlaneGeometry( rows*50, columns*50, 10, 10 ), materialFloor );
		plane2.rotation.x = - Math.PI / 2;
		plane2.castShadow = true;
		plane2.receiveShadow = true;
		scene.add( plane2 );
		
		for(i=0;i<board.length;i++){
			for(j=0;j<board[i].length;j++){
				if( board[i][j]==1){
					fieldHeight = 50;
					yPosition = fieldHeight/2;
					
					x = (i+1)*50 - board.length*50/2 -25;
					z = (j+1)*50 - board[i].length*50/2 -25;
					y = yPosition;
					objects.push( spawnBox(crateTexture, x, y, z) );
				} 
			}
		}
		
		
		
		// PLAYER
		var materialWhite = Physijs.createMaterial(
			new THREE.MeshPhongMaterial({ color: 0xeeeeee }),
			.9, // high friction
			.0 // low restitution
		);
		
		radius = 25;
		segments = 36;
		rings = 36;
		playerObj = new Physijs.SphereMesh( new THREE.SphereGeometry(radius, segments, rings), materialWhite, 9999 );
		playerObj.position.x = 25;
		playerObj.position.y = 25;
		playerObj.position.z = 25;
		playerObj.castShadow = true;
		objects.push(playerObj);
		
		
		// Enable CCD if the object moves more than 1 meter in one simulation frame
		playerObj.setCcdMotionThreshold(100);
		
		// Set the radius of the embedded sphere such that it is smaller than the object
		playerObj.setCcdSweptSphereRadius(1.2);
		
		// add the sphere to the scene
		scene.add(playerObj);
		
		//playerObj.addEventListener( 'collision', function( other_object, relative_velocity, relative_rotation, contact_normal ) {
		    // `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
		  //  console.log('hit');
		//});
		
		litCube = new THREE.Mesh(
			new THREE.CubeGeometry(50, 50, 50),
			new THREE.MeshLambertMaterial({
				transparent: true,
				opacity: 0.5,
				side:THREE.DoubleSide,
				color: 0xFFFFFF
			})
		);
		litCube.position.y = 800;
		litCube.name = "litCube";
		scene.add(litCube);
		objects.push( litCube );
		
		
		
		//////////////////////////////////////
		// LIGHT AND SHADOWS				//
		//////////////////////////////////////
		// add subtle blue ambient lighting
		//var ambientLight = new THREE.AmbientLight(0x111111);
		//scene.add(ambientLight);
		
		//directions light
		light =  new THREE.SpotLight( 0xffeeee, 1 );
		light.shadowDarkness = 0.4;
		//light.shadowCameraVisible = true;
		
		light.shadowCameraRight    =  1300;
		light.shadowCameraLeft     = -1300;
		light.shadowCameraTop      =  1300;
		light.shadowCameraBottom   = -1300;
		
		light.shadowCameraNear = 500;
		light.shadowCameraFar = 4000;
		light.shadowCameraFov = 70;
		
		// enable shadows for a light
		light.castShadow = true;
		light.shadowMapWidth = 4096; // default is 512
		light.shadowMapHeight = 4096; // default is 512
		
		scene.add(light);
		
		projector = new THREE.Projector();
		
		//////////////////////////////////////
		// RENDERER							//
		//////////////////////////////////////
		renderer = new THREE.WebGLRenderer({antialias:true});
		
		// enable shadows on the renderer
		renderer.shadowMapEnabled = true;
		// to antialias the shadow
		renderer.shadowMapSoft = true;
		
		renderer.setSize( window.innerWidth, window.innerHeight );

		container.appendChild( renderer.domElement );

		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'mouseup', onDocumentMouseUp, false );
		window.addEventListener( 'resize', onWindowResize, false );
		
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// TEST
		
		// now create the individual particles
		for(var p = 0; p < particleCount; p++) {
			// create a particle with random
			var pX = Math.random() * 1000 -500;
			var pY = Math.random() * 1000;
			var pZ = Math.random() * 1000 -500;
			var particle = new THREE.Vector3(pX, pY, pZ);
			
			// create a velocity vector
			particle.velocity = new THREE.Vector3(0, -Math.random(), 0); 
			// add it to the geometry
			particles.vertices.push(particle);
		}
		
		// create the particle system
		particleSystem = new THREE.ParticleSystem( particles, pMaterial);
		
		// also update the particle system to
		// sort the particles which enables
		// the behaviour we want
		particleSystem.sortParticles = true;
		
		// add it to the scene
		scene.add(particleSystem);
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function onDocumentMouseDown( event ) {
		clientClickX = event.clientX;
		clientClickY = event.clientY;
	}
	
	function onDocumentMouseUp( event ) {
		event.preventDefault();
		if (event.target == renderer.domElement) {
			var x = event.clientX;
			var y = event.clientY;
			// If the mouse moved since the mousedown then don't consider this a selection
			if( x != clientClickX || y != clientClickY )
				return;
			else {
				var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
				projector.unprojectVector( vector, camera );
				
				var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
				var intersects = raycaster.intersectObjects( objects );
				
				if ( intersects.length > 0 ) {
					console.log(intersects[ 0 ].object);
					
					if(intersects[ 0 ].object.selected != true){
						intersects[ 0 ].object.materialBackup = intersects[ 0 ].object.material;
						intersects[ 0 ].object.materialSelected = new THREE.MeshLambertMaterial({
							map: intersects[ 0 ].object.materialBackup.map,
							color: "red"
						});
						intersects[ 0 ].object.material = intersects[ 0 ].object.materialSelected;
						intersects[ 0 ].object.selected = true;
					} else {
						intersects[ 0 ].object.material = intersects[ 0 ].object.materialBackup;
						intersects[ 0 ].object.selected = false;
					}
		
					var particle = new THREE.Particle( particleMaterial );
					particle.position = intersects[ 0 ].point;
					particle.scale.x = particle.scale.y = 8;
					scene.add( particle );
				}
			}
		}
	}

	//////////////////////////////////////
	// ANIMATION						//
	//////////////////////////////////////
	function animate() {
		requestAnimationFrame( animate );
		// add some rotation to the system
  		particleSystem.rotation.y += 0.0001;
  		
  		var pCount = particleCount;
		while(pCount--) {
		    // get the particle
		    var particle = particles.vertices[pCount];
		
		    // check if we need to reset
		    if( particle.y < 0 ){
		    	particle.y = 1000;
		    	//particle.velocity.y = 0;
		    }
		
		    // update the velocity with
		    // a splat of randomniz
		    //particle.velocity.y -= Math.random() * .1;
		
		    // and the position
		    particle.y = particle.y + particle.velocity.y;
		}
		
		// flag to the particle system
		// that we've changed its vertices.
		particleSystem.geometry.__dirtyVertices = true;

  		
		render();
		update();
	}
	
	function render() {
		var seconds = Date.now()/1000;
		var piPerSeconds = seconds * Math.PI;
		
		light.position.x = Math.cos(piPerSeconds*0.05)*1000;
		light.position.y = 800;
		light.position.z = Math.sin(piPerSeconds*0.05)*1000;
		
		litCube.position = light.position;
		
		renderer.render(scene, camera);
	};
	
	
	function update() {
		keyboard.update();
	
		var moveDistance = 100 * clock.getDelta(); 
	
		if ( keyboard.pressed("A") )
			playerObj.translateX( -moveDistance );
			
		if ( keyboard.pressed("D") )
			playerObj.translateX(  moveDistance );
			
		if ( keyboard.pressed("W") )
			playerObj.translateZ( -moveDistance );
			
		if ( keyboard.pressed("S") )
			playerObj.translateZ(  moveDistance );
			
		if ( keyboard.down("space") ){
			playerObj.material.color = new THREE.Color(0xff0000);
			//spawnBox(crateTexture, 25, 100, 25);
			spawnBomb();
		}
		if ( keyboard.up("R") )
			playerObj.material.color = new THREE.Color(0x0000ff);
		
		playerObj.__dirtyPosition = true;
		playerObj.__dirtyRotation = true;
		playerObj.setAngularFactor({ x: 0, y: 0, z: 0 });
		playerObj.setLinearVelocity({ x: 0, y: 0, z: 0 });
		playerObj.position.y = 25;
		scene.simulate();
		
		// controls
		controls.update();
		
		TWEEN.update();
	}
	
	/*
	 * FUNCTIONS
	 */
	function spawnBomb(){
		// TODO check bombcount for player
		var materialBlack = Physijs.createMaterial(
			new THREE.MeshPhongMaterial({ color: 0x090909 }),
			.9, // high friction
			.0 // low restitution
		);
		
		radius = 20;
		segments = 36;
		rings = 36;
		var bomb = new THREE.Mesh( new THREE.SphereGeometry(radius, segments, rings), materialBlack, 9999999999 );
		bombs.push(bomb);
		bombIndex = jQuery.inArray(bomb, bombs);
		console.log(bombIndex);
		bomb.position.x = playerObj.position.x;
		bomb.position.y = 20;
		bomb.position.z = playerObj.position.z;
		bomb.castShadow = true;
		scene.add(bomb);
		explodeBomb(bombIndex);
		function explodeBomb(bombIndex){
			// TODO chain reaction for bombs
			// TODO nice effects for explosions + sounds
			var thisBomb = bombs[bombIndex];
			var scale = { x : 1, y: 1, z: 1 };
			var target = { x : 1.5, y: 1.5, z: 1.2 };
			var tween = new TWEEN.Tween(scale).to(target, 8000);
			tween.easing(TWEEN.Easing.Elastic.InOut);
			tween.start();
			tween.onUpdate(function(){
				thisBomb.scale.x = scale.x;
				thisBomb.scale.y = scale.y;
				thisBomb.scale.z = scale.z;
			});
			
			setTimeout(function(){
				bomb = bombs[bombIndex];
				explosionRayCast(0,0,-1, bomb);
				explosionRayCast(-1,0,0, bomb);
				explosionRayCast(0,0,1, bomb);
				explosionRayCast(1,0,0, bomb);
				scene.remove(bomb);
			},5000);
		}
	}
	
	function explosionRayCast(x,y,z, bomb){
		var raycaster = new THREE.Raycaster();
	    raycaster.ray.direction.set(x, y, z);
	    raycaster.ray.origin.set(bomb.position.x, bomb.position.y, bomb.position.z);
	
	    var geometry = new THREE.Geometry();
	
	    intersections = raycaster.intersectObjects( objects );
	    if ( intersections.length > 0 ) {
	        var geometry = new THREE.Geometry();
	
	        // POSITION OF MESH TO SHOOT RAYS OUT OF
	        geometry.vertices.push( bomb.position );
	        geometry.vertices.push( intersections[0].object.position );
	
			var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0x990000}));
	        scene.add(line);
	        setTimeout(function(){scene.remove(line);},1000);
	        
	        p1 = bomb.position.x;
	        p2 = bomb.position.y;
	        p3 = bomb.position.z;
	        q1 = intersections[0].object.position.x;
	        q2 = intersections[0].object.position.y;
	        q3 = intersections[0].object.position.z;
	        
	        distance = Math.floor( Math.sqrt( Math.pow(q1-p1,2) + Math.pow(q2-p2,2) + Math.pow(q3-p3,2) ) );
	        console.log( 'distance: ' + distance);
	        
	        if( distance <= player1.bombrange){
	        	for(i=0; i<objects.length; i++){
					if( objects[i].id == intersections[0].object.id )
						objects.splice(i,1);
				}
	        	scene.remove(intersections[0].object);
	        	// TODO check if player got blown up
	        	// TODO spawn PowerUp
	        	
	        }
	    }
	}
	
	////////////////////////////////////////////
	// Create and Draw Map 
	////////////////////////////////////////////
	function createMap(mapheight,mapwidth){
		//Create the board, setting random squares to be obstacles
		for (var x = 0; x < rows; x++){
			map[x] = [];
			board[x] = [];
			for (var y = 0; y < columns; y++) {
				//Give each square a 25% chance of being an obstacle
				var square = Math.floor(Math.random()*4);
				//0 = open, 1 = obstacle
				tile = new Object();
				if (square == 0){
					board[x][y] = 1;
					tile.passable = 1;
				} else {
					board[x][y] = 0;
					tile.passable = 0;
				}
				map[x][y] = tile;
			}
		}
		console.log(map);
	}
	
	function spawnBox(texture, x, y, z) {
			var box, material;
			
			material = Physijs.createMaterial(
				new THREE.MeshLambertMaterial({ map: texture }),
				.6, // medium friction
				.0 // low restitution
			);
			//material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
			//material.map.repeat.set( .5, .5 );
			
			//material = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'images/rocks.jpg' ) });
			
			box = new Physijs.BoxMesh(
				new THREE.CubeGeometry( 50, 50, 50 ),
				material,
				99999999 // mass: 0 = infinite
			);
			box.collisions = 0;
			
			box.position.set(
				x, // x
				y, // y
				z // z
			);
			
			box.castShadow = true;
			//box.addEventListener( 'collision', handleCollision );
			//box.addEventListener( 'ready', spawnBox );
			scene.add( box );
			objects.push();
			return box;
		}
});