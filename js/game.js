let gameActive = true;

function updateGame() {
    if (!gameActive) return;
    aiMove(); 

    players.forEach(function(p) {
        if (!p.alive) return;

        p.x += p.dirX; p.y += p.dirY;
        p.trail.push({ x: p.x, y: p.y });

        const pos = gridToScene(p.x, p.y);
        
        const wallGeo = new THREE.BoxGeometry(0.9, 1.6, 0.9);
        const wallMat = new THREE.MeshStandardMaterial({ 
            color: p.trailColor, emissive: p.trailColor, emissiveIntensity: 1.2,
            transparent: true, opacity: 0.75
        });
        const trailBlock = new THREE.Mesh(wallGeo, wallMat);
        trailBlock.position.set(pos.x, 0.8, pos.z);
        scene.add(trailBlock);
        p.trailMeshes.push(trailBlock);

        if (p.trail.length > 45) {
            p.trail.shift();
            const oldMesh = p.trailMeshes.shift();
            scene.remove(oldMesh);
        }

        p.mesh.position.set(pos.x, 0.5, pos.z);
        
        if (p.dirX === 1) p.mesh.rotation.y = Math.PI / 2;
        if (p.dirX === -1) p.mesh.rotation.y = -Math.PI / 2;
        if (p.dirY === 1) p.mesh.rotation.y = 0;
        if (p.dirY === -1) p.mesh.rotation.y = Math.PI;

        if (p.x < 1 || p.x >= WIDTH - 1 || p.y < 1 || p.y >= HEIGHT - 1) p.alive = false;
        
        players.forEach(function(other) {
            other.trail.forEach(function(t, tIdx) {
                if (other === p && tIdx >= p.trail.length - 2) return;
                if (Math.round(t.x) === Math.round(p.x) && Math.round(t.y) === Math.round(p.y)) p.alive = false;
            });
        });
    });

    const alive = players.filter(function(p) { return p.alive; });
    if (alive.length === 1) {
        gameActive = false; alive[0].score++;
        document.getElementById('p1Score').innerText = players[0].score;
        document.getElementById('p2Score').innerText = players[1].score;
        showMessage("🏆 РАУНД ВЫИГРАЛ: " + alive[0].name.toUpperCase());
        setTimeout(resetGame, 2500);
    } else if (alive.length === 0) {
        gameActive = false; showMessage('💥 ОДНОВРЕМЕННЫЙ ВЗРЫВ!');
        setTimeout(resetGame, 2500);
    }
}

function resetGame() {
    players.forEach(function(p) {
        p.trail.forEach(function(t, i) { scene.remove(p.trailMeshes[i]); });
        p.trail = []; p.trailMeshes = []; p.alive = true;
    });
    players[0].x = 15; players[0].y = Math.floor(HEIGHT / 2); players[0].dirX = 1; players[0].dirY = 0;
    players[1].x = WIDTH - 15; players[1].y = Math.floor(HEIGHT / 2); players[1].dirX = -1; players[1].dirY = 0;
    gameActive = true;
}

function changeDirection(turn) {
    if (!gameActive) return;
    const p1 = players[0];
    if (turn === 'up' && p1.dirY !== 1) { p1.dirX = 0; p1.dirY = -1; }
    if (turn === 'down' && p1.dirY !== -1) { p1.dirX = 0; p1.dirY = 1; }
    if (turn === 'left' && p1.dirX !== 1) { p1.dirX = -1; p1.dirY = 0; }
    if (turn === 'right' && p1.dirX !== -1) { p1.dirX = 1; p1.dirY = 0; }
}
