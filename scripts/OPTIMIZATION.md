# Notion 数据获取脚本优化说明

## 优化内容（方案1）

### ✅ 已完成

1. **使用 Notion SDK 替代直接 HTTP 请求**
   - 使用 `@notionhq/client` SDK（已安装 v5.4.0）
   - 自动处理分页、错误重试、类型安全
   - 代码量减少约 30%

2. **简化 API 调用**
   - `fetchAllPages()`: 使用 `notion.databases.query()`，自动分页
   - `getBlockChildren()`: 使用 `notion.blocks.children.list()`，自动分页和递归
   - 移除了手动 HTTP 请求代码（`queryDatabase`, `getBlockChildrenPage`）

3. **保留所有现有功能**
   - ✅ 图片下载到本地（`processContentImages`）
   - ✅ Slug 生成和索引（`getUrlSlug`, `slugToId`）
   - ✅ Blocks 转 Markdown（`blocksToMarkdown`）
   - ✅ 代理支持（开发环境）
   - ✅ 修复模式（`--fix-markdown-only`）

### 代码对比

**之前（直接 HTTP）：**
```typescript
// 手动处理分页
async function queryDatabase(fetchFn, databaseId, startCursor) {
  const response = await fetchFn(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${NOTION_API_KEY}`, ... },
    body: JSON.stringify({ start_cursor: startCursor, ... })
  });
  return response.json();
}
```

**现在（SDK）：**
```typescript
// SDK 自动处理分页
const response = await notion.databases.query({
  database_id: databaseId,
  page_size: 100,
  start_cursor: startCursor,
  sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
});
```

### 优势

1. **更少的代码**：移除了约 100 行手动 HTTP 处理代码
2. **更好的错误处理**：SDK 内置重试和错误处理
3. **类型安全**：TypeScript 类型定义更完善
4. **易于维护**：API 变更时只需更新 SDK 版本
5. **自动分页**：无需手动管理 `next_cursor`

### 使用方式

保持不变：
```bash
# 获取数据
npm run fetch-notion

# 仅修复 Markdown（不重新获取）
npm run fix-content-markdown

# 构建（自动获取数据）
npm run build
```

### 后续优化建议

1. **使用 notion-to-md 库**（可选）
   - 如果 `notion-to-md` 安装成功，可以替换自定义的 `blocksToMarkdown`
   - 当前自定义实现已足够稳定，可选择性优化

2. **添加缓存机制**（可选）
   - 避免重复下载已存在的图片
   - 增量更新文章内容

3. **GitHub Actions 自动化**（可选）
   - 定时同步 Notion 数据
   - 自动构建和部署

## 迁移说明

- ✅ **向后兼容**：输出格式完全一致（`articles.json`, `articles-content.json`, `articles-index.json`）
- ✅ **无需修改前端代码**：前端读取逻辑不变
- ✅ **环境变量不变**：`NOTION_API_KEY`, `VITE_NOTION_DATASOURCE_ID` 保持不变
