// ============================================
// render.js - 3D Арена для TRON игры
// Версия: 3.0 (Глобальные имена scene, camera)
// ============================================

// ============================================
// 1. КОНФИГУРАЦИЯ АРЕНЫ
// ============================================
const RENDER_CONFIG = {
    width: 70,
    height: 40,
    radius: 6,
    fenceHeight: 5,
    gridDivisions: 40,
    cameraPos: { x: 0, y: 68, z: 58 },
    colors: {
        blue: 0x00ffff,
        orange: 0xff5500,
        pink: 0xff00aa,
        glass: 0x020816,
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
// 2. ИНИЦИАЛИЗАЦИЯ СЦЕНЫ (ГЛОБАЛЬНАЯ scene)
// ============================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000008);
scene.fog = new THREE.FogExp2(0x000008, 0.003);

// ============================================
// 3. КАМЕРА (ГЛОБАЛЬНАЯ camera)
// ============================================
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(RENDER_CONFIG.cameraPos.x, RENDER_CONFIG.cameraPos.y, RENDER_CONFIG.cameraPos.z);
camera.lookAt(0, 0, 0);

// ============================================
// 4. РЕНДЕР (ГЛОБАЛЬНЫЙ renderer)
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
renderer.toneMappingExposure = 1.2;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// ============================================
// 5. ОСВЕЩЕНИЕ
// ============================================
function setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 30);
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

    const blueLight = new THREE.DirectionalLight(0x00ffff, 0.4);
    blueLight.position.set(-40, 20, 0);
    scene.add(blueLight);

    const orangeLight = new THREE.DirectionalLight(0xff5500, 0.4);
    orangeLight.position.set(40, 20, 0);
    scene.add(orangeLight);
}
setupLighting();

// ============================================
// 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
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

function getRoundedRectPoints(w, h, r, segments = 80) {
    const shape = createRoundedRectShape(w, h, r);
    return shape.getPoints(segments);
}

// ============================================
// 7. ЗАДНИЙ ФОН
// ============================================
function setupBackground() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        'assets/images/bg.png',
        (texture) => {
            scene.background = texture;
        },
        undefined,
        () => {
            console.warn('⚠️ Фон не загружен, используется стандартный');
        }
    );

    // Звезды
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
        const radius = 100 + Math.random() * 300;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(theta) * Math.cos(phi);

        const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.3, 0.8, 0.5 + Math.random() * 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
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
        opacity: 0.65,
        roughness: 0.7,
        metalness: 0.8,
        side: THREE.DoubleSide,
        envMapIntensity: 1.0,
        clearcoat: 0.1,
        clearcoatRoughness: 0.2
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

    // Левая сетка (Синяя)
    const gridLeft = new THREE.GridHelper(
        ARENA_PLAY_W / 2,
        RENDER_CONFIG.gridDivisions,
        RENDER_CONFIG.colors.blue,
        RENDER_CONFIG.colors.blue
    );
    gridLeft.position.set(-ARENA_PLAY_W / 4, 0.05, 0);
    gridLeft.scale.z = ARENA_PLAY_H / (ARENA_PLAY_W / 2);
    gridLeft.material.transparent = true;
    gridLeft.material.opacity = 0.35;
    gridLeft.material.color.setHex(RENDER_CONFIG.colors.blue);
    gridGroup.add(gridLeft);

    // Правая сетка (Оранжевая)
    const gridRight = new THREE.GridHelper(
        ARENA_PLAY_W / 2,
        RENDER_CONFIG.gridDivisions,
        RENDER_CONFIG.colors.orange,
        RENDER_CONFIG.colors.orange
    );
    gridRight.position.set(ARENA_PLAY_W / 4, 0.05, 0);
    gridRight.scale.z = ARENA_PLAY_H / (ARENA_PLAY_W / 2);
    gridRight.material.transparent = true;
    gridRight.material.opacity = 0.35;
    gridRight.material.color.setHex(RENDER_CONFIG.colors.orange);
    gridGroup.add(gridRight);

    // Центральная линия
    const centerPoints = [
        new THREE.Vector3(0, 0.06, -ARENA_PLAY_H / 2),
        new THREE.Vector3(0, 0.06, ARENA_PLAY_H / 2)
    ];
    const centerGeo = new THREE.BufferGeometry().setFromPoints(centerPoints);
    const centerMat = new THREE.LineBasicMaterial({
        color: RENDER_CONFIG.colors.center,
        transparent: true,
        opacity: 0.15
    });
    const centerLine = new THREE.Line(centerGeo, centerMat);
    gridGroup.add(centerLine);

    scene.add(gridGroup);
    return gridGroup;
}
const gridGroup = createGrid();

// ============================================
// 10. ЗАБОР
// ============================================
function createFence() {
    const fenceHeight = RENDER_CONFIG.fenceHeight;
    const shape = createRoundedRectShape(ARENA_PLAY_W, ARENA_PLAY_H, ARENA_RADIUS);

    const extrudeSettings = {
        depth: fenceHeight,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.05,
        bevelSegments: 3
    };
    const wallGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const wallMat = new THREE.MeshPhysicalMaterial({
        color: RENDER_CONFIG.colors.fence,
        emissive: 0x001122,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        metalness: 0.8,
        side: THREE.DoubleSide,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.5
    });

    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.rotation.x = Math.PI / 2;
    wall.position.y = fenceHeight / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);

    return wall;
}
const fence = createFence();

// ============================================
// 11. НЕОНОВЫЙ КАНТ
// ============================================
function createNeonEdge() {
    const fenceHeight = RENDER_CONFIG.fenceHeight;
    const points = getRoundedRectPoints(ARENA_PLAY_W - 0.3, ARENA_PLAY_H - 0.3, ARENA_RADIUS - 0.2, 80);

    const edgePoints = points.map(p => 
        new THREE.Vector3(p.x, fenceHeight - 0.1, -p.y)
    );

    const midIndex = Math.floor(edgePoints.length / 2);
    const leftPoints = edgePoints.slice(0, midIndex);
    const rightPoints = edgePoints.slice(midIndex);

    // Синий кант
    const leftGeo = new THREE.BufferGeometry().setFromPoints(leftPoints);
    const leftMat = new THREE.LineBasicMaterial({
        color: RENDER_CONFIG.colors.blue,
        transparent: true,
        opacity: 0.9
    });
    const leftLine = new THREE.Line(leftGeo, leftMat);
    scene.add(leftLine);

    // Оранжевый кант
    const rightGeo = new THREE.BufferGeometry().setFromPoints(rightPoints);
    const rightMat = new THREE.LineBasicMaterial({
        color: RENDER_CONFIG.colors.orange,
        transparent: true,
        opacity: 0.9
    });
    const rightLine = new THREE.Line(rightGeo, rightMat);
    scene.add(rightLine);

    // Нижний кант
    const bottomPoints = points.map(p => 
        new THREE.Vector3(p.x, 0.05, -p.y)
    );
    const bottomGeo = new THREE.BufferGeometry().setFromPoints(bottomPoints);
    const bottomMat = new THREE.LineBasicMaterial({
        color: RENDER_CONFIG.colors.pink,
        transparent: true,
        opacity: 0.4
    });
    const bottomLine = new THREE.Line(bottomGeo, bottomMat);
    scene.add(bottomLine);

    return { leftLine, rightLine, bottomLine };
}
const neonEdges = createNeonEdge();

// ============================================
// 12. УГЛОВЫЕ СТОЛБЫ
// ============================================
function createCornerPillars() {
    const corners = [
        { x: -ARENA_PLAY_W / 2 + 1.5, z: -ARENA_PLAY_H / 2 + 1.5, color: RENDER_CONFIG.colors.blue },
        { x: ARENA_PLAY_W / 2 - 1.5, z: -ARENA_PLAY_H / 2 + 1.5, color: RENDER_CONFIG.colors.orange },
        { x: -ARENA_PLAY_W / 2 + 1.5, z: ARENA_PLAY_H / 2 - 1.5, color: RENDER_CONFIG.colors.blue },
        { x: ARENA_PLAY_W / 2 - 1.5, z: ARENA_PLAY_H / 2 - 1.5, color: RENDER_CONFIG.colors.orange }
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
            emissiveIntensity: 0.3,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1
        });
        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.8, RENDER_CONFIG.fenceHeight, 16),
            pillarMat
        );
        pillar.position.y = RENDER_CONFIG.fenceHeight / 2;
        pillar.castShadow = true;
        group.add(pillar);

        const ringMat = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.9,
            metalness: 0.9,
            roughness: 0.1
        });
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.0, 0.08, 8, 24),
            ringMat
        );
        ring.position.y = RENDER_CONFIG.fenceHeight - 0.2;
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        const ringBottomMat = new THREE.MeshPhysicalMaterial({
            color: RENDER_CONFIG.colors.pink,
            emissive: RENDER_CONFIG.colors.pink,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.6,
            metalness: 0.9,
            roughness: 0.1
        });
        const ringBottom = new THREE.Mesh(
            new THREE.TorusGeometry(1.0, 0.08, 8, 24),
            ringBottomMat
        );
        ringBottom.position.y = 0.2;
        ringBottom.rotation.x = Math.PI / 2;
        group.add(ringBottom);

        const sphereMat = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 3,
            transparent: true,
            opacity: 0.8,
            metalness: 0.0,
            roughness: 0.0,
            clearcoat: 1
        });
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
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
// 13. НЕОНОВЫЕ ДОРОЖКИ
// ============================================
function createNeonTracks() {
    const trackMat1 = new THREE.MeshBasicMaterial({
        color: RENDER_CONFIG.colors.blue,
        transparent: true,
        opacity: 0.08
    });
    const track1 = new THREE.Mesh(
        new THREE.BoxGeometry(ARENA_PLAY_W / 3, 0.02, ARENA_PLAY_H - 3),
        trackMat1
    );
    track1.position.set(-ARENA_PLAY_W / 3.5, 0.03, 0);
    scene.add(track1);

    const trackMat2 = new THREE.MeshBasicMaterial({
        color: RENDER_CONFIG.colors.orange,
        transparent: true,
        opacity: 0.08
    });
    const track2 = new THREE.Mesh(
        new THREE.BoxGeometry(ARENA_PLAY_W / 3, 0.02, ARENA_PLAY_H - 3),
        trackMat2
    );
    track2.position.set(ARENA_PLAY_W / 3.5, 0.03, 0);
    scene.add(track2);
}
createNeonTracks();

// ============================================
// 14. ТРИБУНЫ
// ============================================
function createTribunes() {
    const tribuneMat = new THREE.MeshPhysicalMaterial({
        color: 0x080b18,
        roughness: 0.6,
        metalness: 0.3,
        emissive: 0x020408,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.7
    });

    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = Math.max(ARENA_PLAY_W, ARENA_PLAY_H) / 2 + 10 + Math.random() * 5;
        const width = 8 + Math.random() * 10;
        const height = 3 + Math.random() * 6;
        const depth = 5 + Math.random() * 8;

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
        scene.add(tribune);

        const neonMat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? RENDER_CONFIG.colors.blue : RENDER_CONFIG.colors.orange,
            transparent: true,
            opacity: 0.15 + Math.random() * 0.1
        });
        const neonStrip = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.2, 0.03, depth + 0.2),
            neonMat
        );
        neonStrip.position.set(
            Math.cos(angle) * radius,
            height + 0.03,
            Math.sin(angle) * radius
        );
        neonStrip.rotation.y = -angle + Math.PI / 2;
        scene.add(neonStrip);
    }
}
createTribunes();

// ============================================
// 15. ИГРОКИ (БЕЗОПАСНАЯ ПРОВЕРКА)
// ============================================
if (typeof players !== 'undefined' && Array.isArray(players)) {
    players.forEach(player => {
        if (player && player.mesh) {
            scene.add(player.mesh);
            console.log('✅ Модель игрока добавлена на сцену');
        }
    });
} else {
    console.warn('⚠️ Игроки не найдены, модели не добавлены');
}

// ============================================
// 16. АНИМАЦИЯ
// ============================================
let time = 0;

function animateNeon() {
    time += 0.008;

    if (neonEdges) {
        if (neonEdges.leftLine) {
            neonEdges.leftLine.material.opacity = 0.6 + Math.sin(time * 1.5) * 0.3;
        }
        if (neonEdges.rightLine) {
            neonEdges.rightLine.material.opacity = 0.6 + Math.sin(time * 1.7 + 0.5) * 0.3;
        }
        if (neonEdges.bottomLine) {
            neonEdges.bottomLine.material.opacity = 0.3 + Math.sin(time * 2 + 1) * 0.15;
        }
    }

    if (gridGroup) {
        gridGroup.children.forEach(child => {
            if (child.material && child.material.opacity !== undefined) {
                if (child.material.color && child.material.color.getHex() === RENDER_CONFIG.colors.blue) {
                    child.material.opacity = 0.25 + Math.sin(time * 1.2 + child.position.x) * 0.1;
                }
                if (child.material.color && child.material.color.getHex() === RENDER_CONFIG.colors.orange) {
                    child.material.opacity = 0.25 + Math.sin(time * 1.4 + child.position.x) * 0.1;
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
                        child.material.emissiveIntensity = 2 + Math.sin(time * 2.5 + index) * 1;
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
// 17. АДАПТАЦИЯ К РАЗМЕРУ ОКНА
// ============================================
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// ============================================
// 18. ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
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
    }
};

console.log('🏟️ Render.js загружен');
console.log('📐 Размеры арены:', ARENA_W, 'x', ARENA_H);
console.log('🎨 Неоновый режим активирован');
console.log('🌐 scene, camera, renderer доступны глобально');
