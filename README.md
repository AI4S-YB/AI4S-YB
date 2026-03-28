# AI4S-YB GitHub Pages 导航页

这是一个适合 GitHub Pages 的纯静态导航页骨架，文件只有：

- `index.html`
- `styles.css`
- `script.js`
- `.nojekyll`

## 你能不能做，还是只有管理员能做？

分两层看：

1. 组织层面：
   组织 owner 可以控制是否允许成员在该组织里发布 GitHub Pages。
2. 仓库层面：
   对目标仓库有 `admin` 或 `maintainer` 权限的人，可以在仓库设置里配置 Pages 的发布源。
3. 如果你只有普通写权限：
   你通常可以把网页文件提交到仓库里，但可能仍然需要一个有设置权限的人到 `Settings -> Pages` 里完成启用。

## 推荐怎么放

### 方案 A：做组织主页

如果你想让网站直接挂在：

`https://ai4s-yb.github.io`

那么建议在组织 `AI4S-YB` 下创建一个仓库：

`ai4s-yb.github.io`

然后把这些文件放到仓库根目录，发布源选 `main` 分支的 `/ (root)`。

注意：

- GitHub Pages 的组织主页仓库名必须是 `<organization>.github.io`
- 如果组织名里有大写字母，仓库名需要小写

### 方案 B：做项目主页

如果你只是想在现有某个仓库下挂一个导航页，也可以：

- 把文件放在仓库根目录，然后发布 `main / (root)`
- 或者把文件放在 `docs/` 目录，然后发布 `main /docs`

发布后的地址通常会是：

`https://ai4s-yb.github.io/<repository-name>/`

## 最短部署步骤

1. 选一个目标仓库。
2. 把当前目录里的文件放进去。
3. 打开 GitHub 仓库的 `Settings -> Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，Folder 选择 `/ (root)` 或 `/docs`。
6. 等 GitHub 自动发布完成。

## 你现在最该改的地方

- 把首页里的占位文案换成你们项目的真实内容
- 把按钮链接替换成实际仓库、文档、issue、discussion 或联系邮箱
- 如果要做组织主页，直接把仓库目标定成 `ai4s-yb.github.io`
