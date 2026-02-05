/**
 * IndexedDB 评论数据库管理
 * 
 * 功能：
 * - 存储文章评论到浏览器本地
 * - 支持评论的增删改查
 * - 支持回复和点赞
 */

// 评论类型定义
export interface Comment {
  id: string;
  articleId: string;       // 文章标识（slug）
  parentId: string | null; // 父评论 ID（用于回复）
  userId: string;          // 用户 ID（匿名用户使用随机 ID）
  userName: string;        // 用户名
  userAvatar: string;      // 用户头像 URL
  content: string;         // 评论内容
  likes: number;           // 点赞数
  likedBy: string[];       // 点赞用户 ID 列表
  createdAt: number;       // 创建时间戳
  updatedAt: number;       // 更新时间戳
}

// 用户信息类型
export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

const DB_NAME = "blog_comments_db";
const DB_VERSION = 1;
const COMMENTS_STORE = "comments";
const USER_STORE = "user";

let dbInstance: IDBDatabase | null = null;

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 打开/创建数据库
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("打开 IndexedDB 失败:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建评论存储
      if (!db.objectStoreNames.contains(COMMENTS_STORE)) {
        const commentStore = db.createObjectStore(COMMENTS_STORE, { keyPath: "id" });
        // 创建索引以便按文章查询
        commentStore.createIndex("articleId", "articleId", { unique: false });
        commentStore.createIndex("parentId", "parentId", { unique: false });
        commentStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // 创建用户信息存储
      if (!db.objectStoreNames.contains(USER_STORE)) {
        db.createObjectStore(USER_STORE, { keyPath: "id" });
      }
    };
  });
}

/**
 * 获取当前用户信息（如果不存在则创建匿名用户）
 */
export async function getCurrentUser(): Promise<UserInfo> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], "readwrite");
    const store = transaction.objectStore(USER_STORE);
    const request = store.get("current_user");

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        // 创建匿名用户（不再使用固定头像，头像由 RandomAvatar 组件根据 ID 生成）
        const newUser: UserInfo = {
          id: generateId(),
          name: `访客${Math.floor(Math.random() * 10000)}`,
          avatar: "", // 空字符串，使用 RandomAvatar 组件生成
          createdAt: Date.now(),
        };
        
        // 保存用户信息
        const addRequest = store.put({ ...newUser, id: "current_user", odId: newUser.id });
        addRequest.onsuccess = () => resolve(newUser);
        addRequest.onerror = () => reject(addRequest.error);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * 更新当前用户信息
 */
export async function updateCurrentUser(updates: Partial<Pick<UserInfo, "name" | "avatar">>): Promise<UserInfo> {
  const db = await openDB();
  const currentUser = await getCurrentUser();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USER_STORE], "readwrite");
    const store = transaction.objectStore(USER_STORE);
    
    const updatedUser = {
      ...currentUser,
      ...updates,
      id: "current_user",
      odId: currentUser.id,
    };
    
    const request = store.put(updatedUser);
    
    request.onsuccess = () => {
      resolve({
        id: currentUser.id,
        name: updates.name || currentUser.name,
        avatar: updates.avatar || currentUser.avatar,
        createdAt: currentUser.createdAt,
      });
    };
    
    request.onerror = () => reject(request.error);
  });
}

/**
 * 获取文章的所有评论
 */
export async function getCommentsByArticle(articleId: string): Promise<Comment[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([COMMENTS_STORE], "readonly");
    const store = transaction.objectStore(COMMENTS_STORE);
    const index = store.index("articleId");
    const request = index.getAll(articleId);

    request.onsuccess = () => {
      // 按创建时间排序（新的在前）
      const comments = request.result.sort((a, b) => b.createdAt - a.createdAt);
      resolve(comments);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * 添加评论
 */
export async function addComment(
  articleId: string,
  content: string,
  parentId: string | null = null
): Promise<Comment> {
  const db = await openDB();
  const user = await getCurrentUser();
  
  const comment: Comment = {
    id: generateId(),
    articleId,
    parentId,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    content: content.trim(),
    likes: 0,
    likedBy: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([COMMENTS_STORE], "readwrite");
    const store = transaction.objectStore(COMMENTS_STORE);
    const request = store.add(comment);

    request.onsuccess = () => resolve(comment);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 更新评论内容
 */
export async function updateComment(commentId: string, content: string): Promise<Comment | null> {
  const db = await openDB();
  const user = await getCurrentUser();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([COMMENTS_STORE], "readwrite");
    const store = transaction.objectStore(COMMENTS_STORE);
    const getRequest = store.get(commentId);

    getRequest.onsuccess = () => {
      const comment = getRequest.result;
      if (!comment) {
        resolve(null);
        return;
      }

      // 只能编辑自己的评论
      if (comment.userId !== user.id) {
        reject(new Error("无权编辑此评论"));
        return;
      }

      const updatedComment = {
        ...comment,
        content: content.trim(),
        updatedAt: Date.now(),
      };

      const putRequest = store.put(updatedComment);
      putRequest.onsuccess = () => resolve(updatedComment);
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * 删除评论
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  const db = await openDB();
  const user = await getCurrentUser();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([COMMENTS_STORE], "readwrite");
    const store = transaction.objectStore(COMMENTS_STORE);
    const getRequest = store.get(commentId);

    getRequest.onsuccess = () => {
      const comment = getRequest.result;
      if (!comment) {
        resolve(false);
        return;
      }

      // 只能删除自己的评论
      if (comment.userId !== user.id) {
        reject(new Error("无权删除此评论"));
        return;
      }

      const deleteRequest = store.delete(commentId);
      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * 切换评论点赞状态
 */
export async function toggleCommentLike(commentId: string): Promise<Comment | null> {
  const db = await openDB();
  const user = await getCurrentUser();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([COMMENTS_STORE], "readwrite");
    const store = transaction.objectStore(COMMENTS_STORE);
    const getRequest = store.get(commentId);

    getRequest.onsuccess = () => {
      const comment = getRequest.result;
      if (!comment) {
        resolve(null);
        return;
      }

      const likedBy = comment.likedBy || [];
      const userIndex = likedBy.indexOf(user.id);
      
      if (userIndex === -1) {
        // 点赞
        likedBy.push(user.id);
      } else {
        // 取消点赞
        likedBy.splice(userIndex, 1);
      }

      const updatedComment = {
        ...comment,
        likes: likedBy.length,
        likedBy,
        updatedAt: Date.now(),
      };

      const putRequest = store.put(updatedComment);
      putRequest.onsuccess = () => resolve(updatedComment);
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * 检查当前用户是否已点赞某评论
 */
export async function hasUserLiked(commentId: string): Promise<boolean> {
  const db = await openDB();
  const user = await getCurrentUser();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([COMMENTS_STORE], "readonly");
    const store = transaction.objectStore(COMMENTS_STORE);
    const request = store.get(commentId);

    request.onsuccess = () => {
      const comment = request.result;
      if (!comment) {
        resolve(false);
        return;
      }
      resolve((comment.likedBy || []).includes(user.id));
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * 获取评论总数
 */
export async function getCommentCount(articleId: string): Promise<number> {
  const comments = await getCommentsByArticle(articleId);
  return comments.length;
}

/**
 * 格式化时间差
 */
export function formatTimeAgo(timestamp: number, locale: string = "zh"): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (locale.startsWith("en")) {
    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "just now";
  }

  if (years > 0) return `${years}年前`;
  if (months > 0) return `${months}个月前`;
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return "刚刚";
}

/**
 * 清除所有评论（用于调试）
 */
export async function clearAllComments(): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([COMMENTS_STORE], "readwrite");
    const store = transaction.objectStore(COMMENTS_STORE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
