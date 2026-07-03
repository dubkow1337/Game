// --- ИНИЦИАЛИЗАЦИЯ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 52, 48); 
camera.lookAt(0, -2, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- ФОН ---
const textureLoader = new THREE.TextureLoader();
textureLoader.load('assets/images/bg.png', function(texture) {
    const bgGeo = new THREE.PlaneGeometry(210, 120);
    const bgMat = new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.FrontSide,
        depthWrite: false,
        toneMapped: false 
    });
    const backgroundMesh = new THREE.Mesh(bgGeo, bgMat);
    backgroundMesh.position.set(0, -10, -50);
    scene.add(backgroundMesh);
});

// --- АРЕНА ---
const arenaGroup = new THREE.Group();

// 1. Изящный стеклянный пол
function createGlassFloor() {
    const floorGeo = new THREE.PlaneGeometry(WIDTH / 2, HEIGHT);
    
    // Левая сторона (Синяя)
    const floorLeft = new THREE.Mesh(floorGeo, new THREE.MeshPhysicalMaterial({ 
        color: 0x00ffff, transparent: true, opacity: 0.2, roughness: 0, metalness: 0.1, side: THREE.DoubleSide 
    }));
    floorLeft.position.set(-WIDTH / 4, 0, 0);
    floorLeft.rotation.x = -Math.PI / 2;
    
    // Правая сторона (Оранжевая)
    const floorRight = new THREE.Mesh(floorGeo, new THREE.MeshPhysicalMaterial({ 
        color: 0xff5500, transparent: true, opacity: 0.2, roughness: 0, metalness: 0.1, side: THREE.DoubleSide 
    }));
    floorRight.position.set(WIDTH / 4, 0, 0);
    floorRight.rotation.x = -Math.PI / 2;
    
    arenaGroup.add(floorLeft, floorRight);
}
createGlassFloor();

// 2. Изящный неоновый забор
function createNeonFence() {
    const w = WIDTH / 2; const h = HEIGHT / 2; const r = 4;
    
    const createLine = (points, color) => {
        const curve = new THREE.CatmullRomCurve3(points);
        const geo = new THREE.TubeGeometry(curve, 100, 0.15, 8, false);
        const mat = new THREE.MeshBasicMaterial({ color: color });
        return new THREE.Mesh(geo, mat);
    };

    const leftPoints = [];
    for(let t = Math.PI/2; t <= 3*Math.PI/2; t += 0.1) leftPoints.push(new THREE.Vector3(-w+r + Math.cos(t)*r, 0.5, h-r + Math.sin(t)*r));
    leftPoints.unshift(new THREE.Vector3(0, 0.5, h)); leftPoints.push(new THREE.Vector3(0, 0.5, -h));
    
    const rightPoints = [];
    for(let t = -Math.PI/2; t <= Math.PI/2; t += 0.1) rightPoints.push(new THREE.Vector3(w-r + Math.cos(t)*r, 0.5, h-r + Math.sin(t)*r));
    rightPoints.unshift(new THREE.Vector3(0, 0.5, -h)); rightPoints.push(new THREE.Vector3(0, 0.5, h));

    arenaGroup.add(createLine(leftPoints, 0x00ffff));
    arenaGroup.add(createLine(rightPoints, 0xff5500));
}
createNeonFence();
scene.add(arenaGroup);

// --- ОСТАЛЬНОЕ ---
players.forEach(p => scene.add(p.mesh));

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
