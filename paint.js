var canvas = document.createElement('canvas');
var scale = 8
var rom = []
let CHR = []
let colors = [
    document.getElementById("color1").value,
    "rgba(255,   0,   0, 1)",
    "rgba(  0,   0, 255, 1)",
    "rgba(255, 0, 255, 1)"
]
let ctx = null
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
function readSingleFile(e) {
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
        var canvas = document.createElement('canvas');
        canvas.width = 32 * 8 * scale;
        canvas.height = 16 * 8 * scale;
        ctx = canvas.getContext("2d");
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(canvas);
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



document.getElementById('file-input').addEventListener('change', readSingleFile, false);
document.getElementById('color1').addEventListener('change', colorChange(1));
document.getElementById('color2').addEventListener('change', colorChange(2));
document.getElementById('color3').addEventListener('change', colorChange(3));
document.getElementById('color4').addEventListener('change', colorChange(4));

