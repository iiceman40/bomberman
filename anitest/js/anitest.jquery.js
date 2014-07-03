var loader = new THREE.JSONLoader;
var animation;
var skinnedMesh;
var clock = new THREE.Clock();
var container, stats;

var blendMesh, camera, scene, renderer, controls;

var clock = new THREE.Clock();
var gui = null;

var isFrameStepping = false;
var timeToStep = 0;

$(document).ready(function () {
	init();
});
//////////////////////////////////////
// MAIN FUNCTIONS                   //
//////////////////////////////////////
function init() {
	container = document.getElementById( 'container' );
	scene = new THREE.Scene();
	// Camera
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(0, 0, 50); // y = 430
	camera.lookAt(scene.position);
	// Controls
	controls = new THREE.OrbitControls(camera);

	var material = new THREE.MeshLambertMaterial({color: 0xDD0000});

	boxGeo = new THREE.BoxGeometry(5,5,5);
	box = new THREE.Mesh(boxGeo, material);
	scene.add(box);

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
	container.appendChild(stats.domElement);
	window.addEventListener('resize', onWindowResize, false);

	blendMesh = new THREE.BlendCharacter();
	blendMesh.load( "models/marine_anims.js", start );
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
//////////////////////////////////////
// ANIMATION                        //
//////////////////////////////////////
function start() {

	blendMesh.rotation.y = Math.PI * -135 / 180;
	scene.add( blendMesh );

	var aspect = window.innerWidth / window.innerHeight;
	var radius = blendMesh.geometry.boundingSphere.radius;

	camera = new THREE.PerspectiveCamera( 45, aspect, 1, 10000 );
	camera.position.set( 0.0, radius, radius * 3.5 );

	controls = new THREE.OrbitControls( camera );
	controls.target = new THREE.Vector3( 0, radius, 0 );
	controls.update();

	// Set default weights

	blendMesh.animations[ 'idle' ].weight = 1 / 3;
	blendMesh.animations[ 'walk' ].weight = 1 / 3;
	blendMesh.animations[ 'run' ].weight = 1 / 3;

	gui = new BlendCharacterGui(blendMesh.animations);

	animate();
}
function animate() {

	requestAnimationFrame( animate, renderer.domElement );

	// step forward in time based on whether we're stepping and scale

	var scale = gui.getTimeScale();
	var delta = clock.getDelta();
	var stepSize = (!isFrameStepping) ? delta * scale: timeToStep;

	// modify blend weights

	blendMesh.update( stepSize );
	gui.update();

	THREE.AnimationHandler.update( stepSize );

	renderer.render( scene, camera );
	stats.update();

	// if we are stepping, consume time
	// ( will equal step size next time a single step is desired )

	timeToStep = 0;

}
function render() {
	var seconds = Date.now() / 1000;
	var piPerSeconds = seconds * Math.PI;
	light.position.x = Math.cos(piPerSeconds * 0.05) * 1000;
	light.position.y = 800;
	light.position.z = Math.sin(piPerSeconds * 0.05) * 1000;

	requestAnimationFrame(render);
	animation.update(0.001);

	renderer.render(scene, camera);
	stats.update();
	controls.update();
}
