const {
    MAROON,
    BLACK,
    GRAY,
    FONT_SIZE_NAME,
    FONT_SIZE_SUBTITLE,
    FONT_SIZE_CONTACT,
    FONT_SIZE_SECTION,
    FONT_SIZE_BODY,
    renderSectionHeader,
    renderSplitLine,
    ensureSpace,
} = require('./helpers');

function generateTemplate1PDF(doc, parsed, user, pageWidth) {
    // ===== HEADER =====
    doc.font("Bold")
        .fontSize(FONT_SIZE_NAME)
        .fillColor(MAROON)
        .text(user.name, { align: "left" });

    if (parsed.subtitle) {
        doc.font("Regular")
            .fontSize(FONT_SIZE_SUBTITLE)
            .fillColor(BLACK)
            .text(parsed.subtitle, { align: "left" });
    }

    doc.moveDown(0.3);

    doc.font("Regular")
        .fontSize(FONT_SIZE_CONTACT)
        .fillColor(GRAY)
        .text(`${user.address}  |  ${user.phone}  |  ${user.email}`, { align: "left" });

    // ===== SUMMARY =====
    if (parsed.summary.length > 0) {
        renderSectionHeader(doc, "Summary");
        const summaryRaw = parsed.summary.join(" ");
        const summarySegments = summaryRaw.split(/(<<.+?>>)/g);
        doc.fontSize(FONT_SIZE_BODY).fillColor(BLACK);
        let summaryFirst = true;
        summarySegments.forEach((seg, idx) => {
            const isLast = idx === summarySegments.length - 1;
            if (seg.startsWith("<<") && seg.endsWith(">>")) {
                const keyword = seg.slice(2, -2);
                doc.font("SemiBold");
                if (summaryFirst) {
                    doc.text(keyword, doc.page.margins.left, doc.y, {
                        width: pageWidth,
                        lineGap: 2,
                        continued: !isLast
                    });
                    summaryFirst = false;
                } else {
                    doc.text(keyword, { continued: !isLast });
                }
            } else if (seg) {
                doc.font("Regular");
                if (summaryFirst) {
                    doc.text(seg, doc.page.margins.left, doc.y, {
                        width: pageWidth,
                        lineGap: 2,
                        continued: !isLast
                    });
                    summaryFirst = false;
                } else {
                    doc.text(seg, { continued: !isLast });
                }
            }
        });
    }

    // ===== SKILLS =====
    if (parsed.skills.length > 0) {
        renderSectionHeader(doc, "Skills");
        const labelIndent = 170;
        const skillLeftX = doc.page.margins.left;
        parsed.skills.forEach(skillLine => {
            const colonIdx = skillLine.indexOf(":");
            if (colonIdx > -1) {
                const label = skillLine.substring(0, colonIdx + 1).replace(/<<|>>/g, "");
                const value = skillLine.substring(colonIdx + 1).trim().replace(/<<|>>/g, "");

                doc.font("SemiBold").fontSize(FONT_SIZE_BODY);
                const labelHeight = doc.heightOfString(label, { width: labelIndent });

                doc.font("Regular").fontSize(FONT_SIZE_BODY);
                const valueHeight = doc.heightOfString(value, { width: pageWidth - labelIndent });

                const rowHeight = Math.max(labelHeight, valueHeight, FONT_SIZE_BODY + 2);
                ensureSpace(doc, rowHeight + 4);

                const skillY = doc.y;

                doc.font("SemiBold")
                    .fontSize(FONT_SIZE_BODY)
                    .fillColor(BLACK)
                    .text(label, skillLeftX, skillY, { width: labelIndent });

                doc.font("Regular")
                    .fontSize(FONT_SIZE_BODY)
                    .fillColor(BLACK)
                    .text(value, skillLeftX + labelIndent, skillY, {
                        width: pageWidth - labelIndent
                    });

                doc.x = skillLeftX;
                doc.y = skillY + rowHeight;
            } else {
                ensureSpace(doc, FONT_SIZE_BODY + 4);
                doc.font("Regular")
                    .fontSize(FONT_SIZE_BODY)
                    .fillColor(BLACK)
                    .text(skillLine, skillLeftX, doc.y);
            }
            doc.moveDown(0.15);
        });
    }

    // ===== PROFESSIONAL EXPERIENCE =====
    if (parsed.experience.length > 0) {
        renderSectionHeader(doc, "Professional Experience");

        parsed.experience.forEach(job => {
            ensureSpace(doc, 130);

            renderSplitLine(doc, job.companyAndLocation, "Bold", job.dates, "Regular", FONT_SIZE_BODY);

            if (job.description) {
                doc.font("Italic")
                    .fontSize(FONT_SIZE_BODY)
                    .fillColor(GRAY)
                    .text(job.description, doc.page.margins.left, doc.y, { width: pageWidth });
                doc.moveDown(0.1);
            }

            if (job.title) {
                doc.font("Bold")
                    .fontSize(FONT_SIZE_BODY)
                    .fillColor(BLACK)
                    .text(job.title, doc.page.margins.left, doc.y, { width: pageWidth });
                doc.moveDown(0.15);
            }

            const bulletIndent = 12;
            const leftX = doc.page.margins.left;
            job.bullets.forEach(bullet => {
                const plainBullet = bullet.replace(/<<|>>/g, "");
                doc.font("Regular").fontSize(FONT_SIZE_BODY);
                const textH = doc.heightOfString(plainBullet, { width: pageWidth - bulletIndent });
                ensureSpace(doc, Math.min(textH + 4, 60));

                const bulletY = doc.y;
                const bulletPage = doc.bufferedPageRange().count;

                doc.fillColor(BLACK)
                    .text("\u2022", leftX, bulletY, { width: bulletIndent, lineBreak: false });

                const segments = bullet.split(/(<<.+?>>)/g);
                doc.fontSize(FONT_SIZE_BODY).fillColor(BLACK);
                let isFirst = true;
                segments.forEach((seg, idx) => {
                    const isLast = idx === segments.length - 1;
                    if (seg.startsWith("<<") && seg.endsWith(">>")) {
                        const keyword = seg.slice(2, -2);
                        doc.font("SemiBold");
                        if (isFirst) {
                            doc.text(keyword, leftX + bulletIndent, bulletY, {
                                width: pageWidth - bulletIndent,
                                continued: !isLast
                            });
                            isFirst = false;
                        } else {
                            doc.text(keyword, { continued: !isLast });
                        }
                    } else if (seg) {
                        doc.font("Regular");
                        if (isFirst) {
                            doc.text(seg, leftX + bulletIndent, bulletY, {
                                width: pageWidth - bulletIndent,
                                continued: !isLast
                            });
                            isFirst = false;
                        } else {
                            doc.text(seg, { continued: !isLast });
                        }
                    }
                });

                const afterPage = doc.bufferedPageRange().count;
                doc.x = leftX;
                if (afterPage === bulletPage) {
                    doc.y = Math.max(doc.y, bulletY + textH + 2);
                }
            });

            doc.moveDown(0.3);
        });
    }

    // ===== EDUCATION =====
    if (parsed.education.length > 0) {
        renderSectionHeader(doc, "Education");

        parsed.education.forEach(edu => {
            ensureSpace(doc, 130);

            renderSplitLine(doc, edu.university, "Bold", edu.graduation, "Regular", FONT_SIZE_BODY);

            if (edu.degree) {
                doc.font("Regular")
                    .fontSize(FONT_SIZE_BODY)
                    .fillColor(BLACK)
                    .text(edu.degree, doc.page.margins.left, doc.y, { width: pageWidth });
            }

            if (edu.coursework) {
                doc.font("Italic")
                    .fontSize(FONT_SIZE_BODY)
                    .fillColor(GRAY)
                    .text(edu.coursework, doc.page.margins.left, doc.y, { width: pageWidth });
            }

            doc.moveDown(0.4);
        });
    }
}

module.exports = generateTemplate1PDF;
