var canvas = null;
var scale = 4
var rom = []
let CHR = []
let colors = [
    document.getElementById("color1").value,
    document.getElementById("color2").value,
    document.getElementById("color3").value,
    document.getElementById("color4").value,
]
let ctx = null
let ctx2 = null
var selectedTile = null

function createCHR(rom, CHR) {
    const Z = 16 + (16384 * rom[4])
    let i = 0
    let k = 0
    while (i < 8192 * rom[5]) {
        for (let j = 0; j < 8; j++) {
            let extracted1 = [...rom[Z + i + j + 0].toString(2).padStart(8, '0')]
            let extracted2 = [...rom[Z + i + j + 8].toString(2).padStart(8, '0')]
            let extracted3 = extracted1.map((char, index) => char + extracted2[index])
            extracted3.filter((char, index) => {
                if (char == '00') extracted3[index] = 0
                if (char == '10') extracted3[index] = 1
                if (char == '01') extracted3[index] = 2
                if (char == '11') extracted3[index] = 3
            })
            CHR[k + j] = extracted3
        }

        i = i + 16
        k = k + 8
    }
}
function colorChange(index) {
    return function (e) {
        colors[index - 1] = e.target.value
        if (rom.length) {
            printCHR2(CHR, ctx)
        }

    }
}
function ChangeRomDate(x, y, brush) {
    const Z = 16 + (16384 * rom[4])
    console.log("tile,x,y,brush", selectedTile / 8, x, y, brush)
    const currentByte = Z + ((selectedTile / 8) * 2 * 8) + y
    if (brush == 0) { //00
        rom[currentByte + 0] = rom[currentByte + 0] & (0xff ^ (1 << (7 - x)))
        rom[currentByte + 8] = rom[currentByte + 8] & (0xff ^ (1 << (7 - x)))
    }
    if (brush == 1) { //10
        rom[currentByte + 0] = rom[currentByte + 0] | (0x00 | (1 << (7 - x)))
        rom[currentByte + 8] = rom[currentByte + 8] & (0xff ^ (1 << (7 - x)))
    }
    if (brush == 2) { //01
        rom[currentByte + 0] = rom[currentByte + 0] & (0xff ^ (1 << (7 - x)))
        rom[currentByte + 8] = rom[currentByte + 8] | (0x00 | (1 << (7 - x)))
    }
    if (brush == 3) { //11
        rom[currentByte + 0] = rom[currentByte + 0] | (0x00 | (1 << (7 - x)))
        rom[currentByte + 8] = rom[currentByte + 8] | (0x00 | (1 << (7 - x)))
    }
    createCanvas(rom)
}
function clickOnSprite(e) {
    let x = Math.floor((e.clientX - e.target.offsetLeft) / scale)
    let y = Math.floor((e.clientY - e.target.offsetTop) / scale)
    let brushValue = parseInt(document.getElementById("brush").value) - 1
    let selectedColor = colors[brushValue]
    ctx2.fillStyle = selectedColor
    ctx2.fillRect(x * scale, y * scale, 1 * scale, 1 * scale)

    ctx.fillStyle = `rgba(0,255,0,1)`
    const xx = scale * 8 * (((selectedTile) / (8)) % 32) + x * scale
    const yy = scale * 8 * Math.floor((selectedTile) / (32 * 8)) + y * scale
    ctx.fillRect(
        xx,
        yy,
        1 * scale, 1 * scale)

    CHR[selectedTile + y][x] = brushValue
    ChangeRomDate(x, y, brushValue)


}
function drawSprite(ct, x, y) {
    ct.fillStyle = 'rgba(0,0,0,1)';
    ct.fillRect(0, 0, 8 * scale, 8 * scale);
    let ii = Math.floor(x / (8 * scale))
    let jj = Math.floor(y / (8 * scale))
    selectedTile = jj * 32 * 8 + 8 * ii
    for (let py = 0; py < 8; py++) {
        for (let px = 0; px < 8; px++) {//color pixel at x y
            ct.fillStyle = colors[CHR[selectedTile + py][px]];
            ct.fillRect(px * scale, py * scale, 1 * scale, 1 * scale);
        }
    }
}
function clickOnMainCanvas(e) {
    let sprite = document.getElementById('sprite');
    sprite.addEventListener("click", clickOnSprite, false)
    sprite.width = 8 * scale;
    sprite.height = 8 * scale;
    ctx2 = sprite.getContext("2d");
    var tile = document.getElementsByName("selected-tile")[0];
    tile.removeChild(tile.lastChild);
    tile.appendChild(sprite);
    drawSprite(ctx2, e.clientX - e.target.offsetLeft, e.clientY - e.target.offsetTop)
}
function saveFile(fileName, urlFile) {
    let a = document.createElement("a");
    a.style = "display: none";
    document.body.appendChild(a);
    a.href = urlFile;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(urlFile);
    a.remove();
}
function readFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        createCanvas(e.target.result)
    };
    reader.readAsBinaryString(file);
}
function createCanvas(contents) {
    rom = []
    if (typeof (contents) == 'string') {
        for (let i = 0; i < contents.length; i++) {
            rom = rom.concat(contents.charCodeAt(i))
        }
    } else { // is Array of bytes
        rom = contents
    }
    var mainCanvas = document.getElementById('canvas');
    mainCanvas.removeEventListener("click", clickOnMainCanvas)
    mainCanvas.addEventListener("click", clickOnMainCanvas, false)
    mainCanvas.width = 32 * 8 * scale;
    mainCanvas.height = 16 * 8 * scale;
    ctx = mainCanvas.getContext("2d");
    createCHR(rom, CHR)
    printCHR2(CHR, ctx)
}
function printCHR2(CHR, ctx) {
    for (let k = 0; k < CHR.length; k = k + 32 * 8) {
        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < 32; i++) {
                for (let p = 0; p < 8; p++) {//color pixel at x y
                    ctx.fillStyle = colors[CHR[k + j + i * 8][p]];
                    ctx.fillRect((i * 8 + p) * scale, (k / (32) + j) * scale, 1 * scale, 1 * scale);
                }
            }
        }
    }
}
function exportRom(e) {
    let url = window.URL.createObjectURL(new Blob([new Uint8Array(rom)]));
    saveFile('output.nes', url);
}
document.getElementById('color1').addEventListener('change', colorChange(1));
document.getElementById('color2').addEventListener('change', colorChange(2));
document.getElementById('color3').addEventListener('change', colorChange(3));
document.getElementById('color4').addEventListener('change', colorChange(4));
document.getElementById('export').addEventListener('click', exportRom, false);
document.getElementById('file-input').addEventListener('change', readFile, false);

