async function rss2html(url, max) {
  const proxiedUrl = `/rsslurp/${url}`;
  const rssResponse = await fetch(proxiedUrl);
  const rssText = await rssResponse.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssText, "application/xml");
  window.rssDocs ??= {};
  Object.assign(window.rssDocs, { [url]: doc });
  const title = doc.querySelector("channel > title, feed > title").textContent;
  const link =
    doc.querySelector("channel > link")?.textContent ||
    doc.querySelector("feed > link:not([rel])")?.getAttribute("href");
  const maxItems = parseInt(max, 10) || Infinity;
  const items = Array.from(doc.querySelectorAll("channel > item, feed > entry"))
    .slice(0, maxItems)
    .map((item) => ({
      title: item.querySelector("title").textContent,
      link:
        item.querySelector("link")?.textContent ||
        item.querySelector("link")?.getAttribute("href"),
      description: item.querySelector("description")?.textContent,
    }));
  console.info({ title, link, items, maxItems });
  return /*html*/ `<article>
        <h3 class="feed-title">
            ${
              link
                ? /*html*/ `<a href="${link}" target="_blank">${title}</a>`
                : title
            }
        </h3>
        ${items
          .map(
            (item) => /*html*/ `
                <h4 class="feed-item-title">
                    <a href="${item.link}" target="_blank">${
              item.title
            }</a></h4>
                    ${
                      item.description
                        ? `<p class="feed-item-desc">${item.description}</p>`
                        : ""
                    }
            <!-- To create this output, copy and host this script wherever you want. Have fun! -->`
          )
          .join("")}
    </article>`;
}
class RssList extends HTMLElement {
  static observedAttributes = ["src", "max"];
  pending = false;

  constructor() {
    super();
  }

  update() {
    if (!this.getAttribute("src") || this.pending) return;
    this.innerHTML = this.getAttribute("src");
    this.pending = true;
    rss2html(this.getAttribute("src"), this.getAttribute("max")).then(
      (html) => {
        this.innerHTML = html;
        this.pending = false;
      }
    );
  }

  connectedCallback() {
    this.update();
  }

  attributeChangedCallback(name) {
    if (["max", "src"].includes(name)) {
      this.update();
    }
  }
}

customElements.define("rss-list", RssList);