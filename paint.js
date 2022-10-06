var canvas = document.createElement('canvas');
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
            // extracted3 = extracted3.join('')
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
function drawSprite(ct, x, y) {
    ct.fillStyle = 'rgba(0,0,0,1)';
    ct.fillRect(0, 0, 8 * scale, 8 * scale);
    let ii = Math.floor(x / (8 * scale))
    let jj = Math.floor(y / (8 * scale))
    let selectedTile = jj * 32 * 8 + 8 * ii
    console.log(selectedTile, x, y, ii, jj)
    for (let py = 0; py < 8; py++) {
        for (let px = 0; px < 8; px++) {//color pixel at x y
            ct.fillStyle = colors[CHR[selectedTile + py][px]];
            ct.fillRect(px * scale, py * scale, 1 * scale, 1 * scale);
        }
    }
}
function clickOnMainCanvas(e) {
    // alert((e.clientX - e.target.offsetLeft) + " " + (e.clientY - e.target.offsetTop))
    let sprite = document.createElement('canvas');
    sprite.addEventListener("click", alert, false)
    sprite.width = 8 * scale;
    sprite.height = 8 * scale;
    ctx2 = sprite.getContext("2d");
    var selectedTile = document.getElementsByName("selected-tile")[0];
    selectedTile.removeChild(selectedTile.lastChild);
    selectedTile.appendChild(sprite);
    ctx2.fillStyle = 'rgba(255,0,0,1)'
    ctx2.fillRect(0, 0, 8 * scale, 8 * scale)
    drawSprite(ctx2, e.clientX - e.target.offsetLeft, e.clientY - e.target.offsetTop)
}
function readFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        for (let i = 0; i < contents.length; i++) {
            rom = rom.concat(contents.charCodeAt(i))
        }
        var mainCanvas = document.createElement('canvas');
        mainCanvas.addEventListener("click", clickOnMainCanvas, false)
        mainCanvas.width = 32 * 8 * scale;
        mainCanvas.height = 16 * 8 * scale;
        ctx = mainCanvas.getContext("2d");
        var tiles = document.getElementsByName("tiles")[0];
        tiles.removeChild(tiles.lastChild);
        tiles.appendChild(mainCanvas);
        createCHR(rom, CHR)
        printCHR2(CHR, ctx)

    };
    reader.readAsBinaryString(file);
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
document.getElementById('file-input').addEventListener('change', readFile, false);
document.getElementById('color1').addEventListener('change', colorChange(1));
document.getElementById('color2').addEventListener('change', colorChange(2));
document.getElementById('color3').addEventListener('change', colorChange(3));
document.getElementById('color4').addEventListener('change', colorChange(4));

