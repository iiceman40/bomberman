<html>
	<head>
		<title>Bomberman</title>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">

		<script type="text/javascript" src="js/vendor/jquery-min.js"></script>
		<script src="js/vendor/three.min.js"></script>
		<script>
			THREE.ShaderChunk.map_fragment = [
				"#ifdef USE_MAP",
				"vec4 texelColor = texture2D( map, vUv ); /* NEWWW */",
				"#ifdef GAMMA_INPUT",
				"texelColor.xyz *= texelColor.xyz;",
				"#endif",
				"gl_FragColor.rgb = mix(gl_FragColor.rgb,texelColor.rgb,texelColor.a);",
				"vec3 surfDiffuse = mix(diffuse,vec3(1,1,1),texelColor.a);",
				"#else",
				"vec3 surfDiffuse = diffuse;",
				"#endif"].join('\n');
			// now replace references to 'diffuse' with 'surfDiffuse'
			THREE.ShaderChunk.lights_phong_fragment =
				THREE.ShaderChunk.lights_phong_fragment.replace(/\bdiffuse\b/gm,'surfDiffuse')
			THREE.ShaderLib.phong.fragmentShader = [
				"uniform vec3 diffuse;",
				"uniform float opacity;",
				"uniform vec3 ambient;",
				"uniform vec3 emissive;",
				"uniform vec3 specular;",
				"uniform float shininess;",
				THREE.ShaderChunk[ "color_pars_fragment" ],
				THREE.ShaderChunk[ "map_pars_fragment" ],
				THREE.ShaderChunk[ "lightmap_pars_fragment" ],
				THREE.ShaderChunk[ "envmap_pars_fragment" ],
				THREE.ShaderChunk[ "fog_pars_fragment" ],
				THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
				THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
				THREE.ShaderChunk[ "bumpmap_pars_fragment" ],
				THREE.ShaderChunk[ "normalmap_pars_fragment" ],
				THREE.ShaderChunk[ "specularmap_pars_fragment" ],
				"void main() {",
				"gl_FragColor = vec4( vec3 ( 1.0 ), opacity );",
				THREE.ShaderChunk[ "map_fragment" ],
				THREE.ShaderChunk[ "alphatest_fragment" ],
				THREE.ShaderChunk[ "specularmap_fragment" ],
				THREE.ShaderChunk[ "lights_phong_fragment" ],
				THREE.ShaderChunk[ "lightmap_fragment" ],
				THREE.ShaderChunk[ "color_fragment" ],
				THREE.ShaderChunk[ "envmap_fragment" ],
				THREE.ShaderChunk[ "shadowmap_fragment" ],
				THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
				THREE.ShaderChunk[ "fog_fragment" ],
				"}"
			].join('\n');
		</script>
		<script src="js/vendor/OrbitControls.js"></script>
		<script src="js/vendor/tween.min.js"></script>
		<script src="js/vendor/physi.js"></script>
		<script src="js/vendor/keyboardstate.js"></script>
		<script src="js/vendor/stats.min.js"></script>
		
		<script type="text/javascript" src="js/bomberman.jquery.js"></script>
		
		<link rel="stylesheet" type="text/css" href="css/style.css" />
	</head>
	<body id="viewport">
		<div id="container"> </div>
	</body>
</html>