var clientClickX, clientClickY;
var container = document.createElement('div');
var camera, scene, renderer, stats;
var keyboard = new KeyboardState();
var playerObj1;
var playerObj2;
var maxAnisotropy = 16;
var objects = [];
var notSolidBombs = [];
var bombs = [];
var powerUps = [];
var light;
var crateTexture;
var board = [];
var map = [];
var rows = 19;
var columns = 11;
// standart sphere properties
var radius = 25;
var segments = 18;
var rings = 18;

var world = new CANNON.World();
world.gravity.set(0,-10,0);
world.broadphase = new CANNON.NaiveBroadphase();
//world.iterations = 10;
var timeStep=1/60;

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
	scene = new THREE.Scene();
	// Camera
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.set(0, 730, 1); // y = 430
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
	solidBlockTexture = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
	solidBlockTexture.anisotropy = maxAnisotropy;
	materialFloor = new THREE.MeshLambertMaterial({ map: crate2Texture });
	materialWall = new THREE.MeshLambertMaterial({ map: crateTexture });
	// Build plane
	plane = new THREE.Mesh(new THREE.BoxGeometry(rows * 50, 1, columns * 50),materialFloor);
	plane.position.y = -1;
	scene.add(plane);

	var groundShape = new CANNON.Plane();
	var groundBody = new CANNON.RigidBody(0,groundShape);
	groundBody.position.set(0,0,0);
	var rot = new CANNON.Vec3(0,1,0);
	groundBody.quaternion.setFromAxisAngle(rot,(Math.PI));
	groundBody.quaternion.copy(plane.quaternion);
	groundBody.position.copy(plane.position);
	world.add(groundBody);

	for (i = 0; i < board.length; i++) {
		for (j = 0; j < board[i].length; j++) {
			if (board[i][j] == 1) { // normal block
				fieldHeight = 50;
				yPosition = fieldHeight / 2;
				x = (i + 1) * 50 - board.length * 50 / 2 - 25;
				z = (j + 1) * 50 - board[i].length * 50 / 2 - 25;
				y = yPosition;
				board[i][j] = spawnBox(crateTexture, x, y, z, false);
			}
			else if (board[i][j] == 2) { // solid block
				fieldHeight = 50;
				yPosition = fieldHeight / 2;
				x = (i + 1) * 50 - board.length * 50 / 2 - 25;
				z = (j + 1) * 50 - board[i].length * 50 / 2 - 25;
				y = yPosition;
				board[i][j] = spawnBox(solidBlockTexture, x, y, z, true);
			}
		}
	}
	console.log(board);
	// Arena walls
	wallsTexture1 = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
	wallsTexture1.anisotropy = maxAnisotropy;
	material1 = new THREE.MeshLambertMaterial({ map: wallsTexture1 });
	material1.map.wrapS = material1.map.wrapT = THREE.RepeatWrapping;
	material1.map.repeat.set(rows, 1);
	topBorder = new THREE.Mesh(new THREE.BoxGeometry(rows * 50, 20, 50), material1);
	topBorder.position.set(0, 10, -columns * 50 / 2 - 25);
	topBorder.castShadow = true;
	scene.add(topBorder);
	bottomBorder = new THREE.Mesh(new THREE.BoxGeometry(rows * 50, 20, 50), material1);
	bottomBorder.position.set(0, 10, columns * 50 / 2 + 25);
	bottomBorder.castShadow = true;
	scene.add(bottomBorder);
	wallsTexture2 = new THREE.ImageUtils.loadTexture("textures/cobble_cut.jpg");
	wallsTexture2.anisotropy = maxAnisotropy;
	material2 = new THREE.MeshLambertMaterial({ map: wallsTexture2 });
	material2.map.wrapS = material2.map.wrapT = THREE.RepeatWrapping;
	material2.map.repeat.set(1, columns + 2);
	leftBorder = new THREE.Mesh(new THREE.BoxGeometry(50, 20, (columns + 2) * 50), material2);
	leftBorder.position.set(-rows * 50 / 2 - 25, 10, 0);
	leftBorder.castShadow = true;
	scene.add(leftBorder);
	rightBorder = new THREE.Mesh(new THREE.BoxGeometry(50, 20, (columns + 2) * 50), material2);
	rightBorder.position.set(rows * 50 / 2 + 25, 10, 0);
	rightBorder.castShadow = true;
	scene.add(rightBorder);
	//////////////////////////////////////
	// PLAYERS                          //
	//////////////////////////////////////
	// Create the sprite
	//var playerTexture = THREE.ImageUtils.loadTexture('/images/bman_v2.svg');
	//var playerMaterial = new THREE.SpriteMaterial({ map: playerTexture, useScreenCoordinates: true  });
	//var sprite = new THREE.Sprite(playerMaterial);
	//sprite.scale.set(51, 60.7, 1); // imageWidth, imageHeight
	//sprite.position.set(0, 50, 0);
	//scene.add(sprite);
	var materialBlue = new THREE.MeshPhongMaterial({ color: 0x0000ff, shininess: 100.0 });
	var materialRed = new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100.0 });
	playerObj1 = spawnPlayer(rows * -25 + 25, 25, columns * -25 + 25, materialBlue, 'Player1');
	playerObj2 = spawnPlayer(rows * 25 - 25, 25, columns * 25 - 25, materialRed, 'Player2');

	//////////////////////////////////////
	// LIGHT AND SHADOWS                //
	//////////////////////////////////////
	light = new THREE.SpotLight(0xffeeee, 1);
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
	update();
	updatePhysics();
	requestAnimationFrame(animate);
	render();
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
function updatePhysics() {

	// Step the physics world
	world.step(timeStep);

	// Copy coordinates from Cannon.js to Three.js
	// TODO for each player copy the coordinates
	playerObj1.sphereBody.position.copy(playerObj1.position);
	//playerObj1.sphereBody.quaternion.copy(playerObj1.quaternion);
	for(i=0; i<objects.length; i++){
		if(objects[i].isBox){
			objects[i].boxBody.position.copy(objects[i].position);
			//objects[i].boxBody.quaternion.copy(objects[i].quaternion);
		}
	}

}
function update() {
	keyboard.update();
	handlePlayerMovement();
	handleNotSolidBombs();
	handlePowerUps();
	controls.update();
	TWEEN.update();
}
//////////////////////////////////////
// HELPER FUNCTIONS                 //
//////////////////////////////////////
function getDistance(obj1, obj2){
	return Math.floor(Math.sqrt(Math.pow(obj2.position.x - obj1.position.x, 2) + Math.pow(obj2.position.y - obj1.position.y, 2) + Math.pow(obj2.position.z - obj1.position.z, 2)));
}
function handleNotSolidBombs() {
	// BOMBS BLOCKING BOX
	notSolidBombs = $.grep(notSolidBombs, function (bomb, index) {
		distanceP1 = getDistance(playerObj1, bomb);
		distanceP2 = getDistance(playerObj2, bomb);
		if (distanceP1 >= 40 && distanceP2 >= 40) {
			material = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.5 });
			bomb.box = new THREE.Mesh(new THREE.BoxGeometry(50, 20, 50), material);
			bomb.box.position = bomb.position;
			scene.add(bomb.box);
			return false;
		}
		return true;
	});
}
function handlePowerUps() {
	powerUps = $.grep(powerUps, function (powerUp, index) {
		pickedUpByP1 = collectPowerUp(playerObj1, powerUp);
		pickedUpByP2 = collectPowerUp(playerObj2, powerUp);
		if(pickedUpByP1 || pickedUpByP2) // if picked up by any player
			return false; // remove the power up from the list
		else return true; // else keep it in the list
	});
	function collectPowerUp(playerObj, powerUp){
		distance = getDistance(playerObj, powerUp);
		if (distance <= 40) {
			if (powerUp.type == "range")
				playerObj.bombRange = playerObj.bombRange + 2;
			if (powerUp.type == "limit")
				playerObj.bombLimit = playerObj.bombLimit + 1;
			scene.remove(powerUp);
			return true;
		} else return false;
	}
}
function handlePlayerMovement() {
	if (playerObj1.isActive)
		bindKeyboard(playerObj1, "W", "S", "A", "D", "shift")
	if (playerObj2.isActive)
		bindKeyboard(playerObj2, "up", "down", "left", "right", "space")
	// to the movement of the player object
	function bindKeyboard(playerObj, up, down, left, right, bomb){
		nearObjects = getNearObjects(playerObj);
		function checkForCollision(playerObj, getNearObjects){
			collision = false;
			for (var vertexIndex = 0; vertexIndex < playerObj.geometry.vertices.length; vertexIndex++) {
				var localVertex = playerObj.geometry.vertices[vertexIndex].clone();
				var globalVertex = localVertex.applyMatrix4(playerObj.matrix);
				var directionVector = globalVertex.sub( playerObj.position );

				var ray = new THREE.Raycaster( playerObj.position, directionVector.clone().normalize() );
				var collisionResults = ray.intersectObjects( nearObjects );
				if ( collisionResults.length > 0 && collisionResults[0].distance < 40 ){
					console.log('collision!');
					collision = true;
				}
			}
			return collision;
		}
		// up, down, left, right
		/*
		if (keyboard.pressed(left)){
			//playerObj.bbo.position.x -= playerObj.speed;
			//if( checkForCollision(playerObj.bbo, nearObjects) )
			//	playerObj.bbo.position.x += playerObj.speed;
			//else
				playerObj.position.x = playerObj.bbo.position.x;
		}
		if (keyboard.pressed(right)){
			//playerObj.bbo.position.x += playerObj.speed;
			//if( checkForCollision(playerObj.bbo, nearObjects) )
			//	playerObj.bbo.position.x -= playerObj.speed;
			//else
				playerObj.position.x = playerObj.bbo.position.x;
		}
		if (keyboard.pressed(up)){
			//playerObj.bbo.position.z -= playerObj.speed;
			//if( checkForCollision(playerObj.bbo, nearObjects) )
			//	playerObj.bbo.position.z += playerObj.speed;
			//else
				playerObj.position.z = playerObj.bbo.position.z;
		}
		if (keyboard.pressed(down)){
			//playerObj.bbo.position.z += playerObj.speed;
			//if( checkForCollision(playerObj.bbo, nearObjects) )
			//	playerObj.bbo.position.z -= playerObj.speed;
			//else
				playerObj.position.z = playerObj.bbo.position.z;
		}
		*/
		if (keyboard.pressed(left))
			playerObj.position.x -= 5;
		if (keyboard.pressed(right))
			playerObj.position.x += 5;
		if (keyboard.pressed(up))
			playerObj.position.z -= 5;
		if (keyboard.pressed(down))
			playerObj.position.z += 5;

		if (keyboard.down(bomb)) {
			spawnBomb(playerObj);
		}

		if (keyboard.down("F")) {
			position = getGridPosition(playerObj.position);
			console.log(getNearObjects(playerObj));
		}
	}
}
function spawnPlayer(x, y, z, material, name) {
	y = y + 60;
	if (name == null || name == '') name = 'Player';
		playerObj = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), material);

	// physics
	var mass = 5;
	var sphereShape = new CANNON.Sphere(radius);
	playerObj.sphereBody = new CANNON.RigidBody(mass,sphereShape);
	playerObj.sphereBody.position.set(x,y,z);
	world.add(playerObj.sphereBody);
	console.log('added body');


	//playerObj.bbo = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshPhongMaterial({ color: 0x00FFff, shininess: 100.0, transparent: true, opacity: 0.5 }) );
	//playerObj.bbo.position.set(x, y, z);
	playerObj.position.set(x, y, z);
	playerObj.castShadow = true;
	playerObj.playerName = name;
	playerObj.isActive = true;
	playerObj.bombRange = 5;
	playerObj.bombLimit = 1;
	playerObj.activeBombs = 0;
	playerObj.speed = 3;
	objects.push(playerObj);
	scene.add(playerObj);
	scene.add(playerObj.bbo);
	return playerObj;
}

function spawnBomb(playerObj) {
	radius = 20;
	var materialBlack = new THREE.MeshPhongMaterial({ color: 0x090909 });
	var bomb = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), materialBlack, 100);
	bomb.owner = playerObj;
	bomb.isBomb = true;
	bomb.position.x = Math.round(playerObj.position.x / 50) * 50;
	bomb.position.y = 20;
	bomb.position.z = Math.round(playerObj.position.z / 50) * 50;
	bomb.castShadow = true;
	// condition for not placing 2 bombs in the same spot
	addBomb = true;
	$.each(bombs, function (index, value) {
		if (value != null && value.position.x == bomb.position.x && value.position.z == bomb.position.z)
			addBomb = false;
	});
	// check if bombLimit is exceeded
	if (playerObj.activeBombs >= playerObj.bombLimit) {
		addBomb = false;
	}
	if (addBomb) {
		bombs.push(bomb);
		bombIndex = jQuery.inArray(bomb, bombs);
		bomb.bombIndex = bombIndex;
		bomb.owner = playerObj;
		scene.add(bomb);
		startBomb(bombIndex);
		// make solid after player left object
		notSolidBombs.push(bomb); // FIXME Bug when bomb explodes but is not made solid yet?
		playerObj.activeBombs++;
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
					powerUps.push(spawnPowerUp(intersections[0].object.position.x, intersections[0].object.position.y, intersections[0].object.position.z));
				scene.remove(intersections[0].object);
				intersections[0].object.isActive = false; // TODO only for Players
				if (intersections[0].object == playerObj1) console.log('Player 2 won!');
				if (intersections[0].object == playerObj2) console.log('Player 1 won!');
			}
		}
		// DETONATION EFFECT
		// fire variables
		fire1 = fire( { x: bomb.owner.bombRange, y: 1, z: 1, opacity: 0.2 } );
		fire2 = fire( { x: 1, y: 1, z: bomb.owner.bombRange, opacity: 0.0 } );
		function fire(target){
			radius = 20;
			var materialYellow = new THREE.MeshPhongMaterial({ color: 0xffff00, opacity: 0.3, blending: THREE.AdditiveBlending, transparent: true });
			var fire = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), materialYellow);
			fire.position.x = bomb.position.x;
			fire.position.y = 20;
			fire.position.z = bomb.position.z;
			fire.castShadow = false;
			scene.add(fire);
			setTimeout(function () {
				scene.remove(fire);
			}, 500);
			var scale = { x: 1, y: 1, z: 1, opacity: 0.7 };
			var tween = new TWEEN.Tween(scale).to(target, 500);
			tween.start();
			tween.onUpdate(function () {
				fire.scale.x = scale.x;
				fire.scale.y = scale.y;
				fire.scale.z = scale.z;
				fire.material.opacity = scale.opacity;
			});
		}
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

function spawnBox(texture, x, y, z, solid) {
	y = y + 30;
	var material = new THREE.MeshLambertMaterial({ map: texture });
	var box = new THREE.Mesh(new THREE.BoxGeometry(50, 20, 50), material);

	// physics
	var mass = 1;
	var boxShape = new CANNON.Box(new CANNON.Vec3(50, 20, 50));
	box.boxBody = new CANNON.RigidBody(mass,boxShape);
	box.boxBody.position.set(x,y,z);
	//world.add(box.boxBody);
	console.log('added body');

	box.collisions = 0;
	box.position.set(x, y, z);
	box.castShadow = true;
	box.solid = solid;
	box.isBox = true;
	scene.add(box);
	objects.push(box);
	return box;
}

function spawnPowerUp(x, y, z) {
	var boxGeo = new THREE.BoxGeometry(50, 50, 50);
	var box;
	if( Math.random() > 0.5){
		var material = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
		box = new THREE.Mesh(boxGeo, material);
		box.type = "range";
	} else {
		var material = new THREE.MeshLambertMaterial({ color: 0x0000FF });
		box = new THREE.Mesh(boxGeo, material);
		box.type = "limit";
	}
	box.position.set(x, y, z);
	box.castShadow = true;
	scene.add(box);
	objects.push();
	return box;
}

function getGridPosition(playerPosition){
	x_grid = Math.floor( (playerPosition.x + (rows * 50 / 2)) / 50 );
	z_grid = Math.floor( (playerPosition.z + (columns * 50 / 2)) / 50 );
	position = {
		x: x_grid,
		z: z_grid
	};
	return position;
}
function getNearObjects(playerObj){
	playerGridPosition = getGridPosition(playerObj.position);
	x_min = playerGridPosition.x-1;
	x_max = playerGridPosition.x+1;
	z_min = playerGridPosition.z-1;
	z_max = playerGridPosition.z+1;
	if (x_min < 0) x_min = 0;
	if (z_min < 0) z_min = 0;
	if(x_max > rows-1) x_max = rows-1;
	if(z_max > columns-1) z_max = columns-1;
	nearObjects = [];
	for(i=x_min; i<=x_max; i++){
		for(j=z_min; j<=z_max; j++){
			if( board[i][j] != 0 )
				nearObjects.push(board[i][j]);
		}
	}
	nearObjects.push(leftBorder);
	nearObjects.push(rightBorder);
	nearObjects.push(topBorder);
	nearObjects.push(bottomBorder);
	return nearObjects;
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