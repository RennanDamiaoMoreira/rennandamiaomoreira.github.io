async function loadPartial(path) {
    const response = await fetch(path, { headers: { "X-Requested-With": "fetch" } });

    if (!response.ok) {
        throw new Error(`Failed to load partial: ${path}`);
    }

    return response.text();
}

function resolveSectionHref(section, currentPage) {
    if (currentPage === "home" && document.getElementById(section)) {
        return `#${section}`;
    }

    return `./index.html#${section}`;
}

function buildLink(item, currentPage) {
    if (item.href) {
        return item.href;
    }

    return resolveSectionHref(item.section, currentPage);
}

function renderNavLinks(container, items, currentPage) {
    container.innerHTML = "";

    for (const item of items) {
        const link = document.createElement("a");
        link.className = "site-nav__link";
        link.textContent = item.label;
        link.href = buildLink(item, currentPage);

        container.appendChild(link);
    }
}

function renderFooterLinks(container, items, currentPage) {
    container.innerHTML = "";

    for (const item of items) {
        const link = document.createElement("a");
        link.textContent = item.label;
        link.href = buildLink(item, currentPage);
        container.appendChild(link);
    }
}

async function mountSharedLayout() {
    const site = window.SiteData;

    if (!site) {
        return;
    }

    const currentPage = document.body.dataset.page || "home";
    const headerMount = document.querySelector("[data-site-header]");
    const footerMount = document.querySelector("[data-site-footer]");

    try {
        const [headerHtml, footerHtml] = await Promise.all([
            loadPartial("./components/header.html"),
            loadPartial("./components/footer.html")
        ]);

        if (headerMount) {
            headerMount.innerHTML = headerHtml;

            const brandLink = headerMount.querySelector("[data-brand-link]");
            const brandMark = headerMount.querySelector("[data-brand-mark]");
            const brandName = headerMount.querySelector("[data-brand-name]");
            const navLinks = headerMount.querySelector("[data-nav-links]");

            if (brandLink) brandLink.href = site.brand.homeHref;
            if (brandMark) brandMark.textContent = site.brand.initials;
            if (brandName) brandName.textContent = site.brand.name;
            if (navLinks) renderNavLinks(navLinks, site.navigation, currentPage);
        }

        if (footerMount) {
            footerMount.innerHTML = footerHtml;

            const footerText = footerMount.querySelector("[data-footer-text]");
            const footerLinks = footerMount.querySelector("[data-footer-links]");

            if (footerText) footerText.textContent = site.footer.text;
            if (footerLinks) renderFooterLinks(footerLinks, site.footer.links, currentPage);
        }

        document.body.classList.add("layout-ready");
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", mountSharedLayout);
