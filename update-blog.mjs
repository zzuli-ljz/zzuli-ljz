// GitHub Profile README 博客列表自动同步
// 数据源：个人主页的 Supabase posts 表（公开只读）
// 每日由 .github/workflows/update-blog.yml 触发，更新 README 中 BLOG 标记之间的内容

const SUPABASE_URL = "https://wvhpmezvkumfctxwokmt.supabase.co"
const SUPABASE_KEY = "sb_publishable_Ne3CbQpuh5Tzr20V0XmSzw_UY74qplI" // publishable key，公开安全
const README_PATH = "README.md"
const START = "<!-- BLOG:START -->"
const END = "<!-- BLOG:END -->"

async function fetchPosts() {
  const url =
    `${SUPABASE_URL}/rest/v1/posts` +
    `?published=eq.true&order=date.desc&limit=5&select=slug,title,tag,date`
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) throw new Error(`Supabase REST ${res.status}: ${await res.text()}`)
  return res.json()
}

function renderSection(posts) {
  if (!posts.length) return "暂无文章，快去 [jiazhe.website](https://jiazhe.website/#/blog) 看看"
  const lines = posts.map(
    (p) =>
      `- [${p.title}](https://jiazhe.website/#/blog/${p.slug})` +
      ` — ${p.date || ""}${p.tag ? ` · ${p.tag}` : ""}`
  )
  return lines.join("\n")
}

const readme = (await import("node:fs")).readFileSync(README_PATH, "utf8")
const startIdx = readme.indexOf(START)
const endIdx = readme.indexOf(END)
if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  throw new Error("README 中未找到 BLOG 标记对")
}

const posts = await fetchPosts()
const section = `${START}\n${renderSection(posts)}\n${END}`
const updated = readme.slice(0, startIdx) + section + readme.slice(endIdx + END.length)

if (updated === readme) {
  console.log("无变化，跳过提交")
} else {
  ;(await import("node:fs")).writeFileSync(README_PATH, updated)
  console.log(`已更新：同步了 ${posts.length} 篇文章`)
}
