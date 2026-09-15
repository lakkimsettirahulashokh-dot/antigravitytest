const fs = require('fs');
const path = require('path');

// 128x128 vibrant blue/teal test PNG image
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6AkJDQoQ5J5V0QAAANJJREFUeNrt2LENgDAMQEEkFiM0bMIiLML+wAi1lB0I2X+1o8g3kXPO9fec872rY2Xvvg/07fMNAAAAAAAAAAAAAPA7Y8z9f6979+4HAAAAAAAAAAAAAHjUe4DeA/QeoPcAvQfoPUB/78FeAQAAAAAAAAAAAAAPWb3gfe7dC/QeoPcAvQfoPUB/78H55zsAAAAAAAAAAAAAwC7OOfde+P53L9B7gN4D9B6g9wC9B+g9wPwBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGB7AeJ2f6G3Z1F7AAAAAElFTkSuQmCC';

fs.writeFileSync(path.join(__dirname, 'sample_avatar.png'), Buffer.from(pngBase64, 'base64'));
console.log('Created scratch/sample_avatar.png');
