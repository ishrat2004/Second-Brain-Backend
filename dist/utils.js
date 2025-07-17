"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = random;
function random(len) {
    let options = "ncidsbvdflmsacjvonownqnnvnk";
    let length = options.length;
    let res = "";
    for (let i = 0; i < len; i++) {
        res += options[Math.floor((Math.random() * length))];
    }
    return res;
}
