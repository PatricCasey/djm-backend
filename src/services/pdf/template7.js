// Template 7 — Based on Template 2, Warm Burgundy Professional
const { ensureSpace } = require('./helpers');

const T7_BURGUNDY = "#8B1A1A";
const T7_BLACK = "#2E2E2E";
const T7_GRAY = "#707070";
const T7_LINE = "#D4A574";

function generateTemplate7PDF(doc, parsed, user, pageWidth) {
    // Header — centered
    doc.font("Bold").fontSize(32).fillColor(T7_BURGUNDY)
        .text(user.name, { align: "center" });
    if (parsed.subtitle) {
        doc.font("Regular").fontSize(13).fillColor(T7_BLACK)
            .text(parsed.subtitle, { align: "center" });
    }
    doc.moveDown(0.15);
    doc.font("Regular").fontSize(9).fillColor(T7_GRAY)
        .text(`${user.address}  |  ${user.phone}  |  ${user.email}`, { align: "center" });
    doc.moveDown(0.5);

    // Summary
    if (parsed.summary.length > 0) {
        const summaryText = parsed.summary.join(" ").replace(/<<|>>/g, "");
        // Bordered summary box
        const sy = doc.y;
        doc.font("Regular").fontSize(10);
        const sh = doc.heightOfString(summaryText, { width: pageWidth - 24, lineGap: 2 });
        doc.save();
        doc.strokeColor(T7_LINE).lineWidth(0.8)
            .roundedRect(doc.page.margins.left, sy - 4, pageWidth, sh + 18, 3).stroke();
        doc.restore();
        doc.font("Regular").fontSize(10).fillColor(T7_BLACK)
            .text(summaryText, doc.page.margins.left + 12, sy + 5, {
                width: pageWidth - 24, align: "justify", lineGap: 2
            });
        doc.y = sy + sh + 20;
    }

    function t7SectionHeader(title) {
        doc.moveDown(0.5);
        const ly = doc.y;
        doc.strokeColor(T7_LINE).lineWidth(0.5)
            .moveTo(doc.page.margins.left, ly)
            .lineTo(doc.page.width - doc.page.margins.right, ly).stroke();
        doc.y = ly + 6;
        doc.font("SemiBold").fontSize(10.5).fillColor(T7_BURGUNDY)
            .text(title.toUpperCase(), doc.page.margins.left, doc.y, { characterSpacing: 1 });
        doc.moveDown(0.3);
    }

    function t7SplitLine(leftText, leftFont, rightText, rightFont, fontSize) {
        const usable = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const savedY = doc.y, leftX = doc.page.margins.left;
        const pageBefore = doc.bufferedPageRange().count;
        doc.font(leftFont).fontSize(fontSize).fillColor(T7_BLACK);
        const lh = doc.heightOfString(leftText, { width: usable * 0.7 });
        doc.text(leftText, leftX, savedY, { width: usable * 0.7 });
        doc.font(rightFont).fontSize(fontSize).fillColor(T7_GRAY);
        const rw = doc.widthOfString(rightText);
        const pageAfter = doc.bufferedPageRange().count;
        if (pageAfter === pageBefore) {
            doc.text(rightText, doc.page.width - doc.page.margins.right - rw, savedY, { width: rw + 2 });
            doc.x = leftX; doc.y = savedY + Math.max(lh, fontSize + 4);
        } else {
            doc.text(rightText, doc.page.width - doc.page.margins.right - rw, doc.page.margins.top, { width: rw + 2 });
            doc.x = leftX;
        }
    }

    // Work Experience
    if (parsed.experience.length > 0) {
        t7SectionHeader("Work Experience");
        parsed.experience.forEach((job, idx) => {
            ensureSpace(doc, 100);
            if (idx > 0) doc.moveDown(0.4);
            t7SplitLine(job.title || "", "Bold", job.dates, "Regular", 11);
            if (job.companyAndLocation) {
                doc.font("Regular").fontSize(10).fillColor(T7_GRAY)
                    .text(job.companyAndLocation, doc.page.margins.left, doc.y, { width: pageWidth });
                doc.moveDown(0.25);
            }
            const bulletIndent = 16, leftX = doc.page.margins.left;
            job.bullets.forEach(bullet => {
                const plain = bullet.replace(/<<|>>/g, "");
                doc.font("Regular").fontSize(10);
                const bH = doc.heightOfString(plain, { width: pageWidth - bulletIndent });
                ensureSpace(doc, Math.min(bH + 4, 60));
                const by = doc.y, bp = doc.bufferedPageRange().count;
                doc.font("Regular").fontSize(10).fillColor(T7_BURGUNDY)
                    .text("—", leftX, by, { width: bulletIndent, lineBreak: false });
                doc.font("Regular").fontSize(10).fillColor(T7_BLACK)
                    .text(plain, leftX + bulletIndent, by, { width: pageWidth - bulletIndent, lineGap: 1 });
                const ap = doc.bufferedPageRange().count;
                doc.x = leftX;
                if (ap === bp) doc.y = Math.max(doc.y, by + bH + 2);
            });
            doc.moveDown(0.2);
        });
    }

    // Education
    if (parsed.education.length > 0) {
        t7SectionHeader("Education");
        parsed.education.forEach(edu => {
            ensureSpace(doc, 60);
            t7SplitLine(edu.university, "Bold", edu.graduation, "Regular", 10);
            if (edu.degree) doc.font("Regular").fontSize(10).fillColor(T7_BLACK).text(edu.degree, doc.page.margins.left, doc.y, { width: pageWidth });
            if (edu.coursework) doc.font("Italic").fontSize(10).fillColor(T7_GRAY).text(edu.coursework, doc.page.margins.left, doc.y, { width: pageWidth });
            doc.moveDown(0.4);
        });
    }

    // Skills
    if (parsed.skills.length > 0) {
        t7SectionHeader("Skills & Qualifications");
        const labelIndent = 170, leftX = doc.page.margins.left;
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
                doc.font("Bold").fontSize(10).fillColor(T7_BLACK).text(label, leftX, sy, { width: labelIndent });
                doc.font("Regular").fontSize(10).fillColor(T7_BLACK).text(value, leftX + labelIndent, sy, { width: pageWidth - labelIndent });
                doc.x = leftX; doc.y = sy + rh;
            } else {
                ensureSpace(doc, 14);
                doc.font("Regular").fontSize(10).fillColor(T7_BLACK).text(skillLine.replace(/<<|>>/g, ""), leftX, doc.y);
            }
            doc.moveDown(0.15);
        });
    }
}

module.exports = generateTemplate7PDF;
