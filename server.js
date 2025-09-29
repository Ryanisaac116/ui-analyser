// server.js — UI Bugs Analyser Pro (Node 20+, ESM)
// Run: node server.js

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

// --- Setup -------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "1mb" }));

// Serve static assets (index.html, styles.css, script.js, etc.)
app.use(express.static(__dirname));

// A polite diagnostics UA
const UA =
  "UI-Bugs-Analyser/1.0 (+https://example.invalid; for QA) NodeFetch/20";

// Simple fetch with timeout + final URL capture
async function timedFetch(url, opts = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  let res;
  try {
    res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": UA, ...(opts.headers || {}) },
      signal: controller.signal,
      ...opts,
    });
  } finally {
    clearTimeout(t);
  }
  const timeMs = Math.round(performance.now() - started);
  // Some runtimes expose res.url as final URL:
  const finalUrl = res?.url || url;
  return { res, timeMs, finalUrl };
}

// --- Heuristic checks --------------------------------------------------------

function analyzeHtml(html, baseUrl) {
  const $ = cheerio.load(html);

  const issues = [];
  const meta = {};

  // Helpers
  const add = (severity, id, title, details = "", sample = "") =>
    issues.push({ severity, id, title, details, sample });

  const text = (el) => $(el).text().trim();
  const attr = (el, name) => ($(el).attr(name) || "").trim();

  // 1) <title>
  const titleEl = $("head > title").first();
  if (!titleEl.length) {
    add("warn", "title.missing", "<title> is missing");
  } else {
    const t = titleEl.text().trim();
    if (t.length < 10 || t.length > 65) {
      add(
        "note",
        "title.length",
        "<title> length could be improved",
        `Current length: ${t.length}`,
        t
      );
    }
  }

  // 2) meta viewport
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  if (!viewport) {
    add(
      "warn",
      "meta.viewport.missing",
      "Responsive viewport is missing",
      'Add: <meta name="viewport" content="width=device-width, initial-scale=1">'
    );
  }

  // 3) Missing alt on <img>
  $("img").each((_, el) => {
    const alt = attr(el, "alt");
    const src = attr(el, "src");
    if (alt === "") {
      // decorative ok – we won’t flag empty, only missing
      return;
    }
    if (!alt) {
      add("error", "img.alt.missing", "Image missing alt text", "", src);
    }
    // Layout-stability hint
    const w = attr(el, "width");
    const h = attr(el, "height");
    if (!w || !h) {
      add(
        "note",
        "img.dimensions",
        "Image width/height missing",
        "Reserve space to reduce layout shift.",
        src
      );
    }
  });

  // 4) Inputs without label/accessible name
  $('input, select, textarea').each((_, el) => {
    const type = (attr(el, "type") || "").toLowerCase();
    if (type === "hidden") return;

    const id = attr(el, "id");
    const hasWrapLabel = $(el).closest("label").length > 0;
    const forLabel = id ? $(`label[for="${CSS.escape(id)}"]`).length > 0 : false;
    const ariaLabel = attr(el, "aria-label");
    const labelledBy = attr(el, "aria-labelledby");

    const isNamed = hasWrapLabel || forLabel || ariaLabel || labelledBy;
    if (!isNamed) {
      add(
        "error",
        "form.label.missing",
        "Form control without label/accessible name",
        `type="${type}" id="${id}"`,
        $.html(el).replace(/\s+/g, " ").slice(0, 120) + "…"
      );
    }
  });

  // 5) Buttons/links without accessible name
  $("button, [role='button']").each((_, el) => {
    const t = text(el);
    const aria = attr(el, "aria-label");
    if (!t && !aria) {
      add(
        "warn",
        "button.name.missing",
        "Button lacks accessible name",
        "",
        $.html(el).replace(/\s+/g, " ").slice(0, 120) + "…"
      );
    }
  });

  $("a[href]").each((_, el) => {
    const href = attr(el, "href");
    const t = text(el);
    const aria = attr(el, "aria-label");

    if (href === "#" || href.toLowerCase().startsWith("javascript:")) {
      add("warn", "link.href.placeholder", "Placeholder link", "", href);
    }
    if (!t && !aria) {
      add(
        "warn",
        "link.name.missing",
        "Link lacks accessible name",
        "",
        $.html(el).replace(/\s+/g, " ").slice(0, 120) + "…"
      );
    }
  });

  // 6) Duplicate IDs
  const idMap = new Map();
  $('[id]').each((_, el) => {
    const id = attr(el, "id");
    if (!id) return;
    idMap.set(id, (idMap.get(id) || 0) + 1);
  });
  for (const [id, count] of idMap.entries()) {
    if (count > 1) {
      add(
        "error",
        "dom.duplicate-id",
        "Duplicate id detected",
        `id="${id}" appears ${count} times`,
        id
      );
    }
  }

  // 7) Heading order (skip levels)
  const order = [];
  $("h1,h2,h3,h4,h5,h6").each((_, el) => {
    const level = Number(el.tagName.slice(1));
    order.push(level);
  });
  for (let i = 1; i < order.length; i++) {
    if (order[i] > order[i - 1] + 1) {
      add(
        "note",
        "heading.skip",
        "Heading level skipped",
        `Sequence … h${order[i - 1]} → h${order[i]} …`
      );
      break;
    }
  }

  // 8) Simple DOM size (very rough heuristic)
  const nodes = $("*").length;
  if (nodes > 3000) {
    add(
      "note",
      "dom.size.large",
      "Large DOM",
      `~${nodes} nodes. Very large DOMs can affect performance.`
    );
  }

  // 9) Simple contrast heuristic (body text color vs background, inline only)
  // This is NOT a full contrast audit; it’s a quick hint.
  const contrastHint = computeBodyContrastHint($);
  if (contrastHint) {
    add("note", "contrast.heuristic", "Possible low contrast", contrastHint);
  }

  return { issues, meta };
}

function parseCssColorToRgb(str) {
  // Supports hex (#rrggbb / #rgb), rgb(), rgba()
  if (!str) return null;
  const s = String(str).trim().toLowerCase();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return [r, g, b];
  }
  const rgb = s.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  return null;
}

function luma([r, g, b]) {
  // relative luminance approximation
  const toLin = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = toLin(r), G = toLin(g), B = toLin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(rgb1, rgb2) {
  const L1 = luma(rgb1), L2 = luma(rgb2);
  const [a, b] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (a + 0.05) / (b + 0.05);
}

function computeBodyContrastHint($) {
  // Try to read inline styles on <body> or top container
  // (Cheerio doesn't compute CSS; we only see inline values.)
  const body = $("body").first();
  const bg = body.attr("bgcolor") || body.attr("style") || "";
  const colorAttr = body.attr("style") || "";

  const bodyBgMatch = String(bg).match(/background(?:-color)?:\s*([^;]+)/i);
  const bodyColorMatch = String(colorAttr).match(/color:\s*([^;]+)/i);

  const bgColor = parseCssColorToRgb(bodyBgMatch?.[1]);
  const textColor = parseCssColorToRgb(bodyColorMatch?.[1]);

  if (bgColor && textColor) {
    const ratio = contrastRatio(bgColor, textColor);
    if (ratio < 4.5) {
      return `Body text vs background measured ~${ratio.toFixed(
        2
      )}:1 (inline styles).`;
    }
  }
  return null;
}

// --- Link & image check (optional) -------------------------------------------
async function checkLinksAndImages($, baseUrl) {
  const results = [];

  // Collect a small set to avoid hammering sites
  const links = $("a[href]")
    .map((_, el) => $(el).attr("href"))
    .get()
    .filter(Boolean)
    .slice(0, 40);

  const imgs = $("img[src]")
    .map((_, el) => $(el).attr("src"))
    .get()
    .filter(Boolean)
    .slice(0, 40);

  const targets = [...links, ...imgs];
  const unique = Array.from(new Set(targets));

  // HEAD first; if HEAD fails use GET with small range (some servers block HEAD)
  const fetchHead = async (u) => {
    try {
      const url = new URL(u, baseUrl).toString();
      const { res } = await timedFetch(url, { method: "HEAD" }, 12000);
      // some servers don't allow HEAD → fallback
      if (!res.ok && res.status >= 405) {
        const res2 = await fetch(url, {
          method: "GET",
          headers: { Range: "bytes=0-0", "user-agent": UA },
        });
        return { status: res2.status, url };
      }
      return { status: res.status, url };
    } catch {
      return { status: 0, url: u };
    }
  };

  const checks = unique.map((u) => fetchHead(u));
  const settled = await Promise.all(checks);

  settled.forEach(({ url, status }) => {
    if (status === 0 || status >= 400) {
      results.push({
        severity: status === 0 ? "warn" : "error",
        id: "http.link.status",
        title:
          status === 0 ? "Unreachable URL (network/blocked)" : "Broken link/image",
        details: `Status: ${status || "network error"}`,
        sample: url,
      });
    }
  });

  return results;
}

// --- API: Single -------------------------------------------------------------
app.get("/api/analyze", async (req, res) => {
  const requestedUrl = String(req.query.url || "").trim();
  const checkLinks = String(req.query.checkLinks || "false") === "true";
  const checkContrast = String(req.query.checkContrast || "false") === "true";

  if (!requestedUrl) {
    return res.status(400).json({ error: "Missing ?url=" });
  }

  let html = "";
  let status = 0;
  let timeMs = 0;
  let finalUrl = requestedUrl;

  try {
    const { res: r, timeMs: t, finalUrl: f } = await timedFetch(requestedUrl, {
      headers: { "user-agent": UA, accept: "text/html,*/*" },
    });
    status = r.status;
    timeMs = t;
    finalUrl = f;
    html = await r.text();
  } catch (err) {
    return res.json({
      meta: { requestedUrl, finalUrl, status, timeMs, error: String(err) },
      issues: [
        {
          severity: "error",
          id: "http.fetch",
          title: "Failed to fetch HTML",
          details: String(err),
          sample: requestedUrl,
        },
      ],
    });
  }

  const { issues, meta } = analyzeHtml(html, finalUrl);

  // Optional checks
  let extra = [];
  if (checkLinks) {
    try {
      const $ = cheerio.load(html);
      extra = extra.concat(await checkLinksAndImages($, finalUrl));
    } catch (e) {
      extra.push({
        severity: "note",
        id: "http.link.check",
        title: "Link check skipped",
        details: "Failed to parse links for HEAD checks.",
      });
    }
  }
  // (contrast heuristic is always run; `checkContrast` is kept for UI compatibility)
  // you can gate it if you prefer:
  // if (!checkContrast) { remove issues with id.startsWith('contrast.') }

  const out = {
    meta: {
      ...meta,
      requestedUrl,
      finalUrl,
      status,
      timeMs,
    },
    issues: [...issues, ...extra],
  };

  res.json(out);
});

// --- API: Batch --------------------------------------------------------------
app.post("/api/analyze-batch", async (req, res) => {
  const urls = Array.isArray(req.body?.urls) ? req.body.urls : [];
  const options = req.body?.options || {};
  const checkLinks = !!options.checkLinks;
  const checkContrast = !!options.checkContrast;

  if (!urls.length) {
    return res.status(400).json({ error: "Provide { urls: [...] }" });
  }

  // polite sequential processing to avoid hammering
  const results = [];
  for (const u of urls.slice(0, 20)) {
    try {
      const r = await fetch(
        `${req.protocol}://${req.get("host")}/api/analyze?` +
          new URLSearchParams({
            url: u,
            checkLinks: String(checkLinks),
            checkContrast: String(checkContrast),
          })
      );
      results.push(await r.json());
    } catch (err) {
      results.push({
        meta: { requestedUrl: u, status: 0, timeMs: 0, error: String(err) },
        issues: [
          {
            severity: "error",
            id: "http.fetch",
            title: "Failed to fetch in batch",
            details: String(err),
            sample: u,
          },
        ],
      });
    }
  }

  res.json({ count: results.length, results });
});

// --- Start -------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`UI Bugs Analyser server running on http://localhost:${PORT}`)
);
