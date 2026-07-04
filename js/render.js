// ============================================
// render.js - 3D Арена для TRON игры
// Версия: 8.1 (Увеличенная модель мотоцикла)
// ============================================

// ============================================
// 1. КОНФИГУРАЦИЯ АРЕНЫ
// ============================================
const RENDER_CONFIG = {
    width: 70,
    height: 70,
    radius: 4,
    fenceHeight: 5,
    fenceThickness: 0.8,
    gridDivisions: 40,
    cameraPos: { x: 0, y: 75, z: 75 },
    colors: {
        blue: 0x00ccff,
        blueDark: 0x0044aa,
        blueGlow: 0x0066ff,
        orange: 0xff6600,
        orangeDark: 0xcc4400,
        orangeGlow: 0xff4400,
        pink: 0xff00aa,
        glass: 0x0a0a20,
        fence: 0x0d1b2a,
        center: 0xffffff
    },
    bikeModelPath: 'assets/images/QOZKQ6KP0QTLLC8KUELTN3IVY.glb',
    bikeScale: 2.5  // ← УВЕЛИЧИЛИ В 2.5 РАЗА!
};

const ARENA_W = RENDER_CONFIG.width;
const ARENA_H = RENDER_CONFIG.height;
const ARENA_PLAY_W = ARENA_W - 2;
const ARENA_PLAY_H = ARENA_H - 2;
const ARENA_RADIUS = RENDER_CONFIG.radius;

// ============================================
// 2. ИНИЦИАЛИЗАЦИЯ СЦЕНЫ
// ============================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.FogExp2(0x050510, 0.002);

// ============================================
// 3. КАМЕРА
// ============================================
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(RENDER_CONFIG.cameraPos.x, RENDER_CONFIG.cameraPos.y, RENDER_CONFIG.cameraPos.z);
camera.lookAt(0, 0, 0);

// ============================================
// 4. РЕНДЕР
// ============================================
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
document.body.appendChild(renderer.domElement);

// ============================================
// 5. ЗАГРУЗЧИК GLB МОДЕЛИ
// ============================================
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
document.head.appendChild(script);

let bikeModel = null;
let bikeModelLoaded = false;
let bikeModelLoading = false;

function loadBikeModel() {
    if (bikeModelLoading) return;
    bikeModelLoading = true;
    
    console.log('🏍️ Загрузка модели мотоцикла...');
    
    const checkLoader = setInterval(() => {
        if (typeof THREE.GLTFLoader !== 'undefined') {
            clearInterval(checkLoader);
            
            const loader = new THREE.GLTFLoader();
            loader.load(
                RENDER_CONFIG.bikeModelPath,
                (gltf) => {
                    bikeModel = gltf.scene;
                    bikeModelLoaded = true;
                    bikeModelLoading = false;
                    console.log('✅ Модель мотоцикла загружена!');
                    applyBikeModelsToPlayers();
                },
                (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    if (percent % 20 === 0) {
                        console.log(`⏳ Загрузка модели: ${percent}%`);
                    }
                },
                (error) => {
                    console.error('❌ Ошибка загрузки модели:', error);
                    bikeModelLoading = false;
                    createFallbackBikes();
                }
            );
        }
    }, 100);
}

// ============================================
// 6. ПРИМЕНЕНИЕ МОДЕЛИ К ИГРОКАМ (С УВЕЛИЧЕННЫМ РАЗМЕРОМ)
// ============================================
function applyBikeModelsToPlayers() {
    if (!bikeModelLoaded || !bikeModel) {
        console.warn('⚠️ Модель не загружена');
        return;
    }
    
    if (typeof players === 'undefined' || !Array.isArray(players)) {
        console.warn('⚠️ Игроки не найдены');
        return;
    }
    
    players.forEach((player, index) => {
        if (!player) return;
        
        if (player.mesh && player.mesh.parent) {
            scene.remove(player.mesh);
        }
        
        const model = bikeModel.clone();
        
        // 🔥 УВЕЛИЧЕННЫЙ МАСШТАБ В 2.5 РАЗА 🔥
        const scale = RENDER_CONFIG.bikeScale;
        model.scale.set(scale, scale, scale);
        
        // Меняем цвет
        const color = index === 0 ? RENDER_CONFIG.colors.blue : RENDER_CONFIG.colors.orange;
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.color.setHex(color);
                        if (mat.emissive) {
                            mat.emissive.setHex(color);
                            mat.emissiveIntensity = 0.3;
                        }
                    });
                } else {
                    child.material.color.setHex(color);
                    if (child.material.emissive) {
                        child.material.emissive.setHex(color);
                        child.material.emissiveIntensity = 0.3;
                    }
                }
            }
        });
        
        player.mesh = model;
        scene.add(model);
        
        const pos = Utils.gridToScene(player.x, player.y, ARENA_W, ARENA_H);
        model.position.set(pos.x, 0.2, pos.z);
        updateBikeRotation(player);
        
        console.log(`✅ Модель мотоцикла (масштаб ${scale}x) применена к игроку ${index + 1}`);
    });
}

// ============================================
// 7. ЗАГЛУШКА (СТРЕЛКИ) ЕСЛИ МОДЕЛЬ НЕ ЗАГРУЗИЛАСЬ
// ============================================
function createFallbackBikes() {
    console.log('🔄 Используем заглушки (стрелки)');
    
    if (typeof players === 'undefined' || !Array.isArray(players)) {
        return;
    }
    
    players.forEach((player, index) => {
        if (!player) return;
        
        if (player.mesh && player.mesh.parent) {
            scene.remove(player.mesh);
        }
        
        const color = index === 0 ? RENDER_CONFIG.colors.blue : RENDER_CONFIG.colors.orange;
        const group = new THREE.Group();
        
        const bodyMat = new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0.9,
            roughness: 0.1,
            emissive: color,
            emissiveIntensity: 0.3
        });
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.5, 8), bodyMat);
        body.position.y = 0.5;
        body.rotation.x = Math.PI / 2;
        body.castShadow = true;
        group.add(body);
        
        const noseMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.1,
            emissive: color,
            emissiveIntensity: 0.5
        });
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), noseMat);
        nose.position.set(0, 0.5, 1.2);
        group.add(nose);
        
        player.mesh = group;
        scene.add(group);
        
        const pos = Utils.gridToScene(player.x, player.y, ARENA_W, ARENA_H);
        group.position.set(pos.x, 0.3, pos.z);
        updateBikeRotation(player);
    });
}

// ============================================
// 8. ПОВОРОТ БАЙКА
// ============================================
function updateBikeRotation(player) {
    if (!player || !player.mesh) return;
    
    if (player.dirX === 1) player.mesh.rotation.y = Math.PI / 2;
    else if (player.dirX === -1) player.mesh.rotation.y = -Math.PI / 2;
    else if (player.dirY === 1) player.mesh.rotation.y = 0;
    else if (player.dirY === -1) player.mesh.rotation.y = Math.PI;
}

// ============================================
// 9. ОСВЕЩЕНИЕ
// ============================================
function setupLighting() {
    const ambient = new THREE.AmbientLight(0x4466aa, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    dirLight.position.set(30, 50, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 150;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    scene.add(dirLight);

    const blueLight = new THREE.DirectionalLight(0x00ccff, 0.8);
    blueLight.position.set(-40, 30, 0);
    scene.add(blueLight);

    const orangeLight = new THREE.DirectionalLight(0xff6600, 0.8);
    orangeLight.position.set(40, 30, 0);
    scene.add(orangeLight);
}
setupLighting();

// ============================================
// 10. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================
function createRoundedRectShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;

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

function getRoundedRectPoints(w, h, r, segments = 60) {
    const shape = createRoundedRectShape(w, h, r);
    return shape.getPoints(segments);
}

const Utils = {
    gridToScene: (gx, gy, width, height) => {
        return { x: gx - width/2, z: gy - height/2 };
    }
};

// ============================================
// 11. ЗАДНИЙ ФОН
// ============================================
function setupBackground() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        'assets/images/bg.png',
        (texture) => {
            scene.background = texture;
            console.log('✅ Фон загружен!');
        },
        undefined,
        () => {
            console.warn('⚠️ Фон не загружен, используется стандартный');
            scene.background = new THREE.Color(0x050510);
        }
    );

    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
        const radius = 100 + Math.random() * 350;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(theta) * Math.cos(phi);

        const hue = 0.6 + Math.random() * 0.3;
        const brightness = 0.5 + Math.random() * 0.5;
        const color = new THREE.Color().setHSL(hue, 0.9, brightness);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}
setupBackground();

// ============================================
// 12. ПОЛ АРЕНЫ
// ============================================
function createFloor() {
    const shape = createRoundedRectShape(ARENA_PLAY_W, ARENA_PLAY_H, ARENA_RADIUS);
    const floorGeo = new THREE.ShapeGeometry(shape);

    const floorMat = new THREE.MeshPhysicalMaterial({
        color: RENDER_CONFIG.colors.glass,
        transparent: true,
        opacity: 0.7,
        roughness: 0.2,
        metalness: 0.9,
        side: THREE.DoubleSide,
        envMapIntensity: 1.2,
        clearcoat: 0.2,
        clearcoatRoughness: 0.3
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.position.y = 0;
    scene.add(floor);

    return floor;
}
const floor = createFloor();

// ============================================
// 13. СЕТКА
// ============================================
function createGrid() {
    const gridGroup = new THREE.Group();

    const gridLeftMat = new THREE.GridHelper(
        ARENA_PLAY_W / 2,
        RENDER_CONFIG.gridDivisions,
        RENDER_CONFIG.colors.blue,
        RENDER_CONFIG.colors.blueDark
    );
    gridLeftMat.position.set(-ARENA_PLAY_W / 4, 0.06, 0);
    gridLeftMat.scale.z = ARENA_PLAY_H / (ARENA_PLAY_W / 2);
    gridLeftMat.material.transparent = true;
    gridLeftMat.material.opacity = 0.6;
    gridLeftMat.material.color.setHex(RENDER_CONFIG.colors.blue);
    gridGroup.add(gridLeftMat);

    const gridRightMat = new THREE.GridHelper(
        ARENA_PLAY_W / 2,
        RENDER_CONFIG.gridDivisions,
        RENDER_CONFIG.colors.orange,
        RENDER_CONFIG.colors.orangeDark
    );
    gridRightMat.position.set(ARENA_PLAY_W / 4, 0.06, 0);
    gridRightMat.scale.z = ARENA_PLAY_H / (ARENA_PLAY_W / 2);
    gridRightMat.material.transparent = true;
    gridRightMat.material.opacity = 0.6;
    gridRightMat.material.color.setHex(RENDER_CONFIG.colors.orange);
    gridGroup.add(gridRightMat);

    const centerPoints = [
        new THREE.Vector3(0, 0.08, -ARENA_PLAY_H / 2),
        new THREE.Vector3(0, 0.08, ARENA_PLAY_H / 2)
    ];
    const centerGeo = new THREE.BufferGeometry().setFromPoints(centerPoints);
    const centerMat = new THREE.LineBasicMaterial({
        color: RENDER_CONFIG.colors.center,
        transparent: true,
        opacity: 0.4
    });
    const centerLine = new THREE.Line(centerGeo, centerMat);
    gridGroup.add(centerLine);

    scene.add(gridGroup);
    return gridGroup;
}
const gridGroup = createGrid();

// ============================================
// 14. ЗАБОР
// ============================================
function createFenceWalls() {
    const fenceHeight = RENDER_CONFIG.fenceHeight;
    const halfW = ARENA_PLAY_W / 2;
    const halfH = ARENA_PLAY_H / 2;
    const thickness = RENDER_CONFIG.fenceThickness;

    const blueMat = new THREE.MeshPhysicalMaterial({
        color: RENDER_CONFIG.colors.blue,
        emissive: RENDER_CONFIG.colors.blueGlow,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.95,
        side: THREE.DoubleSide,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.0
    });

    const orangeMat = new THREE.MeshPhysicalMaterial({
        color: RENDER_CONFIG.colors.orange,
        emissive: RENDER_CONFIG.colors.orangeGlow,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.95,
        side: THREE.DoubleSide,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.0
    });

    const topWallLeft = new THREE.Mesh(
        new THREE.BoxGeometry(halfW - 0.5, fenceHeight, thickness),
        blueMat
    );
    topWallLeft.position.set(-halfW / 2, fenceHeight / 2, halfH);
    topWallLeft.castShadow = true;
    topWallLeft.receiveShadow = true;
    scene.add(topWallLeft);

    const topWallRight = new THREE.Mesh(
        new THREE.BoxGeometry(halfW - 0.5, fenceHeight, thickness),
        orangeMat
    );
    topWallRight.position.set(halfW / 2, fenceHeight / 2, halfH);
    topWallRight.castShadow = true;
    topWallRight.receiveShadow = true;
    scene.add(topWallRight);

    const bottomWallLeft = new THREE.Mesh(
        new THREE.BoxGeometry(halfW - 0.5, fenceHeight, thickness),
        blueMat
    );
    bottomWallLeft.position.set(-halfW / 2, fenceHeight / 2, -halfH);
    bottomWallLeft.castShadow = true;
    bottomWallLeft.receiveShadow = true;
    scene.add(bottomWallLeft);

    const bottomWallRight = new THREE.Mesh(
        new THREE.BoxGeometry(halfW - 0.5, fenceHeight, thickness),
        orangeMat
    );
    bottomWallRight.position.set(halfW / 2, fenceHeight / 2, -halfH);
    bottomWallRight.castShadow = true;
    bottomWallRight.receiveShadow = true;
    scene.add(bottomWallRight);

    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, fenceHeight, ARENA_PLAY_H - 1),
        blueMat
    );
    leftWall.position.set(-halfW, fenceHeight / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, fenceHeight, ARENA_PLAY_H - 1),
        orangeMat
    );
    rightWall.position.set(halfW, fenceHeight / 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    function createNeonEdge() {
        const points = getRoundedRectPoints(
            ARENA_PLAY_W - 0.3,
            ARENA_PLAY_H - 0.3,
            ARENA_RADIUS - 0.2,
            60
        );

        const edgePoints = points.map(p => 
            new THREE.Vector3(p.x, RENDER_CONFIG.fenceHeight - 0.1, -p.y)
        );

        const midIndex = Math.floor(edgePoints.length / 2);
        const leftPoints = edgePoints.slice(0, midIndex);
        const rightPoints = edgePoints.slice(midIndex);

        const leftGeo = new THREE.BufferGeometry().setFromPoints(leftPoints);
        const leftMat = new THREE.LineBasicMaterial({
            color: RENDER_CONFIG.colors.blue,
            transparent: true,
            opacity: 1.0
        });
        const leftLine = new THREE.Line(leftGeo, leftMat);
        scene.add(leftLine);

        const rightGeo = new THREE.BufferGeometry().setFromPoints(rightPoints);
        const rightMat = new THREE.LineBasicMaterial({
            color: RENDER_CONFIG.colors.orange,
            transparent: true,
            opacity: 1.0
        });
        const rightLine = new THREE.Line(rightGeo, rightMat);
        scene.add(rightLine);

        const bottomPoints = points.map(p => 
            new THREE.Vector3(p.x, 0.05, -p.y)
        );
        const bottomGeo = new THREE.BufferGeometry().setFromPoints(bottomPoints);
        const bottomMat = new THREE.LineBasicMaterial({
            color: RENDER_CONFIG.colors.pink,
            transparent: true,
            opacity: 0.6
        });
        const bottomLine = new THREE.Line(bottomGeo, bottomMat);
        scene.add(bottomLine);

        return { leftLine, rightLine, bottomLine };
    }
    const neonEdges = createNeonEdge();

    return { topWallLeft, topWallRight, bottomWallLeft, bottomWallRight, leftWall, rightWall };
}
const fenceWalls = createFenceWalls();

// ============================================
// 15. УГЛОВЫЕ СТОЛБЫ
// ============================================
function createCornerPillars() {
    const corners = [
        { x: -ARENA_PLAY_W / 2 + 0.5, z: -ARENA_PLAY_H / 2 + 0.5, color: RENDER_CONFIG.colors.blue },
        { x: ARENA_PLAY_W / 2 - 0.5, z: -ARENA_PLAY_H / 2 + 0.5, color: RENDER_CONFIG.colors.orange },
        { x: -ARENA_PLAY_W / 2 + 0.5, z: ARENA_PLAY_H / 2 - 0.5, color: RENDER_CONFIG.colors.blue },
        { x: ARENA_PLAY_W / 2 - 0.5, z: ARENA_PLAY_H / 2 - 0.5, color: RENDER_CONFIG.colors.orange }
    ];

    const pillars = [];

    corners.forEach((corner, index) => {
        const group = new THREE.Group();
        const color = corner.color;

        const pillarMat = new THREE.MeshPhysicalMaterial({
            color: 0x0a0a2a,
            metalness: 0.95,
            roughness: 0.05,
            emissive: color,
            emissiveIntensity: 0.5,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1
        });
        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, RENDER_CONFIG.fenceHeight, 16),
            pillarMat
        );
        pillar.position.y = RENDER_CONFIG.fenceHeight / 2;
        pillar.castShadow = true;
        group.add(pillar);

        const ringMat = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 2.5,
            transparent: true,
            opacity: 0.9,
            metalness: 0.9,
            roughness: 0.1
        });
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.8, 0.08, 8, 24),
            ringMat
        );
        ring.position.y = RENDER_CONFIG.fenceHeight - 0.2;
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        const ringBottomMat = new THREE.MeshPhysicalMaterial({
            color: RENDER_CONFIG.colors.pink,
            emissive: RENDER_CONFIG.colors.pink,
            emissiveIntensity: 2.0,
            transparent: true,
            opacity: 0.7,
            metalness: 0.9,
            roughness: 0.1
        });
        const ringBottom = new THREE.Mesh(
            new THREE.TorusGeometry(0.8, 0.08, 8, 24),
            ringBottomMat
        );
        ringBottom.position.y = 0.2;
        ringBottom.rotation.x = Math.PI / 2;
        group.add(ringBottom);

        const sphereMat = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 4.0,
            transparent: true,
            opacity: 0.9,
            metalness: 0.0,
            roughness: 0.0,
            clearcoat: 1
        });
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16),
            sphereMat
        );
        sphere.position.y = RENDER_CONFIG.fenceHeight + 0.3;
        group.add(sphere);

        group.position.set(corner.x, 0, corner.z);
        scene.add(group);
        pillars.push(group);
    });

    return pillars;
}
const pillars = createCornerPillars();

// ============================================
// 16. ИГРОКИ И ЗАГРУЗКА МОДЕЛИ
// ============================================
window.players = window.players || [];

if (typeof players !== 'undefined' && Array.isArray(players) && players.length > 0) {
    loadBikeModel();
} else {
    console.warn('⚠️ Игроки не найдены, модель не загружена');
}

// ============================================
// 17. АНИМАЦИЯ
// ============================================
let time = 0;

function animateNeon() {
    time += 0.008;

    const neonEdges = window._neonEdges || {};
    if (neonEdges.leftLine) {
        neonEdges.leftLine.material.opacity = 0.7 + Math.sin(time * 1.5) * 0.3;
    }
    if (neonEdges.rightLine) {
        neonEdges.rightLine.material.opacity = 0.7 + Math.sin(time * 1.7 + 0.5) * 0.3;
    }
    if (neonEdges.bottomLine) {
        neonEdges.bottomLine.material.opacity = 0.4 + Math.sin(time * 2 + 1) * 0.2;
    }

    if (gridGroup) {
        gridGroup.children.forEach(child => {
            if (child.material && child.material.opacity !== undefined) {
                if (child.material.color && child.material.color.getHex() === RENDER_CONFIG.colors.blue) {
                    child.material.opacity = 0.4 + Math.sin(time * 1.2 + child.position.x) * 0.15;
                }
                if (child.material.color && child.material.color.getHex() === RENDER_CONFIG.colors.orange) {
                    child.material.opacity = 0.4 + Math.sin(time * 1.4 + child.position.x) * 0.15;
                }
            }
        });
    }

    if (pillars) {
        pillars.forEach((pillar, index) => {
            pillar.children.forEach(child => {
                if (child.isMesh && child.geometry.type === 'SphereGeometry') {
                    child.position.y = RENDER_CONFIG.fenceHeight + 0.3 + Math.sin(time * 2 + index) * 0.1;
                    if (child.material) {
                        child.material.emissiveIntensity = 3 + Math.sin(time * 2.5 + index) * 1;
                    }
                }
                if (child.isMesh && child.geometry.type === 'TorusGeometry') {
                    child.rotation.z = Math.sin(time * 0.5 + index) * 0.1;
                }
            });
        });
    }
}

function animate() {
    requestAnimationFrame(animate);
    animateNeon();
    renderer.render(scene, camera);
}
animate();

// ============================================
// 18. АДАПТАЦИЯ К РАЗМЕРУ ОКНА
// ============================================
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// ============================================
// 19. ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
// ============================================
window.scene = scene;
window.camera = camera;
window.renderer = renderer;

window.Render = {
    scene: scene,
    camera: camera,
    renderer: renderer,
    config: RENDER_CONFIG,
    addToScene: function(object) {
        if (object) {
            scene.add(object);
        }
    },
    removeFromScene: function(object) {
        if (object) {
            scene.remove(object);
        }
    },
    loadBikeModel: loadBikeModel,
    applyBikeModelsToPlayers: applyBikeModelsToPlayers,
    updateBikeRotation: updateBikeRotation
};

console.log('🏟️ Render.js загружен');
console.log('📐 Квадратная арена:', ARENA_W, 'x', ARENA_H);
console.log('🔵 СИНЯЯ половина (левая) | 🟠 ОРАНЖЕВАЯ половина (правая)');
console.log(`🏍️ Модель мотоцикла (масштаб ${RENDER_CONFIG.bikeScale}x)`);
console.log('🌐 scene, camera, renderer доступны глобально');
