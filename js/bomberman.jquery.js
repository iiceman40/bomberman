Physijs.scripts.worker = '../bomberman/js/vendor/physijs_worker.js';
Physijs.scripts.ammo = '../vendor/ammo.js';

var container = document.createElement('div');
var camera, scene, renderer, stats;
var keyboard = new KeyboardState();
var playerObj1;
var playerObj2;
var players = [];
var maxAnisotropy = 16;
var objects = [];
var notSolidBombs = [];
var bombs = [];
var activePowerUps = [];
var light;
var crateTexture;
var board = [];
var map = [];
var rows = 17;
var columns = 11;
// standart sphere properties
var radius = 23;
var segments = 32;
var rings = 32;
var wallHeight = 50;

var options = {
	bumpmapping: true
}

fireTexture = new THREE.ImageUtils.loadTexture("textures/clean-fire.svg");
bombTexture = new THREE.ImageUtils.loadTexture("textures/bomb.svg");

var powerUpTypes = [
	{
		name:       'range',
		material:   new THREE.MeshPhongMaterial({ color: 0xFFFF00, shininess: 100.0, map: fireTexture }),
		chance:     1,
		effect: function(player){
			player.bombRange = player.bombRange * 2;
			console.log('range improoved to: ', player.bombRange);
		}
	},
	{
		name:       'limit',
		material:   new THREE.MeshPhongMaterial({ color: 0x0000FF, shininess: 100.0, map: bombTexture }),
		chance:     1,
		effect: function(player){
			player.bombLimit++;
			console.log('limit improoved to: ', player.bombLimit);
		}
	}
]


$(document).ready(function () {
	createMap();
	init();
	animate();
});


//////////////////////////////////////
// MAIN FUNCTIONS                   //
//////////////////////////////////////
function init() {
	document.body.appendChild(container);
	// Physics
	scene = new Physijs.Scene;
	scene.setGravity(new THREE.Vector3(0, -30, 0));
	// Camera
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.set(0, 600, 1); // y = 430
	camera.lookAt(scene.position);
	// Controls
	controls = new THREE.OrbitControls(camera);

	// Materials
	crate2Texture = new THREE.ImageUtils.loadTexture("textures/crate2.jpg");
	crate2Texture.wrapS = crate2Texture.wrapT = THREE.RepeatWrapping;
	crate2Texture.repeat.set(rows, columns);
	crate2Texture.anisotropy = maxAnisotropy;

	crateTexture = new THREE.ImageUtils.loadTexture("textures/crate.jpg");
	crateTexture.anisotropy = maxAnisotropy;
	if(options.bumpmapping)
		crateTextureBump = new THREE.ImageUtils.loadTexture("textures/crate_bump.jpg");

	solidBlockTexture = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
	solidBlockTexture.anisotropy = maxAnisotropy;
	if(options.bumpmapping)
		solidBlockTextureBump = new THREE.ImageUtils.loadTexture("textures/cobble_cut_bump.jpg");

	materialFloor = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: crate2Texture }), .0, .0);
	materialWall = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: crateTexture }), .0, .0);

	// build plane
	plane = new Physijs.BoxMesh(new THREE.BoxGeometry(rows * 50, 1, columns * 50), materialFloor, 0); // geometry, material, mass
	plane.position.y = -1;
	plane.receiveShadow = true;
	scene.add(plane);
	// add boxes
	for (i = 0; i < board.length; i++) {
		for (j = 0; j < board[i].length; j++) {
			if (board[i][j] == 1) { // normal block
				fieldHeight = 50;
				yPosition = fieldHeight / 2;
				x = (i + 1) * 50 - board.length * 50 / 2 - 25;
				z = (j + 1) * 50 - board[i].length * 50 / 2 - 25;
				y = yPosition;
				spawnBox(crateTexture, x, y, z, false, (options.bumpmapping)?crateTextureBump:false);
			}
			else if (board[i][j] == 2) { // solid block
				fieldHeight = 50;
				yPosition = fieldHeight / 2;
				x = (i + 1) * 50 - board.length * 50 / 2 - 25;
				z = (j + 1) * 50 - board[i].length * 50 / 2 - 25;
				y = yPosition;
				spawnBox(solidBlockTexture, x, y, z, true, (options.bumpmapping)?solidBlockTextureBump:false);
			}
		}
	}

	// Arena walls
	wallsTexture1 = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
	wallsTexture1.anisotropy = maxAnisotropy;
	material1 = Physijs.createMaterial(new THREE.MeshPhongMaterial({ map: wallsTexture1, bumpMap: (options.bumpmapping)?solidBlockTextureBump:false }), 0, 0);
	material1.map.wrapS = material1.map.wrapT = THREE.RepeatWrapping;
	material1.map.repeat.set(rows, 1);
	if(options.bumpmapping){
		material1.bumpMap.wrapS = material1.bumpMap.wrapT = THREE.RepeatWrapping;
		material1.bumpMap.repeat.set(rows, 1);
	}

	topBorder = new Physijs.BoxMesh(new THREE.BoxGeometry(rows * 50, wallHeight, 50), material1, 0);
	topBorder.position.set(0, wallHeight/2, -columns * 50 / 2 - 25);
	topBorder.castShadow = true;
	scene.add(topBorder);
	bottomBorder = new Physijs.BoxMesh(new THREE.BoxGeometry(rows * 50, wallHeight, 50), material1, 0);
	bottomBorder.position.set(0, wallHeight/2, columns * 50 / 2 + 25);
	bottomBorder.castShadow = true;
	scene.add(bottomBorder);

	wallsTexture2 = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
	wallsTexture2.anisotropy = maxAnisotropy;
	material2 = Physijs.createMaterial(new THREE.MeshPhongMaterial({ map: wallsTexture2, bumpMap: (options.bumpmapping)?solidBlockTextureBump:false }), 0, 0);
	material2.map.wrapS = material2.map.wrapT = THREE.RepeatWrapping;
	material2.map.repeat.set(1, columns);
	if(options.bumpmapping){
		material2.bumpMap.wrapS = material2.bumpMap.wrapT = THREE.RepeatWrapping;
		material2.bumpMap.repeat.set(1, columns + 2);
	}

	wallsTexture2b = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
	wallsTexture2b.anisotropy = maxAnisotropy;
	material2b = Physijs.createMaterial(new THREE.MeshPhongMaterial({ map: wallsTexture2b, bumpMap: (options.bumpmapping)?solidBlockTextureBump:false }), 0, 0); // todo fix bumpmapping
	material2b.map.wrapS = material2b.map.wrapT = THREE.RepeatWrapping;
	material2b.map.repeat.set(rows, 1);

	wallsTexture = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
	wallsTexture.anisotropy = maxAnisotropy;
	material = Physijs.createMaterial(new THREE.MeshPhongMaterial({ map: wallsTexture, bumpMap: (options.bumpmapping)?solidBlockTextureBump:false }), 0, 0);

	materials = new THREE.MeshFaceMaterial([
		material1, // rechts
		material2b, // links
		material2, //oben
		material2b, // unten
		material, // vorn
		material // hinten
	]);

	leftBorder = new Physijs.BoxMesh( new THREE.BoxGeometry(50, wallHeight, (columns + 2) * 50 ), materials, 0 );
	leftBorder.position.set(-rows * 50 / 2 - 25, wallHeight/2, 0);
	leftBorder.castShadow = true;
	scene.add(leftBorder);

	rightBorder = new Physijs.BoxMesh( new THREE.BoxGeometry(50, wallHeight, (columns + 2) * 50 ), materials, 0 );
	rightBorder.position.set(rows * 50 / 2 + 25, wallHeight/2, 0);
	rightBorder.castShadow = true;
	scene.add(rightBorder);

	//////////////////////////////////////
	// PLAYERS                          //
	//////////////////////////////////////
	// Create the sprite
	/*
	 var playerTexture = THREE.ImageUtils.loadTexture('/images/bman_v2.svg');
	 var playerMaterial = new THREE.SpriteMaterial({ map: playerTexture, useScreenCoordinates: true  });
	 var sprite = new THREE.Sprite(playerMaterial);
	 sprite.scale.set(51, 60.7, 1); // imageWidth, imageHeight
	 sprite.position.set(0, 50, 0);
	 scene.add(sprite);
	 */
	bmanTexture = new THREE.ImageUtils.loadTexture("textures/bman1.jpg");
	bmanTextureBump = new THREE.ImageUtils.loadTexture("textures/bman1_bump.jpg");
	var materialBlue = Physijs.createMaterial(new THREE.MeshPhongMaterial({ reflectivity: 0.5, map: bmanTexture, bumpMap: (options.bumpmapping)?bmanTextureBump:false,/*color: 0x0000ff,*/ shininess: 10.0, bumpScale  :  0.45 }), .0, .0);
	var materialRed = Physijs.createMaterial(new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100.0 }), .0, .0);
	playerObj1 = spawnPlayer(rows * -25 + 25, 25, columns * -25 + 25, materialBlue, 'Player1');
	playerObj1.controls = {
		up:     "W",
		down:   "S",
		left:   "A",
		right:  "D",
		bomb:   "shift"
	};
	players.push(playerObj1);

	playerObj2 = spawnPlayer(rows * 25 - 25, 25, columns * 25 - 25, materialRed, 'Player2');
	playerObj2.controls = {
		up:     "up",
		down:   "down",
		left:   "left",
		right:  "right",
		bomb:   "space"
	};
	players.push(playerObj2);

	//////////////////////////////////////
	// LIGHT AND SHADOWS                //
	//////////////////////////////////////
	light = new THREE.SpotLight(0xffeeee, 1.5);
	light.position = {x:0, y: 800, z:0};
	// shadow camera
	//light.shadowCameraVisible = true;
	light.shadowCameraRight = 1300;
	light.shadowCameraLeft = -1300;
	light.shadowCameraTop = 1300;
	light.shadowCameraBottom = -1300;
	light.shadowCameraNear = 500;
	light.shadowCameraFar = 4000;
	light.shadowCameraFov = 70;
	// enable shadows for a light
	light.castShadow = true;
	light.shadowDarkness = 0.4;
	light.shadowMapWidth = 4096; // default is 512
	light.shadowMapHeight = 4096; // default is 512
	scene.add(light);

	//////////////////////////////////////
	// RENDERER                         //
	//////////////////////////////////////
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.shadowMapEnabled = true; // enable shadows on the renderer
	renderer.shadowMapSoft = true; // to antialias the shadow
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );
	window.addEventListener('resize', onWindowResize, false);

}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
//////////////////////////////////////
// ANIMATION                        //
//////////////////////////////////////
function animate() {
	requestAnimationFrame(animate);
	render();
	update();
}
function render() {
	var seconds = Date.now() / 1000;
	var piPerSeconds = seconds * Math.PI;
	light.position.x = Math.cos(piPerSeconds * 0.05) * 1000;
	light.position.y = 800;
	light.position.z = Math.sin(piPerSeconds * 0.05) * 1000;
	renderer.render(scene, camera);
	stats.update();
};
function update() {
	handleNotSolidBombs();
	handlePowerUps();
	TWEEN.update();
	controls.update();
	keyboard.update();
	handlePlayerMovement();
	scene.simulate(); // run physics
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS                                                                                                                                   //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function handleNotSolidBombs() {
	// BOMBS BLOCKING BOX
	notSolidBombs = $.grep(notSolidBombs, function (bomb, index) {
		distanceP1 = getDistance(playerObj1, bomb);
		distanceP2 = getDistance(playerObj2, bomb);
		if (distanceP1 >= 40 && distanceP2 >= 40) {
			material = Physijs.createMaterial(new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.5 }), 0, 0);
			bomb.box = new Physijs.BoxMesh(new THREE.BoxGeometry(50, wallHeight, 50), material, 0);
			bomb.box.position = bomb.position;
			scene.add(bomb.box);
			return false;
		}
		return true;
	});
}
function getDistance(obj1, obj2){
	return Math.floor(Math.sqrt(Math.pow(obj2.position.x - obj1.position.x, 2) + Math.pow(obj2.position.y - obj1.position.y, 2) + Math.pow(obj2.position.z - obj1.position.z, 2)));
}
function handlePowerUps() {
	//activePowerUps = $.grep(activePowerUps, function (value, index) {
	$.each(activePowerUps, function(key, powerUp){
		$.each(players, function(key, player){
			// PowerUp Player 1
			p1 = player.position.x;
			p2 = player.position.y;
			p3 = player.position.z;
			q1 = powerUp.position.x;
			q2 = powerUp.position.y;
			q3 = powerUp.position.z;
			distance = Math.floor(Math.sqrt(Math.pow(q1 - p1, 2) + Math.pow(q2 - p2, 2) + Math.pow(q3 - p3, 2)));
			if (distance <= 40) {
				// apply power up
				powerUp.effect(player);
				// remove it from the scene
				scene.remove(powerUp);
				// remove it from active power ups
				activePowerUps = $.grep(activePowerUps, function(value) {
					return value != powerUp;
				});
			}
		});
	});
}
function handlePlayerMovement() {
	for(i=0;i<players.length;i++){
		player = players[i];
		con = player.controls;
		if (player.isActive) {
			player.setAngularFactor(new THREE.Vector3(0,0,0));
			//player.setLinearVelocity(new THREE.Vector3(0,0,0));
			player.setLinearFactor(new THREE.Vector3(1,0,1));
			//player.position.y = 25;

			vectorsCombined = new THREE.Vector3(0, 0, 0);

			// up, down, left, right
			if (keyboard.pressed(con.left))
				vectorsCombined.add(new THREE.Vector3(-1, 0, 0));
			if (keyboard.pressed(con.right))
				vectorsCombined.add(new THREE.Vector3(1, 0, 0));
			if (keyboard.pressed(con.up))
				vectorsCombined.add(new THREE.Vector3(0, 0, -1));
			if (keyboard.pressed(con.down))
				vectorsCombined.add(new THREE.Vector3(0, 0, 1));

			//console.log(player.speed);
			//player.applyCentralImpulse(vectorsCombined.setLength(player.speed));
			movement = vectorsCombined.setLength(player.speed);
			if( movement.x != player.getLinearVelocity().x ||
				movement.z != player.getLinearVelocity().z){
				player.setLinearVelocity(movement);
				//player.setLinearVelocity(new THREE.Vector3(0,0,0));
				//player.applyCentralForce(movement);
				console.log('change direction', player.getLinearVelocity());
			}

			if (keyboard.down(con.bomb)) {
				spawnBomb(player);
			}
		}
	}
}

function spawnPlayer(x, y, z, material, name) {
	if (name == null || name == '') name = 'Player';
	player = new Physijs.SphereMesh(new THREE.SphereGeometry(radius, segments, rings), material, 1);
	player.position.set(x, y, z);
	player.castShadow = true;
	player.playerName = name;
	player.isActive = true;
	player.bombRange = 5;
	player.bombLimit = 1;
	player.activeBombs = 0;
	player.speed = 200;
	player.setLinearFactor(THREE.Vector3(0, 0, 0));
	player.setCcdMotionThreshold(100); // Enable CCD if the object moves more than 1 meter in one simulation frame
	player.setCcdSweptSphereRadius(1.2); // Set the radius of the embedded sphere such that it is smaller than the object
	player.rotation.y = -90*(Math.PI/180);
	player.rotation.z = 75*(Math.PI/180);
	objects.push(player);
	scene.add(player);
	return player;
}

function spawnBomb(playerObj) {
	radius = 20;
	var materialBlack = Physijs.createMaterial(new THREE.MeshPhongMaterial({ color: 0x090909 }), .9, .0);
	var bomb = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), materialBlack, 100);
	bomb.owner = player;
	bomb.isBomb = true;
	bomb.position.x = Math.round(player.position.x / 50) * 50;
	bomb.position.y = 20;
	bomb.position.z = Math.round(player.position.z / 50) * 50;
	bomb.castShadow = true;
	// condition for not placing 2 bombs in the same spot
	addBomb = true;
	$.each(bombs, function (index, value) {
		if (value != null && value.position.x == bomb.position.x && value.position.z == bomb.position.z)
			addBomb = false;
	});
	// check if bombLimit is exceeded
	if (player.activeBombs >= player.bombLimit) {
		addBomb = false;
	}
	if (addBomb) {
		bombs.push(bomb);
		bombIndex = jQuery.inArray(bomb, bombs);
		bomb.bombIndex = bombIndex;
		bomb.owner = player;
		scene.add(bomb);
		startBomb(bombIndex);
		// make solid after player left object
		notSolidBombs.push(bomb);
		player.activeBombs++;
	}
}
function startBomb(bombIndex) {
	// TODO nice effects for explosions + sounds
	var thisBomb = bombs[bombIndex];
	var scale = { x: 1, y: 1, z: 1 };
	var target = { x: 1.5, y: 1.5, z: 1.2 };
	var tween = new TWEEN.Tween(scale).to(target, 4000);
	tween.easing(TWEEN.Easing.Elastic.InOut);
	tween.start();
	tween.onUpdate(function () {
		thisBomb.scale.x = scale.x;
		thisBomb.scale.y = scale.y;
		thisBomb.scale.z = scale.z;
	});
	thisBomb.timer = setTimeout(function () {
		detonateBomb(bombIndex);
	}, 3000); // time until explosion
}
function detonateBomb(bombIndex) {
	if (bombs[bombIndex] != null) {
		console.log('BOOM: ' + bombIndex);
		bomb = bombs[bombIndex];
		// remove blocking box for bomb
		scene.remove(bomb.box);
		// remove bomb from scene
		scene.remove(bomb);
		// remove bomb from array
		bombs[bombIndex] = null;
		explosionRayCast(0, 0, -1, bomb);
		explosionRayCast(-1, 0, 0, bomb);
		explosionRayCast(0, 0, 1, bomb);
		explosionRayCast(1, 0, 0, bomb);
		bomb.owner.activeBombs--;
		console.log(bomb.owner.playerName + ' has ' + bomb.owner.activeBombs + ' active bombs');
	}
}
function explosionRayCast(x, y, z, bomb) {
	var raycaster = new THREE.Raycaster();
	raycaster.ray.direction.set(x, y, z);
	raycaster.ray.origin.set(bomb.position.x, 15, bomb.position.z);
	var intersections = raycaster.intersectObjects(objects);
	if (intersections.length > 0) {
		var geometry = new THREE.Geometry();
		geometry.vertices.push(bomb.position);
		geometry.vertices.push(intersections[0].object.position);
		var distance = getDistance(bomb,intersections[0].object);
		// IF SOMETHING IS IN RANGE
		if (distance <= bomb.owner.bombRange / 2 * 50) {
			for (i = 0; i < objects.length; i++) {
				if (objects[i].id == intersections[0].object.id)
					objects.splice(i, 1);
			}
			if (!intersections[0].object.solid) {
				if (Math.random() > 0.5)
					activePowerUps.push(spawnPowerUp(intersections[0].object.position.x, intersections[0].object.position.y, intersections[0].object.position.z));
				scene.remove(intersections[0].object);
				intersections[0].object.isActive = false; // TODO only for Players
				if (intersections[0].object == playerObj1) console.log('Player 2 won!');
				if (intersections[0].object == playerObj2) console.log('Player 1 won!');
			}
		}
		// DETONATION EFFECT
		// fire variables
		radius = 20;
		var materialYellow = new THREE.MeshPhongMaterial({ color: 0xffff00, opacity: 0.3, blending: THREE.AdditiveBlending, transparent: true });
		// fire effect 1
		var fire1 = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), materialYellow);
		fire1.position.x = bomb.position.x;
		fire1.position.y = 20;
		fire1.position.z = bomb.position.z;
		fire1.castShadow = false;
		//fire.scale.x = 10;
		scene.add(fire1);
		setTimeout(function () {
			scene.remove(fire1);
		}, 500);
		var scale1 = { x: 1, y: 1, z: 1, opacity: 0.7 };
		var target1 = { x: bomb.owner.bombRange, y: 1, z: 1, opacity: 0.2 };
		var tween1 = new TWEEN.Tween(scale1).to(target1, 500);
		tween1.start();
		tween1.onUpdate(function () {
			fire1.scale.x = scale1.x;
			fire1.scale.y = scale1.y;
			fire1.scale.z = scale1.z;
			fire1.material.opacity = scale1.opacity;
		});
		// fire effect 2
		var fire2 = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), materialYellow);
		fire2.position.x = bomb.position.x;
		fire2.position.y = 20;
		fire2.position.z = bomb.position.z;
		fire2.castShadow = false;
		scene.add(fire2);
		setTimeout(function () {
			scene.remove(fire2);
		}, 500);
		var scale2 = { x: 1, y: 1, z: 1, opacity: 0.7 };
		var target2 = { x: 1, y: 1, z: bomb.owner.bombRange, opacity: 0.0 };
		var tween2 = new TWEEN.Tween(scale2).to(target2, 500);
		tween2.start();
		tween2.onUpdate(function () {
			fire2.scale.x = scale2.x;
			fire2.scale.y = scale2.y;
			fire2.scale.z = scale2.z;
			fire2.material.opacity = scale2.opacity;
		});
	}
	// chain reaction for bombs
	// TODO use objects array instead of separate bomb array to ensure only the first object (bomb/block/player) gets hit
	// otherwise chain reactions will happen even if a block is between bombs
	intersectionsBombs = raycaster.intersectObjects(bombs);
	if (intersectionsBombs.length >= 1 && intersectionsBombs[0].object.isBomb) {
		console.log(intersectionsBombs[0].object.bombIndex);
		detonateBomb(intersectionsBombs[0].object.bombIndex);
	}
}

function spawnBox(texture, x, y, z, solid, bumpmap) {
	var material = Physijs.createMaterial(
		new THREE.MeshPhongMaterial({
			shininess  :  20,
			bumpMap    :  (options.bumpmapping)?bumpmap:false,
			bumpScale  :  0.55,
			map: texture
		}),
		.0, // medium friction
		.0 // low restitution
	);
	var box = new Physijs.BoxMesh(
		new THREE.BoxGeometry(50, wallHeight, 50),
		material,
		0 // mass: 0 = infinite
	);
	box.collisions = 0;
	box.position.set(x, y, z);
	box.castShadow = true;
	box.solid = solid;
	//box.addEventListener( 'collision', handleCollision );
	//box.addEventListener( 'ready', spawnBox );
	scene.add(box);
	objects.push(box);
	return box;
}

function spawnPowerUp(x, y, z) {
	pot = [];
	$.each(powerUpTypes, function(key, powerup){
		for(i=0;i<powerup.chance;i++)
			pot.push(powerup);
	});
	randomId = Math.floor((Math.random() * pot.length));

	var box = new THREE.Mesh(
		new THREE.BoxGeometry(50, wallHeight, 50),
		pot[randomId].material
	);

	box.type = pot[randomId].name;
	box.effect = pot[randomId].effect;

	box.position.set(x, y, z);
	box.castShadow = true;
	scene.add(box);
	objects.push();
	return box;
}

////////////////////////////////////////////
// Create and Draw Map
////////////////////////////////////////////
function createMap(mapheight, mapwidth) {
	//Create the board, setting random squares to be obstacles
	for (var x = 0; x < rows; x++) {
		map[x] = [];
		board[x] = [];
		for (var y = 0; y < columns; y++) {
			//Give each square a 25% chance of being an obstacle
			var square = Math.floor(Math.random() * 4);
			//0 = open, 1 = obstacle
			tile = new Object();
			if (x % 2 == 1 && y % 2 == 1) { //solid
				board[x][y] = 2;
				tile.passable = 0;
				tile.solid = 1;
			} else if (square == 0) { // destructible crate
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
	board[rows - 1][columns - 1] = 0;
	board[rows - 2][columns - 1] = 0;
	board[rows - 1][columns - 2] = 0;
}