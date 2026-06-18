// Template 5 — Based on Style 1: Centered elegant, navy with gold, boxed sections
const { ensureSpace } = require('./helpers');

const T5_NAVY = "#1B2A4A";
const T5_GOLD = "#B8860B";
const T5_BLACK = "#222222";
const T5_GRAY = "#5A5A5A";
const T5_LIGHT = "#F5F0E8";

function generateTemplate5PDF(doc, parsed, user, pageWidth) {
    const leftX = doc.page.margins.left;
    const rightEdge = doc.page.width - doc.page.margins.right;

    // ===== CENTERED HEADER WITH GOLD RULES =====
    doc.font("Bold").fontSize(30).fillColor(T5_NAVY)
        .text(user.name, { align: "center" });
    if (parsed.subtitle) {
        doc.font("Regular").fontSize(12).fillColor(T5_GOLD)
            .text(parsed.subtitle, { align: "center" });
    }
    doc.moveDown(0.2);

    // Double gold rule
    const r1y = doc.y;
    doc.strokeColor(T5_GOLD).lineWidth(1.5)
        .moveTo(leftX + pageWidth * 0.15, r1y).lineTo(rightEdge - pageWidth * 0.15, r1y).stroke();
    doc.strokeColor(T5_GOLD).lineWidth(0.5)
        .moveTo(leftX + pageWidth * 0.15, r1y + 4).lineTo(rightEdge - pageWidth * 0.15, r1y + 4).stroke();
    doc.y = r1y + 10;

    doc.font("Regular").fontSize(9).fillColor(T5_GRAY)
        .text(`${user.address}  \u2022  ${user.phone}  \u2022  ${user.email}`, { align: "center" });
    doc.moveDown(0.5);

    // Section header helper — centered with gold diamond ornaments
    function sectionHeader(title) {
        doc.moveDown(0.4);
        const y = doc.y;
        doc.font("Bold").fontSize(11).fillColor(T5_NAVY)
            .text(title.toUpperCase(), { align: "center", characterSpacing: 2 });
        const ly = doc.y + 2;
        // Gold ornament line
        const center = doc.page.width / 2;
        doc.strokeColor(T5_GOLD).lineWidth(0.5)
            .moveTo(leftX + 40, ly).lineTo(center - 8, ly).stroke();
        doc.save();
        doc.fillColor(T5_GOLD);
        // Small diamond
        doc.moveTo(center, ly - 3).lineTo(center + 3, ly).lineTo(center, ly + 3).lineTo(center - 3, ly).fill();
        doc.restore();
        doc.strokeColor(T5_GOLD).lineWidth(0.5)
            .moveTo(center + 8, ly).lineTo(rightEdge - 40, ly).stroke();
        doc.y = ly + 8;
    }

    // ===== SUMMARY (boxed) =====
    if (parsed.summary.length > 0) {
        sectionHeader("Professional Summary");
        const summaryText = parsed.summary.join(" ");
        const segments = summaryText.split(/(<<.+?>>)/g);
        // Light background box
        doc.font("Regular").fontSize(10);
        const plainText = summaryText.replace(/<<|>>/g, "");
        const sh = doc.heightOfString(plainText, { width: pageWidth - 24, lineGap: 2 });
        const boxY = doc.y;
        doc.save();
        doc.roundedRect(leftX, boxY - 4, pageWidth, sh + 16, 3).fill(T5_LIGHT);
        doc.restore();

        doc.fontSize(10).fillColor(T5_BLACK);
        let first = true;
        segments.forEach((seg, idx) => {
            const isLast = idx === segments.length - 1;
            if (seg.startsWith("<<") && seg.endsWith(">>")) {
                doc.font("SemiBold");
                const kw = seg.slice(2, -2);
                if (first) { doc.text(kw, leftX + 12, boxY + 4, { width: pageWidth - 24, lineGap: 2, continued: !isLast }); first = false; }
                else doc.text(kw, { continued: !isLast });
            } else if (seg) {
                doc.font("Regular");
                if (first) { doc.text(seg, leftX + 12, boxY + 4, { width: pageWidth - 24, lineGap: 2, continued: !isLast }); first = false; }
                else doc.text(seg, { continued: !isLast });
            }
        });
        doc.y = boxY + sh + 16;
    }

    // ===== SKILLS (two-column pills) =====
    if (parsed.skills.length > 0) {
        sectionHeader("Core Competencies");
        const colW = (pageWidth - 20) / 2;
        for (let i = 0; i < parsed.skills.length; i += 2) {
            const s1 = parsed.skills[i].replace(/<<|>>/g, "");
            const s2 = i + 1 < parsed.skills.length ? parsed.skills[i + 1].replace(/<<|>>/g, "") : "";
            doc.font("Regular").fontSize(10);
            const h1 = doc.heightOfString(s1, { width: colW - 12 });
            const h2 = s2 ? doc.heightOfString(s2, { width: colW - 12 }) : 0;
            const rh = Math.max(h1, h2, 14);
            ensureSpace(doc, rh + 6);
            const sy = doc.y;
            // Gold bullet
            doc.save();
            doc.circle(leftX + 4, sy + 6, 2.5).fill(T5_GOLD);
            doc.restore();
            doc.font("Regular").fontSize(10).fillColor(T5_BLACK)
                .text(s1, leftX + 12, sy, { width: colW - 12 });
            if (s2) {
                doc.save();
                doc.circle(leftX + colW + 24, sy + 6, 2.5).fill(T5_GOLD);
                doc.restore();
                doc.text(s2, leftX + colW + 32, sy, { width: colW - 12 });
            }
            doc.x = leftX; doc.y = sy + rh + 4;
        }
    }

    // ===== EXPERIENCE =====
    if (parsed.experience.length > 0) {
        sectionHeader("Professional Experience");
        parsed.experience.forEach(job => {
            ensureSpace(doc, 120);

            // Company name with gold left border
            const cy = doc.y;
            doc.save();
            doc.rect(leftX, cy, 3, 28).fill(T5_GOLD);
            doc.restore();

            doc.font("Bold").fontSize(10.5).fillColor(T5_BLACK)
                .text(job.companyAndLocation, leftX + 10, cy, { width: pageWidth * 0.65 });
            if (job.dates) {
                doc.font("Regular").fontSize(9.5).fillColor(T5_GOLD);
                const dw = doc.widthOfString(job.dates);
                doc.text(job.dates, rightEdge - dw, cy, { width: dw + 2 });
            }
            doc.x = leftX;
            if (doc.y < cy + 14) doc.y = cy + 14;

            if (job.title) {
                doc.font("SemiBold").fontSize(10).fillColor(T5_NAVY)
                    .text(job.title, leftX + 10, doc.y, { width: pageWidth - 10 });
                doc.moveDown(0.1);
            }
            if (job.description) {
                doc.font("Italic").fontSize(9.5).fillColor(T5_GRAY)
                    .text(job.description, leftX + 10, doc.y, { width: pageWidth - 10 });
                doc.moveDown(0.1);
            }

            const bulletIndent = 12;
            job.bullets.forEach(bullet => {
                const plain = bullet.replace(/<<|>>/g, "");
                doc.font("Regular").fontSize(10);
                const bH = doc.heightOfString(plain, { width: pageWidth - bulletIndent });
                ensureSpace(doc, Math.min(bH + 4, 60));
                const by = doc.y, bp = doc.bufferedPageRange().count;
                doc.fillColor(T5_GOLD).text("\u2022", leftX, by, { width: bulletIndent, lineBreak: false });
                const segs = bullet.split(/(<<.+?>>)/g);
                doc.fillColor(T5_BLACK);
                let isFirst = true;
                segs.forEach((s, i) => {
                    const last = i === segs.length - 1;
                    if (s.startsWith("<<") && s.endsWith(">>")) {
                        doc.font("SemiBold");
                        if (isFirst) { doc.text(s.slice(2, -2), leftX + bulletIndent, by, { width: pageWidth - bulletIndent, continued: !last }); isFirst = false; }
                        else doc.text(s.slice(2, -2), { continued: !last });
                    } else if (s) {
                        doc.font("Regular");
                        if (isFirst) { doc.text(s, leftX + bulletIndent, by, { width: pageWidth - bulletIndent, continued: !last }); isFirst = false; }
                        else doc.text(s, { continued: !last });
                    }
                });
                const ap = doc.bufferedPageRange().count;
                doc.x = leftX;
                if (ap === bp) doc.y = Math.max(doc.y, by + bH + 2);
            });
            doc.moveDown(0.35);
        });
    }

    // ===== EDUCATION =====
    if (parsed.education.length > 0) {
        sectionHeader("Education");
        parsed.education.forEach(edu => {
            ensureSpace(doc, 60);
            doc.font("Bold").fontSize(10).fillColor(T5_BLACK)
                .text(edu.university, leftX, doc.y, { width: pageWidth * 0.7 });
            if (edu.graduation) {
                doc.font("Regular").fontSize(10).fillColor(T5_GOLD);
                const dw = doc.widthOfString(edu.graduation);
                doc.text(edu.graduation, rightEdge - dw, doc.y - 14, { width: dw + 2 });
            }
            if (edu.degree) doc.font("Regular").fontSize(10).fillColor(T5_BLACK).text(edu.degree, leftX, doc.y, { width: pageWidth });
            if (edu.coursework) doc.font("Italic").fontSize(10).fillColor(T5_GRAY).text(edu.coursework, leftX, doc.y, { width: pageWidth });
            doc.moveDown(0.4);
        });
    }
}

module.exports = generateTemplate5PDF;
