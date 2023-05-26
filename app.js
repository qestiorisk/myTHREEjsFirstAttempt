import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const cube = new THREE.Mesh( 
    new THREE.BoxGeometry( 1, 1, 1 ), 
    new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
);
scene.add( cube );
let dropping_cubes = []  // 記錄所有正在掉落的方塊
let standing_cubes = [cube]  // 記錄有站好的方塊

camera.position.x = 5;
camera.position.y = 5;  // 看來Y才是高度
camera.position.z = 10;

// 讓方塊有向下的力
const cubes_gravity = () => {
    dropping_cubes.forEach( c => {
        c.position.y -= 0.1
    })
}

const handle_collision = () => {
    // 把方塊從正在掉落的array換到站好的array
    dropping_cubes.forEach( c => {
        if( Math.abs(c.position.y - standing_cubes.length) < 0.01
            && Math.abs(c.position.x - standing_cubes[standing_cubes.length-1].position.x) < 1
            && Math.abs(c.position.z - standing_cubes[standing_cubes.length-1].position.z) < 1
        ){  // 沒查到 THREE.js怎麼處理物理碰撞等等 我先手刻了一個極簡版
            const index = dropping_cubes.indexOf(c)
            if (index > -1) dropping_cubes.splice(index, 1); 
            standing_cubes.push(c)
        }
    })
}

// 這個方塊超過範圍了 我們不要了
const delete_cubes = () => {
    dropping_cubes.forEach( c => {
        if(c.position.y < -10) {            
            scene.remove( c );
            c.geometry.dispose();
            c.material.dispose();
        }
    })
}

const floor = document.getElementById('floor')

// 每一幀要執行的loop 但這名字我覺得我取的不是很好 
const frame_loop = () => {  
	requestAnimationFrame( frame_loop );

	cube.rotation.y += 0.01;
    standing_cubes.forEach(c => c.rotation.y += 0.01)
    camera.lookAt( 0, 1 + 0.8*(standing_cubes.length+dropping_cubes.length), 0 );  // 高度y隨著方塊越多而拉高 前面參數1+0.8是目前試出來最好看的

    cubes_gravity()
    handle_collision()
    delete_cubes()
	renderer.render( scene, camera );

    floor.innerText = `${standing_cubes.length } 樓`
}
frame_loop();

// 生成新方塊
function addCubes(mouse_x, mouse_y) {
    const cube_temp = new THREE.Mesh( 
        new THREE.BoxGeometry( 1, 1, 1 ),
        new THREE.MeshBasicMaterial( { color:  THREE.MathUtils.randInt(0, 0xffffff)} )
    );
    cube_temp.position.y = standing_cubes.length + 5
    cube_temp.position.x = mouse_x 
    cube_temp.position.z = mouse_y

    scene.add( cube_temp );
    dropping_cubes.push(cube_temp)
    moveCamera(0, 1, 0)
}

function moveCamera(x=0, y=0, z=0) {
    camera.position.x += x;
    camera.position.y += y;
    camera.position.z += z;
}

document.body.addEventListener('click', (e)=>{
    let mouse_x = ( e.clientX / window.innerWidth ) * 2 - 1;
    let mouse_y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    console.log(mouse_x, mouse_y)
    addCubes(mouse_x, mouse_y) 
})