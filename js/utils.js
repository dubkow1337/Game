// Константы игрового поля
const WIDTH = 80;   
const HEIGHT = 46;  

// Перевод координат сетки в 3D координаты сцены
function gridToScene(gx, gy) {
    return { x: gx - WIDTH / 2, z: gy - HEIGHT / 2 };
}

// Проверка безопасности клетки (нахождение в пределах поля и отсутствие следов)
function isSafeCell(x, y, trail, enemyTrail) {
    if (x < 2 || x >= WIDTH - 2 || y < 2 || y >= HEIGHT - 2) return false;
    for (let i = 0; i < trail.length; i++) {
        if (Math.round(trail[i].x) === Math.round(x) && Math.round(trail[i].y) === Math.round(y)) return false;
    }
    for (let i = 0; i < enemyTrail.length; i++) {
        if (Math.round(enemyTrail[i].x) === Math.round(x) && Math.round(enemyTrail[i].y) === Math.round(y)) return false;
    }
    return true;
}
