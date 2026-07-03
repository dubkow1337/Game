// Назначение клавиш управления
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') changeDirection('up');
    if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') changeDirection('down');
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') changeDirection('left');
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') changeDirection('right');
});

// Назначение мобильного тач-управления
document.getElementById('btnUp').addEventListener('touchstart', function(e) { e.preventDefault(); changeDirection('up'); }, {passive: false});
document.getElementById('btnDown').addEventListener('touchstart', function(e) { e.preventDefault(); changeDirection('down'); }, {passive: false});
document.getElementById('btnLeft').addEventListener('touchstart', function(e) { e.preventDefault(); changeDirection('left'); }, {passive: false});
document.getElementById('btnRight').addEventListener('touchstart', function(e) { e.preventDefault(); changeDirection('right'); }, {passive: false});

// Запуск игровых циклов
setInterval(updateGame, 75);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Старт рендеринга
animate();
