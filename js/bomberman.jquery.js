$(document).ready(function() {
	Physijs.scripts.worker = '/js/vendor/physijs_worker.js';
	Physijs.scripts.ammo = '/js/vendor/ammo.js';
	
	var clientClickX, clientClickY;
	
	var container;

	var camera, scene, renderer, objects;
	var keyboard = new KeyboardState();
	var playerObj1;
	var playerObj2;

	var clock = new THREE.Clock();
	var maxAnisotropy = 16;
	
	var particleMaterial;
	
	var objects = [];
	var notSolidBombs = [];
	var bombs = [];
	var powerUps = [];
	var light;
	
	var crateTexture;
	
	// NEW
	var allow_diagonals = true;
	var board = [];
	var map = [];
	var fields = new Array();
	
	//Set the number of rows and columns for the board
	var rows = 19;
	var columns = 11;
	
	var litCube;
	
	var particleSystem;
	// create the particle variables
	
	
	var particleCount = 1800;
	var particles = new THREE.Geometry();
	var pMaterial = new THREE.ParticleBasicMaterial({
		color: Math.random() * 0x808008 + 0x808080,
		opacity: 0.3,
		size: 5,
		//map: THREE.ImageUtils.loadTexture("images/particle.png"),
		blending: THREE.AdditiveBlending, 
		transparent: true
	});

	createMap();
	
	init();
	animate();
	

	function init() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		scene = new Physijs.Scene;
		scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
		
		// Camera
		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 0, 730, 1 ); // y = 430
		camera.lookAt(scene.position);

		//controls = new THREE.OrbitControls( camera );
		
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
		crate3Texture = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
		crate3Texture.anisotropy = maxAnisotropy;
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
				if( board[i][j]==1){ // normal block
					fieldHeight = 50;
					yPosition = fieldHeight/2;
					
					x = (i+1)*50 - board.length*50/2 -25;
					z = (j+1)*50 - board[i].length*50/2 -25;
					y = yPosition;
					spawnBox(crateTexture, x, y, z, false);
				}
				else if( board[i][j]==2){ // solid block
					fieldHeight = 50;
					yPosition = fieldHeight/2;
					
					x = (i+1)*50 - board.length*50/2 -25;
					z = (j+1)*50 - board[i].length*50/2 -25;
					y = yPosition;
					spawnBox(crate3Texture, x, y, z, true);
				} 
			}
		}
		
		// TODO arena walls
		wallsTexture1 = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
		wallsTexture1.anisotropy = maxAnisotropy;
		
		material1 = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: wallsTexture1 }), 0, 0);
		material1.map.wrapS = material1.map.wrapT = THREE.RepeatWrapping;
		material1.map.repeat.set( rows, 1 );
		
		topBorder = new Physijs.BoxMesh(new THREE.CubeGeometry( rows*50, 20, 50 ), material1, 0);
		topBorder.position.set(0, 10, -columns*50/2-25);
		topBorder.castShadow = true;
				
		scene.add( topBorder );
		
		bottomBorder = new Physijs.BoxMesh(new THREE.CubeGeometry( rows*50, 20, 50 ), material1, 0);
		bottomBorder.position.set(0, 10, columns*50/2+25);
		bottomBorder.castShadow = true;
		
		scene.add( bottomBorder );
		
		wallsTexture2 = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
		wallsTexture2.anisotropy = maxAnisotropy;
		
		material2 = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: wallsTexture2 }), 0, 0);
		material2.map.wrapS = material2.map.wrapT = THREE.RepeatWrapping;
		material2.map.repeat.set( 1, columns+2 );
		
		leftBorder = new Physijs.BoxMesh(new THREE.CubeGeometry( 50, 20, (columns+2)*50 ), material2, 0);
		leftBorder.position.set(-rows*50/2-25, 10, 0);
		leftBorder.castShadow = true;
				
		scene.add( leftBorder );
		
		rightBorder = new Physijs.BoxMesh(new THREE.CubeGeometry( 50, 20, (columns+2)*50 ), material2, 0);
		rightBorder.position.set(rows*50/2+25, 10, 0);
		rightBorder.castShadow = true;
		
		scene.add( rightBorder );
		
		
		// PLAYERS
		var materialWhite = Physijs.createMaterial(
			new THREE.MeshPhongMaterial({ color: 0xeeeeee }),
			.0, // high friction
			.0 // low restitution
		);
		var materialBlue = Physijs.createMaterial(
			new THREE.MeshPhongMaterial({ color: 0x0000ff, shininess: 100.0 }),
			.0, // high friction
			.0 // low restitution
		);
		var materialRed = Physijs.createMaterial(
			new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100.0 }),
			.0, // high friction
			.0 // low restitution
		);
		
		playerObj1 = spawnPlayer(rows*-25 + 25, 25, columns*-25 + 25, materialBlue, 'Player1');
		
		
		//playerObj1.addEventListener( 'collision', function( other_object, relative_velocity, relative_rotation, contact_normal ) {
		    // `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
		  //  console.log('hit');
		//});
		
		playerObj2 = spawnPlayer(rows*25 - 25, 25, columns*25 - 25, materialRed, 'Player2');
		
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

		//document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		//document.addEventListener( 'mouseup', onDocumentMouseUp, false );
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
		//scene.add(particleSystem);
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
		
		renderer.render(scene, camera);
	};
	
	
	function update() {
		keyboard.update();
		
		var delta = clock.getDelta();
		
		// TODO capsule movement in function
		if (playerObj1.isActive){
			//playerObj1.__dirtyPosition = true;
			playerObj1.__dirtyRotation = true;
			playerObj1.setAngularFactor({ x: 0, y: 0, z: 0 });
			playerObj1.setLinearVelocity({ x: 0, y: 0, z: 0 });
			playerObj1.setLinearFactor({ x: 1, y: 0, z: 1 });
			playerObj1.position.y = 25;
			
			// Player 1
			s =  playerObj1.speed; // speed for single direction
			s2 = Math.sqrt( playerObj1.speed*playerObj1.speed/2 ); // speed for diagonal direction
			
			// diagonal
			if ( keyboard.pressed("A") && keyboard.pressed("W") )
				playerObj1.setLinearVelocity({ x: -s2, y: 0, z: -s2 });
			else if ( keyboard.pressed("A") && keyboard.pressed("S") )
				playerObj1.setLinearVelocity({ x: -s2, y: 0, z: s2 });
			else if ( keyboard.pressed("D") && keyboard.pressed("W") )
				playerObj1.setLinearVelocity({ x: s2, y: 0, z: -s2 });
			else if ( keyboard.pressed("D") && keyboard.pressed("S") )
				playerObj1.setLinearVelocity({ x: s2, y: 0, z: s2 });
			else {
				// up, down, left, right
				if ( keyboard.pressed("A") )
					playerObj1.setLinearVelocity({ x: -s, y: 0, z: 0 });
				if ( keyboard.pressed("D") )
					playerObj1.setLinearVelocity({ x: s, y: 0, z: 0 });
					
				if ( keyboard.pressed("W") )
					playerObj1.setLinearVelocity({ x: 0, y: 0, z: -s });
				if ( keyboard.pressed("S") )
					playerObj1.setLinearVelocity({ x: 0, y: 0, z: s });
			}
			if ( keyboard.down("shift") ){
				//playerObj1.material.color = new THREE.Color(0xff0000);
				//spawnBox(crateTexture, 25, 100, 25);
				spawnBomb(playerObj1);
			}
		}
		if (playerObj2.isActive){
			//playerObj2.__dirtyPosition = true;
			playerObj2.__dirtyRotation = true;
			playerObj2.setAngularFactor({ x: 0, y: 0, z: 0 });
			playerObj2.setLinearVelocity({ x: 0, y: 0, z: 0 });
			playerObj2.setLinearFactor({ x: 1, y: 0, z: 1 });
			playerObj2.position.y = 25;
			
			// Player 2
			s =  playerObj2.speed; // speed for single direction
			s2 = Math.sqrt( playerObj2.speed*playerObj2.speed/2 ); // speed for diagonal direction
			
			// diagonal
			if ( keyboard.pressed("left") && keyboard.pressed("up") )
				playerObj2.setLinearVelocity({ x: -s2, y: 0, z: -s2 });
			else if ( keyboard.pressed("left") && keyboard.pressed("down") )
				playerObj2.setLinearVelocity({ x: -s2, y: 0, z: s2 });
			else if ( keyboard.pressed("right") && keyboard.pressed("up") )
				playerObj2.setLinearVelocity({ x: s2, y: 0, z: -s2 });
			else if ( keyboard.pressed("right") && keyboard.pressed("down") )
				playerObj2.setLinearVelocity({ x: s2, y: 0, z: s2 });
			else {
				// up, down, left, right
				if ( keyboard.pressed("left") )
					playerObj2.setLinearVelocity({ x: -s, y: 0, z: 0 });
				if ( keyboard.pressed("right") )
					playerObj2.setLinearVelocity({ x: s, y: 0, z: 0 });
					
				if ( keyboard.pressed("up") )
					playerObj2.setLinearVelocity({ x: 0, y: 0, z: -s });
				if ( keyboard.pressed("down") )
					playerObj2.setLinearVelocity({ x: 0, y: 0, z: s });
			}
			if ( keyboard.down("space") ){
				//playerObj2.material.color = new THREE.Color(0xff0000);
				//spawnBox(crateTexture, 25, 100, 25);
				spawnBomb(playerObj2);
			}
		}
		
		// BOMBS BLOCKING BOX
		notSolidBombs = $.grep(notSolidBombs, function(bomb, index){
			// Player 1
			p1 = playerObj1.position.x;
	        p2 = playerObj1.position.y;
	        p3 = playerObj1.position.z;
	        q1 = bomb.position.x;
	        q2 = bomb.position.y;
	        q3 = bomb.position.z;
	        
	        distanceP1 = Math.floor( Math.sqrt( Math.pow(q1-p1,2) + Math.pow(q2-p2,2) + Math.pow(q3-p3,2) ) );
	        
	        // Player 2
			p1 = playerObj2.position.x;
	        p2 = playerObj2.position.y;
	        p3 = playerObj2.position.z;
	        q1 = bomb.position.x;
	        q2 = bomb.position.y;
	        q3 = bomb.position.z;
	        
	        distanceP2 = Math.floor( Math.sqrt( Math.pow(q1-p1,2) + Math.pow(q2-p2,2) + Math.pow(q3-p3,2) ) );
	        
			if( distanceP1 >= 40 && distanceP2 >= 40 ){
				material = Physijs.createMaterial(new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.5 }), 0, 0);
				
				bomb.box = new Physijs.BoxMesh(
					new THREE.CubeGeometry( 50, 20, 50 ),
					material,
					99999999999999 // mass: 0 = infinite
				);
				bomb.box.position = bomb.position;
				scene.add(bomb.box);
				
				return false;
			}
			
			return true;
			
		});
		
		// POWERUPS
		powerUps = $.grep(powerUps, function(value, index){
			// PowerUp Player 1
			p1 = playerObj1.position.x;
	        p2 = playerObj1.position.y;
	        p3 = playerObj1.position.z;
	        q1 = value.position.x;
	        q2 = value.position.y;
	        q3 = value.position.z;
	        
	        distance = Math.floor( Math.sqrt( Math.pow(q1-p1,2) + Math.pow(q2-p2,2) + Math.pow(q3-p3,2) ) );
			if( distance <= 40 ){
				if( value.type == "range" )
				playerObj1.bombRange = playerObj1.bombRange + 2;
				console.log('player 1 range: ' + playerObj1.bombRange);
				scene.remove(value);
				return false;
			}
			
			// PowerUp Player 2
			p1 = playerObj2.position.x;
	        p2 = playerObj2.position.y;
	        p3 = playerObj2.position.z;
	        q1 = value.position.x;
	        q2 = value.position.y;
	        q3 = value.position.z;
	        
	        distance = Math.floor( Math.sqrt( Math.pow(q1-p1,2) + Math.pow(q2-p2,2) + Math.pow(q3-p3,2) ) );
			if( distance <= 40 ){
				if( value.type == "range" )
				playerObj2.bombRange = playerObj2.bombRange + 2;
				console.log('palyer 2 range: ' + playerObj2.bombRange);
				scene.remove(value);
				return false;
			}
			
			return true;
		});
		
		scene.simulate();
		
		// controls
		//controls.update();
		
		TWEEN.update();
	}
	
	/*
	 * FUNCTIONS
	 */
	
	function spawnPlayer(x,y,z, material, name){
		if(name == null || name == '') name = 'Player';
		radius = 23;
		segments = 36;
		rings = 36;
		playerObj = new Physijs.SphereMesh( new THREE.SphereGeometry(radius, segments, rings), material, 10000 );
		playerObj.position.x = x; //rows*25 - 25;
		playerObj.position.y = y; //25;
		playerObj.position.z = z; //columns*25 - 25;
		playerObj.castShadow = true;
		
		playerObj.playerName = name;
		playerObj.isActive = true;
		playerObj.bombRange = 5;
		playerObj.bombLimit = 1;
		playerObj.activeBombs = 0;
		playerObj.speed = 200;
		
		playerObj.setLinearFactor(THREE.Vector3( 0, 0, 0 ));
		
		// Enable CCD if the object moves more than 1 meter in one simulation frame
		playerObj.setCcdMotionThreshold(100);
		
		// Set the radius of the embedded sphere such that it is smaller than the object
		playerObj.setCcdSweptSphereRadius(1.2);
		
		objects.push(playerObj);
		scene.add(playerObj);
		
		return playerObj;
	}
	
	function spawnBomb(playerObj){
	
		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// TODO FIXME bomb goes tru solid blox, maybe boxes, too, find reason and FIX!!!!

		var materialBlack = Physijs.createMaterial(
			new THREE.MeshPhongMaterial({ color: 0x090909 }),
			.9, // high friction
			.0 // low restitutions
		);
		
		radius = 20;
		segments = 36;
		rings = 36;
		// TODO use physijs mesh
		//var bomb = new Physijs.SphereMesh( new THREE.SphereGeometry(radius, segments, rings), materialBlack, 1000000 );
		var bomb = new THREE.Mesh( new THREE.SphereGeometry(radius, segments, rings), materialBlack, 100 );
		bomb.owner = playerObj;
		bomb.isBomb = true;
		//console.log(bombIndex);
		bomb.position.x = Math.round(playerObj.position.x/50)*50;
		bomb.position.y = 20;
		bomb.position.z = Math.round(playerObj.position.z/50)*50;
		
		bomb.castShadow = true;
		//bomb.setLinearFactor(THREE.Vector3( 0, 0, 0 ));
		
		// condition for not placing 2 bombs in the same spot
		addBomb = true;
		$.each(bombs,function(index, value){
			if(value != null && value.position.x == bomb.position.x && value.position.z == bomb.position.z)
				addBomb = false;
		});
		// check if bombLimit is exceeded
		if( playerObj.activeBombs >= playerObj.bombLimit ){
			addBomb = false;
		}
		
		console.log('Bomb spawned by player ' + playerObj.playerName);
		if(addBomb){
			bombs.push(bomb);
			bombIndex = jQuery.inArray(bomb, bombs);
			bomb.bombIndex = bombIndex;
			bomb.owner = playerObj;
			scene.add(bomb);
			startBomb(bombIndex);
			// make solid after player left object
			notSolidBombs.push(bomb);
			playerObj.activeBombs++;
			console.log(playerObj.activeBombs);
			console.log(playerObj);
		}
		
	}
	
	function startBomb(bombIndex){
		// TODO nice effects for explosions + sounds
		var thisBomb = bombs[bombIndex];
		var scale = { x : 1, y: 1, z: 1 };
		var target = { x : 1.5, y: 1.5, z: 1.2 };
		var tween = new TWEEN.Tween(scale).to(target, 4000);
		tween.easing(TWEEN.Easing.Elastic.InOut);
		tween.start();
		tween.onUpdate(function(){
			thisBomb.scale.x = scale.x;
			thisBomb.scale.y = scale.y;
			thisBomb.scale.z = scale.z;
		});
		
		thisBomb.timer = setTimeout(function(){
			detonateBomb(bombIndex);
		},3000); // time until explosion
	}
	function detonateBomb(bombIndex){
		if(bombs[bombIndex] != null){
			console.log('BOOM: ' + bombIndex);
			bomb = bombs[bombIndex];
	        // remove blocking box for bomb
			scene.remove(bomb.box);
			// remove bomb froms cene
			scene.remove(bomb);
	        
			// remove bomb from array
	        bombs[bombIndex] = null;
	        
			explosionRayCast(0,0,-1, bomb);
			explosionRayCast(-1,0,0, bomb);
			explosionRayCast(0,0,1, bomb);
			explosionRayCast(1,0,0, bomb);
			
			bomb.owner.activeBombs--;
			console.log(bomb.owner.playerName + ' has ' + bomb.owner.activeBombs + ' active bombs');
		}
	}
	
	function explosionRayCast(x,y,z, bomb){
		var raycaster = new THREE.Raycaster();
	    raycaster.ray.direction.set(x, y, z);
	    raycaster.ray.origin.set(bomb.position.x, 15, bomb.position.z);
	
	    var geometry = new THREE.Geometry();
		
	    intersections = raycaster.intersectObjects( objects );
	    if ( intersections.length > 0 ) {
	        var geometry = new THREE.Geometry();
	
	        // POSITION OF MESH TO SHOOT RAYS OUT OF
	        geometry.vertices.push( bomb.position );
	        geometry.vertices.push( intersections[0].object.position );
	
			//var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0x990000}));
	        //scene.add(line);
	        //setTimeout(function(){scene.remove(line);},1000);
	        
	        p1 = bomb.position.x;
	        p2 = bomb.position.y;
	        p3 = bomb.position.z;
	        q1 = intersections[0].object.position.x;
	        q2 = intersections[0].object.position.y;
	        q3 = intersections[0].object.position.z;
	        
	        distance = Math.floor( Math.sqrt( Math.pow(q1-p1,2) + Math.pow(q2-p2,2) + Math.pow(q3-p3,2) ) );
	        //console.log( 'distance: ' + distance);
	        
	        // IF SOMETHING IS IN RANGE
	        if( distance <= bomb.owner.bombRange/2*50){
	        	for(i=0; i<objects.length; i++){
					if( objects[i].id == intersections[0].object.id )
						objects.splice(i,1);
				}
				
				if( !intersections[0].object.solid ){
					if(Math.random() > 0.5)
						powerUps.push(spawnPowerUp(intersections[0].object.position.x, intersections[0].object.position.y, intersections[0].object.position.z) );
	        		scene.remove(intersections[0].object);
	        		
		        	intersections[0].object.isActive = false; // TODO only for Players
		        	if( intersections[0].object == playerObj1 ) console.log('Player 2 won!');
		        	if( intersections[0].object == playerObj2 ) console.log('Player 1 won!');
				}	
	        	
	        }
	        // DETONATION EFFECT
			// fire variables
	        radius = 20;
			segments = 18;
			rings = 18;
	        var materialYellow = new THREE.MeshPhongMaterial({ color: 0xffff00, opacity: 0.3, blending: THREE.AdditiveBlending, transparent: true });
			// fire effect 1
	        var fire1 = new THREE.Mesh( new THREE.SphereGeometry(radius, segments, rings), materialYellow);
			fire1.position.x = bomb.position.x;
			fire1.position.y = 20;
			fire1.position.z = bomb.position.z;
			fire1.castShadow = false;
			//fire.scale.x = 10;
			scene.add(fire1);
			setTimeout(function(){scene.remove(fire1);},500);
			
			var scale1 = { x : 1, y: 1, z: 1, opacity: 0.7 };
			var target1 = { x : bomb.owner.bombRange, y: 1, z: 1, opacity: 0.2 };
			var tween1 = new TWEEN.Tween(scale1).to(target1, 500);
			tween1.start();
			tween1.onUpdate(function(){
				fire1.scale.x = scale1.x;
				fire1.scale.y = scale1.y;
				fire1.scale.z = scale1.z;
				fire1.material.opacity = scale1.opacity;
			});
			// bomb light - TODO predefined light put in place when needed?
			
			// fire effect 2
	        var fire2 = new THREE.Mesh( new THREE.SphereGeometry(radius, segments, rings), materialYellow);
			fire2.position.x = bomb.position.x;
			fire2.position.y = 20;
			fire2.position.z = bomb.position.z;
			fire2.castShadow = false;
			//fire.scale.z = 10;
			scene.add(fire2);
			setTimeout(function(){scene.remove(fire2);},500);
			
			var scale2 = { x : 1, y: 1, z: 1, opacity: 0.7 };
			var target2 = { x : 1, y: 1, z: bomb.owner.bombRange, opacity: 0.0 };
			var tween2 = new TWEEN.Tween(scale2).to(target2, 500);
			tween2.start();
			tween2.onUpdate(function(){
				fire2.scale.x = scale2.x;
				fire2.scale.y = scale2.y;
				fire2.scale.z = scale2.z;
				fire2.material.opacity = scale2.opacity;
			});
	    }
	    
	    // chain reaction for bombs 
	    // TODO use objects array instead of separate bomb array to ensure only the first object (bomb/block/player) gets hit
	    // otherwise chain reactions will happen even if a block is between bombs
	    intersectionsBombs = raycaster.intersectObjects( bombs );
	   	if( intersectionsBombs.length >= 1 && intersectionsBombs[0].object.isBomb )  {
	   		console.log(intersectionsBombs[0].object.bombIndex);
    		detonateBomb(intersectionsBombs[0].object.bombIndex);
    	}
	}
	
	function spawnBox(texture, x, y, z, solid) {
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
			new THREE.CubeGeometry( 50, 20, 50 ),
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
		box.solid = solid;
		//box.addEventListener( 'collision', handleCollision );
		//box.addEventListener( 'ready', spawnBox );
		scene.add( box );
		objects.push(box);
		return box;
	}
	
	function spawnPowerUp(x, y, z) {
		// TODO more power up types (array) with different chances and effects
		var box, material;
		
		material = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
		//material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
		//material.map.repeat.set( .5, .5 );
		
		//material = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'images/rocks.jpg' ) });
		
		box = new THREE.Mesh(
			new THREE.CubeGeometry( 50, 50, 50 ),
			material
		);
		
		box.position.set(
			x, // x
			y, // y
			z // z
		);
		
		box.castShadow = true;
		box.type = "range";
		//box.addEventListener( 'collision', handleCollision );
		//box.addEventListener( 'ready', spawnBox );
		scene.add( box );
		objects.push();
		return box;
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
				if(x%2 == 1 && y%2 == 1) { //solid
					board[x][y] = 2;
					tile.passable = 0;
					tile.solid = 1;
				} else if (square == 0){ // destructible crate
					board[x][y] = 1;
					tile.passable = 1;
				} else { // empty
					board[x][y] = 0;
					tile.passable = 0;
				}
				map[x][y] = tile;
			}
		}
		// clear starting positions
		board[0][0] = 0;
		board[1][0] = 0;
		board[0][1] = 0;
		board[rows-1][columns-1] = 0;
		board[rows-2][columns-1] = 0;
		board[rows-1][columns-2] = 0;
		console.log(map);
	}
	
});