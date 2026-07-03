const scene = new THREE.Scene();

// 1. ФОН: Делаем его глобальным фоном сцены, чтобы он растягивался на весь экран
const textureLoader = new THREE.TextureLoader();
textureLoader.load('assets/images/bg.png', (texture) => {
    scene.background = texture;
});

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 50, 60); 
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const arenaGroup = new THREE.Group();

// 2. ПОЛ: Матовое стекло с узорами
function createFloor() {
    // Основная подложка
    const floorGeo = new THREE.PlaneGeometry(WIDTH, HEIGHT);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x010510, 
        transparent: true, 
        opacity: 0.6, 
        roughness: 0.8, // Эффект мутности
        side: THREE.DoubleSide 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    arenaGroup.add(floor);

    // Добавляем узор сетки (как на картинке)
    const grid = new THREE.GridHelper(WIDTH, 20, 0x00ffff, 0x00ffff);
    grid.position.y = 0.05;
    arenaGroup.add(grid);
}
createFloor();

// 3. ЗАБОР: Используем LineSegments для идеальных линий (без треугольников)
function createNeonFence() {
    const w = WIDTH / 2;
    const h = HEIGHT / 2;
    
    // Создаем точки контура
    const points = [];
    // Простая прямоугольная форма с закруглениями (для начала)
    for(let i = 0; i <= 20; i++) points.push(new THREE.Vector3(-w + i*w/10, 0.5, h)); // Верх
    for(let i = 0; i <= 20; i++) points.push(new THREE.Vector3(w, 0.5, h - i*h/10)); // Правая сторона
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    const line = new THREE.Line(geometry, material);
    
    arenaGroup.add(line);
}
createNeonFence();

scene.add(arenaGroup);

// Освещение для матового пола
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
