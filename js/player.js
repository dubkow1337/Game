function createConeBike(colorHex) { 
    const group = new THREE.Group();
    const coneGeo = new THREE.ConeGeometry(0.5, 1.6, 16);
    const coneMat = new THREE.MeshStandardMaterial({ 
        color: colorHex, emissive: colorHex, emissiveIntensity: 0.3, metalness: 0.5, roughness: 0.2 
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = Math.PI / 2;
    group.add(cone);
    return group;
}

const players = [
    { 
        color: 0x00ffff, trailColor: 0x00ffff, name: "Синий", 
        x: 15, y: Math.floor(HEIGHT / 2), dirX: 1, dirY: 0, 
        trail: [], alive: true, score: 0,
        mesh: createConeBike(0x00ffff), trailMeshes: []
    },
    { 
        color: 0xff4400, trailColor: 0xff4400, name: "Оранжевый", 
        x: WIDTH - 15, y: Math.floor(HEIGHT / 2), dirX: -1, dirY: 0, 
        trail: [], alive: true, score: 0,
        mesh: createConeBike(0xff4400), trailMeshes: []
    }
];
