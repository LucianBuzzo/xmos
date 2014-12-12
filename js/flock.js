// Based on http://www.openprocessing.org/visuals/?visualID=6910
//
var FREEZE = false;
var SLOMO = false;
var Boid = function() {

    var vector = new THREE.Vector3(),
        _acceleration, 
        _width = 500, 
        _height = 500, 
        _depth = 200, 
        _goal, 
        _neighborhoodRadius = 100,
        _maxSpeed = 4, 
        _maxSteerForce = 0.1, 
        _avoidWalls = false;

    this.chosen = false;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    _acceleration = new THREE.Vector3();

    this.setGoal = function ( target ) {

        _goal = target;

    }

    this.setAvoidWalls = function ( value ) {

        _avoidWalls = value;

    }

    this.setWorldSize = function ( width, height, depth ) {

        _width = width;
        _height = height;
        _depth = depth;

    }

    this.run = function ( boids ) {

        if ( _avoidWalls ) {

            vector.set( - _width, this.position.y, this.position.z );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

            vector.set( _width, this.position.y, this.position.z );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

            vector.set( this.position.x, - _height, this.position.z );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

            vector.set( this.position.x, _height, this.position.z );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

            vector.set( this.position.x, this.position.y, - _depth );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

            vector.set( this.position.x, this.position.y, _depth );
            vector = this.avoid( vector );
            vector.multiplyScalar( 5 );
            _acceleration.add( vector );

        }/* else {

        this.checkBounds();

        }
    */

        if ( Math.random() > 0.5 ) {

            this.flock( boids );

        }

        this.move();

    }

    this.flock = function ( boids ) {

        if ( _goal ) {

            _acceleration.add( this.reach( _goal, 0.005 ) );

            return;
        }

        _acceleration.add( this.alignment( boids ) );
        _acceleration.add( this.cohesion( boids ) );
        _acceleration.add( this.separation( boids ) );

    }

    this.move = function () {

        if(FREEZE && !this.chosen) return;

        this.velocity.add( _acceleration );

        var l = this.velocity.length();

        if ( l > _maxSpeed ) {

            this.velocity.divideScalar( l / _maxSpeed );

        }

        this.position.add( this.velocity );
        _acceleration.set( 0, 0, 0 );

    }

    this.checkBounds = function () {

        if ( this.position.x >   _width ) this.position.x = - _width;
        if ( this.position.x < - _width ) this.position.x =   _width;
        if ( this.position.y >   _height ) this.position.y = - _height;
        if ( this.position.y < - _height ) this.position.y =  _height;
        if ( this.position.z >  _depth ) this.position.z = - _depth;
        if ( this.position.z < - _depth ) this.position.z =  _depth;

    }

    //

    this.avoid = function ( target ) {

        var steer = new THREE.Vector3();

        steer.copy( this.position );
        steer.sub( target );

        steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );

        return steer;

    }

    this.repulse = function ( target ) {

        var distance = this.position.distanceTo( target );

        if ( distance < 150 ) {

            var steer = new THREE.Vector3();

            steer.subVectors( this.position, target );
            steer.multiplyScalar( 0.5 / distance );

            _acceleration.add( steer );

        }

    }

    this.reach = function ( target, amount ) {

        var steer = new THREE.Vector3();

        steer.subVectors( target, this.position );
        steer.multiplyScalar( amount );

        return steer;

    }

    this.alignment = function ( boids ) {

        var boid, velSum = new THREE.Vector3(),
        count = 0;

        for ( var i = 0, il = boids.length; i < il; i++ ) {

            if ( Math.random() > 0.6 ) continue;

            boid = boids[ i ];

            distance = boid.position.distanceTo( this.position );

            if ( distance > 0 && distance <= _neighborhoodRadius ) {

                velSum.add( boid.velocity );
                count++;

            }

        }

        if ( count > 0 ) {

            velSum.divideScalar( count );

            var l = velSum.length();

            if ( l > _maxSteerForce ) {

                velSum.divideScalar( l / _maxSteerForce );

            }

        }

        return velSum;

    }

    this.cohesion = function ( boids ) {

        var boid, distance,
        posSum = new THREE.Vector3(),
        steer = new THREE.Vector3(),
        count = 0;

        for ( var i = 0, il = boids.length; i < il; i ++ ) {

            if ( Math.random() > 0.6 ) continue;

            boid = boids[ i ];
            distance = boid.position.distanceTo( this.position );

            if ( distance > 0 && distance <= _neighborhoodRadius ) {

                posSum.add( boid.position );
                count++;

            }

        }

        if ( count > 0 ) {

            posSum.divideScalar( count );

        }

        steer.subVectors( posSum, this.position );

        var l = steer.length();

        if ( l > _maxSteerForce ) {

            steer.divideScalar( l / _maxSteerForce );

        }

        return steer;

    }

    this.separation = function ( boids ) {

        var boid, distance,
        posSum = new THREE.Vector3(),
        repulse = new THREE.Vector3();

        for ( var i = 0, il = boids.length; i < il; i ++ ) {

            if ( Math.random() > 0.6 ) continue;

            boid = boids[ i ];
            distance = boid.position.distanceTo( this.position );

            if ( distance > 0 && distance <= _neighborhoodRadius ) {

                repulse.subVectors( this.position, boid.position );
                repulse.normalize();
                repulse.divideScalar( distance );
                posSum.add( repulse );

            }

        }

        return posSum;

    }

}


var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

var camera, scene, renderer,
birds, bird;

var boid, boids;

var stats;

var raycaster;
var particleMaterial;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
    camera.position.z = 450;

    scene = new THREE.Scene();

    birds = [];
    boids = [];

    for ( var i = 0; i < 5; i ++ ) {

        boid = boids[ i ] = new Boid();
        boid.position.x = Math.random() * 400 - 200;
        boid.position.y = Math.random() * 400 - 200;
        boid.position.z = Math.random() * 400 - 200;
        boid.velocity.x = Math.random() * 2 - 1;
        boid.velocity.y = Math.random() * 2 - 1;
        boid.velocity.z = Math.random() * 2 - 1;
        boid.setAvoidWalls( true );
        boid.setWorldSize( 500, 500, 400 );

        bird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color:Math.random() * 0xffffff, side: THREE.DoubleSide } ) );
        bird.phase = Math.floor( Math.random() * 62.83 );
        bird.text = 'Hello world';
        bird.chosen = false;
        scene.add( bird );


    }

    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0xffffff );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    raycaster = new THREE.Raycaster();

    var PI2 = Math.PI * 2;
    particleMaterial = new THREE.SpriteCanvasMaterial( {

        color: 0x000000,
        program: function ( context ) {

            context.beginPath();
            context.arc( 0, 0, 0.5, 0, PI2, true );
            context.fill();

        }

    } );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.body.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.getElementById( 'container' ).appendChild(stats.domElement);

    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    //

    window.addEventListener( 'resize', onWindowResize, false );

    window.addEventListener( "keypress", doKeyDown, false )

}

function doKeyDown(event){
        console.log(event);
    if(event.keyCode === 32){
        FREEZE = !FREEZE;
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    var vector = new THREE.Vector3( event.clientX - SCREEN_WIDTH_HALF, - event.clientY + SCREEN_HEIGHT_HALF, 0 );

    for ( var i = 0, il = boids.length; i < il; i++ ) {

        boid = boids[ i ];

        vector.z = boid.position.z;

        boid.repulse( vector );

    }

}

//

function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}

function getRandomInt(min, max) {
      return Math.random() * (max - min) + min;
}

function render() {

    for ( var i = 0, il = birds.length; i < il; i++ ) {

        bird = birds[ i ];

        boid = boids[ i ];

        if(birds[ i ].chosen) boids[ i ].chosen = true;

        boid.run( boids );

        bird.position.copy( boids[ i ].position );

        color = bird.material.color;
        if(birds[ i ].chosen) {
            color.r = ( 200 - bird.position.z/2 ) / 1000;
            color.g = 0.5;
            color.b = ( 200 - bird.position.z/2 ) / 1000;
        } else {
            color.r = color.g = color.b = ( 200 - bird.position.z ) / 1000;
        }

        if(!FREEZE || birds[ i ].chosen){
            bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
            bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

            bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;

            bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;
        }

    }

    renderer.render( scene, camera );

}
function onDocumentMouseDown( event ) {

    event.preventDefault();

    var vector = new THREE.Vector3();
    vector.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
    vector.unproject( camera );

    raycaster.ray.set( camera.position, vector.sub( camera.position ).normalize() );

    var intersects = raycaster.intersectObjects( birds );

    if ( intersects.length > 0 ) {

        /*
        intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );

        var particle = new THREE.Sprite( particleMaterial );
        particle.position.copy( intersects[ 0 ].point );
        particle.scale.x = particle.scale.y = 16;
        scene.add( particle );
        */
       intersects[0].object.chosen = true;
    }

}
