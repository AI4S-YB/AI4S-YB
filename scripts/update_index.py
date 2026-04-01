#!/usr/bin/env python3
"""
Fetch AI4S-YB GitHub org repos, ask Claude to generate HTML cards,
and replace the AUTO_REPOS_START/END section in index.html.
"""
import json
import os
import re
import sys

import anthropic
import requests

ORG = "AI4S-YB"
INDEX_HTML = os.path.join(os.path.dirname(__file__), "..", "index.html")
MARKER_START = "<!-- AUTO_REPOS_START -->"
MARKER_END = "<!-- AUTO_REPOS_END -->"
DEFAULT_MODEL = "claude-opus-4-6"


def github_headers() -> dict:
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def fetch_repos() -> list[dict]:
    url = f"https://api.github.com/orgs/{ORG}/repos"
    params = {"sort": "updated", "per_page": 30, "type": "public"}
    resp = requests.get(url, headers=github_headers(), params=params, timeout=15)
    resp.raise_for_status()
    repos = resp.json()
    # Keep non-forks that have a description
    repos = [r for r in repos if not r.get("fork") and r.get("description")]
    return repos[:10]


def fetch_org() -> dict:
    url = f"https://api.github.com/orgs/{ORG}"
    resp = requests.get(url, headers=github_headers(), timeout=15)
    resp.raise_for_status()
    return resp.json()


def normalize_base_url(base_url: str) -> str:
    base_url = base_url.rstrip("/")
    for suffix in ("/v1/messages", "/messages", "/v1"):
        if base_url.endswith(suffix):
            base_url = base_url[: -len(suffix)]
            break
    return base_url


def generate_html(repos: list[dict], org: dict, model: str) -> str:
    repos_data = [
        {
            "name": r["name"],
            "description": r["description"] or "",
            "language": r.get("language") or "",
            "stars": r.get("stargazers_count", 0),
            "url": r["html_url"],
            "topics": r.get("topics", [])[:4],
            "updated": r["updated_at"][:10],
        }
        for r in repos
    ]

    prompt = f"""你是一名前端工程师，需要为 AI4S-YB 组织主页生成「开源仓库」区块的内部 HTML 片段。

## 组织信息
- 名称：{org.get("name") or ORG}
- 公开仓库数：{org.get("public_repos", "?")}
- 成员数：{org.get("public_members_count", "?")}

## 仓库列表（JSON）
{json.dumps(repos_data, ensure_ascii=False, indent=2)}

## 要求
1. 输出一个 `<div class="work-grid">` 包裹的卡片列表，每个仓库一张卡片
2. 参考以下卡片结构（保留 CSS 类名）：

```html
<article class="work-card reveal delay-1">
  <div class="work-card-top">
    <span class="work-icon">
      <!-- 根据语言选一个合适的 SVG icon（24×24，stroke 风格） -->
    </span>
    <span class="work-status">进行中</span>
  </div>
  <h3>仓库名</h3>
  <p>仓库描述（中英文均可）</p>
  <div class="work-tags">
    <span>language</span>
    <span>topic</span>
  </div>
  <a class="join-link" href="仓库URL" target="_blank" rel="noreferrer">
    查看仓库
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
  </a>
</article>
```

3. delay-N 从 1 开始递增（delay-1, delay-2 …），最多 delay-6 循环
4. work-status 根据实际情况选：进行中 / 规划中 / 已归档
5. Stars 数展示在 work-card-top 右侧（用 `<span class="work-status">⭐ N</span>` 样式）
6. 只输出 HTML 片段，不要 markdown 代码块标记，不要任何解释文字
"""

    kwargs = {"api_key": os.environ["ANTHROPIC_API_KEY"]}
    base_url = os.getenv("ANTHROPIC_BASE_URL")
    if base_url:
        # The SDK appends `/v1/messages`, so accept values like
        # `http://host`, `http://host/v1`, or `http://host/v1/messages`.
        base_url = normalize_base_url(base_url)
        kwargs["base_url"] = base_url
        print(f"  Using base_url: {base_url}")
    client = anthropic.Anthropic(**kwargs)
    msg = client.messages.create(
        model=model,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text.strip()


def patch_html(new_inner: str) -> bool:
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = re.compile(
        re.escape(MARKER_START) + r".*?" + re.escape(MARKER_END),
        re.DOTALL,
    )
    if not pattern.search(content):
        print("ERROR: markers not found in index.html", file=sys.stderr)
        return False

    replacement = f"{MARKER_START}\n          {new_inner}\n          {MARKER_END}"
    new_content = pattern.sub(replacement, content)

    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("index.html patched successfully.")
    return True


def main():
    model = os.getenv("CLAUDE_MODEL", DEFAULT_MODEL)
    print(f"Model: {model}")

    print("Fetching repos from GitHub…")
    repos = fetch_repos()
    org = fetch_org()
    print(f"  {len(repos)} repos fetched (org public_repos={org.get('public_repos')})")

    if not repos:
        print("No repos found, skipping update.")
        return

    print("Calling Claude to generate HTML…")
    html_fragment = generate_html(repos, org, model)
    print(f"  Generated {len(html_fragment)} chars")

    patch_html(html_fragment)


if __name__ == "__main__":
    main()
