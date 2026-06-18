function cleanJobTitle(title) {
    if (!title) return "";

    let cleaned = title;

    // Remove parenthetical content: (Remote), (Hybrid), (On-site), (L5), (IC4), (Contract), etc.
    cleaned = cleaned.replace(/\s*\([^)]*\)\s*/g, " ");

    // Remove bracketed content: [Remote], [L5], etc.
    cleaned = cleaned.replace(/\s*\[[^\]]*\]\s*/g, " ");

    // Remove level codes at word boundaries: L1-L10, IC1-IC10, P1-P10, M1-M10, T1-T10
    cleaned = cleaned.replace(/\b[LICPMT]\d{1,2}\b/gi, "");

    // Remove roman numeral levels: I, II, III, IV, V, VI (when standalone or at end)
    cleaned = cleaned.replace(/\s+(I{1,3}|IV|VI?|VII?)(\s|$|,)/g, "$2");

    // Remove trailing level indicators after title: "Engineer II" -> "Engineer"
    cleaned = cleaned.replace(/\s+(I{1,3}|IV|VI?|VII?)\s*$/g, "");

    // Remove team/department names after dash or comma: "- Messaging", "- Platform", ", Growth Team"
    // Require a space before the dash so hyphenated titles like "Full-Stack Engineer" are preserved
    cleaned = cleaned.replace(/\s+[-–—]\s*[A-Za-z]+(\s+[A-Za-z]+)?\s*$/g, "");
    cleaned = cleaned.replace(/,\s*[A-Za-z]+\s+(Team|Org|Department|Division|Group)\s*$/gi, "");

    // Remove common suffixes: "- Remote", "- Hybrid", "- Contract", "- Full Time"
    cleaned = cleaned.replace(/\s*[-–—]\s*(Remote|Hybrid|On-?site|Contract|Full[- ]?Time|Part[- ]?Time)\s*$/gi, "");

    // Remove standalone location indicators
    cleaned = cleaned.replace(/\s*[-–—]\s*(US|USA|UK|EU|EMEA|APAC|Global)\s*$/gi, "");

    // Clean up multiple spaces and trim
    cleaned = cleaned.replace(/\s{2,}/g, " ").trim();

    // Remove trailing punctuation
    cleaned = cleaned.replace(/[,\-–—:;]\s*$/, "").trim();

    return cleaned;
}

module.exports = cleanJobTitle;
