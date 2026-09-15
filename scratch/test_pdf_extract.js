const fs = require('fs');
const pdfModule = require('pdf-parse');
const PDFParseClass = pdfModule.PDFParse || pdfModule;

// Simple test creating a raw text PDF or checking PDFParse functionality
console.log('Testing PDFParseClass loading...');
const p = new PDFParseClass({ data: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF') });
p.load().then(async () => {
    console.log('p.load succeeded');
    const info = await p.getInfo();
    console.log('info:', info);
    try {
        const ss = await p.getScreenshot({ imageDataUrl: true });
        console.log('ss pages count:', ss?.pages?.length);
    } catch(e) {
        console.log('getScreenshot error:', e.message);
    }
    await p.destroy();
}).catch(err => {
    console.log('p.load failed:', err.message);
});
