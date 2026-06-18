// ===== Template 3 Style Constants (Enhancv-style two-column) =====
const T3_BLUE = "#2079C7";
const T3_BLACK = "#2D2D2D";
const T3_GRAY = "#888888";
const T3_LIGHT_GRAY = "#CCCCCC";

// ===== Icon Helpers =====
function t3PhoneIcon(doc, x, y, color) {
    doc.save().fillColor(color);
    doc.roundedRect(x + 1.5, y + 0.5, 6.5, 9, 1.2).fill();
    doc.fillColor('white');
    doc.roundedRect(x + 2.8, y + 2, 3.9, 4.5, 0.4).fill();
    doc.circle(x + 4.75, y + 7.8, 0.65).fill();
    doc.restore();
}

function t3EmailIcon(doc, x, y, color) {
    doc.save();
    doc.strokeColor(color).lineWidth(0.7).lineJoin('round');
    doc.rect(x + 0.5, y + 1.8, 9, 6.5).stroke();
    doc.moveTo(x + 0.5, y + 1.8).lineTo(x + 5, y + 5.5).lineTo(x + 9.5, y + 1.8).stroke();
    doc.restore();
}

function t3LocationIcon(doc, x, y, color) {
    doc.save().fillColor(color);
    doc.circle(x + 4, y + 3, 2.8).fill();
    doc.moveTo(x + 1.5, y + 3.5).lineTo(x + 4, y + 9.5).lineTo(x + 6.5, y + 3.5).fill();
    doc.fillColor('white');
    doc.circle(x + 4, y + 3, 1.1).fill();
    doc.restore();
}

function t3CalendarIcon(doc, x, y, color) {
    doc.save();
    doc.strokeColor(color).fillColor(color).lineWidth(0.6);
    doc.roundedRect(x + 0.5, y + 2, 9, 7, 0.5).stroke();
    doc.roundedRect(x + 0.5, y + 2, 9, 2.2, 0.5).fill();
    doc.strokeColor(color).lineWidth(0.8).lineCap('round');
    doc.moveTo(x + 3, y + 0.5).lineTo(x + 3, y + 3.2).stroke();
    doc.moveTo(x + 7, y + 0.5).lineTo(x + 7, y + 3.2).stroke();
    doc.restore();
}

// ===== Section Header with thick blue underline =====
function t3SectionHeader(doc, title, x, y, width) {
    doc.font("Bold").fontSize(12).fillColor(T3_BLACK);
    doc.text(title.toUpperCase(), x, y, { width: width });
    const lineY = doc.y + 2;
    doc.strokeColor(T3_BLUE).lineWidth(2.5);
    doc.moveTo(x, lineY).lineTo(x + width, lineY).stroke();
    return lineY + 8;
}

// ===== Dotted Separator =====
function t3DottedSep(doc, x, y, width) {
    doc.save();
    doc.strokeColor(T3_LIGHT_GRAY).lineWidth(0.5);
    doc.dash(2, { space: 2 });
    doc.moveTo(x, y).lineTo(x + width, y).stroke();
    doc.undash();
    doc.restore();
}

// ===== Template 3 PDF Generator =====
function generateTemplate3PDF(doc, parsed, user, pageWidth) {
    const leftMargin = doc.page.margins.left;
    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const usableW = pageW - leftMargin - doc.page.margins.right;
    const usableBottom = pageH - doc.page.margins.bottom;
    const topMargin = doc.page.margins.top;

    // Two-column dimensions
    const gap = 22;
    const leftColW = Math.round(usableW * 0.585);
    const rightColW = usableW - leftColW - gap;
    const leftColX = leftMargin;
    const rightColX = leftMargin + leftColW + gap;

    let y = topMargin;

    // ===== HEADER (full width) =====
    doc.font("Bold").fontSize(24).fillColor(T3_BLACK);
    doc.text(user.name, leftMargin, y, { width: usableW });
    y = doc.y;

    if (parsed.subtitle) {
        doc.font("Regular").fontSize(12).fillColor(T3_BLUE);
        doc.text(parsed.subtitle, leftMargin, y, { width: usableW });
        y = doc.y;
    }

    y += 6;

    // Contact line with icons
    const contactY = y;
    let cx = leftMargin;

    doc.font("Regular").fontSize(9).fillColor(T3_GRAY);
    const contactTextY = contactY;
    const contactIconY = contactTextY + 1.5;

    t3PhoneIcon(doc, cx, contactIconY, T3_GRAY);
    cx += 13;
    const phoneStr = user.phone || "";
    doc.text(phoneStr, cx, contactTextY, { lineBreak: false });
    cx += doc.widthOfString(phoneStr) + 16;

    t3EmailIcon(doc, cx, contactIconY, T3_GRAY);
    cx += 13;
    const emailStr = user.email || "";
    doc.text(emailStr, cx, contactTextY, { lineBreak: false });
    cx += doc.widthOfString(emailStr) + 16;

    t3LocationIcon(doc, cx, contactIconY, T3_GRAY);
    cx += 13;
    const addressStr = user.address || "";
    doc.text(addressStr, cx, contactTextY, { lineBreak: false });

    y = contactY + 16;
    const contentStartY = y;

    // ===== RIGHT COLUMN: SUMMARY + SKILLS (page 1 only) =====
    let rightY = contentStartY;

    rightY = t3SectionHeader(doc, "Summary", rightColX, rightY, rightColW);

    if (parsed.summary.length > 0) {
        const summaryText = parsed.summary.join(" ").replace(/<<|>>/g, "");
        doc.font("Regular").fontSize(9).fillColor(T3_BLACK);
        const summaryH = doc.heightOfString(summaryText, { width: rightColW, lineGap: 2 });
        if (rightY + summaryH < usableBottom) {
            doc.text(summaryText, rightColX, rightY, {
                width: rightColW,
                lineGap: 2,
                align: "left"
            });
            rightY = doc.y + 12;
        }
    }

    if (rightY + 25 < usableBottom) {
        rightY = t3SectionHeader(doc, "Skills", rightColX, rightY, rightColW);
    }

    if (parsed.skills.length > 0) {
        parsed.skills.forEach(skillLine => {
            if (rightY + 30 > usableBottom) return;
            const colonIdx = skillLine.indexOf(":");
            if (colonIdx > -1) {
                const label = skillLine.substring(0, colonIdx).replace(/<<|>>/g, "").trim();
                const fullText = skillLine.replace(/<<|>>/g, "");

                doc.font("Bold").fontSize(10);
                const labelH = doc.heightOfString(label, { width: rightColW });
                doc.font("Regular").fontSize(9);
                const textH = doc.heightOfString(fullText, { width: rightColW - 12, lineGap: 1.5 });
                if (rightY + labelH + 10 + textH + 8 > usableBottom) return;

                doc.font("Bold").fontSize(10).fillColor(T3_BLUE);
                doc.text(label, rightColX, rightY, { width: rightColW });
                rightY = doc.y + 4;

                t3DottedSep(doc, rightColX, rightY, rightColW);
                rightY += 6;

                doc.font("Regular").fontSize(9).fillColor(T3_BLACK);
                doc.text(fullText, rightColX + 12, rightY, {
                    width: rightColW - 12,
                    lineGap: 1.5
                });
                rightY = doc.y + 8;
            } else {
                doc.font("Regular").fontSize(9);
                const lineH = doc.heightOfString(skillLine, { width: rightColW });
                if (rightY + lineH > usableBottom) return;
                doc.font("Regular").fontSize(9).fillColor(T3_BLACK);
                doc.text(skillLine.replace(/<<|>>/g, ""), rightColX, rightY, { width: rightColW });
                rightY = doc.y + 4;
            }
        });
    }

    // ===== LEFT COLUMN: EXPERIENCE =====
    let leftY = contentStartY;
    let currentPage = 0;

    function getColW() { return leftColW; }
    function getColX() { return leftColX; }

    // Education in the right column (rendered once when page 2 is created)
    let educationRendered = false;
    function renderEducationRight(startY) {
        if (educationRendered || parsed.education.length === 0) return;
        educationRendered = true;

        let ry = startY;
        const ew = rightColW;
        const ex = rightColX;

        ry = t3SectionHeader(doc, "Education", ex, ry, ew);

        parsed.education.forEach((edu, idx) => {
            if (idx > 0) {
                t3DottedSep(doc, ex, ry, ew);
                ry += 8;
            }

            if (edu.degree) {
                doc.font("Bold").fontSize(10.5).fillColor(T3_BLACK);
                doc.text(edu.degree, ex, ry, { width: ew });
                ry = doc.y;
            }

            if (edu.university) {
                doc.font("Bold").fontSize(10).fillColor(T3_BLUE);
                const uniName = edu.university.split(",")[0].trim();
                doc.text(uniName, ex, ry, { width: ew });
                ry = doc.y + 1;
            }

            let elx = ex;
            const eduTextY = ry;
            const eduIconY = eduTextY + 1;

            if (edu.graduation) {
                t3CalendarIcon(doc, elx, eduIconY, T3_GRAY);
                elx += 12;
                doc.font("Regular").fontSize(8.5).fillColor(T3_GRAY);
                doc.text(edu.graduation, elx, eduTextY, { lineBreak: false });
                elx += doc.widthOfString(edu.graduation) + 12;
            }

            const eduLoc = edu.university && edu.university.includes(",")
                ? edu.university.split(",").slice(1).join(",").trim()
                : "";
            if (eduLoc) {
                t3LocationIcon(doc, elx, eduIconY, T3_GRAY);
                elx += 12;
                doc.font("Regular").fontSize(8.5).fillColor(T3_GRAY);
                doc.text(eduLoc, elx, eduTextY, { lineBreak: false });
            }

            ry = eduTextY + 14;

            if (edu.coursework) {
                const courses = edu.coursework.split(/[•]/).map(c => c.trim()).filter(Boolean);
                courses.forEach(course => {
                    doc.save();
                    doc.circle(ex + 4, ry + 5, 1.5).fill(T3_BLACK);
                    doc.restore();

                    doc.font("Regular").fontSize(9).fillColor(T3_BLACK);
                    doc.text(course, ex + 12, ry, { width: ew - 12 });
                    ry = doc.y + 2;
                });
            }

            ry += 6;
        });
    }

    if (parsed.experience.length > 0) {
        leftY = t3SectionHeader(doc, "Experience", getColX(), leftY, getColW());

        parsed.experience.forEach((job, idx) => {
            if (leftY + 80 > usableBottom) {
                doc.addPage();
                currentPage++;
                leftY = topMargin;
                if (currentPage === 1) renderEducationRight(topMargin);
            }

            let w = getColW();
            let sx = getColX();

            if (idx > 0) {
                t3DottedSep(doc, sx, leftY, w);
                leftY += 8;
            }

            doc.font("Bold").fontSize(10.5).fillColor(T3_BLACK);
            doc.text(job.title || "", sx, leftY, { width: w });
            leftY = doc.y;

            if (job.companyAndLocation) {
                doc.font("Bold").fontSize(10).fillColor(T3_BLUE);
                const companyName = job.companyAndLocation.split(",")[0].trim();
                doc.text(companyName, sx, leftY, { width: w });
                leftY = doc.y + 1;
            }

            let dlx = sx;
            const dateTextY = leftY;
            const dateIconY = dateTextY + 1;

            if (job.dates) {
                t3CalendarIcon(doc, dlx, dateIconY, T3_GRAY);
                dlx += 12;
                doc.font("Regular").fontSize(8.5).fillColor(T3_GRAY);
                doc.text(job.dates, dlx, dateTextY, { lineBreak: false });
                dlx += doc.widthOfString(job.dates) + 12;
            }

            const locText = job.companyAndLocation && job.companyAndLocation.includes(",")
                ? job.companyAndLocation.split(",").slice(1).join(",").trim()
                : "Remote";
            t3LocationIcon(doc, dlx, dateIconY, T3_GRAY);
            dlx += 12;
            doc.font("Regular").fontSize(8.5).fillColor(T3_GRAY);
            doc.text(locText, dlx, dateTextY, { lineBreak: false });

            leftY = dateTextY + 14;

            w = getColW();
            sx = getColX();
            if (job.description) {
                doc.font("Regular").fontSize(9).fillColor(T3_BLACK);
                doc.text(job.description, sx, leftY, { width: w, lineGap: 1 });
                leftY = doc.y + 4;
            }

            const bulletIndent = 12;
            job.bullets.forEach(bullet => {
                const plainBullet = bullet.replace(/<<|>>/g, "");
                w = getColW();
                sx = getColX();
                doc.font("Regular").fontSize(9);
                const bH = doc.heightOfString(plainBullet, { width: w - bulletIndent });

                if (leftY + bH + 4 > usableBottom) {
                    doc.addPage();
                    currentPage++;
                    leftY = topMargin;
                    if (currentPage === 1) renderEducationRight(topMargin);
                    w = getColW();
                    sx = getColX();
                }

                doc.save();
                doc.circle(sx + 4, leftY + 5, 1.5).fill(T3_BLACK);
                doc.restore();

                doc.font("Regular").fontSize(9).fillColor(T3_BLACK);
                doc.text(plainBullet, sx + bulletIndent, leftY, {
                    width: w - bulletIndent,
                    lineGap: 1
                });
                leftY = doc.y + 2;
            });

            leftY += 4;
        });
    }

    // ===== EDUCATION (only if not already rendered in right column on page 2) =====
    if (parsed.education.length > 0 && !educationRendered) {
        if (leftY + 50 > usableBottom) {
            doc.addPage();
            currentPage++;
            leftY = topMargin;
        }

        let w = getColW();
        let sx = getColX();
        leftY = t3SectionHeader(doc, "Education", sx, leftY, w);

        parsed.education.forEach((edu, idx) => {
            if (leftY + 50 > usableBottom) {
                doc.addPage();
                currentPage++;
                leftY = topMargin;
            }

            w = getColW();
            sx = getColX();

            if (idx > 0) {
                t3DottedSep(doc, sx, leftY, w);
                leftY += 8;
            }

            if (edu.degree) {
                doc.font("Bold").fontSize(10.5).fillColor(T3_BLACK);
                doc.text(edu.degree, sx, leftY, { width: w });
                leftY = doc.y;
            }

            if (edu.university) {
                doc.font("Bold").fontSize(10).fillColor(T3_BLUE);
                const uniName = edu.university.split(",")[0].trim();
                doc.text(uniName, sx, leftY, { width: w });
                leftY = doc.y + 1;
            }

            let elx = sx;
            const eduTextY = leftY;
            const eduIconY = eduTextY + 1;

            if (edu.graduation) {
                t3CalendarIcon(doc, elx, eduIconY, T3_GRAY);
                elx += 12;
                doc.font("Regular").fontSize(8.5).fillColor(T3_GRAY);
                doc.text(edu.graduation, elx, eduTextY, { lineBreak: false });
                elx += doc.widthOfString(edu.graduation) + 12;
            }

            const eduLoc = edu.university && edu.university.includes(",")
                ? edu.university.split(",").slice(1).join(",").trim()
                : "";
            if (eduLoc) {
                t3LocationIcon(doc, elx, eduIconY, T3_GRAY);
                elx += 12;
                doc.font("Regular").fontSize(8.5).fillColor(T3_GRAY);
                doc.text(eduLoc, elx, eduTextY, { lineBreak: false });
            }

            leftY = eduTextY + 14;

            if (edu.coursework) {
                w = getColW();
                sx = getColX();
                const courses = edu.coursework.split(/[•]/).map(c => c.trim()).filter(Boolean);
                courses.forEach(course => {
                    doc.save();
                    doc.circle(sx + 4, leftY + 5, 1.5).fill(T3_BLACK);
                    doc.restore();

                    doc.font("Regular").fontSize(9).fillColor(T3_BLACK);
                    doc.text(course, sx + 12, leftY, { width: w - 12 });
                    leftY = doc.y + 2;
                });
            }

            leftY += 6;
        });
    }
}

module.exports = generateTemplate3PDF;
