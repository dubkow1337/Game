// ============================================
// TRON ARENA - НЕОНОВАЯ ВЕРСИЯ
// ============================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000008);

// ============================================
// 1. КАМЕРА - ВЫСОКИЙ УГОЛ ДЛЯ ОБЗОРА
// ============================================
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 75, 75); // Высокий угол обзора
camera.lookAt(0, -2, 0);

// ============================================
// 2. РЕНДЕР С НАСТРОЙКАМИ ЯРКОСТИ
// ============================================
const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: false 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8; // Яркость
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.gammaFactor = 2.2;
document.body.appendChild(renderer.domElement);

// ============================================
// 3. ЗВЕЗДНЫЙ ФОН (ЯРКИЙ)
// ============================================
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 4000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);
    
    for (let i = 0; i < starsCount; i++) {
        const radius = 100 + Math.random() * 350;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(theta) * Math.cos(phi);
        
        const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.25, 1, 0.7 + Math.random() * 0.3);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        sizes[i] = 0.8 + Math.random() * 2;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}
createStarfield();

const arenaGroup = new THREE.Group();

// ============================================
// 4. КОНФИГУРАЦИЯ АРЕНЫ
// ============================================
const ARENA_WIDTH = 70;
const ARENA_HEIGHT = 40;
const playWidth = ARENA_WIDTH - 2;
const playHeight = ARENA_HEIGHT - 2;
const radius = 6;

// ============================================
// 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
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

function createRoundedRectPath(w, h, r, segments = 60) {
    const shape = createRoundedRectShape(w, h, r);
    return shape.getPoints(segments);
}

// ============================================
// 6. ПОЛ - СВЕТЯЩИЙСЯ С ЭФФЕКТОМ ГЛУБИНЫ
// ============================================
function createFloor() {
    const shape = createRoundedRectShape(playWidth, playHeight, radius);
    const floorGeo = new THREE.ShapeGeometry(shape);
    
    // Основной пол - темный с отражением
    const floorMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a20,
        roughness: 0.1,
        metalness: 0.95,
        emissive: 0x000022,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        envMapIntensity: 1.2
    });
    
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    arenaGroup.add(floor);
    
    // Светящаяся подложка
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x0044ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
    });
    const glowFloor = new THREE.Mesh(floorGeo.clone(), glowMat);
    glowFloor.rotation.x = -Math.PI / 2;
    glowFloor.position.y = -0.02;
    arenaGroup.add(glowFloor);
}
createFloor();

// ============================================
// 7. ЯРКАЯ СВЕТЯЩАЯСЯ СЕТКА
// ============================================
function createGrid() {
    // СИНЯЯ сетка (левая половина)
    const gridLeftMat = new THREE.GridHelper(playWidth / 2, 40, 0x00ccff, 0x0033aa);
    gridLeftMat.position.set(-playWidth / 4, 0.08, 0);
    gridLeftMat.scale.z = playHeight / (playWidth / 2);
    gridLeftMat.material.transparent = true;
    gridLeftMat.material.opacity = 0.6;
    gridLeftMat.material.emissive = new THREE.Color(0x0066ff);
    arenaGroup.add(gridLeftMat);
    
    // ОРАНЖЕВАЯ сетка (правая половина)
    const gridRightMat = new THREE.GridHelper(playWidth / 2, 40, 0xff6600, 0xaa3300);
    gridRightMat.position.set(playWidth / 4, 0.08, 0);
    gridRightMat.scale.z = playHeight / (playWidth / 2);
    gridRightMat.material.transparent = true;
    gridRightMat.material.opacity = 0.6;
    gridRightMat.material.emissive = new THREE.Color(0xff4400);
    arenaGroup.add(gridRightMat);
    
    // Дополнительная тонкая сетка для эффекта
    const thinGridMat = new THREE.GridHelper(playWidth, 80, 0x00ffff, 0x00ffff);
    thinGridMat.position.y = 0.04;
    thinGridMat.material.transparent = true;
    thinGridMat.material.opacity = 0.08;
    arenaGroup.add(thinGridMat);
    
    // Центральная светящаяся линия
    const centerPoints = [
        new THREE.Vector3(0, 0.1, -playHeight/2),
        new THREE.Vector3(0, 0.1, playHeight/2)
    ];
    const centerGeo = new THREE.BufferGeometry().setFromPoints(centerPoints);
    const centerMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4
    });
    const centerLine = new THREE.Line(centerGeo, centerMat);
    arenaGroup.add(centerLine);
}
createGrid();

// ============================================
// 8. НЕОНОВЫЙ ЗАБОР
// ============================================
function createFence() {
    const fenceHeight = 4.5;
    const wallShape = createRoundedRectShape(playWidth, playHeight, radius);
    
    // Прозрачный забор
    const extrudeSettings = {
        depth: fenceHeight,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.05,
        bevelSegments: 3
    };
    const wallGeo = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
    
    const wallMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a2a,
        emissive: 0x001155,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.15,
        roughness: 0.1,
        metalness: 0.95,
        side: THREE.DoubleSide,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0.5
    });
    
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.rotation.x = Math.PI / 2;
    wall.position.y = fenceHeight / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    arenaGroup.add(wall);
    
    // ===== ВЕРХНИЙ НЕОНОВЫЙ КАНТ =====
    const points = createRoundedRectPath(playWidth - 0.3, playHeight - 0.3, radius - 0.2, 80);
    const edgePoints = points.map((p, i) => {
        const heightOffset = fenceHeight - 0.1 + Math.sin(i * 0.5) * 0.05;
        return new THREE.Vector3(p.x, heightOffset, -p.y);
    });
    
    // СИНИЙ кант (левая половина)
    const leftCount = Math.floor(edgePoints.length * 0.45);
    const leftPoints = edgePoints.slice(0, leftCount);
    const leftGeo = new THREE.BufferGeometry().setFromPoints(leftPoints);
    const leftMat = new THREE.LineBasicMaterial({
        color: 0x00ccff,
        transparent: true,
        opacity: 1,
        linewidth: 3
    });
    const leftLine = new THREE.Line(leftGeo, leftMat);
    arenaGroup.add(leftLine);
    
    // ОРАНЖЕВЫЙ кант (правая половина)
    const rightPoints = edgePoints.slice(leftCount);
    const rightGeo = new THREE.BufferGeometry().setFromPoints(rightPoints);
    const rightMat = new THREE.LineBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 1,
        linewidth: 3
    });
    const rightLine = new THREE.Line(rightGeo, rightMat);
    arenaGroup.add(rightLine);
    
    // ===== НИЖНИЙ НЕОНОВЫЙ КАНТ =====
    const bottomPoints = points.map(p => new THREE.Vector3(p.x, 0.05, -p.y));
    const bottomGeo = new THREE.BufferGeometry().setFromPoints(bottomPoints);
    const bottomMat = new THREE.LineBasicMaterial({
        color: 0xff00aa,
        transparent: true,
        opacity: 0.6
    });
    const bottomLine = new THREE.Line(bottomGeo, bottomMat);
    arenaGroup.add(bottomLine);
}
createFence();

// ============================================
// 9. НЕОНОВЫЕ СТОЛБЫ ПО УГЛАМ
// ============================================
function createCornerPillars() {
    const corners = [
        [-playWidth/2 + 1.5, -playHeight/2 + 1.5],
        [playWidth/2 - 1.5, -playHeight/2 + 1.5],
        [-playWidth/2 + 1.5, playHeight/2 - 1.5],
        [playWidth/2 - 1.5, playHeight/2 - 1.5]
    ];
    
    corners.forEach(([x, z]) => {
        const group = new THREE.Group();
        
        // Основной столб с металлическим блеском
        const pillarMat = new THREE.MeshPhysicalMaterial({
            color: 0x0a0a2a,
            metalness: 0.95,
            roughness: 0.05,
            emissive: 0x002266,
            emissiveIntensity: 0.8,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1
        });
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 5, 16), pillarMat);
        pillar.position.y = 2.5;
        pillar.castShadow = true;
        group.add(pillar);
        
        // Верхнее светящееся кольцо (синее)
        const ringMat = new THREE.MeshPhysicalMaterial({
            color: 0x00ccff,
            emissive: 0x00ccff,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.9,
            metalness: 0.9,
            roughness: 0.1
        });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 8, 24), ringMat);
        ring.position.y = 4.8;
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        
        // Нижнее кольцо (розовое)
        const ringBottomMat = new THREE.MeshPhysicalMaterial({
            color: 0xff00aa,
            emissive: 0xff00aa,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.7,
            metalness: 0.9,
            roughness: 0.1
        });
        const ringBottom = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 8, 24), ringBottomMat);
        ringBottom.position.y = 0.2;
        ringBottom.rotation.x = Math.PI / 2;
        group.add(ringBottom);
        
        // Энергетическая сфера на вершине
        const sphereMat = new THREE.MeshPhysicalMaterial({
            color: 0x00ccff,
            emissive: 0x00ccff,
            emissiveIntensity: 3,
            transparent: true,
            opacity: 0.8,
            metalness: 0.0,
            roughness: 0.0,
            clearcoat: 1
        });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), sphereMat);
        sphere.position.y = 5.4;
        group.add(sphere);
        
        // Ореол вокруг сферы (дополнительный свет)
        const glowMat = new THREE.SpriteMaterial({
            map: createGlowTexture(),
            blending: THREE.AdditiveBlending,
            opacity: 0.6
        });
        const glow = new THREE.Sprite(glowMat);
        glow.scale.set(2, 2, 1);
        glow.position.y = 5.4;
        group.add(glow);
        
        group.position.set(x, 0, z);
        arenaGroup.add(group);
    });
}

function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(0,200,255,0.8)');
    gradient.addColorStop(1, 'rgba(0,200,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}
createCornerPillars();

// ============================================
// 10. ТРИБУНЫ С НЕОНОВОЙ ПОДСВЕТКОЙ
// ============================================
function createTribunes() {
    const tribuneMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a20,
        roughness: 0.5,
        metalness: 0.7,
        emissive: 0x001133,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.85,
        clearcoat: 0.3
    });
    
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const radius = Math.max(playWidth, playHeight) / 2 + 12 + Math.random() * 5;
        const width = 10 + Math.random() * 10;
        const height = 3 + Math.random() * 7;
        const depth = 6 + Math.random() * 8;
        
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
        
        // Неоновая подсветка трибуны (яркая)
        const neonMat = new THREE.MeshPhysicalMaterial({
            color: i % 2 === 0 ? 0x00ccff : 0xff6600,
            emissive: i % 2 === 0 ? 0x00ccff : 0xff6600,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.3 + Math.random() * 0.2
        });
        const neonStrip = new THREE.Mesh(
            new THREE.BoxGeometry(width + 0.3, 0.03, depth + 0.3),
            neonMat
        );
        neonStrip.position.set(
            Math.cos(angle) * radius,
            height + 0.03,
            Math.sin(angle) * radius
        );
        neonStrip.rotation.y = -angle + Math.PI / 2;
        arenaGroup.add(neonStrip);
    }
}
createTribunes();

// ============================================
// 11. ЯРКОЕ ОСВЕЩЕНИЕ
// ============================================
function createLighting() {
    // Ambient - яркий
    const ambient = new THREE.AmbientLight(0x4488ff, 0.6);
    scene.add(ambient);
    
    // Основной свет
    const mainLight = new THREE.DirectionalLight(0xffdd99, 1.5);
    mainLight.position.set(30, 60, 30);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 150;
    mainLight.shadow.camera.left = -60;
    mainLight.shadow.camera.right = 60;
    mainLight.shadow.camera.top = 60;
    mainLight.shadow.camera.bottom = -60;
    scene.add(mainLight);
    
    // Синий свет слева
    const blueLight = new THREE.DirectionalLight(0x0066ff, 1.2);
    blueLight.position.set(-40, 30, 0);
    scene.add(blueLight);
    
    // Оранжевый свет справа
    const orangeLight = new THREE.DirectionalLight(0xff4400, 1.2);
    orangeLight.position.set(40, 30, 0);
    scene.add(orangeLight);
    
    // Точечный свет в центре
    const centerLight = new THREE.PointLight(0x00ccff, 1.5, 80);
    centerLight.position.set(0, 25, 0);
    scene.add(centerLight);
    
    // Дополнительные точечные света по углам
    const corners = [
        [-30, 15, -20], [30, 15, -20],
        [-30, 15, 20], [30, 15, 20]
    ];
    corners.forEach(([x, y, z]) => {
        const light = new THREE.PointLight(
            Math.random() > 0.5 ? 0x0066ff : 0xff4400,
            0.8,
            50
        );
        light.position.set(x, y, z);
        scene.add(light);
    });
}
createLighting();

// ============================================
// 12. НЕОНОВЫЕ ДОРОЖКИ
// ============================================
function createNeonTracks() {
    // Синяя дорожка
    const trackMat1 = new THREE.MeshBasicMaterial({
        color: 0x00ccff,
        transparent: true,
        opacity: 0.12
    });
    const track1 = new THREE.Mesh(
        new THREE.BoxGeometry(playWidth / 2.5, 0.02, playHeight - 3),
        trackMat1
    );
    track1.position.set(-playWidth / 3, 0.06, 0);
    arenaGroup.add(track1);
    
    // Оранжевая дорожка
    const trackMat2 = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.12
    });
    const track2 = new THREE.Mesh(
        new THREE.BoxGeometry(playWidth / 2.5, 0.02, playHeight - 3),
        trackMat2
    );
    track2.position.set(playWidth / 3, 0.06, 0);
    arenaGroup.add(track2);
}
createNeonTracks();

// ============================================
// 13. ДЕКОРАТИВНЫЕ НЕОНОВЫЕ ЛИНИИ
// ============================================
function createDecorations() {
    const colors = [0x00ccff, 0xff6600, 0xff00aa, 0x00ff88];
    
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 10 + Math.random() * 20;
        const color = colors[i % colors.length];
        
        const points = [
            new THREE.Vector3(0, 0.05, 0),
            new THREE.Vector3(
                Math.cos(angle) * dist,
                0.05,
                Math.sin(angle) * dist
            )
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.08 + Math.random() * 0.1
        });
        const line = new THREE.Line(geo, mat);
        arenaGroup.add(line);
    }
}
createDecorations();

// ============================================
// 14. АНИМАЦИЯ
// ============================================
scene.add(arenaGroup);

let time = 0;

function animateNeon() {
    time += 0.008;
    
    arenaGroup.children.forEach(child => {
        if (child.isMesh && child.material) {
            // Анимация яркости неоновых элементов
            if (child.material.emissive && child.material.emissiveIntensity !== undefined) {
                if (child.material.color.getHex() === 0x00ccff || 
                    child.material.color.getHex() === 0x0066ff) {
                    child.material.emissiveIntensity = 1.5 + Math.sin(time * 2 + child.position.x) * 0.8;
                }
                if (child.material.color.getHex() === 0xff6600 || 
                    child.material.color.getHex() === 0xff4400) {
                    child.material.emissiveIntensity = 1.5 + Math.sin(time * 2.2 + child.position.x) * 0.8;
                }
                if (child.material.color.getHex() === 0xff00aa) {
                    child.material.emissiveIntensity = 1 + Math.sin(time * 2.5 + child.position.z) * 0.6;
                }
            }
            
            // Анимация прозрачности
            if (child.material.transparent && child.material.opacity !== undefined) {
                if (child.material.color.getHex() === 0x00ccff) {
                    child.material.opacity = 0.3 + Math.sin(time * 1.5 + child.position.x) * 0.15;
                }
                if (child.material.color.getHex() === 0xff6600) {
                    child.material.opacity = 0.3 + Math.sin(time * 1.7 + child.position.x) * 0.15;
                }
            }
        }
        
        // Анимация вращения сфер на столбах
        if (child.isMesh && child.geometry.type === 'SphereGeometry') {
            child.position.y = 5.4 + Math.sin(time * 2 + child.position.x) * 0.1;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    animateNeon();
    renderer.render(scene, camera);
}
animate();

// ============================================
// 15. АДАПТИВНОСТЬ
// ============================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('🏟️ TRON Арена создана!');
console.log('🎨 Неоновый режим активирован');
console.log('📐 Размеры арены: 70x40');
