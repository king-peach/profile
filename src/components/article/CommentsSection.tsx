import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiCornerDownRight, FiEdit2, FiMessageCircle, FiThumbsUp, FiTrash2, FiUser, FiX } from "react-icons/fi";
import { useTheme } from "../ThemeContext";
import RandomAvatar from "../ui/RandomAvatar";
import {
  type Comment,
  type UserInfo,
  addComment,
  deleteComment,
  formatTimeAgo,
  getCommentsByArticle,
  getCurrentUser,
  toggleCommentLike,
  updateComment,
  updateCurrentUser,
} from "../../lib/commentDB";

function CommentItem({
  comment,
  currentUser,
  onLike,
  onReply,
  onDelete,
  onEdit,
  replies,
  locale,
}: {
  comment: Comment;
  currentUser: UserInfo | null;
  onLike: (id: string) => void;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  replies: Comment[];
  locale: string;
}) {
  const { dark, accent } = useTheme();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = currentUser?.id === comment.userId;
  const hasLiked = currentUser ? (comment.likedBy || []).includes(currentUser.id) : false;

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3">
      <RandomAvatar seed={comment.userId || comment.userName} size={40} className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`font-medium text-sm ${dark ? "text-white" : "text-gray-900"}`}>{comment.userName}</span>
          {isOwner && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: `${accent}20`, color: accent }}
            >
              {t("articleDetail.you", { defaultValue: "我" })}
            </span>
          )}
          <span className={`text-xs ${dark ? "text-white/50" : "text-gray-500"}`}>{formatTimeAgo(comment.createdAt, locale)}</span>
          {comment.updatedAt > comment.createdAt + 1000 && (
            <span className={`text-xs ${dark ? "text-white/40" : "text-gray-400"}`}>
              ({t("articleDetail.edited", { defaultValue: "已编辑" })})
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              ref={(el) => {
                if (!el) return;
                el.focus();
                el.setSelectionRange(el.value.length, el.value.length);
              }}
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm resize-none ${
                dark ? "bg-zinc-800 text-white border-zinc-700" : "bg-gray-50 text-gray-900 border-gray-200"
              } border focus:outline-none focus:ring-2`}
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                style={{ backgroundColor: accent }}
              >
                {t("articleDetail.save", { defaultValue: "保存" })}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dark ? "bg-zinc-700 text-white/80" : "bg-gray-200 text-gray-700"
                }`}
              >
                {t("articleDetail.cancel", { defaultValue: "取消" })}
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-sm leading-relaxed ${dark ? "text-white/80" : "text-gray-700"}`}>{comment.content}</p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                hasLiked ? "" : dark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-gray-700"
              }`}
              style={hasLiked ? { color: accent } : undefined}
            >
              <FiThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? "fill-current" : ""}`} />
              {comment.likes > 0 && comment.likes}
            </button>
            <button
              onClick={() => onReply(comment.id)}
              className={`flex items-center gap-1 text-xs ${
                dark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiCornerDownRight className="w-3.5 h-3.5" />
              {t("articleDetail.reply", { defaultValue: "回复" })}
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1 text-xs ${
                    dark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                  {t("articleDetail.edit", { defaultValue: "编辑" })}
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className={`flex items-center gap-1 text-xs ${
                    dark ? "text-red-400/70 hover:text-red-400" : "text-red-500/70 hover:text-red-500"
                  }`}
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  {t("articleDetail.delete", { defaultValue: "删除" })}
                </button>
              </>
            )}
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={`text-xs mb-3 ${dark ? "text-white/60" : "text-gray-500"}`}
            >
              {showReplies ? "▼" : "▶"} {replies.length} {t("articleDetail.replies", { defaultValue: "条回复" })}
            </button>
            {showReplies && (
              <div className="space-y-4 pl-4 border-l-2" style={{ borderColor: dark ? "#3f3f46" : "#e5e7eb" }}>
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUser={currentUser}
                    onLike={onLike}
                    onReply={onReply}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    replies={[]}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentsSection({ articleId }: { articleId: string }) {
  const { dark, accent } = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserName, setEditingUserName] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [commentsData, userData] = await Promise.all([getCommentsByArticle(articleId), getCurrentUser()]);
      setComments(commentsData);
      setCurrentUser(userData);
    } catch (error) {
      console.error("加载评论失败:", error);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addComment(articleId, newComment);
      setNewComment("");
      await loadData();
    } catch (error) {
      console.error("发表评论失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addComment(articleId, replyContent, parentId);
      setReplyContent("");
      setReplyingTo(null);
      await loadData();
    } catch (error) {
      console.error("回复失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await toggleCommentLike(commentId);
      await loadData();
    } catch (error) {
      console.error("点赞失败:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm(t("articleDetail.confirmDelete", { defaultValue: "确定要删除这条评论吗？" }))) {
      return;
    }

    try {
      await deleteComment(commentId);
      await loadData();
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, content);
      await loadData();
    } catch (error) {
      console.error("编辑失败:", error);
    }
  };

  const handleUpdateUserName = async () => {
    if (!editingUserName.trim()) return;

    try {
      const updated = await updateCurrentUser({ name: editingUserName.trim() });
      setCurrentUser(updated);
      setShowUserModal(false);
    } catch (error) {
      console.error("更新用户名失败:", error);
    }
  };

  const topLevelComments = comments.filter((comment) => !comment.parentId);
  const getReplies = (parentId: string) => comments.filter((comment) => comment.parentId === parentId);

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}>
            <FiMessageCircle className="w-5 h-5" />
            {t("articleDetail.comments", { defaultValue: "评论" })} ({comments.length})
          </h2>

          {currentUser && (
            <button
              onClick={() => {
                setEditingUserName(currentUser.name);
                setShowUserModal(true);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                dark ? "bg-zinc-800 text-white/80 hover:bg-zinc-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <RandomAvatar seed={currentUser.id} size={20} />
              <span>{currentUser.name}</span>
              <FiEdit2 className="w-3 h-3 opacity-60" />
            </button>
          )}
        </div>

        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className={`w-full max-w-sm mx-4 p-6 rounded-2xl shadow-2xl ${dark ? "bg-zinc-900" : "bg-white"}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${dark ? "text-white" : "text-gray-900"}`}>
                  <FiUser className="inline-block mr-2 w-5 h-5" />
                  {t("articleDetail.editProfile", { defaultValue: "编辑资料" })}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className={`p-1 rounded-lg ${dark ? "hover:bg-zinc-800" : "hover:bg-gray-100"}`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-1.5 ${dark ? "text-white/70" : "text-gray-600"}`}>
                    {t("articleDetail.userName", { defaultValue: "昵称" })}
                  </label>
                  <input
                    type="text"
                    value={editingUserName}
                    onChange={(event) => setEditingUserName(event.target.value)}
                    maxLength={20}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm ${
                      dark ? "bg-zinc-800 text-white border-zinc-700" : "bg-gray-50 text-gray-900 border-gray-200"
                    } border focus:outline-none focus:ring-2`}
                    placeholder={t("articleDetail.userNamePlaceholder", { defaultValue: "输入昵称（最多20字）" })}
                  />
                </div>
                <p className={`text-xs ${dark ? "text-white/50" : "text-gray-500"}`}>
                  {t("articleDetail.localStorageNote", {
                    defaultValue: "评论数据存储在本地浏览器中，清除浏览器数据后将丢失。",
                  })}
                </p>
                <button
                  onClick={handleUpdateUserName}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: accent }}
                >
                  {t("articleDetail.save", { defaultValue: "保存" })}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-8">
          <RandomAvatar seed={currentUser?.id || "guest"} size={40} className="flex-shrink-0" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder={t("articleDetail.commentPlaceholder", { defaultValue: "分享你的想法..." })}
              className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${
                dark ? "bg-zinc-800 text-white border-zinc-700" : "bg-gray-50 text-gray-900 border-gray-200"
              } border focus:outline-none focus:ring-2`}
              rows={3}
              maxLength={1000}
            />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${dark ? "text-white/40" : "text-gray-400"}`}>{newComment.length}/1000</span>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ backgroundColor: accent }}
              >
                {isSubmitting
                  ? t("articleDetail.posting", { defaultValue: "发布中..." })
                  : t("articleDetail.postComment", { defaultValue: "发表评论" })}
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((item) => (
              <div key={item} className="flex gap-3 animate-pulse">
                <div className={`w-10 h-10 rounded-full ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-32 rounded ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
                  <div className={`h-4 w-full rounded ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
                  <div className={`h-4 w-3/4 rounded ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className={`text-center py-12 ${dark ? "text-white/50" : "text-gray-500"}`}>
            <FiMessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t("articleDetail.noComments", { defaultValue: "还没有评论，来说点什么吧~" })}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {topLevelComments.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onReply={(id) => {
                    setReplyingTo(id);
                    setReplyContent("");
                  }}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  replies={getReplies(comment.id)}
                  locale={locale}
                />

                {replyingTo === comment.id && (
                  <div className="ml-13 mt-4 pl-4 border-l-2" style={{ borderColor: dark ? "#3f3f46" : "#e5e7eb" }}>
                    <div className="flex gap-3">
                      <RandomAvatar seed={currentUser?.id || "guest"} size={32} className="flex-shrink-0" />
                      <div className="flex-1">
                        <textarea
                          value={replyContent}
                          onChange={(event) => setReplyContent(event.target.value)}
                          placeholder={t("articleDetail.replyPlaceholder", {
                            defaultValue: `回复 ${comment.userName}...`,
                            name: comment.userName,
                          })}
                          className={`w-full px-3 py-2 rounded-lg text-sm resize-none ${
                            dark ? "bg-zinc-800 text-white border-zinc-700" : "bg-gray-50 text-gray-900 border-gray-200"
                          } border focus:outline-none focus:ring-2`}
                          rows={2}
                          autoFocus
                          maxLength={500}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim() || isSubmitting}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-50"
                            style={{ backgroundColor: accent }}
                          >
                            {t("articleDetail.reply", { defaultValue: "回复" })}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              dark ? "bg-zinc-700 text-white/80" : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {t("articleDetail.cancel", { defaultValue: "取消" })}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
