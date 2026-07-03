const scene = new THREE.Scene();
scene.background = new THREE.Color(0x01030a);
scene.fog = new THREE.FogExp2(0x01030a, 0.012);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 52, 48); 
camera.lookAt(0, -2, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x0a1530, 0.6));
const blueLight = new THREE.PointLight(0x00ffff, 2, 60); blueLight.position.set(-20, 10, 0); scene.add(blueLight);
const orangeLight = new THREE.PointLight(0xff4400, 2, 60); orangeLight.position.set(20, 10, 0); scene.add(orangeLight);

// Генерация города
const cityGroup = new THREE.Group();
for(let i=0; i<60; i++) {
    const h = 15 + Math.random() * 40; const w = 6 + Math.random() * 10; const d = 6 + Math.random() * 10;
    const buildGeo = new THREE.BoxGeometry(w, h, d);
    const building = new THREE.Mesh(buildGeo, new THREE.MeshStandardMaterial({ color: 0x03050d, roughness: 0.7 }));
    const angle = Math.random() * Math.PI * 2; const radius = 70 + Math.random() * 60;
    building.position.set(Math.cos(angle)*radius, -h/2 - 5, Math.sin(angle)*radius);
    cityGroup.add(building);
    cityGroup.add(new THREE.BoxHelper(building, Math.random() > 0.5 ? 0x00ffff : 0xff00aa));
}
scene.add(cityGroup);

// Генерация парящей арены
const arenaGroup = new THREE.Group();
const arenaFloor = new THREE.Mesh(new THREE.BoxGeometry(WIDTH, 0.5, HEIGHT), new THREE.MeshStandardMaterial({ color: 0x040814, roughness: 0.3, metalness: 0.8 }));
arenaFloor.position.y = -0.25; arenaGroup.add(arenaFloor);

const gridLeft = new THREE.GridHelper(WIDTH/2, WIDTH/2, 0x00ffff, 0x004455); gridLeft.position.set(-WIDTH/4, 0.02, 0); arenaGroup.add(gridLeft);
const gridRight = new THREE.GridHelper(WIDTH/2, WIDTH/2, 0xff5500, 0x551100); gridRight.position.set(WIDTH/4, 0.02, 0); arenaGroup.add(gridRight);

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
