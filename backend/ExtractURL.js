import fetch from "node-fetch";
import { JSDOM } from "jsdom";

const URL = "http://results.jntuh.ac.in/jsp/home.jsp";

async function scrape() {
    const res = await fetch(URL);
    const html = await res.text();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const table = document.getElementsByTagName("tbody")[0];
    if (!table) {
        console.log("No tbody found");
        return;
    }

    const links = table.getElementsByTagName("a");

    const queryParts = [];

    for (const link of links) {
        const href = link.getAttribute("href");

        if (!href) continue;

        // Ensure it's a valid link with query
        const idx = href.indexOf("?");

        if (idx !== -1) {
            const query = href.substring(idx + 1);   // everything after ?
            queryParts.push(query);
        }
    }

    console.log("Extracted query parts:\n", queryParts);
}

scrape();
