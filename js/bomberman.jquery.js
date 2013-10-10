$(document).ready(function() {
	var clientClickX, clientClickY;
	
	var container;

	var camera, scene, renderer, objects;
	var keyboard = new KeyboardState();
	var playerObj;

	var clock = new THREE.Clock();
	var maxAnisotropy = 16;
	
	var particleMaterial;

	var objects = [];
	var light;
	
	// NEW
	var allow_diagonals = true;
	var board = [];
	var map = []
	var fields = new Array();
	
	//Set the number of rows and columns for the board
	var rows = 40;
	var columns = 40;
	
	var litCube; 

	createMap();
	
	init();
	animate(new Date().getTime());
	

	function init() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		scene = new THREE.Scene();
		
		// Camera
		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 0, 300, 300 );
		camera.lookAt(scene.position);

		controls = new THREE.OrbitControls( camera );
		
		// Materials
		var crate2Texture = new THREE.ImageUtils.loadTexture("textures/crate2.jpg");
		crate2Texture.wrapS = crate2Texture.wrapT = THREE.RepeatWrapping;
		crate2Texture.repeat.set( rows, columns );
		crate2Texture.anisotropy = maxAnisotropy;
		var materialFloor = new THREE.MeshLambertMaterial({
			map: crate2Texture
		});
		var crateTexture = new THREE.ImageUtils.loadTexture("textures/crate.jpg");
		crateTexture.anisotropy = maxAnisotropy;
		var materialWall = new THREE.MeshLambertMaterial({
			map: crateTexture
		});
		
		// build plane
		plane = new THREE.Mesh( new THREE.PlaneGeometry( rows*50, columns*50, 10, 10 ), materialFloor );
		plane.rotation.x = - Math.PI / 2;
		plane.castShadow = true;
		plane.receiveShadow = true;
		scene.add( plane );
		
		for(i=0;i<board.length;i++){
			for(j=0;j<board[i].length;j++){
				if( board[i][j]==1){
					fieldHeight = 50;
					yPosition = fieldHeight/2;
					material = materialWall;
					
					var field = new THREE.Mesh(	new THREE.CubeGeometry(50,fieldHeight,50), material	);
					field.position.x = (i+1)*50 - board.length*50/2 -25;
					field.position.z = (j+1)*50 - board[i].length*50/2 -25;
					field.position.y = yPosition;
					field.castShadow = true;
					field.receiveShadow = true;
					scene.add( field );
					objects.push( field );
				} 
				
			}
		}
		
		// PLAYER
		var materialWhite = new THREE.MeshPhongMaterial({
			color: 0xeeeeee
		});
		
		radius = 25;
		segments = 36;
		rings = 36;
		playerObj = new THREE.Mesh( new THREE.SphereGeometry(radius, segments, rings), materialWhite );
		playerObj.position.x = 25
		playerObj.position.y = 25
		playerObj.position.z = 25
		// add the sphere to the scene
		scene.add(playerObj);
		
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
		light.shadowCameraVisible = true;
		
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
		render();
		update();
	}
	
	function render() {
		var seconds = Date.now()/1000
		var piPerSeconds = seconds * Math.PI;
		
		light.position.x = Math.cos(piPerSeconds*0.05)*1000;
		light.position.y = 800;
		light.position.z = Math.sin(piPerSeconds*0.05)*1000;
		
		litCube.position = light.position;
		
		renderer.render(scene, camera);
	};
	
	
	function update() {
		keyboard.update();
	
		var moveDistance = 50 * clock.getDelta(); 
	
		if ( keyboard.pressed("A") )
			playerObj.translateX( -moveDistance );
			
		if ( keyboard.pressed("D") )
			playerObj.translateX(  moveDistance );
			
		if ( keyboard.pressed("W") )
			playerObj.translateZ( -moveDistance );
			
		if ( keyboard.pressed("S") )
			playerObj.translateZ(  moveDistance );
			
		if ( keyboard.down("R") )
			playerObj.material.color = new THREE.Color(0xff0000);
		if ( keyboard.up("R") )
			playerObj.material.color = new THREE.Color(0x0000ff);
		
		
		
		// controls
		controls.update();
	}
	
	/*
	 * FUNCTIONS
	 */
	////////////////////////////////////////////
	// Create and Draw Map 
	////////////////////////////////////////////
	function createMap(mapheight,mapwidth){
		//Create the board, setting random squares to be obstacles
		for (var x = 0; x < columns; x++)
		{
			map[x] = [];
			board[x] = [];
			for (var y = 0; y < rows; y++) {
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
});