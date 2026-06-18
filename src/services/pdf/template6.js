// Template 6 — Based on Style 2: Left-aligned modern, green with gray sidebar stripe
const { ensureSpace } = require('./helpers');

const T6_GREEN = "#2E7D32";
const T6_DARK = "#1B5E20";
const T6_BLACK = "#333333";
const T6_GRAY = "#616161";
const T6_LIGHT = "#E8F5E9";
const T6_LINE = "#A5D6A7";

function generateTemplate6PDF(doc, parsed, user, pageWidth) {
    const leftX = doc.page.margins.left;
    const rightEdge = doc.page.width - doc.page.margins.right;

    // ===== GREEN LEFT STRIPE (every page) =====
    function drawSidebar() {
        doc.save();
        doc.rect(0, 0, 18, doc.page.height).fill(T6_GREEN);
        doc.restore();
    }
    drawSidebar();
    doc.on('pageAdded', drawSidebar);

    doc.font("Bold").fontSize(28).fillColor(T6_DARK)
        .text(user.name, leftX, doc.page.margins.top, { align: "left" });
    if (parsed.subtitle) {
        doc.font("Regular").fontSize(13).fillColor(T6_GREEN)
            .text(parsed.subtitle, { align: "left" });
    }
    doc.moveDown(0.15);
    doc.font("Regular").fontSize(9).fillColor(T6_GRAY)
        .text(`${user.address}  \u00B7  ${user.phone}  \u00B7  ${user.email}`, { align: "left" });
    doc.moveDown(0.5);

    // Section header — green text with underline
    function sectionHeader(title) {
        doc.moveDown(0.5);
        doc.font("SemiBold").fontSize(10.5).fillColor(T6_DARK)
            .text(title.toUpperCase(), leftX, doc.y, { width: pageWidth, characterSpacing: 1 });
        doc.moveDown(0.15);
        const ly = doc.y;
        doc.strokeColor(T6_LINE).lineWidth(1)
            .moveTo(leftX, ly).lineTo(rightEdge, ly).stroke();
        doc.y = ly + 8;
    }

    function splitLine(leftText, leftFont, rightText, rightFont, fontSize) {
        const savedY = doc.y;
        const pageBefore = doc.bufferedPageRange().count;
        doc.font(leftFont).fontSize(fontSize).fillColor(T6_BLACK);
        const lh = doc.heightOfString(leftText, { width: pageWidth * 0.7 });
        doc.text(leftText, leftX, savedY, { width: pageWidth * 0.7 });
        doc.font(rightFont).fontSize(fontSize).fillColor(T6_GREEN);
        const rw = doc.widthOfString(rightText);
        const pageAfter = doc.bufferedPageRange().count;
        if (pageAfter === pageBefore) {
            doc.text(rightText, rightEdge - rw, savedY, { width: rw + 2 });
            doc.x = leftX; doc.y = savedY + Math.max(lh, fontSize + 4);
        } else {
            doc.text(rightText, rightEdge - rw, doc.page.margins.top, { width: rw + 2 });
            doc.x = leftX;
        }
    }

    // ===== SUMMARY =====
    if (parsed.summary.length > 0) {
        const summaryText = parsed.summary.join(" ").replace(/<<|>>/g, "");
        doc.font("Regular").fontSize(10).fillColor(T6_BLACK)
            .text(summaryText, leftX, doc.y, { width: pageWidth, align: "justify", lineGap: 2 });
    }

    // ===== WORK EXPERIENCE =====
    if (parsed.experience.length > 0) {
        sectionHeader("Work Experience");
        parsed.experience.forEach((job, idx) => {
            ensureSpace(doc, 100);
            if (idx > 0) doc.moveDown(0.4);
            splitLine(job.title || "", "Bold", job.dates, "Regular", 11);
            if (job.companyAndLocation) {
                doc.font("Regular").fontSize(10).fillColor(T6_GRAY)
                    .text(job.companyAndLocation, leftX, doc.y, { width: pageWidth });
                doc.moveDown(0.25);
            }
            const bulletIndent = 16;
            job.bullets.forEach(bullet => {
                const plain = bullet.replace(/<<|>>/g, "");
                doc.font("Regular").fontSize(10);
                const bH = doc.heightOfString(plain, { width: pageWidth - bulletIndent });
                ensureSpace(doc, Math.min(bH + 4, 60));
                const by = doc.y, bp = doc.bufferedPageRange().count;
                // Green square bullet
                doc.save();
                doc.rect(leftX + 3, by + 5, 4, 4).fill(T6_GREEN);
                doc.restore();
                doc.font("Regular").fontSize(10).fillColor(T6_BLACK)
                    .text(plain, leftX + bulletIndent, by, { width: pageWidth - bulletIndent, lineGap: 1 });
                const ap = doc.bufferedPageRange().count;
                doc.x = leftX;
                if (ap === bp) doc.y = Math.max(doc.y, by + bH + 2);
            });
            doc.moveDown(0.2);
        });
    }

    // ===== EDUCATION =====
    if (parsed.education.length > 0) {
        sectionHeader("Education");
        parsed.education.forEach(edu => {
            ensureSpace(doc, 60);
            splitLine(edu.university, "Bold", edu.graduation, "Regular", 10);
            if (edu.degree) doc.font("Regular").fontSize(10).fillColor(T6_BLACK).text(edu.degree, leftX, doc.y, { width: pageWidth });
            if (edu.coursework) doc.font("Italic").fontSize(10).fillColor(T6_GRAY).text(edu.coursework, leftX, doc.y, { width: pageWidth });
            doc.moveDown(0.4);
        });
    }

    // ===== SKILLS =====
    if (parsed.skills.length > 0) {
        sectionHeader("Skills & Expertise");
        const labelIndent = 170;
        parsed.skills.forEach(skillLine => {
            const colonIdx = skillLine.indexOf(":");
            if (colonIdx > -1) {
                const label = skillLine.substring(0, colonIdx + 1).replace(/<<|>>/g, "");
                const value = skillLine.substring(colonIdx + 1).trim().replace(/<<|>>/g, "");
                doc.font("Bold").fontSize(10);
                const lh = doc.heightOfString(label, { width: labelIndent });
                doc.font("Regular").fontSize(10);
                const vh = doc.heightOfString(value, { width: pageWidth - labelIndent });
                const rh = Math.max(lh, vh, 12);
                ensureSpace(doc, rh + 4);
                const sy = doc.y;
                doc.font("Bold").fontSize(10).fillColor(T6_BLACK).text(label, leftX, sy, { width: labelIndent });
                doc.font("Regular").fontSize(10).fillColor(T6_BLACK).text(value, leftX + labelIndent, sy, { width: pageWidth - labelIndent });
                doc.x = leftX; doc.y = sy + rh;
            } else {
                ensureSpace(doc, 14);
                doc.font("Regular").fontSize(10).fillColor(T6_BLACK).text(skillLine.replace(/<<|>>/g, ""), leftX, doc.y);
            }
            doc.moveDown(0.15);
        });
    }
}

module.exports = generateTemplate6PDF;
