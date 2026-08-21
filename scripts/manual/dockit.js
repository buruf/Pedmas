/** Tiny document builder over pdfkit: headings, paragraphs, bullets, steps, key-value rows. */
const PDFDocument = require("pdfkit");
const fs = require("fs");

const BRAND = "#7c3aed";
const INK = "#1f2033";
const MUTED = "#5b5d72";
const LIGHT = "#eceaf5";

function makeDoc(file, title, subtitle) {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 64, bottom: 64, left: 64, right: 64 }, bufferPages: true });
  doc.pipe(fs.createWriteStream(file));

  const api = {
    doc,
    ensure(h) {
      if (doc.y + h > doc.page.height - 70) doc.addPage();
    },
    title() {
      doc.fontSize(11).fillColor(BRAND).font("Helvetica-Bold").text("PEDMAS", { continued: false });
      doc.moveDown(0.6);
      doc.fontSize(26).fillColor(INK).font("Helvetica-Bold").text(title);
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor(MUTED).font("Helvetica").text(subtitle);
      doc.moveDown(0.4);
      doc.fontSize(9.5).fillColor(MUTED).text("www.pedmas.com  ·  " + new Date().toISOString().slice(0, 10));
      doc.moveDown(0.8);
      doc.moveTo(64, doc.y).lineTo(doc.page.width - 64, doc.y).strokeColor(LIGHT).lineWidth(1.4).stroke();
      doc.moveDown(1.2);
      return api;
    },
    h1(text) {
      api.ensure(70);
      doc.moveDown(0.9);
      doc.fontSize(17).fillColor(BRAND).font("Helvetica-Bold").text(text);
      doc.moveDown(0.35);
      return api;
    },
    h2(text) {
      api.ensure(56);
      doc.moveDown(0.55);
      doc.fontSize(12.5).fillColor(INK).font("Helvetica-Bold").text(text);
      doc.moveDown(0.25);
      return api;
    },
    p(text, opts = {}) {
      api.ensure(40);
      doc.fontSize(10.5).fillColor(opts.muted ? MUTED : INK).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(text, { lineGap: 2.6, ...opts });
      doc.moveDown(0.35);
      return api;
    },
    warn(text) {
      api.ensure(60);
      const x = doc.x, w = doc.page.width - 128;
      const h = doc.heightOfString(text, { width: w - 24, lineGap: 2.4 }) + 20;
      api.ensure(h + 12);
      doc.save().roundedRect(x, doc.y, w, h, 6).fillColor("#fef2f2").fill()
        .roundedRect(x, doc.y, w, h, 6).strokeColor("#dc2626").lineWidth(0.8).stroke().restore();
      doc.fillColor("#9a1c1c").fontSize(10).font("Helvetica-Bold")
        .text(text, x + 12, doc.y + 10, { width: w - 24, lineGap: 2.4 });
      doc.x = x; doc.moveDown(1);
      return api;
    },
    note(text) {
      api.ensure(60);
      const x = doc.x, w = doc.page.width - 128;
      const h = doc.heightOfString(text, { width: w - 24, lineGap: 2.4 }) + 20;
      api.ensure(h + 12);
      doc.save().roundedRect(x, doc.y, w, h, 6).fillColor("#f6f5fb").fill().restore();
      doc.fillColor(INK).fontSize(10).font("Helvetica")
        .text(text, x + 12, doc.y + 10, { width: w - 24, lineGap: 2.4 });
      doc.x = x; doc.moveDown(1);
      return api;
    },
    bullets(items) {
      for (const item of items) {
        api.ensure(34);
        const x = doc.x;
        doc.fontSize(10.5).fillColor(BRAND).font("Helvetica-Bold").text("•", x + 4, doc.y, { continued: false, width: 12 });
        doc.moveUp();
        doc.fillColor(INK).font("Helvetica").text(item, x + 18, doc.y, { width: doc.page.width - 128 - 18, lineGap: 2.2 });
        doc.x = x;
        doc.moveDown(0.28);
      }
      doc.moveDown(0.3);
      return api;
    },
    kv(rows) {
      for (const [k, v] of rows) {
        api.ensure(34);
        const x = doc.x;
        doc.fontSize(9.8).font("Courier-Bold").fillColor(INK).text(k, x, doc.y, { width: 190 });
        doc.moveUp();
        doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(v, x + 198, doc.y, { width: doc.page.width - 128 - 198, lineGap: 2 });
        doc.x = x;
        doc.moveDown(0.35);
      }
      doc.moveDown(0.3);
      return api;
    },
    step(n, action, expected) {
      api.ensure(56);
      const x = doc.x;
      doc.save().circle(x + 9, doc.y + 8, 9).fillColor(BRAND).fill().restore();
      doc.fontSize(9).fillColor("white").font("Helvetica-Bold").text(String(n), x, doc.y + 4, { width: 18, align: "center" });
      doc.moveUp();
      doc.fontSize(10.5).fillColor(INK).font("Helvetica-Bold").text(action, x + 26, doc.y + 1, { width: doc.page.width - 128 - 26, lineGap: 2.2 });
      if (expected) {
        doc.fontSize(9.8).fillColor("#15803d").font("Helvetica-Oblique")
          .text("Expect: " + expected, x + 26, doc.y + 2, { width: doc.page.width - 128 - 26, lineGap: 2 });
      }
      doc.x = x;
      doc.moveDown(0.55);
      return api;
    },
    code(text) {
      api.ensure(40);
      const x = doc.x, w = doc.page.width - 128;
      const h = doc.heightOfString(text, { width: w - 20, lineGap: 2 }) + 16;
      api.ensure(h + 10);
      doc.save().roundedRect(x, doc.y, w, h, 5).fillColor("#f3f2f9").fill().restore();
      doc.font("Courier").fontSize(9.3).fillColor(INK).text(text, x + 10, doc.y + 8, { width: w - 20, lineGap: 2 });
      doc.x = x; doc.moveDown(0.8);
      return api;
    },
    /** Compact checklist row: five stage boxes + optional lesson box + name. */
    checkRow(name, lesson, stageLabels) {
      api.ensure(20);
      const x = doc.x;
      let bx = x;
      for (let i = 0; i < 5; i++) {
        doc.save().rect(bx, doc.y + 1.5, 9, 9).strokeColor("#b9b6cf").lineWidth(0.8).stroke().restore();
        bx += 13;
      }
      // Lesson box, only when the skill has a written lesson.
      if (lesson) {
        doc.save().rect(bx + 4, doc.y + 1.5, 9, 9).strokeColor(BRAND).lineWidth(0.9).stroke().restore();
        doc.fontSize(6.5).fillColor(BRAND).font("Helvetica-Bold").text("L", bx + 6.5, doc.y + 3.2, { lineBreak: false });
      }
      doc.fontSize(9.6).fillColor(INK).font("Helvetica")
        .text(name, x + 96, doc.y, { width: doc.page.width - 128 - 96, lineBreak: false, ellipsis: true });
      doc.x = x;
      doc.moveDown(0.55);
      return api;
    },
    finish() {
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        // Writing inside the bottom margin makes pdfkit add a new page per
        // footer — one blank page for every real one. Zero the margin for
        // the stamp, then restore it.
        const oldBottom = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc.fontSize(8.5).fillColor(MUTED).font("Helvetica")
          .text(`${title} — page ${i + 1} of ${range.count}`, 64, doc.page.height - 46, { width: doc.page.width - 128, align: "center", lineBreak: false });
        doc.page.margins.bottom = oldBottom;
      }
      doc.end();
    },
  };
  return api;
}

module.exports = { makeDoc };
