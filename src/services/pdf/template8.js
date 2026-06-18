// Template 8 — Based on Template 3, Two-column with left sidebar (Dark Slate)
const T8_PRIMARY = "#37474F";
const T8_ACCENT = "#FF6F00";
const T8_BLACK = "#212121";
const T8_GRAY = "#757575";
const T8_LIGHT = "#CFD8DC";

function t8SectionHeader(doc, title, x, y, width) {
    doc.font("Bold").fontSize(11).fillColor(T8_PRIMARY);
    doc.text(title.toUpperCase(), x, y, { width, characterSpacing: 1 });
    const ly = doc.y + 2;
    doc.strokeColor(T8_ACCENT).lineWidth(2)
        .moveTo(x, ly).lineTo(x + 30, ly).stroke();
    doc.strokeColor(T8_LIGHT).lineWidth(0.5)
        .moveTo(x + 32, ly).lineTo(x + width, ly).stroke();
    return ly + 8;
}

function generateTemplate8PDF(doc, parsed, user, pageWidth) {
    const leftMargin = doc.page.margins.left;
    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const usableW = pageW - leftMargin - doc.page.margins.right;
    const usableBottom = pageH - doc.page.margins.bottom;
    const topMargin = doc.page.margins.top;

    const gap = 24;
    const leftColW = Math.round(usableW * 0.35);
    const rightColW = usableW - leftColW - gap;
    const leftColX = leftMargin;
    const rightColX = leftMargin + leftColW + gap;

    let y = topMargin;

    // Header (full width)
    doc.font("Bold").fontSize(26).fillColor(T8_BLACK)
        .text(user.name, leftMargin, y, { width: usableW });
    y = doc.y;
    if (parsed.subtitle) {
        doc.font("Regular").fontSize(12).fillColor(T8_ACCENT)
            .text(parsed.subtitle, leftMargin, y, { width: usableW });
        y = doc.y;
    }
    y += 4;
    const hy = y;
    doc.strokeColor(T8_PRIMARY).lineWidth(1.5)
        .moveTo(leftMargin, hy).lineTo(leftMargin + usableW, hy).stroke();
    y = hy + 12;
    const contentStartY = y;

    // LEFT COLUMN: Contact + Skills + Education
    let leftY = contentStartY;

    // Contact info
    leftY = t8SectionHeader(doc, "Contact", leftColX, leftY, leftColW);
    const contactItems = [
        { icon: "\u2706", text: user.phone || "" },
        { icon: "\u2709", text: user.email || "" },
        { icon: "\u2302", text: user.address || "" },
    ];
    contactItems.forEach(item => {
        if (!item.text) return;
        doc.font("Regular").fontSize(9).fillColor(T8_ACCENT)
            .text(item.icon, leftColX, leftY, { lineBreak: false });
        doc.font("Regular").fontSize(9).fillColor(T8_BLACK)
            .text(item.text, leftColX + 14, leftY, { width: leftColW - 14 });
        leftY = doc.y + 4;
    });
    leftY += 6;

    // Skills
    if (parsed.skills.length > 0 && leftY + 25 < usableBottom) {
        leftY = t8SectionHeader(doc, "Skills", leftColX, leftY, leftColW);
        parsed.skills.forEach(skillLine => {
            if (leftY + 20 > usableBottom) return;
            const plain = skillLine.replace(/<<|>>/g, "");
            const colonIdx = plain.indexOf(":");
            if (colonIdx > -1) {
                const label = plain.substring(0, colonIdx).trim();
                const value = plain.substring(colonIdx + 1).trim();
                doc.font("SemiBold").fontSize(9).fillColor(T8_PRIMARY)
                    .text(label, leftColX, leftY, { width: leftColW });
                leftY = doc.y;
                doc.font("Regular").fontSize(8.5).fillColor(T8_GRAY)
                    .text(value, leftColX + 8, leftY, { width: leftColW - 8 });
                leftY = doc.y + 6;
            } else {
                doc.save();
                doc.circle(leftColX + 3, leftY + 5, 1.5).fill(T8_ACCENT);
                doc.restore();
                doc.font("Regular").fontSize(9).fillColor(T8_BLACK)
                    .text(plain, leftColX + 10, leftY, { width: leftColW - 10 });
                leftY = doc.y + 3;
            }
        });
        leftY += 6;
    }

    // Education (left column)
    if (parsed.education.length > 0 && leftY + 25 < usableBottom) {
        leftY = t8SectionHeader(doc, "Education", leftColX, leftY, leftColW);
        parsed.education.forEach(edu => {
            if (leftY + 30 > usableBottom) return;
            if (edu.degree) {
                doc.font("Bold").fontSize(9.5).fillColor(T8_BLACK)
                    .text(edu.degree, leftColX, leftY, { width: leftColW });
                leftY = doc.y;
            }
            if (edu.university) {
                doc.font("Regular").fontSize(9).fillColor(T8_PRIMARY)
                    .text(edu.university.split(",")[0].trim(), leftColX, leftY, { width: leftColW });
                leftY = doc.y;
            }
            if (edu.graduation) {
                doc.font("Regular").fontSize(8.5).fillColor(T8_GRAY)
                    .text(edu.graduation, leftColX, leftY, { width: leftColW });
                leftY = doc.y;
            }
            if (edu.coursework) {
                doc.font("Italic").fontSize(8.5).fillColor(T8_GRAY)
                    .text(edu.coursework, leftColX, leftY + 2, { width: leftColW });
                leftY = doc.y;
            }
            leftY += 8;
        });
    }

    // RIGHT COLUMN: Summary + Experience
    let rightY = contentStartY;

    // Summary
    if (parsed.summary.length > 0) {
        rightY = t8SectionHeader(doc, "Profile", rightColX, rightY, rightColW);
        const summaryText = parsed.summary.join(" ").replace(/<<|>>/g, "");
        doc.font("Regular").fontSize(10).fillColor(T8_BLACK);
        doc.text(summaryText, rightColX, rightY, { width: rightColW, lineGap: 2, align: "justify" });
        rightY = doc.y + 10;
    }

    // Experience
    if (parsed.experience.length > 0) {
        rightY = t8SectionHeader(doc, "Experience", rightColX, rightY, rightColW);
        parsed.experience.forEach((job, idx) => {
            if (rightY + 80 > usableBottom) {
                doc.addPage();
                rightY = topMargin;
            }
            if (idx > 0) {
                doc.save();
                doc.strokeColor(T8_LIGHT).lineWidth(0.5).dash(3, { space: 3 })
                    .moveTo(rightColX, rightY).lineTo(rightColX + rightColW, rightY).stroke();
                doc.undash();
                doc.restore();
                rightY += 8;
            }
            doc.font("Bold").fontSize(10.5).fillColor(T8_BLACK)
                .text(job.title || "", rightColX, rightY, { width: rightColW });
            rightY = doc.y;
            if (job.companyAndLocation) {
                doc.font("SemiBold").fontSize(9.5).fillColor(T8_ACCENT)
                    .text(job.companyAndLocation.split(",")[0].trim(), rightColX, rightY, { width: rightColW * 0.6, continued: false });
                if (job.dates) {
                    const dw = doc.font("Regular").fontSize(9).widthOfString(job.dates);
                    doc.fillColor(T8_GRAY).text(job.dates, rightColX + rightColW - dw, rightY, { width: dw + 2 });
                }
                rightY = doc.y + 2;
            }
            const bulletIndent = 12;
            job.bullets.forEach(bullet => {
                const plain = bullet.replace(/<<|>>/g, "");
                doc.font("Regular").fontSize(9);
                const bH = doc.heightOfString(plain, { width: rightColW - bulletIndent });
                if (rightY + bH + 4 > usableBottom) {
                    doc.addPage();
                    rightY = topMargin;
                }
                doc.save();
                doc.circle(rightColX + 3, rightY + 5, 1.5).fill(T8_ACCENT);
                doc.restore();
                doc.font("Regular").fontSize(9).fillColor(T8_BLACK)
                    .text(plain, rightColX + bulletIndent, rightY, { width: rightColW - bulletIndent, lineGap: 1 });
                rightY = doc.y + 2;
            });
            rightY += 6;
        });
    }
}

module.exports = generateTemplate8PDF;
