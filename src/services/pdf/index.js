const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const parseResumeText = require('./parser');
const generateTemplate1PDF = require('./template1');
const generateTemplate2PDF = require('./template2');
const generateTemplate3PDF = require('./template3');
const generateTemplate4PDF = require('./template4');
const generateTemplate5PDF = require('./template5');
const generateTemplate6PDF = require('./template6');
const generateTemplate7PDF = require('./template7');
const generateTemplate8PDF = require('./template8');
const generateTemplate9PDF = require('./template9');

const FONTS_DIR = path.join(__dirname, '..', '..', '..', 'fonts');

function registerFonts(doc) {
    const fontRegular = path.join(FONTS_DIR, 'OpenSans-Regular.ttf');
    if (fs.existsSync(fontRegular)) {
        doc.registerFont("Regular", fontRegular);
        doc.registerFont("Bold", path.join(FONTS_DIR, 'OpenSans-Bold.ttf'));
        doc.registerFont("Italic", path.join(FONTS_DIR, 'OpenSans-Italic.ttf'));
        doc.registerFont("SemiBold", path.join(FONTS_DIR, 'OpenSans-SemiBold.ttf'));
    }
}

function generatePDF(resumeText, user, resumeStyle) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margins: { top: 40, bottom: 40, left: 50, right: 50 }, bufferPages: true });
        registerFonts(doc);

        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        const parsed = parseResumeText(resumeText);
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        const templates = {
            1: generateTemplate1PDF,
            2: generateTemplate2PDF,
            3: generateTemplate3PDF,
            4: generateTemplate4PDF,
            5: generateTemplate5PDF,
            6: generateTemplate6PDF,
            7: generateTemplate7PDF,
            8: generateTemplate8PDF,
            9: generateTemplate9PDF,
        };
        const templateFn = templates[resumeStyle] || generateTemplate1PDF;
        templateFn(doc, parsed, user, pageWidth);

        doc.flushPages();
        doc.end();
    });
}

module.exports = { generatePDF };
