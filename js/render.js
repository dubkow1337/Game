const scene = new THREE.Scene();
scene.background = new THREE.Color(0x01030a);
// Делаем туман чуть мягче, чтобы он красиво уводил края арены в глубину фона
scene.fog = new THREE.FogExp2(0x01030a, 0.008);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 52, 48); 
camera.lookAt(0, -2, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// СВЕТ (Подстраиваем под тональность картинки 1782981130590_2.png)
scene.add(new THREE.AmbientLight(0x0a1128, 0.8));
const blueLight = new THREE.PointLight(0x00ffff, 2.5, 70); blueLight.position.set(-25, 12, 0); scene.add(blueLight);
const orangeLight = new THREE.PointLight(0xff5500, 2.5, 70); orangeLight.position.set(25, 12, 0); scene.add(orangeLight);

// КИБЕР-ГОРОД ИЗ КАРТИНКИ (Задний фон)
const textureLoader = new THREE.TextureLoader();
textureLoader.load('assets/images/bg.png', function(texture) {
    // Создаем гигантскую плоскость для заднего плана
    const bgGeo = new THREE.PlaneGeometry(210, 120);
    // MeshBasicMaterial не реагирует на свет, сохраняя оригинальную яркость картинки
    const bgMat = new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.DoubleSide,
        depthWrite: false // Чтобы фон всегда оставался на самом заднем плане
    });
    const backgroundMesh = new THREE.Mesh(bgGeo, bgMat);
    
    // Отодвигаем назад и наклоняем, чтобы поймать перспективу с картинки 1782981130590_2.png
    backgroundMesh.position.set(0, -15, -60);
    backgroundMesh.rotation.x = -Math.PI / 12; 
    scene.add(backgroundMesh);
});

// ПАРЯЩАЯ АРЕНА
const arenaGroup = new THREE.Group();

// Материал пола делаем более глянцевым (уменьшаем roughness)
const arenaFloor = new THREE.Mesh(
    new THREE.BoxGeometry(WIDTH, 0.5, HEIGHT), 
    new THREE.MeshStandardMaterial({ color: 0x020511, roughness: 0.15, metalness: 0.9 })
);
arenaFloor.position.y = -0.25; 
arenaGroup.add(arenaFloor);

// Сетки игроков
const gridLeft = new THREE.GridHelper(WIDTH/2, WIDTH/2, 0x00ffff, 0x002233); 
gridLeft.position.set(-WIDTH/4, 0.02, 0); 
arenaGroup.add(gridLeft);

const gridRight = new THREE.GridHelper(WIDTH/2, WIDTH/2, 0xff5500, 0x330a00); 
gridRight.position.set(WIDTH/4, 0.02, 0); 
arenaGroup.add(gridRight);

// НЕОНОВЫЙ КОНТУР АРЕНЫ
function createNeonFrame() {
    const w = WIDTH / 2; const h = HEIGHT / 2; const r = 4;
    const leftPoints = [];
    for(let theta = Math.PI/2; theta <= 3*Math.PI/2; theta += 0.1) leftPoints.push(new THREE.Vector3(-w+r + Math.cos(theta)*r, 0.5, h-r + Math.sin(theta)*r));
    leftPoints.unshift(new THREE.Vector3(0, 0.5, h)); leftPoints.push(new THREE.Vector3(0, 0.5, -h));
    arenaGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftPoints), 40, 0.5, 8, false), new THREE.MeshBasicMaterial({ color: 0x00ffff })));

    const rightPoints = [];
    for(let theta = -Math.PI/2; theta <= Math.PI/2; theta += 0.1) rightPoints.push(new THREE.Vector3(w-r + Math.cos(theta)*r, 0.5, h-r + Math.sin(theta)*r));
    rightPoints.unshift(new THREE.Vector3(0, 0.5, -h)); rightPoints.push(new THREE.Vector3(0, 0.5, h));
    arenaGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightPoints), 40, 0.5, 8, false), new THREE.MeshBasicMaterial({ color: 0xff4400 })));
}
createNeonFrame();
scene.add(arenaGroup);

// Добавление моделей игроков на сцену
players.forEach(p => scene.add(p.mesh));
