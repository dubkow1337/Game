const scene = new THREE.Scene(); 
scene.background = new THREE.Color(0x000000);
// УБИРАЕМ ТУМАН - фон будет четким до самого края
// scene.fog = ... (удалено)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 52, 48); 
camera.lookAt(0, -2, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// СВЕТ (оставляем только для самой арены и конусов)
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// ЗАДНИЙ ФОН - МАКСИМАЛЬНАЯ ЯРКОСТЬ И ЧЕТКОСТЬ
const textureLoader = new THREE.TextureLoader();
textureLoader.load('assets/images/bg.png', function(texture) {
    const bgGeo = new THREE.PlaneGeometry(210, 120);
    
    // MeshBasicMaterial + отмена влияния освещения сцены
    const bgMat = new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.FrontSide,
        depthWrite: false,
        // Фон не будет затемняться, он будет светиться как экран монитора
        toneMapped: false 
    });
    
    const backgroundMesh = new THREE.Mesh(bgGeo, bgMat);
    // Располагаем прямо за ареной
    backgroundMesh.position.set(0, -10, -50);
    scene.add(backgroundMesh);
});

// АРЕНА (код остается прежним)
const arenaGroup = new THREE.Group();
const arenaFloor = new THREE.Mesh(
    new THREE.BoxGeometry(WIDTH, 0.5, HEIGHT), 
    new THREE.MeshStandardMaterial({ color: 0x010105, roughness: 0.1, metalness: 0.8 })
);
arenaFloor.position.y = -0.25; 
arenaGroup.add(arenaFloor);

// СЕТКИ И РАМКА (остаются прежними)
const gridLeft = new THREE.GridHelper(WIDTH/2, WIDTH/2, 0x00ffff, 0x00ffff); 
gridLeft.position.set(-WIDTH/4, 0.02, 0); 
arenaGroup.add(gridLeft);

const gridRight = new THREE.GridHelper(WIDTH/2, WIDTH/2, 0xff5500, 0xff5500); 
gridRight.position.set(WIDTH/4, 0.02, 0); 
arenaGroup.add(gridRight);

function createNeonFrame() {
    const w = WIDTH / 2; const h = HEIGHT / 2; const r = 4;
    // ... (код создания рамки тот же)
}
createNeonFrame();
scene.add(arenaGroup);
players.forEach(p => scene.add(p.mesh));
