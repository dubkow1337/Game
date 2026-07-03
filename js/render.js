const scene = new THREE.Scene();

// 1. ФОН
const textureLoader = new THREE.TextureLoader();
textureLoader.load('assets/images/bg.png', (texture) => {
    scene.background = texture;
});

// Настроенная камера под нужным углом
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 68, 58); 
camera.lookAt(0, -2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const arenaGroup = new THREE.Group();

// Игровые размеры
const playWidth = WIDTH - 2;
const playHeight = HEIGHT - 2;
const radius = 6; // Радиус закругления углов

// Функция для генерации формы скругленного прямоугольника
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

// 2. ПОЛ И СЕТКА
function createFloor() {
    // Делаем общую подложку со скруглениями
    const shape = createRoundedRectShape(playWidth, playHeight, radius);
    const floorGeo = new THREE.ShapeGeometry(shape);
    
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x020816, 
        transparent: true, 
        opacity: 0.65, 
        roughness: 0.7, 
        side: THREE.DoubleSide 
    });
    
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    arenaGroup.add(floor);

    // МЕЛКАЯ СЕТКА (Увеличили число делений до 40, чтобы видеть линии движения)
    const gridLeft = new THREE.GridHelper(playWidth / 2, 40, 0x00ffff, 0x002233);
    gridLeft.position.set(-playWidth / 4, 0.02, 0);
    gridLeft.scale.z = playHeight / (playWidth / 2);
    
    const gridRight = new THREE.GridHelper(playWidth / 2, 40, 0xff5500, 0x331100);
    gridRight.position.set(playWidth / 4, 0.02, 0);
    gridRight.scale.z = playHeight / (playWidth / 2);

    arenaGroup.add(gridLeft, gridRight);
}
createFloor();

// 3. ЗАКРУГЛЕННЫЙ ЗАБОР (Материальный, с неоновым кантом)
function createHighFence() {
    const fenceHeight = 5;
    
    // Форма внешней стены (вырезаем внутреннюю часть, чтобы получить только забор)
    const wallShape = createRoundedRectShape(playWidth, playHeight, radius);
    
    // Настройки выдавливания формы вверх
    const extrudeSettings = { depth: fenceHeight, bevelEnabled: false };
    const wallGeo = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
    
    // Материал забора: увеличили видимость (opacity 0.4) и добавили внутреннее свечение (emissive)
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x0d1b2a,
        emissive: 0x001122, // Легкое свечение самого пластика забора в темноте
        transparent: true, 
        opacity: 0.4, 
        roughness: 0.1, 
        metalness: 0.8, 
        side: THREE.DoubleSide
    });
    
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.rotation.x = Math.PI / 2; // Ставим вертикально
    // Сдвигаем по оси Y, чтобы забор шел вверх от пола
    wall.position.y = fenceHeight; 
    arenaGroup.add(wall);

    // СВЕТЯЩИЙСЯ КАНТ ПО КРАЯМ (Верхняя кромка забора)
    const points = wallShape.getPoints(50); // Получаем точки скругленного контура
    const edge3DPoints = points.map(p => new THREE.Vector3(p.x, fenceHeight, -p.y));
    
    const edgeGeo = new THREE.BufferGeometry().setFromPoints(edge3DPoints);
    
    // Делим визуально кант на две половины (синий и оранжевый) через два объекта
    const leftEdgeMat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 3 });
    const rightEdgeMat = new THREE.LineBasicMaterial({ color: 0xff5500, linewidth: 3 });
    
    const neonLineLeft = new THREE.Line(edgeGeo, leftEdgeMat);
    arenaGroup.add(neonLineLeft);
}
createHighFence();

scene.add(arenaGroup);

// Направленный свет
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(0, 40, 20);
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
