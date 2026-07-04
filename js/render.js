// ============================================
// render.js - 3D Арена для TRON игры
// Версия: 7.3 (Полная рабочая сборка)
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
    }
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
// 5. ОСВЕЩЕНИЕ
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

    const blueLight = new THREE.DirectionalLight(RENDER_CONFIG.colors.blue, 0.8);
    blueLight.position.set(-40, 30, 0);
    scene.add(blueLight);

    const orangeLight = new THREE.DirectionalLight(RENDER_CONFIG.colors.orange, 0.8);
    orangeLight.position.set(40, 30, 0);
    scene.add(orangeLight);
}
setupLighting();

// ============================================
// 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И ГЕОМЕТРИЯ
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

// ============================================
// 7. ЗАДНИЙ ФОН (ТЕКСТУРА + ЗВЁЗДЫ)
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
        (error) => {
            console.warn('⚠️ Фон не загружен, используется стандартный:', error);
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
// 8. ПОЛ АРЕНЫ
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
// 9. СЕТКА
// ============================================
function createGrid() {
    const gridGroup = new THREE.Group();

    // СИНЯЯ сетка (левая половина)
    const gridLeft = new THREE.GridHelper(
        ARENA_PLAY_W / 2,
        RENDER_CONFIG.gridDivisions,
        RENDER_CONFIG.colors.blue,
        RENDER_CONFIG.colors.blueDark
    );
    gridLeft.position.set(-ARENA_PLAY_W / 4, 0.06, 0);
    gridLeft.scale.z = ARENA_PLAY_H / (ARENA_PLAY_W / 2);
    gridLeft.material.transparent = true;
    gridLeft.material.opacity = 0.5;
    gridGroup.add(gridLeft);

    // ОРАНЖЕВАЯ сетка (правая половина)
    const gridRight = new THREE.GridHelper(
        ARENA_PLAY_W / 2,
        RENDER_CONFIG.gridDivisions,
        RENDER_CONFIG.colors.orange,
        RENDER_CONFIG.colors.orangeDark
    );
    gridRight.position.set(ARENA_PLAY_W / 4, 0.06, 0);
    gridRight.scale.z = ARENA_PLAY_H / (ARENA_PLAY_W / 2);
    gridRight.material.transparent = true;
    gridRight.material.opacity = 0.5;
    gridGroup.add(gridRight);

    // Центральная линия
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
// 10. ИСТИННЫЙ ЗАКРУГЛЕННЫЙ ЗАБОР С ЦВЕТОВЫМ РАЗДЕЛЕНИЕМ
// ============================================
function createFenceWalls() {
    const fenceHeight = RENDER_CONFIG.fenceHeight;
    const thickness = RENDER_CONFIG.fenceThickness;
    
    const shape = createRoundedRectShape(ARENA_PLAY_W, ARENA_PLAY_H, ARENA_RADIUS);
    const points = shape.getPoints(80);
    const edge3DPoints = points.map(p => new THREE.Vector3(p.x, 0, -p.y));

    const blueMat = new THREE.MeshPhysicalMaterial({
        color: RENDER_CONFIG.colors.blue,
        emissive: RENDER_CONFIG.colors.blueGlow,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
        metalness: 0.9,
        side: THREE.DoubleSide
    });

    const orangeMat = new THREE.MeshPhysicalMaterial({
        color: RENDER_CONFIG.colors.orange,
        emissive: RENDER_CONFIG.colors.orangeGlow,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
        metalness: 0.9,
        side: THREE.DoubleSide
    });

    // Настоящее поактное построение скругленного забора
    for (let i = 0; i < edge3DPoints.length; i++) {
        const p1 = edge3DPoints[i];
        const p2 = edge3DPoints[(i + 1) % edge3DPoints.length];
        
        const distance = p1.distanceTo(p2);
        const boxGeo = new THREE.BoxGeometry(thickness, fenceHeight, distance + 0.1);
        
        const midX = (p1.x + p2.x) / 2;
        const currentMat = (midX <= 0.1) ? blueMat : orangeMat;

        const segment = new THREE.Mesh(boxGeo, currentMat);
        segment.position.set((p1.x + p2.x) / 2, fenceHeight / 2, (p1.z + p2.z) / 2);
        segment.lookAt(p2);
        
        segment.castShadow = true;
        segment.receiveShadow = true;
        scene.add(segment);
    }

    // ============================================
    // 11. НЕОНОВЫЙ КАНТ ПО ВЕРХУ ЗАБОРА
    // ============================================
    const neonPoints = shape.getPoints(120).map(p => 
        new THREE.Vector3(p.x, fenceHeight - 0.05, -p.y)
    );

    const leftNeonPoints = neonPoints.filter(p => p.x <= 0.05);
    const rightNeonPoints = neonPoints.filter(p => p.x >= -0.05);

    const leftGeo = new THREE.BufferGeometry().setFromPoints(leftNeonPoints);
    const leftMat = new THREE.LineBasicMaterial({ color: RENDER_CONFIG.colors.blue, transparent: true, opacity: 1.0 });
    const leftLine = new THREE.Line(leftGeo, leftMat);
    scene.add(leftLine);

    const rightGeo = new THREE.BufferGeometry().setFromPoints(rightNeonPoints);
    const rightMat = new THREE.LineBasicMaterial({ color: RENDER_CONFIG.colors.orange, transparent: true, opacity: 1.0 });
    const rightLine = new THREE.Line(rightGeo, rightMat);
    scene.add(rightLine);

    const bottomPoints = shape.getPoints(100).map(p => new THREE.Vector3(p.x, 0.05, -p.y));
    const bottomGeo = new THREE.BufferGeometry().setFromPoints(bottomPoints);
    const bottomMat = new THREE.LineBasicMaterial({ color: RENDER_CONFIG.colors.pink, transparent: true, opacity: 0.6 });
    const bottomLine = new THREE.Line(bottomGeo, bottomMat);
    scene.add(bottomLine);

    window._neonEdges = { leftLine, rightLine, bottomLine };
}
const fenceWalls = createFenceWalls();

// ============================================
// 12. УГЛОВЫЕ СТОЛБЫ
// ============================================
function createCornerPillars() {
    const offset = ARENA_PLAY_W / 2 - ARENA_RADIUS + 1.2;
    const corners = [
        { x: -offset, z: -offset, color: RENDER_CONFIG.colors.blue },
        { x: offset, z: -offset, color: RENDER_CONFIG.colors.orange },
        { x: -offset, z: offset, color: RENDER_CONFIG.colors.blue },
        { x: offset, z: offset, color: RENDER_CONFIG.colors.orange }
    ];

    const pillars = [];

    corners.forEach((corner) => {
        const group = new THREE.Group();
        const color = corner.color;

        const pillarMat = new THREE.MeshPhysicalMaterial({
            color: 0x0a0a2a,
            metalness: 0.95,
            roughness: 0.05,
            emissive: color,
            emissiveIntensity: 0.5,
            clearcoat: 0.8
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
            opacity: 0.9
        });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 8, 24), ringMat);
        ring.position.y = RENDER_CONFIG.fenceHeight - 0.2;
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        const ringBottomMat = new THREE.MeshPhysicalMaterial({
            color: RENDER_CONFIG.colors.pink,
            emissive: RENDER_CONFIG.colors.pink,
            emissiveIntensity: 2.0,
            transparent: true,
            opacity: 0.7
        });
        const ringBottom = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 8, 24), ringBottomMat);
        ringBottom.position.y = 0.2;
        ringBottom.rotation.x = Math.PI / 2;
        group.add(ringBottom);

        const sphereMat = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 4.0,
            transparent: true,
            opacity: 0.9,
            clearcoat: 1
        });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), sphereMat);
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
// 13. ИГРОКИ (БЕЗОПАСНАЯ ПРОВЕРКА И ОТРИСОВКА)
// ============================================
if (typeof players !== 'undefined' && Array.isArray(players)) {
    players.forEach(player => {
        if (player && player.mesh) {
            scene.add(player.mesh);
            console.log('✅ Модель игрока добавлена на сцену');
        }
    });
} else {
    console.warn('⚠️ Игроки не найдены, модели будут добавлены ядром игры');
}

// ============================================
// 14. АНИМАЦИЯ
// ============================================
let time = 0;

function animateNeon() {
    time += 0.01;

    const neonEdges = window._neonEdges || {};
    if (neonEdges.leftLine && neonEdges.leftLine.material) {
        neonEdges.leftLine.material.opacity = 0.75 + Math.sin(time * 2.5) * 0.25;
    }
    if (neonEdges.rightLine && neonEdges.rightLine.material) {
        neonEdges.rightLine.material.opacity = 0.75 + Math.sin(time * 2.5 + Math.PI) * 0.25;
    }
    if (neonEdges.bottomLine && neonEdges.bottomLine.material) {
        neonEdges.bottomLine.material.opacity = 0.4 + Math.sin(time * 1.8) * 0.2;
    }

    if (gridGroup) {
        gridGroup.children.forEach(child => {
            if (child.material) {
                child.material.opacity = 0.45 + Math.sin(time * 1.5) * 0.15;
            }
        });
    }

    if (pillars) {
        pillars.forEach((pillar, index) => {
            pillar.children.forEach(child => {
                if (child.isMesh && child.geometry.type === 'SphereGeometry') {
                    child.position.y = RENDER_CONFIG.fenceHeight + 0.3 + Math.sin(time * 3 + index) * 0.08;
                    if (child.material) {
                        child.material.emissiveIntensity = 3.5 + Math.sin(time * 4 + index) * 0.8;
                    }
                }
                if (child.isMesh && child.geometry.type === 'TorusGeometry') {
                    child.rotation.z = time * 0.2;
                }
            });
        });
    }
}

function animate() {
    requestAnimationFrame(animate);
    animateNeon();
    
    // Постоянно проверяем появление мотоциклов, чтобы они никогда не пропадали
    if (typeof players !== 'undefined' && Array.isArray(players)) {
        players.forEach(player => {
            if (player && player.mesh && !scene.children.includes(player.mesh)) {
                scene.add(player.mesh);
            }
        });
    }
    
    renderer.render(scene, camera);
}
animate();

// ============================================
// 15. АДАПТАЦИЯ К РАЗМЕРУ ОКНА
// ============================================
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// ============================================
// 16. ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
// ============================================
window.scene = scene;
window.camera = camera;
window.renderer = renderer;

window.Render = {
    scene: scene,
    camera: camera,
    renderer: renderer,
    config: RENDER_CONFIG,
    addToScene: function(object) { if (object) scene.add(object); },
    removeFromScene: function(object) { if (object) scene.remove(object); }
};

console.log('🏟️ Render.js v7.3 успешно запущен.');
