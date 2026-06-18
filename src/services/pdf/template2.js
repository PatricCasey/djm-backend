const { ensureSpace } = require('./helpers');

// ===== Template 2 Style Constants =====
const T2_BLUE = "#5B7BD5";
const T2_SECTION_COLOR = "#C09060";
const T2_BLACK = "#3D3D3D";
const T2_GRAY = "#6B6B6B";
const T2_LINE_COLOR = "#CCCCCC";

function generateTemplate2PDF(doc, parsed, user, pageWidth) {
    // ===== HEADER =====
    doc.font("Bold")
        .fontSize(30)
        .fillColor(T2_BLUE)
        .text(user.name, { align: "left" });

    if (parsed.subtitle) {
        doc.font("Regular")
            .fontSize(14)
            .fillColor(T2_BLACK)
            .text(parsed.subtitle, { align: "left" });
    }

    doc.moveDown(0.15);

    doc.font("Regular")
        .fontSize(9)
        .fillColor(T2_GRAY)
        .text(`${user.address}  \u00B7  ${user.phone}  \u00B7  ${user.email}`, { align: "left" });

    doc.moveDown(0.5);

    // ===== SUMMARY =====
    if (parsed.summary.length > 0) {
        const summaryText = parsed.summary.join(" ").replace(/<<|>>/g, "");
        doc.font("Regular")
            .fontSize(10)
            .fillColor(T2_BLACK)
            .text(summaryText, doc.page.margins.left, doc.y, {
                width: pageWidth,
                align: "justify",
                lineGap: 2
            });
    }

    // Helper: Template 2 section header with thin gray line
    function t2SectionHeader(title) {
        doc.moveDown(0.6);
        doc.font("SemiBold")
            .fontSize(10.5)
            .fillColor(T2_BLUE)
            .text(title.toUpperCase(), doc.page.margins.left, doc.y);
        doc.moveDown(0.15);
        const lineY = doc.y;
        doc.strokeColor(T2_LINE_COLOR)
            .lineWidth(0.5)
            .moveTo(doc.page.margins.left, lineY)
            .lineTo(doc.page.width - doc.page.margins.right, lineY)
            .stroke();
        doc.y = lineY + 8;
    }

    // Helper: Split line (left-aligned + right-aligned on same row)
    function t2SplitLine(leftText, leftFont, rightText, rightFont, fontSize) {
        const usable = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const savedY = doc.y;
        const leftX = doc.page.margins.left;
        const pageBefore = doc.bufferedPageRange().count;

        doc.font(leftFont).fontSize(fontSize).fillColor(T2_BLACK);
        const leftHeight = doc.heightOfString(leftText, { width: usable * 0.7 });
        doc.text(leftText, leftX, savedY, { width: usable * 0.7 });

        doc.font(rightFont).fontSize(fontSize).fillColor(T2_BLACK);
        const rightW = doc.widthOfString(rightText);
        const pageAfter = doc.bufferedPageRange().count;
        if (pageAfter === pageBefore) {
            doc.text(rightText, doc.page.width - doc.page.margins.right - rightW, savedY, {
                width: rightW + 2
            });
            doc.x = leftX;
            doc.y = savedY + Math.max(leftHeight, fontSize + 4);
        } else {
            doc.text(rightText, doc.page.width - doc.page.margins.right - rightW, doc.page.margins.top, {
                width: rightW + 2
            });
            doc.x = leftX;
        }
    }

    // ===== WORK EXPERIENCE =====
    if (parsed.experience.length > 0) {
        t2SectionHeader("Work Experience");

        parsed.experience.forEach((job, idx) => {
            ensureSpace(doc, 100);
            if (idx > 0) doc.moveDown(0.4);

            t2SplitLine(job.title || "", "Bold", job.dates, "Regular", 11);

            if (job.companyAndLocation) {
                doc.font("Regular")
                    .fontSize(10)
                    .fillColor(T2_GRAY)
                    .text(job.companyAndLocation, doc.page.margins.left, doc.y, { width: pageWidth });
                doc.moveDown(0.25);
            }

            const bulletIndent = 16;
            const leftX = doc.page.margins.left;
            job.bullets.forEach(bullet => {
                const plainBullet = bullet.replace(/<<|>>/g, "");
                doc.font("Regular").fontSize(10);
                const textH = doc.heightOfString(plainBullet, { width: pageWidth - bulletIndent });
                ensureSpace(doc, Math.min(textH + 4, 60));

                const bulletY = doc.y;
                const bulletPage = doc.bufferedPageRange().count;

                doc.save();
                doc.circle(leftX + 4, bulletY + 7.5, 2.2).fill(T2_BLACK);
                doc.restore();

                doc.font("Regular")
                    .fontSize(10)
                    .fillColor(T2_BLACK)
                    .text(plainBullet, leftX + bulletIndent, bulletY, {
                        width: pageWidth - bulletIndent,
                        lineGap: 1
                    });

                const afterPage = doc.bufferedPageRange().count;
                doc.x = leftX;
                if (afterPage === bulletPage) {
                    doc.y = Math.max(doc.y, bulletY + textH + 2);
                }
            });

            doc.moveDown(0.2);
        });
    }

    // ===== EDUCATION =====
    if (parsed.education.length > 0) {
        t2SectionHeader("Education");

        parsed.education.forEach(edu => {
            ensureSpace(doc, 60);

            t2SplitLine(edu.university, "Bold", edu.graduation, "Regular", 10);

            if (edu.degree) {
                doc.font("Regular")
                    .fontSize(10)
                    .fillColor(T2_BLACK)
                    .text(edu.degree, doc.page.margins.left, doc.y, { width: pageWidth });
            }

            if (edu.coursework) {
                doc.font("Italic")
                    .fontSize(10)
                    .fillColor(T2_GRAY)
                    .text(edu.coursework, doc.page.margins.left, doc.y, { width: pageWidth });
            }

            doc.moveDown(0.4);
        });
    }

    // ===== SKILLS & OTHER =====
    if (parsed.skills.length > 0) {
        t2SectionHeader("Skills & Other");

        const labelIndent = 170;
        const skillLeftX = doc.page.margins.left;
        parsed.skills.forEach(skillLine => {
            const colonIdx = skillLine.indexOf(":");
            if (colonIdx > -1) {
                const label = skillLine.substring(0, colonIdx + 1).replace(/<<|>>/g, "");
                const value = skillLine.substring(colonIdx + 1).trim().replace(/<<|>>/g, "");

                doc.font("Bold").fontSize(10);
                const labelHeight = doc.heightOfString(label, { width: labelIndent });

                doc.font("Regular").fontSize(10);
                const valueHeight = doc.heightOfString(value, { width: pageWidth - labelIndent });

                const rowHeight = Math.max(labelHeight, valueHeight, 12);
                ensureSpace(doc, rowHeight + 4);

                const skillY = doc.y;

                doc.font("Bold")
                    .fontSize(10)
                    .fillColor(T2_BLACK)
                    .text(label, skillLeftX, skillY, { width: labelIndent });

                doc.font("Regular")
                    .fontSize(10)
                    .fillColor(T2_BLACK)
                    .text(value, skillLeftX + labelIndent, skillY, {
                        width: pageWidth - labelIndent
                    });

                doc.x = skillLeftX;
                doc.y = skillY + rowHeight;
            } else {
                ensureSpace(doc, 14);
                doc.font("Regular")
                    .fontSize(10)
                    .fillColor(T2_BLACK)
                    .text(skillLine.replace(/<<|>>/g, ""), skillLeftX, doc.y);
            }
            doc.moveDown(0.15);
        });
    }
}

module.exports = generateTemplate2PDF;
