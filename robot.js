import * as THREE from '/libs/three.module.js';
import { TrackballControls } from '/libs/trackBall.js';
import { OBJLoader } from '/libs/OBJLoader.js';
import { MTLLoader } from '/libs/MTLLoader.js';

let renderer;
let scene;
let camera;
let controls;

let clock;
let body;
const spheres = [];
const town = new THREE.Object3D();
let moon;
let moon2;

init();
animate();

function init() {
	const container = document.getElementById( 'c' );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0X110000 );
	scene.fog = new THREE.Fog( 0x110000, 500, 13000 );

	clock = new THREE.Clock( );
	
	renderer = new THREE.WebGLRenderer({ antialias: true } );
	renderer.setClearColor(new THREE.Color( 0x0 ));
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 
		75, 
		window.innerWidth / window.innerHeight, 
		0.1, 
		17000 );
	camera.position.set( 2200, 300, 4300 );
//ground
	let plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 30000, 15000 ),
		new THREE.MeshPhysicalMaterial({
			color: 0xb77c9f,
			side: THREE.DoubleSide,
			emissive: 0x0,
			roughness: 0.3,
			metalness: 0.9,
			reflectivity: 0.5}));
	plane.rotation.x = - Math.PI / 2;
	plane.position.set ( -3000, -3, 1000) ;
	plane.receiveShadow = true;

	let grid = new THREE.Points( 
		new THREE.PlaneBufferGeometry( 30000, 15000, 2000, 120 ), 
		new THREE.PointsMaterial({ color: 0xffc62b, size: 0.1 }));
	grid.position.set( 15, 1, 0 );
	grid.rotation.x = Math.PI / 2;
	scene.add ( plane, grid);
//moon
	let textureMoon = new THREE.TextureLoader().load('robot/moon.png');
	textureMoon.wrapS = THREE.RepeatWrapping;
        textureMoon.wrapT = THREE.RepeatWrapping;
        textureMoon.repeat.set(1, 1);

	let moon1 = new THREE.SphereGeometry( 600, 20, 20 );
	let moonMaterial = new THREE.MeshLambertMaterial({
		color: 0xeb7fff,
	 	map: textureMoon });
	moon = new THREE.Mesh( moon1, moonMaterial );
	moon.position.set( 2000, 1800, 1000 );
	moon.castShadow = true;
	scene.add(moon);

	let moonSmall = new THREE.SphereGeometry( 400, 20, 20 );
	moon2 = new THREE.Mesh( moonSmall, moonMaterial );
	moon2.position.set( -1000, 2800, -300 );
	moon2.castShadow = true;
	scene.add( moon, moon2 );
//light
	addShadowedLight( 1, 4000, 1, 0x001266, 2 );
	addShadowedLight( 0.5, -4000, - 1, 0xea8a23, 2 );
	addShadowedLight( 100, 1000, -500, 0xb22e51, 2 );
	addShadowedLight( -400, 1000, 500, 0x288bd6, 2 );
	addShadowedLight( 4000, 300, 5000, 0x311f7f, 2 );
	addShadowedLight( -4000, -200, -3000, 0x0085dd, 2 );

	function addShadowedLight( x, y, z, color, intensity ) {
		const directionalLight = new THREE.DirectionalLight( color, intensity );
		directionalLight.position.set( x, y, z );
		directionalLight.castShadow = true;
		scene.add( directionalLight );
		const d = 1;
		directionalLight.shadow.camera.left = - d;
		directionalLight.shadow.camera.right = d;
		directionalLight.shadow.camera.top = d;
		directionalLight.shadow.camera.bottom = - d;
		directionalLight.shadow.camera.near = 1;
		directionalLight.shadow.camera.far = 500;
		directionalLight.shadow.mapSize.width = 1024;
		directionalLight.shadow.mapSize.height = 1024;
		directionalLight.shadow.bias = - 0.001;
	}
//loading objects
	let onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
		let percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
		}
	};
	let onError = function () {};
	let manager = new THREE.LoadingManager();
//town
	new MTLLoader( manager )
		.load( 'robot/wild_town.mtl', function ( materials ) {
			materials.preload();

			new OBJLoader( manager )
			.setMaterials( materials )
			.load( 'robot/wild town.obj', function ( town ) {
					town.position.set( 2000, 0, 7000);
					town.scale.set ( 2, 2, 2 );
					town.receiveShadow = true;
					scene.add( town );
				}, 
			onProgress, 
			onError );
	});
//robot
	new MTLLoader( manager )
		.load( 'robot/walking.mtl', function ( materials ) {
			materials.preload();

			new OBJLoader( manager )
			.setMaterials( materials )
			.load( 'robot/walking.obj', function ( body ) {
					body.position.set( 1900, 145, 4000);
					body.rotation.y = 0.5;
					body.castShadow = true;
					body.receiveShadow = true;
					scene.add( body );
				}, 
			onProgress, 
			onError );
	});	
//snow
	let geometry = new THREE.SphereBufferGeometry( 2, 32, 16 );
	let material = new THREE.MeshPhysicalMaterial({
			color: 0x9e0346,
			side: THREE.DoubleSide,
			emissive: 0x0,
			wireframe: false,
			roughness: 0.4,
			metalness: 0.8,
			clearcoat: 0.8,
			reflectivity: 0.9});

	for ( let i = 0; i < 9000; i ++ ) {
		let mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = Math.random() * 10000 - 1000;
		mesh.position.y = Math.random() * 10000 - 1000;
		mesh.position.z = Math.random() * 10000 - 1000;
		mesh.castShadow = true;
		mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
		scene.add( mesh );
		spheres.push( mesh );
	}

	window.addEventListener( 'resize', onWindowResize, false );
	createControls( camera );
}
function createControls( camera ) {
	controls = new TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 0.1;
	controls.zoomSpeed = 0.1;
	controls.panSpeed = 0.1;
	controls.keys = [ 65, 83, 68 ];
	controls.maxDistance = 8000;
	controls.maxPolarAngle = Math.PI * 0.295;
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	controls.handleResize();
}
function animate() {
	requestAnimationFrame( animate );
	controls.update();
	render();
}
function render() {
	var timer = 0.00001 * Date.now();
	for ( var i = 0, il = spheres.length; i < il; i ++ ) {
		var sphere = spheres[ i ];
		sphere.position.x = 5000 * Math.cos( timer + i );
		sphere.position.y = 5000 * Math.sin( timer + i * 1.1 );
	}
	moon.rotation.x += 0.005;
	moon.rotation.y += 0.002;
	moon2.rotation.x += 0.008;
	moon2.rotation.y += 0.005;

	renderer.render( scene, camera);
}
