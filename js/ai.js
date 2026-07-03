let opponentType = 'ai'; 

function aiMove() {
    if (!players[1].alive || opponentType !== 'ai') return;
    const p = players[1]; const enemy = players[0];
    const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
    let moveScores = [];

    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i];
        let newX = p.x + dir.dx; let newY = p.y + dir.dy;
        if (!isSafeCell(newX, newY, p.trail, enemy.trail)) { moveScores.push({ dir: dir, score: -999 }); continue; }
        let simX = newX, simY = newY, steps = 0;
        let simTrail = [...p.trail, { x: Math.round(simX), y: Math.round(simY) }];
        for (let step = 0; step < 30; step++) {
            let nextX = simX + dir.dx; let nextY = simY + dir.dy;
            if (isSafeCell(nextX, nextY, simTrail, enemy.trail)) { simX = nextX; simY = nextY; simTrail.push({ x: simX, y: simY }); steps++; } else break;
        }
        const distToEnemy = Math.abs(simX - enemy.x) + Math.abs(simY - enemy.y);
        moveScores.push({ dir: dir, score: steps * 10 + (30 - distToEnemy) });
    }
    moveScores.sort(function(a, b) { return b.score - a.score; });
    if (moveScores[0] && moveScores[0].score > -999) { p.dirX = moveScores[0].dir.dx; p.dirY = moveScores[0].dir.dy; }
}
