'use strict'

var scripts = {};
function loadScript( id ) {

    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        screen.textContent = this.responseText;
    }
    xhr.open( 'GET', 'scripts/' + id + '.html?' + Date.now() );
    xhr.send();

}

var screen = document.getElementById( 'screen' );

var renderer, camera, scene, projector;
var SELECTED, INTERSECTED;
var keys = { up: false, left: false, right: false, bottom: false, forward: false, back: false };
var lon = 90, lat = -0, position = { x: 90, y: -0 }, isUserInteracting = false, onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat;
var clock = new THREE.Clock();

var introScene, firstScene, lightScene, basicMaterialScene, complexMaterialScene, animationScene, modelScene, finalScene;

var cubeGeometry = new THREE.CubeGeometry( 1, 1, 1 );

function initRenderer() {

    var container = document.getElementById( 'container' );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( container.clientWidth, container.clientHeight );
    container.appendChild(renderer.domElement);

    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMapType = THREE.PCFShadowMap;

    function onWindowResize() {

        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( container.clientWidth, container.clientHeight );

    }

    camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000 );
    camera.target = new THREE.Vector3( 0, 0, 0 );

    scene = new THREE.Scene();
    projector = new THREE.Projector();

    window.addEventListener( 'resize', onWindowResize );

}

function setupIntroScene( offset ) {

    var plane1 = new THREE.Mesh( 
        new THREE.PlaneGeometry( 50, 50 ), 
        new THREE.MeshPhongMaterial( {
            color: 0xffffff,
            emissive: 0xffffff,
            map: THREE.ImageUtils.loadTexture( 'assets/intro-1.png' ),
            transparent: true
        } )
    );
    plane1.position.set( offset + 0, 50, 0 );
    plane1.rotation.y = Math.PI;
    plane1.__scriptName = 'intro';

    scene.add( plane1 );

    var plane2 = new THREE.Mesh( 
        new THREE.PlaneGeometry( 50, 50 ), 
        new THREE.MeshPhongMaterial( {
            color: 0xffffff,
            emissive: 0xffffff,
            map: THREE.ImageUtils.loadTexture( 'assets/intro-2.png' ),
            transparent: true
        } )
    );
    plane2.position.set( offset - 50, 50, 0 );
    plane2.rotation.y = Math.PI;
    plane2.__scriptName = 'what-is-it';

    scene.add( plane2 );

    var plane3 = new THREE.Mesh( 
        new THREE.PlaneGeometry( 50, 50 ), 
        new THREE.MeshPhongMaterial( {
            color: 0xffffff,
            emissive: 0xffffff,
            map: THREE.ImageUtils.loadTexture( 'assets/intro-3.png' ),
            transparent: true
        } )
    );
    plane3.position.set( offset - 100, 50, 0 );
    plane3.rotation.y = Math.PI;
    plane3.__scriptName = 'setting-it-up';

    scene.add( plane3 );

    var plane4 = new THREE.Mesh( 
        new THREE.PlaneGeometry( 50, 50 ), 
        new THREE.MeshPhongMaterial( {
            color: 0xffffff,
            emissive: 0xffffff,
            map: THREE.ImageUtils.loadTexture( 'assets/intro-4.png' ),
            transparent: true
        } )
    );
    plane4.position.set( offset - 100, -50, 0 );
    plane4.rotation.y = Math.PI;
    plane4.rotation.x = Math.PI / 2;
    plane4.__scriptName = 'adding-some-hooks';

    scene.add( plane4 );

    return {

        show: function() {

            plane1.visible = plane2.visible = plane3.visible = plane4.visible = true;
        },

        hide: function() {

            plane1.visible = plane2.visible = plane3.visible = plane4.visible = false;

        }

    }

}

function setupFinalScene( offset ) {

    var plane1 = new THREE.Mesh( 
        new THREE.PlaneGeometry( 50, 50 ), 
        new THREE.MeshPhongMaterial( {
            color: 0xffffff,
            emissive: 0xffffff,
            map: THREE.ImageUtils.loadTexture( 'assets/last-1.png' ),
            transparent: true
        } )
    );
    plane1.position.set( offset + 0, 50, 0 );
    plane1.rotation.y = Math.PI;

    scene.add( plane1 );

    var plane2 = new THREE.Mesh( 
        new THREE.PlaneGeometry( 50, 50 ), 
        new THREE.MeshPhongMaterial( {
            color: 0xffffff,
            emissive: 0xffffff,
            map: THREE.ImageUtils.loadTexture( 'assets/last-2.png' ),
            transparent: true
        } )
    );
    plane2.position.set( offset - 50, 50, 0 );
    plane2.rotation.y = Math.PI;

    scene.add( plane2 );

    return {

        show: function() {

        },

        hide: function() {

        }

    }

}

function addLightParticles( color, position ) {

    var geometry = new THREE.Geometry();

    var sprite = THREE.ImageUtils.loadTexture( 'assets/coc.png' );
    var d = 10;

    for ( var i = 0; i < 50; i ++ ) {

        var vertex = new THREE.Vector3();
        vertex.x = position.x + d * ( 2 * Math.random() - 1 );
        vertex.y = position.y + d * ( 2 * Math.random() - 1 );
        vertex.z = position.z + d * ( 2 * Math.random() - 1 );

        geometry.vertices.push( vertex );

    }

    var material = new THREE.ParticleBasicMaterial( { 
        blending: THREE.AdditiveBlending, 
        size: 10, 
        sizeAttenuation: true, 
        map: sprite, 
        transparent: true 
    } );

    var c = color.getHSL();
    material.color.setHSL( c.h, c.s, c.l );

    var particles = new THREE.ParticleSystem( geometry, material );
    particles.sortParticles = true;
    scene.add( particles );

}

function setupLightsScene( offset ) {

    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
    
    var material = new THREE.MeshPhongMaterial( {
        color: 0x1080ff,
        specular: 0x808080,
        shininess: 10
    } );

    var base = new THREE.Mesh( geometry, material );
    base.scale.set( 200, 2, 200 );
    base.position.set( offset + 0, 2, 0 );
    base.receiveShadow = true;
    base.__id = 'Scene1';
    base.__scriptName = 'create-scene-lights';
    scene.add( base );

    var base = new THREE.Mesh( geometry, material );
    base.scale.set( 2, 200, 200 );
    base.position.set( offset - 100, 100, 0 );
    base.receiveShadow = true;
    scene.add( base );

    var material = new THREE.MeshPhongMaterial( {
        color: 0xff8010,
        specular: 0x808080,
        shininess: 10
    } );

    var cube = new THREE.Mesh( geometry, material );
    cube.scale.set( 20, 20, 20 );
    cube.position.set( offset + 0, 20, 0 );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.__id = 'Scene1Cube';
    cube.__scriptName = 'create-cube-light'
    scene.add( cube );

    var sphere = new THREE.Mesh( new THREE.SphereGeometry( .5, 20, 20 ), material );
    sphere.scale.set( 20, 20, 20 );
    sphere.position.set( offset + 30, 20, 0 );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add( sphere );

    var cylinder = new THREE.Mesh( new THREE.CylinderGeometry( .5, .5, 1, 20, 20 ), material );
    cylinder.scale.set( 20, 20, 20 );
    cylinder.position.set( offset - 30, 20, 0 );
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    scene.add( cylinder );

    var light = new THREE.AmbientLight( 0x202020 ); // soft white light
    scene.add( light );

    var pointLight = new THREE.PointLight( 0x983451, 1, 500 );
    pointLight.position.set( offset, 100, 0 );
    scene.add( pointLight );

    var spotLight1 = new THREE.SpotLight( 0xa5f4e7, 1, 500 );
    spotLight1.position.set( offset - 100, 150, -50 );
    spotLight1.target.position.set( offset, 0, 0 );
    spotLight1.castShadow = true;
    scene.add( spotLight1 );

    var spotLight2 = new THREE.SpotLight( 0xa5f4e7, 2, 500 );
    spotLight2.position.set( offset - 100, 50, -100 );
    spotLight2.target.position.set( offset, 0, 0 );
    spotLight2.castShadow = true;
    scene.add( spotLight2 );

    return {

        show: function() { 

            pointLight.intensity = spotLight1.intensity = spotLight2.intensity = 1;
        },

        hide: function() {

            pointLight.intensity = spotLight1.intensity = spotLight2.intensity = 0;
        }
        
    }

}

function setupBasicMaterialScene( offset ) {

    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
    
    var material = new THREE.MeshPhongMaterial( {
        color: 0x1080ff,
        specular: 0xffffff,
        shininess: .1
    } );

    /*var material = new THREE.MeshBasicMaterial( {
        color: 0xff8010,
        wireframe: false
    } );*/

    var base = new THREE.Mesh( geometry, material );
    base.scale.set( 200, 2, 200 );
    base.position.set( offset + 0, 2, 0 );
    base.receiveShadow = true;
    base.__id = 'Scene1';
    base.__scriptName = 'create-simple-material';
    scene.add( base );

    var base = new THREE.Mesh( geometry, material );
    base.scale.set( 2, 200, 200 );
    base.position.set( offset - 100, 100, 0 );
    base.receiveShadow = true;
    scene.add( base );
    
    var wireMaterial = new THREE.MeshPhongMaterial( {
        color: 0xff8010,
        shading: THREE.FlatShading,
        specular: 0xffffff,
        shininess: 1,
        ambient: 0xff00ff
        //map: THREE.ImageUtils.loadTexture( 'background_texture.jpg' )
    } );

    var solidMaterial = new THREE.MeshPhongMaterial( {
        color: 0xff8010,
        shading: THREE.SmoothShading,
        specular: 0xffffff,
        shininess: 10,
        emissive: 0xff0000
        //map: THREE.ImageUtils.loadTexture( 'background_texture.jpg' )
    } );

    var textureMaterial = new THREE.MeshPhongMaterial( {
        color: 0xff8010,
        shading: THREE.SmoothShading,
        specular: 0xffffff,
        shininess: 1,
        emissive: 0x101010,
        map: THREE.ImageUtils.loadTexture( 'assets/CheckerTexture.png' )
    } );

    var cube = new THREE.Mesh( geometry, wireMaterial );
    cube.scale.set( 20, 20, 20 );
    cube.position.set( offset + 0, 20, 0 );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.__id = 'Scene1Cube';
    cube.__scriptName = 'create-flat-material'
    scene.add( cube );

    var cube = new THREE.Mesh( geometry, solidMaterial );
    cube.scale.set( 20, 20, 20 );
    cube.position.set( offset + 0, 20, 40 );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.__id = 'Scene1Cube';
    cube.__scriptName = 'create-solid-material'
    scene.add( cube );

    var cube = new THREE.Mesh( new THREE.CubeGeometry( 1, 1,1 ), textureMaterial );
    cube.scale.set( 20, 20, 20 );
    cube.position.set( offset + 0, 20, -40 );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.__id = 'Scene1Cube';
    cube.__scriptName = 'create-texture-material'
    scene.add( cube );

    var sphere = new THREE.Mesh( new THREE.SphereGeometry( .5, 20, 20 ), wireMaterial );
    sphere.scale.set( 20, 20, 20 );
    sphere.position.set( offset + 30, 20, 0 );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.__scriptName = 'create-flat-material';
    scene.add( sphere );

    var sphere = new THREE.Mesh( new THREE.SphereGeometry( .5, 20, 20 ), solidMaterial );
    sphere.scale.set( 20, 20, 20 );
    sphere.position.set( offset + 30, 20, 40 );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.__scriptName = 'create-solid-material';
    scene.add( sphere );

    var sphere = new THREE.Mesh( new THREE.SphereGeometry( .5, 20, 20 ), textureMaterial );
    sphere.scale.set( 20, 20, 20 );
    sphere.position.set( offset + 30, 20, -40 );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.__scriptName = 'create-texture-material';
    scene.add( sphere );

    var cylinder = new THREE.Mesh( new THREE.CylinderGeometry( .5, .5, 1, 20, 20 ), wireMaterial );
    cylinder.scale.set( 20, 20, 20 );
    cylinder.position.set( offset - 30, 20, 0 );
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.__scriptName = 'create-flat-material'
    scene.add( cylinder );

    var cylinder = new THREE.Mesh( new THREE.CylinderGeometry( .5, .5, 1, 20, 20 ), solidMaterial );
    cylinder.scale.set( 20, 20, 20 );
    cylinder.position.set( offset - 30, 20, 40 );
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.__scriptName = 'create-solid-material'
    scene.add( cylinder );

    var cylinder = new THREE.Mesh( new THREE.CylinderGeometry( .5, .5, 1, 20, 20 ), textureMaterial );
    cylinder.scale.set( 20, 20, 20 );
    cylinder.position.set( offset - 30, 20, -40 );
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.__scriptName = 'create-texture-material'
    scene.add( cylinder );
    
    var spotLight1 = new THREE.SpotLight( 0x984572, 1 );
    spotLight1.position.set( offset + 100, 200, -200 );
    spotLight1.castShadow = true;
    spotLight1.target.position.set( offset, 0, 0 );
    scene.add( spotLight1 );

    var spotLight2 = new THREE.SpotLight( 0x259834, 1 );
    spotLight2.position.set( offset - 100, 100, -100 );
    spotLight2.target.position.set( offset, 0, 0 );
    spotLight2.castShadow = true;
    scene.add( spotLight2 );

    return {

        show: function() { 

            spotLight1.distance = spotLight2.distance = 0;
        },

        hide: function() {

            spotLight1.distance = spotLight2.distance = .1;
        }
        
    }

}

function setupComplexMaterialScene( offset ) {

    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
    
    var material = new THREE.MeshPhongMaterial( {
        color: 0x1080ff,
        specular: 0xffffff,
        shininess: .1
    } );

    var base = new THREE.Mesh( geometry, material );
    base.scale.set( 200, 2, 200 );
    base.position.set( offset + 0, 2, 0 );
    base.receiveShadow = true;
    base.__id = 'Scene1';
    base.__scriptName = 'create-complex-material';
    scene.add( base );

    var base = new THREE.Mesh( geometry, material );
    base.scale.set( 2, 200, 200 );
    base.position.set( offset - 100, 100, 0 );
    base.receiveShadow = true;
    base.__id = 'Scene1';
    scene.add( base );
    
    var wireMaterial = new THREE.MeshPhongMaterial( {
        color: 0x189c1c,
        shading: THREE.SmoothShading,
        specular: 0xffffff,
        shininess: 1,
        ambient: 0xff00ff,
        bumpScale: -1,
        specularMap: THREE.ImageUtils.loadTexture( 'assets/Texture seamless mattoni tufo bump simo-3d.jpg' ),
        bumpMap: THREE.ImageUtils.loadTexture( 'assets/Texture seamless mattoni tufo bump simo-3d.jpg' )
    } );

    var solidMaterial = new THREE.MeshPhongMaterial( {
        color: 0xff8010,
        shading: THREE.SmoothShading,
        specular: 0xffffff,
        shininess: 10,
        normalScale: new THREE.Vector2( 4,4 ),
        normalMap: THREE.ImageUtils.loadTexture( 'assets/243-normal.jpg' )
    } );

    var textureMaterial = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        shading: THREE.SmoothShading,
        specular: 0xffffff,
        shininess: 10,
        emissive: 0x200000,
        map: THREE.ImageUtils.loadTexture( 'assets/lavaTex.png' ),
        normalScale: new THREE.Vector2( 2,2  ),
        normalMap: THREE.ImageUtils.loadTexture( 'assets/lavaNormal.png' )
    } );

    var cube = new THREE.Mesh( new THREE.CubeGeometry( 1, 1,1 ), wireMaterial );
    cube.scale.set( 20, 20, 20 );
    cube.position.set( offset + 0, 20, 0 );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.__id = 'Scene1Cube';
    scene.add( cube );

    var cube = new THREE.Mesh( new THREE.CubeGeometry( 1, 1,1 ), solidMaterial );
    cube.scale.set( 20, 20, 20 );
    cube.position.set( offset + 0, 20, 40 );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.__id = 'Scene1Cube';
    scene.add( cube );

    var cube = new THREE.Mesh( new THREE.CubeGeometry( 1, 1,1 ), textureMaterial );
    cube.scale.set( 20, 20, 20 );
    cube.position.set( offset + 0, 20, -40 );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.__id = 'Scene1Cube';
    scene.add( cube );

    var sphere = new THREE.Mesh( new THREE.SphereGeometry( .5, 20, 20 ), wireMaterial );
    sphere.scale.set( 20, 20, 20 );
    sphere.position.set( offset + 30, 20, 0 );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add( sphere );

    var sphere = new THREE.Mesh( new THREE.SphereGeometry( .5, 20, 20 ), solidMaterial );
    sphere.scale.set( 20, 20, 20 );
    sphere.position.set( offset + 30, 20, 40 );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add( sphere );

    var sphere = new THREE.Mesh( new THREE.SphereGeometry( .5, 20, 20 ), textureMaterial );
    sphere.scale.set( 20, 20, 20 );
    sphere.position.set( offset + 30, 20, -40 );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add( sphere );

    var cylinder = new THREE.Mesh( new THREE.CylinderGeometry( .5, .5, 1, 20, 20 ), wireMaterial );
    cylinder.scale.set( 20, 20, 20 );
    cylinder.position.set( offset - 30, 20, 0 );
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    scene.add( cylinder );

    var cylinder = new THREE.Mesh( new THREE.CylinderGeometry( .5, .5, 1, 20, 20 ), solidMaterial );
    cylinder.scale.set( 20, 20, 20 );
    cylinder.position.set( offset - 30, 20, 40 );
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    scene.add( cylinder );

    var cylinder = new THREE.Mesh( new THREE.CylinderGeometry( .5, .5, 1, 20, 20 ), textureMaterial );
    cylinder.scale.set( 20, 20, 20 );
    cylinder.position.set( offset - 30, 20, -40 );
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    scene.add( cylinder );
    
    var spotLight1 = new THREE.SpotLight( 0xffc62d, .5 );
    spotLight1.position.set( offset + 100, 200, -200 );
    spotLight1.castShadow = true;
    spotLight1.target.position.set( offset, 0, 0 );
    scene.add( spotLight1 );

    var spotLight2 = new THREE.SpotLight( 0x7fafff, 1 );
    spotLight2.position.set( offset - 100, 100, -100 );
    spotLight2.target.position.set( offset, 0, 0 );
    spotLight2.castShadow = true;
    scene.add( spotLight2 );

    return {

        show: function() { 

            spotLight1.distance = spotLight2.distance = 0;
        },

        hide: function() {

            spotLight1.distance = spotLight2.distance = .1;
        }
        
    }

}

function setupFirstScene( offset ) {

    var wireMaterial = new THREE.MeshBasicMaterial( {
        color: 0xff8010,
        wireframe: true
    } );

    var firstCube = new THREE.Mesh( cubeGeometry, wireMaterial );
    firstCube.scale.set( 20, 20, 20 );
    firstCube.position.set( offset + 0, 20, 0 );
    firstCube.__id = 'Scene1Cube1';
    firstCube.__scriptName = 'create-a-wireframe-cube'
    scene.add( firstCube );

    var wireMaterial = new THREE.MeshBasicMaterial( {
        color: 0xff8010
    } );

    var secondCube = new THREE.Mesh( cubeGeometry, wireMaterial );
    secondCube.scale.set( 20, 20, 20 );
    secondCube.position.set( offset - 30, 20, 0 );
    secondCube.__id = 'Scene1Cube2';
    secondCube.__scriptName = 'create-a-solid-cube'
    scene.add( secondCube );

    var normalMaterial = new THREE.MeshNormalMaterial();

    var thirdCube = new THREE.Mesh( new THREE.CubeGeometry( 1, 1,1 ), normalMaterial );
    thirdCube.scale.set( 20, 20, 20 );
    thirdCube.position.set( offset - 60, 20, 0 );
    thirdCube.__id = 'Scene1Cube3';
    thirdCube.__scriptName = 'create-a-cube'
    scene.add( thirdCube );

    var mapMaterial = new THREE.MeshBasicMaterial( {
        color: 0xff8010,
        map: THREE.ImageUtils.loadTexture( 'assets/CheckerTexture.png' )
    } );

    var fourthCube = new THREE.Mesh( new THREE.CubeGeometry( 1, 1,1 ), mapMaterial );
    fourthCube.scale.set( 20, 20, 20 );
    fourthCube.position.set( offset - 90, 20, 0 );
    fourthCube.__id = 'Scene1Cube3';
    fourthCube.__scriptName = 'create-a-textured-cube'
    scene.add( fourthCube );

    return {

        show: function() { 
        },

        hide: function() {


        }

    }

}

var torus;

function setupAnimationScene( offset ) {

    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
    
    var material = new THREE.MeshPhongMaterial( {
        color: 0x1080ff,
        specular: 0xffffff,
        shininess: .1
    } );

    var base = new THREE.Mesh( geometry, material );
    base.scale.set( 200, 2, 200 );
    base.position.set( offset + 0, 2, 0 );
    base.receiveShadow = true;
    base.__id = 'SceneModel';
    base.__scriptName = 'animate-torus';
    scene.add( base );

    var base = new THREE.Mesh( geometry, material );
    base.scale.set( 2, 200, 200 );
    base.position.set( offset - 100, 100, 0 );
    base.receiveShadow = true;
    base.__id = 'Scene1';
    scene.add( base );

    var spotLight = new THREE.SpotLight( 0xffad1e, 1 );
    spotLight.position.set( offset + 100, 200, -200 );
    spotLight.castShadow = true;
    spotLight.target.position.set( offset, 0, -20 );
    spotLight.angle = .5;
    spotLight.exponent = 500;
    spotLight.shadowCameraFov = 90;
    spotLight.shadowMapWidth = 2048;
    spotLight.shadowMapHeight = 2048;
    scene.add( spotLight );
        
    var path = "assets/";
    var format = '.jpg';
    var urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

    var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
    reflectionCube.format = THREE.RGBFormat;

    torus = new THREE.Mesh( 
        new THREE.TorusKnotGeometry( 1, .3, 120, 40, 2, 3 ), 
        new THREE.MeshPhongMaterial({
            //color: 0xffffff, 
            //ambient: 0xaaaaaa,
            //emissive: 0xffffff,
            envMap: reflectionCube,
            combine: THREE.MixOperation,
            reflectivity: .5
        } )
    );
    torus.scale.set( 10, 10, 10 );
    torus.rotation.y = Math.PI;
    torus.__id = 'leePerryFace';
    torus.__scriptName = 'create-reflective-torus'
    torus.position.y = 10;
    torus.position.x = offset;
    torus.castShadow = true;
    torus.receiveShadow = true;
    scene.add( torus );

    return {

        show: function() { 

            spotLight.distance = 0;
        },

        hide: function() {

            spotLight.distance = .1;
        }
        
    }

}

function setupModelScene( offset ) {

    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
    
    var material = new THREE.MeshPhongMaterial( {
        color: 0x1080ff,
        specular: 0xffffff,
        shininess: .1
    } );

    var base = new THREE.Mesh( geometry, material );
    base.scale.set( 200, 2, 200 );
    base.position.set( offset + 0, 2, 0 );
    base.receiveShadow = true;
    base.__id = 'SceneModel';
    base.__scriptName = 'load-a-model';
    scene.add( base );

    var base = new THREE.Mesh( geometry, material );
    base.scale.set( 2, 200, 200 );
    base.position.set( offset - 100, 100, 0 );
    base.receiveShadow = true;
    base.__id = 'Scene1';
    base.__scriptName = '0-creating-a-scene';
    scene.add( base );

    var spotLight1 = new THREE.SpotLight( 0x984572, 1 );
    spotLight1.position.set( offset + 100, 200, -200 );
    spotLight1.castShadow = true;
    spotLight1.target.position.set( offset, 0, 0 );
    spotLight1.angle = .2;
    spotLight1.shadowMapWidth = 2048;
    spotLight1.shadowMapHeight = 2048;
    spotLight1.exponent =  500;
    scene.add( spotLight1 );

    var spotLight2 = new THREE.SpotLight( 0x259834, 1 );
    spotLight2.position.set( offset - 100, 300, -100 );
    spotLight2.angle = .2;
    spotLight2.exponent = 500;
    spotLight2.target.position.set( offset, 0, 0 );
    spotLight2.castShadow = true;
    spotLight2.shadowMapWidth = 2048;
    spotLight2.shadowMapHeight = 2048;
    scene.add( spotLight2 );

    var loader = new THREE.JSONLoader();
    loader.load( 'assets/LeePerrySmith.js', function( geometry ) {

        geometry.computeTangents();

        var material = new THREE.MeshPhongMaterial( {
            color: 0xf0c9c9,
            emissive: 0x101010,
            map: THREE.ImageUtils.loadTexture( 'assets/Map-COL.jpg' ),
            normalMap: THREE.ImageUtils.loadTexture( 'assets/Infinite-Level_02_Tangent_SmoothUV.jpg' ),
            specularMap: THREE.ImageUtils.loadTexture( 'assets/Map-SPEC.jpg' )
        } );
        
        var face = new THREE.Mesh( geometry, material );
        face.scale.set( 10, 10, 10 );
        face.rotation.y = Math.PI;
        face.__id = 'leePerryFace';
        face.__scriptName = 'load-face'
        face.position.y = 10;
        face.position.x = offset;
        face.castShadow = true;
        face.receiveShadow = true;
        scene.add( face );

    } );

    return {

        show: function() { 

            spotLight1.distance = spotLight2.distance = 0;
        },

        hide: function() {

            spotLight1.distance = spotLight2.distance = .1;
        }
        
    }

}

window.addEventListener( 'keydown', function( e ) {
    switch( e.keyCode ) {
        case 87: keys.forward = true; e.preventDefault(); break;
        case 65: keys.left = true; e.preventDefault(); break;
        case 68: keys.right = true; e.preventDefault(); break;
        case 83: keys.back = true; e.preventDefault(); break;
    }
    
} )

window.addEventListener( 'keyup', function( e ) {
    switch( e.keyCode ) {
        case 87: keys.forward = false; e.preventDefault(); break;
        case 65: keys.left = false; e.preventDefault(); break;
        case 68: keys.right = false; e.preventDefault(); break;
        case 83: keys.back = false; e.preventDefault(); break;
    }
    e.preventDefault();
} )

container.addEventListener( 'mousedown', onMouseDown );
container.addEventListener( 'mouseup', onMouseUp );
container.addEventListener( 'mousemove', onMouseMove );
container.addEventListener( 'contextmenu', onContextMenu );

function onContextMenu( event ) {

    loadScript( INTERSECTED.__scriptName );
    event.cancelBubble = true;
     event.preventDefault();
   return false;

}

function onMouseDown( event ) {

    event.preventDefault();

    isUserInteracting = true;
    
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;

    onPointerDownLon = lon;
    onPointerDownLat = lat;
    
}

function onMouseUp( event ) {

    event.preventDefault();

    isUserInteracting = false;
    
}

function onMouseMove( event ) {

    if ( isUserInteracting ) {
        var dx = ( event.clientX - onPointerDownPointerX );
        var dy = -( event.clientY - onPointerDownPointerY );
        position.x = .75 * dx + onPointerDownLon;
        position.y = .75 * dy + onPointerDownLat;
    }

    var mouse = {
        x: ( event.clientX / container.clientWidth ) * 2 - 1,
        y: - ( event.clientY / container.clientHeight ) * 2 + 1
    }

    pick( mouse );

}

function pick( pos ) {

    var vector = new THREE.Vector3( pos.x, pos.y, 0.5 );
    projector.unprojectVector( vector, camera );

    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    if ( SELECTED ) {

        var intersects = raycaster.intersectObject( plane );
        SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
        return;

    }

    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {

        if ( INTERSECTED != intersects[ 0 ].object ) {

            INTERSECTED = intersects[ 0 ].object;

        }

        container.style.cursor = 'pointer';

    } else {

        INTERSECTED = null;

        container.style.cursor = 'auto';

    }

}

function render() {

    var ellapsedFactor = clock.getDelta();

    var olon = lon, olat = lat;
    var s = 2.5 * ellapsedFactor;
    lon = lon + ( position.x - olon ) * s;
    lat = lat + ( position.y - olat ) * s;
    var d = 100;
    lat = Math.max( - 85, Math.min( 85, lat ) );
    var phi = ( 90 - lat ) * Math.PI / 180;
    var theta = lon * Math.PI / 180;

    var step = 80 * ellapsedFactor;

    if( keys.forward ) {
        camera.position.x += step * Math.cos( theta );
        camera.position.z += step * Math.sin( theta );
    }
    if( keys.back ) {
        camera.position.x -= step * Math.cos( theta );
        camera.position.z -= step * Math.sin( theta );
    }
    if( keys.left ) {
        camera.position.x += step * Math.cos( theta - Math.PI / 2 );
        camera.position.z += step * Math.sin( theta - Math.PI / 2  );
    }
    if( keys.right ) {
        camera.position.x -= step * Math.cos( theta - Math.PI / 2  );
        camera.position.z -= step * Math.sin( theta - Math.PI / 2  );
    }

    camera.target.x = camera.position.x + d * Math.sin( phi ) * Math.cos( theta );
    camera.target.y = camera.position.y + d * Math.cos( phi );
    camera.target.z = camera.position.z + d * Math.sin( phi ) * Math.sin( theta );
    camera.lookAt( camera.target );

    if( torus ) {
        torus.rotation.x += ellapsedFactor * 1;
        torus.rotation.y += ellapsedFactor * .7;
        torus.rotation.z += ellapsedFactor * .5;
        torus.position.y = 20 + 20 * Math.sin( .0005 * Date.now() );
        var s = 10 * ( 1 + .5 * Math.sin( .0001 * Date.now() ) );
        torus.scale.set( s, s, s );
        torus.material.emissive.setHSL( Math.cos( .0001 * Date.now() ), Math.cos( .00011 * Date.now() ), .5 );
    }

    renderer.render( scene, camera );
    
    requestAnimationFrame( render );

}
