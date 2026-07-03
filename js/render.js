// ============================================
// 3D АРЕНА - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ
// ============================================

const scene = new THREE.Scene();

// 1. ФОН - Космос с эффектом туманности
const textureLoader = new THREE.TextureLoader();
textureLoader.load('assets/images/bg.png', (texture) => {
    scene.background = texture;
});

// Добавляем звездный фон программно (если нет текстуры)
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 3000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);
    
    for (let i = 0; i < starsCount; i++) {
        const radius = 200 + Math.random() * 300;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(theta) * Math.cos(phi);
        
        const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.3, 0.8, 0.5 + Math.random() * 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        sizes[i] = 0.5 + Math.random() * 1.5;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}
createStarfield();

// ============================================
// КОНФИГУРАЦИЯ АРЕНЫ
// ============================================
const WIDTH = 70;
const HEIGHT = 40;
const playWidth = WIDTH - 2;
const playHeight = HEIGHT - 2;
const radius = 6;

// 2. КАМЕРА - Исправленный угол обзора
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 68, 58); // Применили твой идеальный угол
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

const arenaGroup = new THREE.Group();

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================
function createRoundedRectShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    
    shape.moveTo(x, y + r);
    shape.lineTo(x, y + h - r);
    shape.absarc(x + r, y + h - r, r, Math.PI, Math.PI / 2, true);
    shape.lineTo(x + w - r, y + h);
    shape.absarc(x + w - r, y + h - r, r, Math.PI / 2, 0, true);
    shape.lineTo(x + w, y + r);
    shape.absarc(x + w - r, y + r, r, 0, -Math.PI / 2, true);
    shape.lineTo(x + r, y);
    shape.absarc(x + r, y + r, r, -Math.PI / 2, Math.PI, true);
    
    return shape;
}

// ============================================
// 1. ПОЛ С ЭФФЕКТОМ ГЛУБИНЫ (МАТОВОЕ СТЕКЛО)
// ============================================
function createFloor() {
    const shape = createRoundedRectShape(playWidth, playHeight, radius);
    const floorGeo = new THREE.ShapeGeometry(shape);
    
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x020816,
        roughness: 0.7, // Эффект мутности
        metalness: 0.8,
        emissive: 0x010510,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
    });
    
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    arenaGroup.add(floor);
}
createFloor();

// ============================================
// 2. СВЕТЯЩАЯСЯ МЕЛКАЯ СЕТКА
// ============================================
function createGrid() {
    // ИСПРАВЛЕНО: Обращение к материалам Helpers идет через массив или .material внутри Three
    const gridLeft = new THREE.GridHelper(playWidth / 2, 40, 0x00ffff, 0x002233);
    gridLeft.position.set(-playWidth / 4, 0.02, 0);
    gridLeft.scale.z = playHeight / (playWidth / 2);
    gridLeft.material.transparent = true;
    gridLeft.material.opacity = 0.3;
    arenaGroup.add(gridLeft);
    
    const gridRight = new THREE.GridHelper(playWidth / 2, 40, 0xff5500, 0x331100);
    gridRight.position.set(playWidth / 4, 0.02, 0);
    gridRight.scale.z = playHeight / (playWidth / 2);
    gridRight.material.transparent = true;
    gridRight.material.opacity = 0.3;
    arenaGroup.add(gridRight);
    
    // Центральная разделительная линия
    const centerPoints = [
        new THREE.Vector3(0, 0.03, -playHeight/2),
        new THREE.Vector3(0, 0.03, playHeight/2)
    ];
    const centerGeo = new THREE.BufferGeometry().setFromPoints(centerPoints);
    const centerMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
    arenaGroup.add(new THREE.Line(centerGeo, centerMat));
}
createGrid();

// ============================================
// 3. МАСШТАБНЫЙ ЗАКРУГЛЕННЫЙ ЗАБОР
// ============================================
function createFence() {
    const fenceHeight = 5;
    const wallShape = createRoundedRectShape(playWidth, playHeight, radius);
    
    const extrudeSettings = { depth: fenceHeight, bevelEnabled: false };
    const wallGeo = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
    
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x0d1b2a,
        emissive: 0x001122,
        transparent: true,
        opacity: 0.4, // Забор материальный, его видно в воздухе
        roughness: 0.1,
        metalness: 0.8,
        side: THREE.DoubleSide
    });
    
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.rotation.x = Math.PI / 2;
    wall.position.y = fenceHeight;
    wall.castShadow = true;
    wall.receiveShadow = true;
    arenaGroup.add(wall);
    
    // ВЕРХНИЙ НЕОНОВЫЙ КАНТ (Разделенный на левый и правый)
    const points = wallShape.getPoints(60);
    const edge3DPoints = points.map(p => new THREE.Vector3(p.x, fenceHeight - 0.05, -p.y));
    
    // ИСПРАВЛЕНО: Четкое разделение массива точек на Левую (Синию) и Правую (Оранжевую) половины сцены
    const leftPoints = edge3DPoints.filter(p => p.x <= 0.1);
    const rightPoints = edge3DPoints.filter(p => p.x >= -0.1);

    const leftGeo = new THREE.BufferGeometry().setFromPoints(leftPoints);
    const leftMat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 3 });
    arenaGroup.add(new THREE.Line(leftGeo, leftMat));
    
    const rightGeo = new THREE.BufferGeometry().setFromPoints(rightPoints);
    const rightMat = new THREE.LineBasicMaterial({ color: 0xff5500, linewidth: 3 });
    arenaGroup.add(new THREE.Line(rightGeo, rightMat));
}
createFence();

// ============================================
// 4. УГЛОВЫЕ СТОЛБЫ С ЭНЕРГЕТИЧЕСКИМИ СФЕРАМИ
// ============================================
function createCornerPillars() {
    const corners = [
        [-playWidth/2 + 0.5, -playHeight/2 + 0.5],
        [playWidth/2 - 0.5, -playHeight/2 + 0.5],
        [-playWidth/2 + 0.5, playHeight/2 - 0.5],
        [playWidth/2 - 0.5, playHeight/2 - 0.5]
    ];
    
    corners.forEach(([x, z], index) => {
        const group = new THREE.Group();
        const mainColor = (x < 0) ? 0x00ffff : 0xff5500; // Цвет столба зависит от половины поля
        
        const pillarMat = new THREE.MeshPhysicalMaterial({
            color: 0x0e1726,
            metalness: 0.9,
            roughness: 0.1,
            emissive: mainColor,
            emissiveIntensity: 0.2
        });
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 5, 12), pillarMat);
        pillar.position.y = 2.5;
        group.add(pillar);
        
        const ringMat = new THREE.MeshBasicMaterial({ color: mainColor, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 8, 16), ringMat);
        ring.position.y = 4.8;
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        
        const sphereMat = new THREE.MeshBasicMaterial({ color: mainColor });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), sphereMat);
        sphere.position.y = 5.2;
        group.add(sphere);
        
        group.position.set(x, 0, z);
        arenaGroup.add(group);
    });
}
createCornerPillars();

// ============================================
// 5. ОСВЕЩЕНИЕ
// ============================================
function createLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.5);
    mainLight.position.set(0, 40, 20);
    scene.add(mainLight);
}
createLighting();

// ============================================
// 6. АНИМАЦИЯ НЕОНА
// ============================================
let time = 0;
function animateNeon() {
    time += 0.02;
    arenaGroup.children.forEach(child => {
        // Безопасная анимация мерцания кастомных линий
        if (child.isLine && child.material) {
            if (child.material.color.getHex() === 0x00ffff) {
                child.material.opacity = 0.6 + Math.sin(time * 2) * 0.3;
            }
            if (child.material.color.getHex() === 0xff5500) {
                child.material.opacity = 0.6 + Math.sin(time * 2 + Math.PI) * 0.3;
            }
        }
    });
}

// ============================================
// 7. РЕНДЕР ЦИКЛ И ИНИЦАЛИЗАЦИЯ СЦЕНЫ
// ============================================
scene.add(arenaGroup);

// Безопасное добавление игроков (если они объявлены глобально)
if (typeof players !== 'undefined') {
    players.forEach(p => scene.add(p.mesh));
}

function animate() {
    requestAnimationFrame(animate);
    animateNeon();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('🏟️ Арена успешно запущена и работает!');
