const mapWidth = 128, mapHeight = 128;
let w = 0, h = 0;
let cameraX = mapWidth/2, cameraY = mapHeight/2, cameraScale = 1;
let cursorX = 0, cursorY = 0;
let tile = [];
let cursorTile;

let map = [];

let mousePosition = {x: 0, y: 0}, lastMousePosition = {x: 0, y: 0}, leftMouseDown = false, rightMouseDown = false;

let dragging = false, dragStartX = -1, dragStartY, dragEndX, dragEndY;

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
    cursorTile = new Image();
    cursorTile.src = 'cursor.png';

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

    const canvas = document.getElementById('tileCanvas');
    canvas.addEventListener('mousedown', event => {
        lastMousePosition.x = mousePosition.x
        lastMousePosition.y = mousePosition.y;
        if (event.button === 0) {
          leftMouseDown = true;
        } else {
          rightMouseDown = true;
        }
    }, false);

    canvas.addEventListener('mouseup', event => {
      if (event.button === 0) {
        leftMouseDown = false;
      } else {
        rightMouseDown = false;
      }
    }, false);

    window.addEventListener("wheel", event => {
        if (Math.sign(event.deltaY) > 0) {
          cameraScale *= 0.9;
        } else {
          cameraScale /= 0.9;
        }
        if (cameraScale > 4) cameraScale = 4;
        if (cameraScale < 0.25) cameraScale = 0.25;
    });

    canvas.addEventListener('mousemove', event => {
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
    }, false);

    canvas.oncontextmenu = function (e) {
      e.preventDefault();
    };

    window.requestAnimationFrame(redraw);

}

let lastTimestamp = 0, fps = 0, fpsTimestamp = -1, frames = 0;

function redraw(timestamp) {

    const frameLength = (lastTimestamp - timestamp) / 1000;
    lastTimestamp = timestamp;

    if (fpsTimestamp === -1) fpsTimestamp = timestamp;

    if (timestamp - fpsTimestamp > 1000) {
      fps = frames;
      frames = 0;
      fpsTimestamp += 1000
      window.top.document.title = "Tiled Canvas Demo (" + fps + " FPS)";
    }
    frames++;

    const tileWidth = 128;
    const tileHeight = 128;

    const scaledTileWidth = tileWidth*cameraScale;
    const scaledTileHeight = tileHeight*cameraScale;

    cursorX = Math.floor((mousePosition.x - w/2) / scaledTileWidth + cameraX);
    cursorY = Math.floor((mousePosition.y - h/2) / scaledTileHeight + cameraY);

    if (cursorX < 0) cursorX = 0;
    if (cursorY < 0) cursorY = 0;
    if (cursorX >= mapWidth) cursorX = mapWidth - 1;
    if (cursorY >= mapHeight) cursorY = mapHeight - 1;

    if (leftMouseDown) {
        map[cursorX][cursorY].tile = tile[0];
    }

    if (rightMouseDown) {
        cameraX += (lastMousePosition.x - mousePosition.x) / scaledTileWidth;
        cameraY += (lastMousePosition.y - mousePosition.y) / scaledTileHeight;
        lastMousePosition.x = mousePosition.x
        lastMousePosition.y = mousePosition.y;
    }

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
            if (cameraScale > 4) cameraScale = 4;
            break;
         case 'PageDown':
            cameraScale /= 1-frameLength;
            if (cameraScale < 0.25) cameraScale = 0.25;
            break;
          case 'Home':
            cameraScale = 1;
            break;
          case 'Shift':
            if (!dragging) {
              dragStartX = cursorX;
              dragStartY = cursorY;
              dragging = true;
            }
            dragEndX = cursorX;
            dragEndY = cursorY;
            break;
          case 'Escape':
            dragStartX = -1;
        }
      } else {
        if (key == 'Shift') {
          dragging = false;
        }
      }
    }

    const canvas = document.getElementById('tileCanvas');
    const context = canvas.getContext('2d');

    context.fillStyle = '#000088';
    context.fillRect(0, 0, w, h);

    let alpha = Math.floor(Math.abs((timestamp - fpsTimestamp) - 500)/4) + 50;
    if (alpha < 16) alpha = 16;
    if (alpha > 250) alpha = 250;

    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            if (map[i][j] !== null) {
                let u = w/2 + (i - cameraX) * scaledTileWidth;
                let v = h/2 + (j - cameraY) * scaledTileHeight;
                if (u > -scaledTileWidth && v > -scaledTileHeight && u < w && v < h) {
                    context.drawImage(map[i][j].tile, 0, 0, 128, 128, u, v, scaledTileWidth, scaledTileHeight);
                    if (dragStartX != -1 && i >= dragStartX && j >= dragStartY && i <= dragEndX && j <= dragEndY) {
                      context.fillStyle = '#00FFFF' + alpha.toString(16);
                      context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
                    }
                    if (i === cursorX && j === cursorY) {
                      context.drawImage(cursorTile, 0, 0, 128, 128, u, v, scaledTileWidth, scaledTileHeight);
                    }
                }
            }
        }
    }

    context.font = "24px Arial";
    context.strokeStyle = 'white';
    context.strokeText(`${cursorX}, ${cursorY}`, mousePosition.x, mousePosition.y);

    window.requestAnimationFrame(redraw);

}
