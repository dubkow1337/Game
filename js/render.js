const scene = new THREE.Scene();

// 1. ФОН (Растягивается на весь экран)
const textureLoader = new THREE.TextureLoader();
textureLoader.load('assets/images/bg.png', (texture) => {
    scene.background = texture;
});

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
// Чуть приподнимем и отодвинем камеру для лучшего обзора высокого забора
camera.position.set(0, 55, 65); 
camera.lookAt(0, -2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const arenaGroup = new THREE.Group();

// Размеры внутренней игровой зоны (где игрок не умирает)
const playWidth = WIDTH - 2;
const playHeight = HEIGHT - 2;

// 2. ПОЛ: Матовое стекло, разделенное по цветам
function createFloor() {
    const floorGeo = new THREE.PlaneGeometry(playWidth / 2, playHeight);
    
    // Левая матовая половина (Синяя)
    const floorLeft = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ 
        color: 0x002233, transparent: true, opacity: 0.5, roughness: 0.7, side: THREE.DoubleSide 
    }));
    floorLeft.position.set(-playWidth / 4, 0, 0);
    floorLeft.rotation.x = -Math.PI / 2;
    
    // Правая матовая половина (Оранжевая)
    const floorRight = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ 
        color: 0x331100, transparent: true, opacity: 0.5, roughness: 0.7, side: THREE.DoubleSide 
    }));
    floorRight.position.set(playWidth / 4, 0, 0);
    floorRight.rotation.x = -Math.PI / 2;
    
    arenaGroup.add(floorLeft, floorRight);

    // СЕТКИ: Создаем две отдельные сетки, строго запертые внутри игровых зон
    // Левая сетка
    const gridLeft = new THREE.GridHelper(playWidth / 2, 10, 0x00ffff, 0x004455);
    gridLeft.position.set(-playWidth / 4, 0.02, 0);
    // Масштабируем по оси Z, чтобы сетка идеально вписалась в прямоугольник поля
    gridLeft.scale.z = playHeight / (playWidth / 2);
    
    // Правая сетка
    const gridRight = new THREE.GridHelper(playWidth / 2, 10, 0xff5500, 0x551100);
    gridRight.position.set(playWidth / 4, 0.02, 0);
    gridRight.scale.z = playHeight / (playWidth / 2);

    arenaGroup.add(gridLeft, gridRight);
}
createFloor();

// 3. МЕГА-ЗАБОР: Высокие полупрозрачные стены с неоновым светящимся кантом
function createHighFence() {
    const w = playWidth / 2;
    const h = playHeight / 2;
    const fenceHeight = 5; // Высота забора
    
    // Функция для создания светящегося канта (верхней кромки)
    const createNeonEdge = (points, color) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: color, linewidth: 3 });
        return new THREE.Line(geometry, material);
    };

    // --- ЛЕВАЯ СТОРОНА ЗАБОРА (СИНЯЯ) ---
    const leftShape = new THREE.Shape();
    leftShape.moveTo(0, h);
    leftShape.lineTo(-w, h);
    leftShape.lineTo(-w, -h);
    leftShape.lineTo(0, -h);

    // Делаем объемную тонкую стену
    const leftWallGeo = new THREE.ExtrudeGeometry(leftShape, { depth: fenceHeight, bevelEnabled: false });
    const leftWallMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff, transparent: true, opacity: 0.15, roughness: 0.2, metalness: 0.5, side: THREE.DoubleSide
    });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.rotation.x = Math.PI / 2; // Переворачиваем вертикально
    arenaGroup.add(leftWall);

    // Верхний светящийся контур для левой стены
    const leftEdgePoints = [
        new THREE.Vector3(0, fenceHeight, h),
        new THREE.Vector3(-w, fenceHeight, h),
        new THREE.Vector3(-w, fenceHeight, -h),
        new THREE.Vector3(0, fenceHeight, -h)
    ];
    arenaGroup.add(createNeonEdge(leftEdgePoints, 0x00ffff));

    // --- ПРАВАЯ СТОРОНА ЗАБОРА (ОРАНЖЕВАЯ) ---
    const rightShape = new THREE.Shape();
    rightShape.moveTo(0, -h);
    rightShape.lineTo(w, -h);
    rightShape.lineTo(w, h);
    rightShape.lineTo(0, h);

    const rightWallGeo = new THREE.ExtrudeGeometry(rightShape, { depth: fenceHeight, bevelEnabled: false });
    const rightWallMat = new THREE.MeshStandardMaterial({
        color: 0xff5500, transparent: true, opacity: 0.15, roughness: 0.2, metalness: 0.5, side: THREE.DoubleSide
    });
    const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
    rightWall.rotation.x = Math.PI / 2;
    arenaGroup.add(rightWall);

    // Верхний светящийся контур для правой стены
    const rightEdgePoints = [
        new THREE.Vector3(0, fenceHeight, -h),
        new THREE.Vector3(w, fenceHeight, -h),
        new THREE.Vector3(w, fenceHeight, h),
        new THREE.Vector3(0, fenceHeight, h)
    ];
    arenaGroup.add(createNeonEdge(rightEdgePoints, 0xff5500));
}
createHighFence();

scene.add(arenaGroup);

// Направленный и рассеянный свет, чтобы матовые стены и пол "играли" бликами
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight.position.set(0, 30, 10);
scene.add(dirLight);

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
