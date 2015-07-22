var camera, scene, renderer, controls,
	material_depth;

var mouseX = 0, mouseY = 0;
var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;
var windowHalfWidth = window.innerWidth / 2;
var windowHalfHeight = window.innerHeight / 2;

var current = {};




$(document).ready(function () {
	init();
	animate();
	TestView.init();
});



function init () {
	
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.x = 700;
	camera.position.z = -500;
	camera.position.y = 180;
	
	scene = new THREE.Scene();
	//scene.fog = new THREE.Fog( 0xffffff, 1150, 2000 );

	//material_depth = new THREE.MeshDepthMaterial();

	// Ambient Light
	var light = new THREE.AmbientLight( 0x000000 ); 
	scene.add( light );

	var pointLightLeft = new THREE.PointLight( 0xffffff, 0.4, 2000 ); 
	pointLightLeft.position.set( 100, 80, -25 ); 
	scene.add( pointLightLeft );

	var pointLightRight = new THREE.PointLight( 0xffffff, 0.4, 2000 ); 
	pointLightRight.position.set( -100, 80, -25 ); 
	scene.add( pointLightRight );

	var pointLightTop = new THREE.PointLight( 0xffffff, 0.4, 2000 ); 
	pointLightTop.position.set( 0, 80, -50 ); 
	scene.add( pointLightTop );


	var geometry = new THREE.BoxGeometry(3000, 2000, 3000);  
	var uniforms = {  
		texture: { type: 't', value: THREE.ImageUtils.loadTexture('../resources/skydome.jpg') }
	};

	var material = new THREE.ShaderMaterial( {  
		uniforms:       uniforms,
		vertexShader:   document.getElementById('sky-vertex').textContent,
		fragmentShader: document.getElementById('sky-fragment').textContent
	});

	skyBox = new THREE.Mesh(geometry, material);  
	skyBox.scale.set(-1, 1, 1);  
	skyBox.eulerOrder = 'XZY';  
	skyBox.renderDepth = 1000.0;  
	scene.add(skyBox);  

	// Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0xffffff );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;


}


function onMouseMove ( event ) {
	var maxLookY = 10; 
	var maxLookX = 10; 

    mouseX = ( event.clientX - windowHalfWidth ) / maxLookX;
    mouseY = ( event.clientY - windowHalfHeight ) / maxLookY;
}


function onWindowResize () {
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;

	windowHalfWidth = windowWidth / 2;
	windowHalfHeight = windowHeight / 2;

	camera.aspect = windowWidth / windowHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( windowWidth, windowHeight );
	postprocessing.composer.setSize( windowWidth, windowHeight );
}

function animate () {
	requestAnimationFrame( animate );

	camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    camera.position.y += (  mouseY - camera.position.y ) * 0.02;
    camera.lookAt( scene.position );

	renderer.render( scene, camera );

}



var TestView = {
	resources: {
		geometry: null
	},

	renderLoopID: null,

	init: function () {
		$.when(TestView.load()).then(function () {
			TestView.build();
		});
	},

	load: function () {
		var deferred = $.Deferred();
		var that = this;
		var loader = new THREE.JSONLoader();

		loader.load('./resources/skull.json', function (geometry, materials) {
			that.resources.geometry = geometry;
			deferred.resolve();
		});

		return deferred.promise();
	},

	build: function () {


		var material = new THREE.MeshLambertMaterial({
			color: 0x5c5c5c,
			emissive: 0x000000,
			shading: THREE.FlatShading,
			transparent: true,
			opacity: 1
		});

		var model = new THREE.Mesh(this.resources.geometry, material);
				
		model.scale.set(3,3,3);
		model.rotateY(3.14159);
		model.position.set(100, -100, 0);
		scene.add(model);



		



		var blurMaterial = new THREE.ShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( THREE.HorizontalBlurShader.uniforms ),
			vertexShader: THREE.HorizontalBlurShader.vertexShader,
			fragmentShader: THREE.HorizontalBlurShader.fragmentShader,
			color: 0x5c5c5c,
			emissive: 0x000000,
			shading: THREE.FlatShading,
			transparent: true,
			opacity: 1
		} );

		var blurModel = new THREE.Mesh(this.resources.geometry, blurMaterial);
				
		blurModel.scale.set(3,3,3);
		blurModel.rotateY(3.14159);
		blurModel.position.set(-100, -100, 0);
		scene.add(blurModel);		

	}
}