// ===== Style Constants (Template 1 — Maroon/Black) =====
const MAROON = "#7A0000";
const BLACK = "#2D2D2D";
const GRAY = "#555555";

const FONT_SIZE_NAME = 24;
const FONT_SIZE_SUBTITLE = 11;
const FONT_SIZE_CONTACT = 9;
const FONT_SIZE_SECTION = 11;
const FONT_SIZE_BODY = 10;

// Normalize a stored LinkedIn value for display.
// Accepts a full URL, a bare "linkedin.com/in/foo", or just a username.
// Returns "" when the profile has no LinkedIn (the field is optional).
function formatLinkedIn(value) {
    if (!value) return "";
    let s = String(value).trim();
    if (!s) return "";
    s = s.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
    if (!/linkedin\.com/i.test(s)) {
        s = `linkedin.com/in/${s.replace(/^\/+/, "")}`;
    }
    return s;
}

// Contact pieces for the header line, in order, with empty values dropped
// so a profile without a LinkedIn renders exactly as before.
function contactParts(user) {
    return [user.address, user.phone, user.email, formatLinkedIn(user.linkedin)]
        .filter(part => part && String(part).trim());
}

function drawSectionRule(doc) {
    const y = doc.y;
    doc.strokeColor(MAROON)
        .lineWidth(1)
        .moveTo(doc.page.margins.left, y)
        .lineTo(doc.page.width - doc.page.margins.right, y)
        .stroke();
    doc.y = y + 4;
}

function renderSectionHeader(doc, title) {
    doc.moveDown(0.4);
    doc.font("Bold")
        .fontSize(FONT_SIZE_SECTION)
        .fillColor(MAROON)
        .text(title.toUpperCase(), doc.page.margins.left, doc.y);
    doc.moveDown(0.1);
    drawSectionRule(doc);
    doc.moveDown(0.2);
}

function renderSplitLine(doc, leftText, leftFont, rightText, rightFont, fontSize) {
    const usable = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const savedY = doc.y;
    const leftX = doc.page.margins.left;
    const pageBefore = doc.bufferedPageRange().count;

    // Draw left text
    doc.font(leftFont).fontSize(fontSize).fillColor(BLACK);
    const leftHeight = doc.heightOfString(leftText, { width: usable * 0.7 });
    doc.text(leftText, leftX, savedY, { width: usable * 0.7 });

    // Draw right text at same Y (only if still on same page)
    doc.font(rightFont).fontSize(fontSize).fillColor(BLACK);
    const rightW = doc.widthOfString(rightText);
    const pageAfter = doc.bufferedPageRange().count;
    if (pageAfter === pageBefore) {
        doc.text(rightText, doc.page.width - doc.page.margins.right - rightW, savedY, {
            width: rightW + 2
        });
        doc.x = leftX;
        doc.y = savedY + Math.max(leftHeight, fontSize + 4);
    } else {
        // Page changed — just put right text on current page and let Y flow
        doc.text(rightText, doc.page.width - doc.page.margins.right - rightW, doc.page.margins.top, {
            width: rightW + 2
        });
        doc.x = leftX;
    }
}

function ensureSpace(doc, needed) {
    const remaining = doc.page.height - doc.page.margins.bottom - doc.y;
    if (remaining < needed) {
        doc.addPage();
    }
}

module.exports = {
    MAROON,
    BLACK,
    GRAY,
    FONT_SIZE_NAME,
    FONT_SIZE_SUBTITLE,
    FONT_SIZE_CONTACT,
    FONT_SIZE_SECTION,
    FONT_SIZE_BODY,
    formatLinkedIn,
    contactParts,
    drawSectionRule,
    renderSectionHeader,
    renderSplitLine,
    ensureSpace,
};
