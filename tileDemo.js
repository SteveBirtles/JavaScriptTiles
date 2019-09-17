let w = 0, h = 0;
let p = 0, q = 0;
const tile = new Image();
const mapWidth = 128, mapHeight = 128;

let map = [];

function fixSize() {
    w = window.innerWidth;
    h = window.innerHeight;
    const canvas = document.getElementById('tileCanvas');
    canvas.width = w;
    canvas.height = h;
}

let pressedKeys = [];

function keyDown(event) {
    pressedKeys[event.key] = true;
}

function keyUp(event) {
    pressedKeys[event.key] = false;
}

function pageLoad() {

    for (let x = 0; x < mapWidth; x++) {
        let row = [];
        for (let y = 0; y < mapHeight; y++) {
            row.push({tile});
        }
        map.push(row);
    }

    window.addEventListener("resize", fixSize);
    fixSize();

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    tile.src = "01.png";
    tile.onload = () => window.requestAnimationFrame(redraw);

}

function redraw() {

    for (let key in pressedKeys) {
      if (pressedKeys[key]) {
        console.log(key);
        switch (key) {
          case 'ArrowUp':
            q--;
            break;
          case 'ArrowDown':
            q++;
            break;
          case 'ArrowLeft':
            p--;
            break;
          case 'ArrowRight':
            p++;
            break;
        }
      }
    }

    const canvas = document.getElementById('tileCanvas');
    const context = canvas.getContext('2d');

    context.fillStyle = '#000088';
    context.fillRect(0, 0, w, h);

    const tileWidth = 128;
    const tileHeight = 128;

    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            if (map[i][j] !== null) {
                let u = p * 10 + i * tileWidth;
                let v = q * 10 + j * tileWidth;
                context.drawImage(map[i][j].tile, 0, 0, 128, 128, u, v, tileWidth, tileWidth);
            }
        }
    }

    window.requestAnimationFrame(redraw);

}
