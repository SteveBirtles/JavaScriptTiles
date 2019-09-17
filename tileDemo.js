const mapWidth = 128, mapHeight = 128;
let w = 0, h = 0;
let cameraX = mapWidth/2, cameraY = mapHeight/2, cameraScale = 1;
let tile = [];

let map = [];

function fixSize() {
    w = window.innerWidth;
    h = window.innerHeight;
    const canvas = document.getElementById('tileCanvas');
    canvas.width = w;
    canvas.height = h;
}

let pressedKeys = {};

function pageLoad() {

    for (let i = 0; i < 12; i++) {
        tile[i] = new Image()
        tile[i].src = (i+1) + ".png";
    }

    for (let x = 0; x < mapWidth; x++) {
        let row = [];
        for (let y = 0; y < mapHeight; y++) {
            let r = Math.floor(Math.random() * 12);
            row.push({tile: tile[r]});
        }
        map.push(row);
    }

    window.addEventListener("resize", fixSize);
    fixSize();

    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => pressedKeys[event.key] = false);

    window.requestAnimationFrame(redraw);

}

let lastTimestamp = 0;

function redraw(timestamp) {

    const frameLength = (lastTimestamp - timestamp) / 1000;
    lastTimestamp = timestamp;

    for (let key in pressedKeys) {
      if (pressedKeys[key]) {
        switch (key) {
          case 'ArrowUp':
            cameraY += 5*frameLength/cameraScale;
            break;
          case 'ArrowDown':
            cameraY -= 5*frameLength/cameraScale;
            break;
          case 'ArrowLeft':
            cameraX += 5*frameLength/cameraScale;
            break;
          case 'ArrowRight':
            cameraX -= 5*frameLength/cameraScale;
            break;
         case 'PageUp':
            cameraScale *= 1-frameLength;
            break;
         case 'PageDown':
            cameraScale /= 1-frameLength;
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
                let u = w/2 + (i - cameraX) * tileWidth*cameraScale;
                let v = h/2 + (j - cameraY) * tileHeight*cameraScale;
                if (u > -tileWidth*cameraScale && v > -tileHeight*cameraScale && u < w && v < h) {
                    context.drawImage(map[i][j].tile, 0, 0, 128, 128, u, v, tileWidth*cameraScale, tileHeight*cameraScale);
                }
            }
        }
    }

    window.requestAnimationFrame(redraw);

}
