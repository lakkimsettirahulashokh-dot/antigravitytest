/**
 * scratch/batch_inject_seo_metadata.js
 * Batch updates all HTML files in the BTechPath AI OS repository with:
 * - Specific, unique Title and Meta Description
 * - Robots directives (index, follow vs noindex, nofollow)
 * - Canonical link tag
 * - Open Graph & Twitter Card tags
 * - Multi-resolution Favicon and Manifest tags
 * - seo-metadata.js script tag
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const { PAGE_METADATA, resolvePageMetadata } = require('../js/seo-metadata.js');

const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

console.log(`Found ${htmlFiles.length} HTML files to inspect and update...`);

let updatedCount = 0;

htmlFiles.forEach(fileName => {
    const filePath = path.join(ROOT_DIR, fileName);
    let html = fs.readFileSync(filePath, 'utf8');

    const meta = resolvePageMetadata(fileName);
    if (!meta) {
        console.warn(`[WARN] No metadata resolved for ${fileName}`);
        return;
    }

    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    if (!headMatch) {
        console.warn(`[WARN] No <head> found in ${fileName}`);
        return;
    }

    let headContent = headMatch[1];

    // Remove existing title
    headContent = headContent.replace(/<title>[\s\S]*?<\/title>\s*/gi, '');
    // Remove existing meta title, description, robots
    headContent = headContent.replace(/<meta\s+name=["'](title|description|robots|twitter:[^"']+)["'][^>]*>\s*/gi, '');
    // Remove existing OG meta tags
    headContent = headContent.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi, '');
    // Remove existing canonical
    headContent = headContent.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');
    // Remove existing favicon/manifest links
    headContent = headContent.replace(/<link\s+rel=["'](icon|shortcut icon|apple-touch-icon|manifest)["'][^>]*>\s*/gi, '');
    headContent = headContent.replace(/<meta\s+name=["']theme-color["'][^>]*>\s*/gi, '');

    const newMetaBlock = `
    <!-- Primary SEO Meta Tags -->
    <title>${meta.title}</title>
    <meta name="title" content="${meta.title}">
    <meta name="description" content="${meta.description}">
    <meta name="robots" content="${meta.robots}">
    <link rel="canonical" href="${meta.canonical}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${meta.ogType || 'website'}">
    <meta property="og:site_name" content="BTechPath AI">
    <meta property="og:url" content="${meta.canonical}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:image" content="${meta.ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="BTechPath AI - The Engineering Intelligence Platform">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${meta.canonical}">
    <meta name="twitter:title" content="${meta.title}">
    <meta name="twitter:description" content="${meta.description}">
    <meta name="twitter:image" content="${meta.ogImage}">
    <meta name="twitter:image:alt" content="BTechPath AI - The Engineering Intelligence Platform">

    <!-- Favicon & App Icons -->
    <link rel="icon" type="image/svg+xml" href="assets/branding/favicon.svg">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/branding/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/branding/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/branding/apple-touch-icon.png">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#0B0F19">
`;

    // Ensure seo-metadata.js script tag is present
    if (!headContent.includes('js/seo-metadata.js') && !html.includes('js/seo-metadata.js')) {
        headContent += `\n    <script src="js/seo-metadata.js" defer></script>\n`;
    }

    // Insert newMetaBlock right after <head...>
    const openingHeadTagMatch = html.match(/<head[^>]*>/i);
    const openingHeadTag = openingHeadTagMatch[0];

    // Clean up excessive empty lines in headContent
    headContent = headContent.replace(/^\s*\n+/, '');

    const newHead = `${openingHeadTag}${newMetaBlock}${headContent}</head>`;

    const newHtml = html.replace(/<head[^>]*>[\s\S]*?<\/head>/i, newHead);

    fs.writeFileSync(filePath, newHtml, 'utf8');
    updatedCount++;
    console.log(`[UPDATED] ${fileName} -> Title: "${meta.title}" | Robots: "${meta.robots}"`);
});

console.log(`\nSuccessfully injected production SEO metadata & favicons into ${updatedCount} HTML files.`);
