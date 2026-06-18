// Template 9 — Based on Template 3, Two-column with Purple Modern
const T9_PRIMARY = "#4A148C";
const T9_ACCENT = "#7C4DFF";
const T9_BLACK = "#1A1A1A";
const T9_GRAY = "#757575";
const T9_LIGHT = "#E1BEE7";

function t9PhoneIcon(doc, x, y, color) {
    doc.save().fillColor(color);
    doc.roundedRect(x + 1.5, y + 0.5, 6.5, 9, 1.2).fill();
    doc.fillColor('white');
    doc.roundedRect(x + 2.8, y + 2, 3.9, 4.5, 0.4).fill();
    doc.circle(x + 4.75, y + 7.8, 0.65).fill();
    doc.restore();
}

function t9EmailIcon(doc, x, y, color) {
    doc.save();
    doc.strokeColor(color).lineWidth(0.7).lineJoin('round');
    doc.rect(x + 0.5, y + 1.8, 9, 6.5).stroke();
    doc.moveTo(x + 0.5, y + 1.8).lineTo(x + 5, y + 5.5).lineTo(x + 9.5, y + 1.8).stroke();
    doc.restore();
}

function t9LocationIcon(doc, x, y, color) {
    doc.save().fillColor(color);
    doc.circle(x + 4, y + 3, 2.8).fill();
    doc.moveTo(x + 1.5, y + 3.5).lineTo(x + 4, y + 9.5).lineTo(x + 6.5, y + 3.5).fill();
    doc.fillColor('white');
    doc.circle(x + 4, y + 3, 1.1).fill();
    doc.restore();
}

function t9CalendarIcon(doc, x, y, color) {
    doc.save();
    doc.strokeColor(color).fillColor(color).lineWidth(0.6);
    doc.roundedRect(x + 0.5, y + 2, 9, 7, 0.5).stroke();
    doc.roundedRect(x + 0.5, y + 2, 9, 2.2, 0.5).fill();
    doc.strokeColor(color).lineWidth(0.8).lineCap('round');
    doc.moveTo(x + 3, y + 0.5).lineTo(x + 3, y + 3.2).stroke();
    doc.moveTo(x + 7, y + 0.5).lineTo(x + 7, y + 3.2).stroke();
    doc.restore();
}

function t9SectionHeader(doc, title, x, y, width) {
    doc.font("Bold").fontSize(11).fillColor(T9_PRIMARY);
    doc.text(title.toUpperCase(), x, y, { width, characterSpacing: 0.8 });
    const ly = doc.y + 3;
    // Gradient-style double line
    doc.strokeColor(T9_PRIMARY).lineWidth(2)
        .moveTo(x, ly).lineTo(x + width * 0.4, ly).stroke();
    doc.strokeColor(T9_LIGHT).lineWidth(1)
        .moveTo(x + width * 0.4, ly).lineTo(x + width, ly).stroke();
    return ly + 8;
}

function generateTemplate9PDF(doc, parsed, user, pageWidth) {
    const leftMargin = doc.page.margins.left;
    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const usableW = pageW - leftMargin - doc.page.margins.right;
    const usableBottom = pageH - doc.page.margins.bottom;
    const topMargin = doc.page.margins.top;

    const gap = 22;
    const leftColW = Math.round(usableW * 0.585);
    const rightColW = usableW - leftColW - gap;
    const leftColX = leftMargin;
    const rightColX = leftMargin + leftColW + gap;

    let y = topMargin;

    // Header (full width) with accent left border
    doc.save();
    doc.rect(leftMargin, y, 4, 40).fill(T9_ACCENT);
    doc.restore();

    doc.font("Bold").fontSize(24).fillColor(T9_BLACK)
        .text(user.name, leftMargin + 12, y, { width: usableW - 12 });
    y = doc.y;
    if (parsed.subtitle) {
        doc.font("Regular").fontSize(12).fillColor(T9_ACCENT)
            .text(parsed.subtitle, leftMargin + 12, y, { width: usableW - 12 });
        y = doc.y;
    }
    y += 6;

    // Contact line with icons
    let cx = leftMargin;
    const contactY = y;
    doc.font("Regular").fontSize(9).fillColor(T9_GRAY);

    t9PhoneIcon(doc, cx, contactY + 1.5, T9_ACCENT);
    cx += 13;
    const phoneStr = user.phone || "";
    doc.text(phoneStr, cx, contactY, { lineBreak: false });
    cx += doc.widthOfString(phoneStr) + 16;

    t9EmailIcon(doc, cx, contactY + 1.5, T9_ACCENT);
    cx += 13;
    const emailStr = user.email || "";
    doc.text(emailStr, cx, contactY, { lineBreak: false });
    cx += doc.widthOfString(emailStr) + 16;

    t9LocationIcon(doc, cx, contactY + 1.5, T9_ACCENT);
    cx += 13;
    doc.text(user.address || "", cx, contactY, { lineBreak: false });

    y = contactY + 18;
    const contentStartY = y;

    // RIGHT COLUMN: Summary + Skills
    let rightY = contentStartY;

    rightY = t9SectionHeader(doc, "Summary", rightColX, rightY, rightColW);
    if (parsed.summary.length > 0) {
        const summaryText = parsed.summary.join(" ").replace(/<<|>>/g, "");
        doc.font("Regular").fontSize(9).fillColor(T9_BLACK);
        const sh = doc.heightOfString(summaryText, { width: rightColW, lineGap: 2 });
        if (rightY + sh < usableBottom) {
            doc.text(summaryText, rightColX, rightY, { width: rightColW, lineGap: 2 });
            rightY = doc.y + 12;
        }
    }

    if (rightY + 25 < usableBottom) {
        rightY = t9SectionHeader(doc, "Skills", rightColX, rightY, rightColW);
    }
    if (parsed.skills.length > 0) {
        parsed.skills.forEach(skillLine => {
            if (rightY + 30 > usableBottom) return;
            const colonIdx = skillLine.indexOf(":");
            if (colonIdx > -1) {
                const label = skillLine.substring(0, colonIdx).replace(/<<|>>/g, "").trim();
                const fullText = skillLine.replace(/<<|>>/g, "");
                doc.font("Bold").fontSize(9.5).fillColor(T9_PRIMARY);
                doc.text(label, rightColX, rightY, { width: rightColW });
                rightY = doc.y + 2;
                // Accent dot separator
                doc.save();
                for (let dx = 0; dx < rightColW; dx += 6) {
                    doc.circle(rightColX + dx + 2, rightY, 0.8).fill(T9_LIGHT);
                }
                doc.restore();
                rightY += 4;
                doc.font("Regular").fontSize(9).fillColor(T9_BLACK);
                doc.text(fullText.substring(colonIdx + 1).trim(), rightColX + 8, rightY, { width: rightColW - 8, lineGap: 1.5 });
                rightY = doc.y + 8;
            } else {
                doc.save();
                doc.circle(rightColX + 3, rightY + 4, 1.5).fill(T9_ACCENT);
                doc.restore();
                doc.font("Regular").fontSize(9).fillColor(T9_BLACK)
                    .text(skillLine.replace(/<<|>>/g, ""), rightColX + 10, rightY, { width: rightColW - 10 });
                rightY = doc.y + 3;
            }
        });
    }

    // Education in right column
    let educationRendered = false;
    function renderEducationRight(startY) {
        if (educationRendered || parsed.education.length === 0) return;
        educationRendered = true;
        let ry = startY;
        ry = t9SectionHeader(doc, "Education", rightColX, ry, rightColW);
        parsed.education.forEach((edu, idx) => {
            if (idx > 0) ry += 6;
            if (edu.degree) {
                doc.font("Bold").fontSize(10).fillColor(T9_BLACK)
                    .text(edu.degree, rightColX, ry, { width: rightColW });
                ry = doc.y;
            }
            if (edu.university) {
                doc.font("SemiBold").fontSize(9.5).fillColor(T9_ACCENT)
                    .text(edu.university.split(",")[0].trim(), rightColX, ry, { width: rightColW });
                ry = doc.y + 1;
            }
            let elx = rightColX;
            if (edu.graduation) {
                t9CalendarIcon(doc, elx, ry + 1, T9_GRAY);
                elx += 12;
                doc.font("Regular").fontSize(8.5).fillColor(T9_GRAY)
                    .text(edu.graduation, elx, ry, { lineBreak: false });
                elx += doc.widthOfString(edu.graduation) + 12;
            }
            const loc = edu.university?.includes(",") ? edu.university.split(",").slice(1).join(",").trim() : "";
            if (loc) {
                t9LocationIcon(doc, elx, ry + 1, T9_GRAY);
                elx += 12;
                doc.font("Regular").fontSize(8.5).fillColor(T9_GRAY).text(loc, elx, ry, { lineBreak: false });
            }
            ry += 14;
            if (edu.coursework) {
                const courses = edu.coursework.split(/[•]/).map(c => c.trim()).filter(Boolean);
                courses.forEach(course => {
                    doc.save(); doc.circle(rightColX + 3, ry + 4, 1.5).fill(T9_ACCENT); doc.restore();
                    doc.font("Regular").fontSize(9).fillColor(T9_BLACK)
                        .text(course, rightColX + 10, ry, { width: rightColW - 10 });
                    ry = doc.y + 2;
                });
            }
            ry += 4;
        });
    }

    // LEFT COLUMN: Experience
    let leftY = contentStartY;
    let currentPage = 0;

    if (parsed.experience.length > 0) {
        leftY = t9SectionHeader(doc, "Experience", leftColX, leftY, leftColW);
        parsed.experience.forEach((job, idx) => {
            if (leftY + 80 > usableBottom) {
                doc.addPage();
                currentPage++;
                leftY = topMargin;
                if (currentPage === 1) renderEducationRight(topMargin);
            }
            if (idx > 0) {
                doc.save();
                doc.strokeColor(T9_LIGHT).lineWidth(0.5).dash(2, { space: 2 })
                    .moveTo(leftColX, leftY).lineTo(leftColX + leftColW, leftY).stroke();
                doc.undash(); doc.restore();
                leftY += 8;
            }
            doc.font("Bold").fontSize(10.5).fillColor(T9_BLACK)
                .text(job.title || "", leftColX, leftY, { width: leftColW });
            leftY = doc.y;
            if (job.companyAndLocation) {
                doc.font("Bold").fontSize(10).fillColor(T9_ACCENT)
                    .text(job.companyAndLocation.split(",")[0].trim(), leftColX, leftY, { width: leftColW });
                leftY = doc.y + 1;
            }
            let dlx = leftColX;
            const dty = leftY;
            if (job.dates) {
                t9CalendarIcon(doc, dlx, dty + 1, T9_GRAY);
                dlx += 12;
                doc.font("Regular").fontSize(8.5).fillColor(T9_GRAY)
                    .text(job.dates, dlx, dty, { lineBreak: false });
                dlx += doc.widthOfString(job.dates) + 12;
            }
            const loc = job.companyAndLocation?.includes(",")
                ? job.companyAndLocation.split(",").slice(1).join(",").trim() : "Remote";
            t9LocationIcon(doc, dlx, dty + 1, T9_GRAY);
            dlx += 12;
            doc.font("Regular").fontSize(8.5).fillColor(T9_GRAY).text(loc, dlx, dty, { lineBreak: false });
            leftY = dty + 14;

            if (job.description) {
                doc.font("Regular").fontSize(9).fillColor(T9_BLACK)
                    .text(job.description, leftColX, leftY, { width: leftColW, lineGap: 1 });
                leftY = doc.y + 4;
            }
            const bulletIndent = 12;
            job.bullets.forEach(bullet => {
                const plain = bullet.replace(/<<|>>/g, "");
                doc.font("Regular").fontSize(9);
                const bH = doc.heightOfString(plain, { width: leftColW - bulletIndent });
                if (leftY + bH + 4 > usableBottom) {
                    doc.addPage();
                    currentPage++;
                    leftY = topMargin;
                    if (currentPage === 1) renderEducationRight(topMargin);
                }
                doc.save(); doc.circle(leftColX + 3, leftY + 5, 1.5).fill(T9_ACCENT); doc.restore();
                doc.font("Regular").fontSize(9).fillColor(T9_BLACK)
                    .text(plain, leftColX + bulletIndent, leftY, { width: leftColW - bulletIndent, lineGap: 1 });
                leftY = doc.y + 2;
            });
            leftY += 4;
        });
    }

    // Education fallback
    if (parsed.education.length > 0 && !educationRendered) {
        if (leftY + 50 > usableBottom) {
            doc.addPage();
            leftY = topMargin;
        }
        leftY = t9SectionHeader(doc, "Education", leftColX, leftY, leftColW);
        parsed.education.forEach((edu, idx) => {
            if (leftY + 50 > usableBottom) {
                doc.addPage();
                leftY = topMargin;
            }
            if (idx > 0) leftY += 6;
            if (edu.degree) {
                doc.font("Bold").fontSize(10.5).fillColor(T9_BLACK)
                    .text(edu.degree, leftColX, leftY, { width: leftColW });
                leftY = doc.y;
            }
            if (edu.university) {
                doc.font("Bold").fontSize(10).fillColor(T9_ACCENT)
                    .text(edu.university.split(",")[0].trim(), leftColX, leftY, { width: leftColW });
                leftY = doc.y + 1;
            }
            if (edu.graduation) {
                doc.font("Regular").fontSize(8.5).fillColor(T9_GRAY)
                    .text(edu.graduation, leftColX, leftY, { width: leftColW });
                leftY = doc.y;
            }
            leftY += 8;
        });
    }
}

module.exports = generateTemplate9PDF;
