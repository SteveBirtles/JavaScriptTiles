"use strict";

const mapWidth = 128, mapHeight = 128;

let w = 0, h = 0;
let cameraX = mapWidth/2, cameraY = mapHeight/2, cameraScale = 1;
let cursorX = 0, cursorY = 0, currentTile = 0;
let tile = [];

let map = [], mapFilename = 'map.json';

let mousePosition = {x: 0, y: 0}, lastMousePosition = {x: 0, y: 0}, leftMouseDown = false, rightMouseDown = false, keyDown = false;

let dragging = false, dragStartX = -1, dragStartY, dragEndX, dragEndY, showGrid = false, showHelp = true;

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
            row.push({});
        }
        map.push(row);
    }

    window.addEventListener("resize", fixSize);
    fixSize();

    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => {
        keyDown = false;
        pressedKeys[event.key] = false;
    });

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
        map[cursorX][cursorY].tile = currentTile;
    }

    if (rightMouseDown) {
        cameraX += (lastMousePosition.x - mousePosition.x) / scaledTileWidth;
        cameraY += (lastMousePosition.y - mousePosition.y) / scaledTileHeight;
        lastMousePosition.x = mousePosition.x
        lastMousePosition.y = mousePosition.y;
    }

    let alpha, dragX1, dragY1, dragX2, dragY2;
    if (dragStartX != -1) {
        alpha = Math.floor(50*(1+Math.cos(timestamp/200)) + 50);
        dragX1 = dragStartX > dragEndX ? dragEndX : dragStartX;
        dragY1 = dragStartY > dragEndY ? dragEndY : dragStartY;
        dragX2 = dragStartX > dragEndX ? dragStartX : dragEndX;
        dragY2 = dragStartY > dragEndY ? dragStartY : dragEndY;
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
                break;
                case 'a': //select all
                dragStartX = 0;
                dragStartY = 0;
                dragEndX = mapWidth-1;
                dragEndY = mapHeight-1;
                break;
                case 'Delete':
                map[cursorX][cursorY] = {};
                break;
                case '[': //previous tile
                if (!keyDown) {
                    currentTile--;
                    if (currentTile < 0) currentTile = tile.length-1;
                    keyDown = true;
                }
                break;
                case ']': //next tile
                if (!keyDown) {
                    currentTile++;
                    if (currentTile >= tile.length) currentTile = 0;
                    keyDown = true;
                }
                case 'p': //pick tile
                if (map[cursorX][cursorY] !== {} && !(typeof map[cursorX][cursorY].tile === "undefined")) {
                    currentTile = map[cursorX][cursorY].tile;
                }
                break;
                case 'g': //grid
                if (!keyDown) {
                    showGrid = !showGrid;
                    keyDown = true;
                }
                case 'h': //help
                if (!keyDown) {
                    showHelp = !showHelp
                    document.getElementById("helpText").style.display = showHelp ? "block" : "none";
                    keyDown = true;
                }
                break;
                case 'f': //fill
                case 'd': //duplicate
                case 'x': //cut
                case 'b': //clear (bin)
                case 'm': //mirror horizonal
                case 'k': //flip vertical
                case 'l': //flip and mirror
                if (dragStartX != -1) {
                    for (let i = dragX1; i <= dragX2; i++) {
                        for (let j = dragY1; j <= dragY2; j++) {
                            if (key === 'f') map[i][j].tile = currentTile;
                            if (key === 'b') map[i][j] = {};
                            if (map[i][j] !== {} && i - dragX1 + cursorX < mapWidth && j - dragY1 + cursorY < mapHeight) {
                                if (key === 'd') map[i - dragX1 + cursorX][j - dragY1 + cursorY].tile = map[i][j].tile;
                                if (key === 'x') {
                                    map[i - dragX1 + cursorX][j - dragY1 + cursorY].tile = map[i][j].tile;
                                    map[i][j] = {};
                                }
                                if (key === 'm') map[i - dragX1 + cursorX][j - dragY1 + cursorY].tile = map[dragX2-(i-dragX1)][j].tile;
                                if (key === 'k') map[i - dragX1 + cursorX][j - dragY1 + cursorY].tile = map[i][dragY2-(j-dragY1)].tile;
                                if (key === 'l') map[i - dragX1 + cursorX][j - dragY1 + cursorY].tile = map[dragX2-(i-dragX1)][dragY2-(j-dragY1)].tile;
                            }
                        }
                    }

                }
                break;
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

    context.fillStyle = '#FF000044';

    for (let i = -1; i <= mapWidth; i++) {
        for (let j = -1; j <= mapHeight; j += mapHeight+1) {
            let u = w/2 + (i - cameraX) * scaledTileWidth;
            let v = h/2 + (j - cameraY) * scaledTileHeight;
            if (u > -scaledTileWidth && v > -scaledTileHeight && u < w && v < h) {
                context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
            }
        }
    }
    for (let j = 0; j < mapHeight; j++) {
        for (let i = -1; i <= mapWidth; i += mapWidth+1) {
            let u = w/2 + (i - cameraX) * scaledTileWidth;
            let v = h/2 + (j - cameraY) * scaledTileHeight;
            if (u > -scaledTileWidthh && v > -scaledTileHeight && u < w && v < h) {
                context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
            }
        }
    }

    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            if (map[i][j] !== {}) {
                let u = w/2 + (i - cameraX) * scaledTileWidth;
                let v = h/2 + (j - cameraY) * scaledTileHeight;
                if (u > -scaledTileWidth && v > -scaledTileHeight && u < w && v < h) {

                    if (map[i][j] !== {} && !(typeof map[i][j].tile === "undefined")) {
                        context.drawImage(tile[map[i][j].tile], 0, 0, 128, 128, u, v, scaledTileWidth, scaledTileHeight);
                    } else if (showGrid) {
                        context.strokeStyle = '#00FF00';
                        context.strokeRect(u, v, scaledTileWidth, scaledTileHeight);
                    }

                    if (dragStartX != -1) {
                        if (i >= dragX1 && j >= dragY1 && i <= dragX2 && j <= dragY2) {
                            context.fillStyle = '#00FFFF' + alpha.toString(16);
                            context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
                        }
                    }

                    if (i === cursorX && j === cursorY) {
                        context.fillStyle = '#FFFFFF88';
                        context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
                    }

                }
            }
        }
    }

    context.fillStyle = '#00000088';
    context.fillRect(0, 0, 105, 158);
    context.drawImage(tile[currentTile], 0,0, tileWidth, tileHeight, 10,63, 83,83);

    context.font = "24px Arial";
    context.strokeStyle = 'white';
    context.strokeText(`${cursorX}, ${cursorY}`, mousePosition.x, mousePosition.y);

    window.requestAnimationFrame(redraw);

}

function handleUpload(files) {

    if (files.length !== 1) return;

    mapFilename = files[0].name;
    console.log("Loading " + mapFilename + "...");

    let reader = new FileReader();
    reader.onload = function(){
        let mapJSON = reader.result;
        map = JSON.parse(mapJSON);
        document.getElementById('uploader').value = ''
    };
    reader.readAsText(files[0]);

}

function handleDownload() {

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(map)));
    element.setAttribute('download', mapFilename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

}
