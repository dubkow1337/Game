// ============================================
// 3D АРЕНА - ПОЛНАЯ ВЕРСИЯ
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

// 2. КАМЕРА - Исправленный угол обзора
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 55, 65);
camera.lookAt(0, 0, 0); // Смотрим в центр арены

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
// КОНФИГУРАЦИЯ АРЕНЫ
// ============================================
const WIDTH = 70;
const HEIGHT = 40;
const playWidth = WIDTH - 2;
const playHeight = HEIGHT - 2;
const radius = 6;

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

function createRoundedRectPath(w, h, r, segments = 50) {
    const shape = createRoundedRectShape(w, h, r);
    return shape.getPoints(segments);
}

// ============================================
// 1. ПОЛ С ЭФФЕКТОМ ГЛУБИНЫ
// ============================================
function createFloor() {
    // Основной пол
    const shape = createRoundedRectShape(playWidth, playHeight, radius);
    const floorGeo = new THREE.ShapeGeometry(shape);
    
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0a0f24,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0x050810,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
    });
    
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    arenaGroup.add(floor);
    
    // Полупрозрачный слой с эффектом глубины
    const depthMat = new THREE.MeshStandardMaterial({
        color: 0x001133,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        roughness: 0.1,
        metalness: 0.9
    });
    const depthFloor = new THREE.Mesh(floorGeo.clone(), depthMat);
    depthFloor.rotation.x = -Math.PI / 2;
    depthFloor.position.y = -0.05;
    arenaGroup.add(depthFloor);
}
createFloor();

// ============================================
// 2. СВЕТЯЩАЯСЯ СЕТКА
// ============================================
function createGrid() {
    // Синяя сетка (левая половина)
    const gridLeftMat = new THREE.GridHelper(playWidth / 2, 30, 0x00ffff, 0x003366);
    gridLeftMat.position.set(-playWidth / 4, 0.05, 0);
    gridLeftMat.scale.z = playHeight / (playWidth / 2);
    gridLeftMat.material.transparent = true;
    gridLeftMat.material.opacity = 0.3;
    arenaGroup.add(gridLeftMat);
    
    // Оранжевая сетка (правая половина)
    const gridRightMat = new THREE.GridHelper(playWidth / 2, 30, 0xff5500, 0x663300);
    gridRightMat.position.set(playWidth / 4, 0.05, 0);
    gridRightMat.scale.z = playHeight / (playWidth / 2);
    gridRightMat.material.transparent = true;
    gridRightMat.material.opacity = 0.3;
    arenaGroup.add(gridRightMat);
    
    // Центральная разделительная линия
    const centerPoints = [
        new THREE.Vector3(0, 0.06, -playHeight/2),
        new THREE.Vector3(0, 0.06, playHeight/2)
    ];
    const centerGeo = new THREE.BufferGeometry().setFromPoints(centerPoints);
    const centerMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        dashSize: 0.5,
        gapSize: 0.3
    });
    const centerLine = new THREE.Line(centerGeo, centerMat);
    arenaGroup.add(centerLine);
}
createGrid();

// ============================================
// 3. МАСШТАБНЫЙ ЗАБОР С НЕОНОВОЙ ПОДСВЕТКОЙ
// ============================================
function createFence() {
    const fenceHeight = 4.5;
    const wallShape = createRoundedRectShape(playWidth, playHeight, radius);
    
    // Основной забор
    const extrudeSettings = {
        depth: fenceHeight,
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize: 0.1,
        bevelSegments: 3
    };
    const wallGeo = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
    
    const wallMat = new THREE.MeshPhysicalMaterial({
        color: 0x0d1b2a,
        emissive: 0x001133,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.9,
        side: THREE.DoubleSide,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2
    });
    
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.rotation.x = Math.PI / 2;
    wall.position.y = fenceHeight / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    arenaGroup.add(wall);
    
    // ВНУТРЕННИЙ НЕОНОВЫЙ КАНТ
    const points = createRoundedRectPath(playWidth - 0.5, playHeight - 0.5, radius - 0.3, 60);
    const edgePoints = points.map(p => new THREE.Vector3(p.x, fenceHeight - 0.1, -p.y));
    const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePoints);
    
    // Синий кант (левая половина)
    const leftPoints = edgePoints.filter((_, i) => i < edgePoints.length / 2);
    const leftGeo = new THREE.BufferGeometry().setFromPoints(leftPoints);
    const leftMat = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
    });
    const leftLine = new THREE.Line(leftGeo, leftMat);
    arenaGroup.add(leftLine);
    
    // Оранжевый кант (правая половина)
    const rightPoints = edgePoints.filter((_, i) => i >= edgePoints.length / 2);
    const rightGeo = new THREE.BufferGeometry().setFromPoints(rightPoints);
    const rightMat = new THREE.LineBasicMaterial({
        color: 0xff5500,
        transparent: true,
        opacity: 0.8
    });
    const rightLine = new THREE.Line(rightGeo, rightMat);
    arenaGroup.add(rightLine);
    
    // НИЖНИЙ НЕОНОВЫЙ КАНТ
    const bottomPoints = points.map(p => new THREE.Vector3(p.x, 0.1, -p.y));
    const bottomGeo = new THREE.BufferGeometry().setFromPoints(bottomPoints);
    const bottomMat = new THREE.LineBasicMaterial({
        color: 0xff00aa,
        transparent: true,
        opacity: 0.4
    });
    const bottomLine = new THREE.Line(bottomGeo, bottomMat);
    arenaGroup.add(bottomLine);
}
createFence();

// ============================================
// 4. УГЛОВЫЕ СТОЛБЫ С ЭНЕРГЕТИЧЕСКИМИ СФЕРАМИ
// ============================================
function createCornerPillars() {
    const corners = [
        [-playWidth/2 + 1, -playHeight/2 + 1],
        [playWidth/2 - 1, -playHeight/2 + 1],
        [-playWidth/2 + 1, playHeight/2 - 1],
        [playWidth/2 - 1, playHeight/2 - 1]
    ];
    
    corners.forEach(([x, z]) => {
        const group = new THREE.Group();
        
        // Основной столб
        const pillarMat = new THREE.MeshPhysicalMaterial({
            color: 0x111630,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x001133,
            emissiveIntensity: 0.5,
            clearcoat: 0.5
        });
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 5, 12), pillarMat);
        pillar.position.y = 2.5;
        pillar.castShadow = true;
        group.add(pillar);
        
        // Верхнее кольцо
        const ringMat = new THREE.MeshPhysicalMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.7,
            metalness: 0.9,
            roughness: 0.1
        });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 8, 16), ringMat);
        ring.position.y = 4.8;
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        
        // Нижнее кольцо
        const ringBottomMat = new THREE.MeshPhysicalMaterial({
            color: 0xff00aa,
            emissive: 0xff00aa,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.5,
            metalness: 0.9,
            roughness: 0.1
        });
        const ringBottom = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 8, 16), ringBottomMat);
        ringBottom.position.y = 0.2;
        ringBottom.rotation.x = Math.PI / 2;
        group.add(ringBottom);
        
        // Энергетическая сфера на вершине
        const sphereMat = new THREE.MeshPhysicalMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.6,
            metalness: 0.0,
            roughness: 0.0,
            clearcoat: 0.5
        });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), sphereMat);
        sphere.position.y = 5.3;
        group.add(sphere);
        
        group.position.set(x, 0, z);
        arenaGroup.add(group);
    });
}
createCornerPillars();

// ============================================
// 5. ДЕКОРАТИВНЫЕ ЭЛЕМЕНТЫ
// ============================================
function createDecorations() {
    // Светящиеся линии на полу
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.1
    });
    
    const lineMat2 = new THREE.LineBasicMaterial({
        color: 0xff5500,
        transparent: true,
        opacity: 0.1
    });
    
    // Диагональные линии
    const lines = [
        { x1: -playWidth/2 + 3, z1: -playHeight/2 + 3, x2: playWidth/2 - 3, z2: playHeight/2 - 3, mat: lineMat },
        { x1: playWidth/2 - 3, z1: -playHeight/2 + 3, x2: -playWidth/2 + 3, z2: playHeight/2 - 3, mat: lineMat2 }
    ];
    
    lines.forEach(({ x1, z1, x2, z2, mat }) => {
        const points = [
            new THREE.Vector3(x1, 0.04, z1),
            new THREE.Vector3(x2, 0.04, z2)
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, mat);
        arenaGroup.add(line);
    });
}
createDecorations();

// ============================================
// 6. ОСВЕЩЕНИЕ
// ============================================
function createLighting() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x2233aa, 0.4);
    scene.add(ambient);
    
    // Основной свет
    const mainLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    mainLight.position.set(30, 50, 30);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 150;
    mainLight.shadow.camera.left = -50;
    mainLight.shadow.camera.right = 50;
    mainLight.shadow.camera.top = 50;
    mainLight.shadow.camera.bottom = -50;
    scene.add(mainLight);
    
    // Дополнительный свет
    const fillLight = new THREE.DirectionalLight(0x00ffff, 0.3);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);
    
    // Контровой свет
    const rimLight = new THREE.DirectionalLight(0xff00aa, 0.2);
    rimLight.position.set(0, 10, -50);
    scene.add(rimLight);
    
    // Точечный свет в центре
    const centerLight = new THREE.PointLight(0x00ffff, 0.5, 60);
    centerLight.position.set(0, 20, 0);
    scene.add(centerLight);
}
createLighting();

// ============================================
// 7. ТРИБУНЫ (ЗРИТЕЛИ)
// ============================================
function createTribunes() {
    const tribuneMat = new THREE.MeshPhysicalMaterial({
        color: 0x080b18,
        roughness: 0.6,
        metalness: 0.3,
        emissive: 0x020408,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });
    
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = Math.max(playWidth, playHeight) / 2 + 12 + Math.random() * 4;
        const width = 10 + Math.random() * 8;
        const height = 3 + Math.random() * 6;
        const depth = 6 + Math.random() * 6;
        
        const tribune = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            tribuneMat
        );
        tribune.position.set(
            Math.cos(angle) * radius,
            height / 2,
            Math.sin(angle) * radius
        );
        tribune.rotation.y = -angle + Math.PI / 2;
        tribune.castShadow = true;
        tribune.receiveShadow = true;
        arenaGroup.add(tribune);
        
        // Неоновая подсветка трибуны
        const neonMat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x00ffff : 0xff5500,
            transparent: true,
            opacity: 0.15 + Math.random() * 0.15
        });
        const neonStrip = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.3, 0.05, depth + 0.3),
            neonMat
        );
        neonStrip.position.set(
            Math.cos(angle) * radius,
            height + 0.05,
            Math.sin(angle) * radius
        );
        neonStrip.rotation.y = -angle + Math.PI / 2;
        arenaGroup.add(neonStrip);
    }
}
createTribunes();

// ============================================
// 8. НЕОНОВЫЕ ДОРОЖКИ ПО КРАЯМ
// ============================================
function createNeonTracks() {
    const trackMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.08
    });
    
    const trackMat2 = new THREE.MeshBasicMaterial({
        color: 0xff5500,
        transparent: true,
        opacity: 0.08
    });
    
    // Синяя дорожка слева
    const leftTrack = new THREE.Mesh(
        new THREE.BoxGeometry(playWidth / 2, 0.02, playHeight - 2),
        trackMat
    );
    leftTrack.position.set(-playWidth / 4, 0.03, 0);
    arenaGroup.add(leftTrack);
    
    // Оранжевая дорожка справа
    const rightTrack = new THREE.Mesh(
        new THREE.BoxGeometry(playWidth / 2, 0.02, playHeight - 2),
        trackMat2
    );
    rightTrack.position.set(playWidth / 4, 0.03, 0);
    arenaGroup.add(rightTrack);
}
createNeonTracks();

// ============================================
// 9. АНИМАЦИЯ НЕОНА
// ============================================
let time = 0;

function animateNeon() {
    time += 0.01;
    
    arenaGroup.children.forEach(child => {
        if (child.isMesh && child.material && child.material.color) {
            // Анимация прозрачности неоновых элементов
            if (child.material.color.getHex() === 0x00ffff && child.material.opacity !== undefined) {
                child.material.opacity = 0.3 + Math.sin(time * 2 + child.position.x) * 0.2;
            }
            if (child.material.color.getHex() === 0xff5500 && child.material.opacity !== undefined) {
                child.material.opacity = 0.3 + Math.sin(time * 2.5 + child.position.x) * 0.2;
            }
            if (child.material.color.getHex() === 0xff00aa && child.material.opacity !== undefined) {
                child.material.opacity = 0.3 + Math.sin(time * 3 + child.position.z) * 0.15;
            }
        }
    });
}

// ============================================
// 10. РЕНДЕР ЦИКЛ
// ============================================
scene.add(arenaGroup);

function animate() {
    requestAnimationFrame(animate);
    
    // Анимация неона
    animateNeon();
    
    renderer.render(scene, camera);
}
animate();

// ============================================
// 11. АДАПТИВНОСТЬ
// ============================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('🏟️ Арена создана!');
console.log(`📐 Размеры: ${WIDTH}x${HEIGHT}`);
console.log('✨ Неоновая подсветка активна');
