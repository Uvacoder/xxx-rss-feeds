async function rss2html(url) {
  const rssResponse = await fetch(url);
  const rssText = await rssResponse.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssText, "application/xml");
  const channel = doc.querySelector("channel");
  const title = channel.querySelector("title").textContent;
  const link = channel.querySelector("link").textContent;
  const items = Array.from(channel.querySelectorAll("item")).map((item) => ({
    title: item.querySelector("title").textContent,
    link: item.querySelector("link").textContent,
    description: item.querySelector("description").textContent,
  }));
  return /*html*/ `<article>
        <h3 class="feed-title">
            ${link ? /*html*/ `<a href="${link}" target="_blank">` : title}
        </h3>
        ${items.map(
          (item) => /*html*/ `
                <h4 class="feed-item-title">
                    <a href="${item.link}" target="_blank">${item.title}</h4>
                    ${
                      item.description
                        ? `<p class="feed-item-desc">${item.description}</p>`
                        : ""
                    }
            <!-- To create this output, copy and host this script wherever you want. Have fun! -->`
        )}
    </article>`;
}
const sarajoyEntry = rss2html("/rsslurp/sarajoy.dev/rss.xml");
console.log(sarajoyEntry);
document.querySelector("main").insertAdjacentHTML("beforeend", sarajoyEntry);