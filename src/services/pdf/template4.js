// Template 4 — Based on Style 1: Top banner header, teal accent, timeline experience
const { ensureSpace } = require('./helpers');

const T4_TEAL = "#00695C";
const T4_LIGHT_TEAL = "#B2DFDB";
const T4_BLACK = "#1A1A1A";
const T4_GRAY = "#4A4A4A";

function generateTemplate4PDF(doc, parsed, user, pageWidth) {
    const leftX = doc.page.margins.left;
    const rightEdge = doc.page.width - doc.page.margins.right;

    // ===== COLORED BANNER HEADER =====
    doc.save();
    doc.rect(0, 0, doc.page.width, 105).fill(T4_TEAL);
    doc.restore();

    doc.font("Bold").fontSize(28).fillColor('#FFFFFF')
        .text(user.name, leftX, 18, { width: pageWidth });
    const afterName = doc.y;
    if (parsed.subtitle) {
        doc.font("Regular").fontSize(12).fillColor(T4_LIGHT_TEAL)
            .text(parsed.subtitle, leftX, afterName + 2, { width: pageWidth });
    }
    const afterSubtitle = doc.y;
    doc.font("Regular").fontSize(9).fillColor('#E0F2F1')
        .text(`${user.address}  |  ${user.phone}  |  ${user.email}`, leftX, afterSubtitle + 4, { width: pageWidth });

    doc.y = 120;

    // Section header helper
    function sectionHeader(title) {
        doc.moveDown(0.4);
        const y = doc.y;
        doc.save();
        doc.rect(leftX, y, 3, 14).fill(T4_TEAL);
        doc.restore();
        doc.font("Bold").fontSize(11).fillColor(T4_TEAL)
            .text(title.toUpperCase(), leftX + 10, y + 1, { width: pageWidth - 10 });
        doc.moveDown(0.15);
        const ly = doc.y;
        doc.strokeColor(T4_LIGHT_TEAL).lineWidth(0.5)
            .moveTo(leftX, ly).lineTo(rightEdge, ly).stroke();
        doc.y = ly + 6;
    }

    // ===== SUMMARY =====
    if (parsed.summary.length > 0) {
        sectionHeader("Summary");
        const text = parsed.summary.join(" ");
        const segments = text.split(/(<<.+?>>)/g);
        doc.fontSize(10).fillColor(T4_BLACK);
        let first = true;
        segments.forEach((seg, idx) => {
            const isLast = idx === segments.length - 1;
            if (seg.startsWith("<<") && seg.endsWith(">>")) {
                doc.font("SemiBold");
                const kw = seg.slice(2, -2);
                if (first) { doc.text(kw, leftX, doc.y, { width: pageWidth, lineGap: 2, continued: !isLast }); first = false; }
                else doc.text(kw, { continued: !isLast });
            } else if (seg) {
                doc.font("Regular");
                if (first) { doc.text(seg, leftX, doc.y, { width: pageWidth, lineGap: 2, continued: !isLast }); first = false; }
                else doc.text(seg, { continued: !isLast });
            }
        });
    }

    // ===== SKILLS =====
    if (parsed.skills.length > 0) {
        sectionHeader("Skills");
        const labelW = 170;
        parsed.skills.forEach(line => {
            const ci = line.indexOf(":");
            if (ci > -1) {
                const label = line.substring(0, ci + 1).replace(/<<|>>/g, "");
                const value = line.substring(ci + 1).trim().replace(/<<|>>/g, "");
                doc.font("SemiBold").fontSize(10);
                const lh = doc.heightOfString(label, { width: labelW });
                doc.font("Regular").fontSize(10);
                const vh = doc.heightOfString(value, { width: pageWidth - labelW });
                const rh = Math.max(lh, vh, 12);
                ensureSpace(doc, rh + 4);
                const sy = doc.y;
                doc.font("SemiBold").fontSize(10).fillColor(T4_BLACK).text(label, leftX, sy, { width: labelW });
                doc.font("Regular").fontSize(10).fillColor(T4_BLACK).text(value, leftX + labelW, sy, { width: pageWidth - labelW });
                doc.x = leftX; doc.y = sy + rh;
            } else {
                ensureSpace(doc, 14);
                doc.font("Regular").fontSize(10).fillColor(T4_BLACK).text(line.replace(/<<|>>/g, ""), leftX, doc.y);
            }
            doc.moveDown(0.15);
        });
    }

    // ===== EXPERIENCE (timeline style) =====
    if (parsed.experience.length > 0) {
        sectionHeader("Professional Experience");
        const timelineX = leftX + 6;
        const contentX = leftX + 20;
        const contentW = pageWidth - 20;

        parsed.experience.forEach((job, idx) => {
            ensureSpace(doc, 120);

            // Track which page (0-indexed) the dot is on
            const dotPageIndex = doc.bufferedPageRange().count - 1;
            const dotY = doc.y;

            // Timeline dot
            doc.save();
            doc.circle(timelineX, dotY + 6, 4).fill(T4_TEAL);
            doc.circle(timelineX, dotY + 6, 2).fill('#FFFFFF');
            doc.restore();

            // Company & dates on same line
            doc.font("Bold").fontSize(10).fillColor(T4_BLACK)
                .text(job.companyAndLocation, contentX, dotY, { width: contentW * 0.7 });
            if (job.dates) {
                doc.font("Regular").fontSize(9).fillColor(T4_GRAY);
                const dw = doc.widthOfString(job.dates);
                doc.text(job.dates, rightEdge - dw, dotY, { width: dw + 2 });
            }
            doc.x = contentX;
            if (doc.y < dotY + 14) doc.y = dotY + 14;

            if (job.title) {
                doc.font("SemiBold").fontSize(10).fillColor(T4_TEAL)
                    .text(job.title, contentX, doc.y, { width: contentW });
                doc.moveDown(0.1);
            }
            if (job.description) {
                doc.font("Italic").fontSize(9.5).fillColor(T4_GRAY)
                    .text(job.description, contentX, doc.y, { width: contentW });
                doc.moveDown(0.1);
            }

            job.bullets.forEach(bullet => {
                const plain = bullet.replace(/<<|>>/g, "");
                doc.font("Regular").fontSize(10);
                const bH = doc.heightOfString(plain, { width: contentW - 14 });
                ensureSpace(doc, Math.min(bH + 4, 60));
                const by = doc.y, bp = doc.bufferedPageRange().count;
                doc.fillColor(T4_TEAL).text("\u25B8", contentX, by, { width: 14, lineBreak: false });
                const segs = bullet.split(/(<<.+?>>)/g);
                doc.fillColor(T4_BLACK);
                let isFirst = true;
                segs.forEach((s, i) => {
                    const last = i === segs.length - 1;
                    if (s.startsWith("<<") && s.endsWith(">>")) {
                        doc.font("SemiBold");
                        if (isFirst) { doc.text(s.slice(2, -2), contentX + 14, by, { width: contentW - 14, continued: !last }); isFirst = false; }
                        else doc.text(s.slice(2, -2), { continued: !last });
                    } else if (s) {
                        doc.font("Regular");
                        if (isFirst) { doc.text(s, contentX + 14, by, { width: contentW - 14, continued: !last }); isFirst = false; }
                        else doc.text(s, { continued: !last });
                    }
                });
                const ap = doc.bufferedPageRange().count;
                doc.x = leftX;
                if (ap === bp) doc.y = Math.max(doc.y, by + bH + 2);
            });

            // Draw timeline line across all pages this job spans
            const endY = doc.y;
            const endPageIndex = doc.bufferedPageRange().count - 1;
            const pageBottom = doc.page.height - doc.page.margins.bottom;
            const pageTop = doc.page.margins.top;

            if (endPageIndex === dotPageIndex) {
                // All on same page — single line from dot to end
                doc.save();
                doc.strokeColor(T4_LIGHT_TEAL).lineWidth(1.5)
                    .moveTo(timelineX, dotY + 12).lineTo(timelineX, endY + 4).stroke();
                doc.restore();
            } else {
                // Job spans multiple pages — use switchToPage to draw on each
                const savedPage = endPageIndex;
                const savedY = doc.y;
                const savedX = doc.x;

                // Draw on the dot's page: from dot down to page bottom
                doc.switchToPage(dotPageIndex);
                doc.save();
                doc.strokeColor(T4_LIGHT_TEAL).lineWidth(1.5)
                    .moveTo(timelineX, dotY + 12).lineTo(timelineX, pageBottom).stroke();
                doc.restore();

                // Draw on any intermediate pages: full line top to bottom
                for (let p = dotPageIndex + 1; p < endPageIndex; p++) {
                    doc.switchToPage(p);
                    doc.save();
                    doc.strokeColor(T4_LIGHT_TEAL).lineWidth(1.5)
                        .moveTo(timelineX, pageTop).lineTo(timelineX, pageBottom).stroke();
                    doc.restore();
                }

                // Draw on the last page: from top to endY
                doc.switchToPage(endPageIndex);
                doc.save();
                doc.strokeColor(T4_LIGHT_TEAL).lineWidth(1.5)
                    .moveTo(timelineX, pageTop).lineTo(timelineX, endY + 4).stroke();
                doc.restore();

                // Restore cursor position
                doc.x = savedX;
                doc.y = savedY;
            }

            doc.moveDown(0.4);
        });
    }

    // ===== EDUCATION =====
    if (parsed.education.length > 0) {
        sectionHeader("Education");
        parsed.education.forEach(edu => {
            ensureSpace(doc, 60);
            doc.font("Bold").fontSize(10).fillColor(T4_BLACK)
                .text(edu.university, leftX, doc.y, { width: pageWidth * 0.7 });
            if (edu.graduation) {
                const dw = doc.font("Regular").fontSize(10).widthOfString(edu.graduation);
                doc.fillColor(T4_GRAY).text(edu.graduation, rightEdge - dw, doc.y - 14, { width: dw + 2 });
            }
            if (edu.degree) doc.font("Regular").fontSize(10).fillColor(T4_BLACK).text(edu.degree, leftX, doc.y, { width: pageWidth });
            if (edu.coursework) doc.font("Italic").fontSize(10).fillColor(T4_GRAY).text(edu.coursework, leftX, doc.y, { width: pageWidth });
            doc.moveDown(0.4);
        });
    }
}

module.exports = generateTemplate4PDF;
