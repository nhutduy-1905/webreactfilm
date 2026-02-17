import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from 'react-icons/ai';
import { BiSortAlt2 } from 'react-icons/bi';
import { MdEdit, MdDelete, MdMoreVert } from 'react-icons/md';
import { useAppSelector } from '../store/index';

interface Reply {
  id: string;
  content: string;
  userName: string;
  userAvatar?: string;
  userId: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
}

interface Comment {
  id: string;
  content: string;
  userName: string;
  userAvatar?: string;
  userId: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  replies?: Reply[];
  replyCount?: number;
}

interface CommentSectionProps {
  movieId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ movieId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'top' | 'oldest'>('top');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const currentUser = useAppSelector((state) => state.profile.profile);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axios.get(`/api/comments/${movieId}?sort=${sortBy}&limit=50`);
      console.log('Comments response:', response.data);
      setComments(response.data.comments || []);
      setTotal(response.data.total || 0);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      setErrorMessage(error?.response?.data?.error || 'Khong tai duoc binh luan. Vui long thu lai.');
      setComments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [movieId, sortBy]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      console.log('Submitting comment for movie:', movieId, 'content:', newComment);
      const response = await axios.post('/api/comments/create', {
        content: newComment.trim(),
        movieId
      });
      console.log('Comment submitted successfully:', response.data);
      setNewComment('');
      setSuccessMessage('✓ Bình luận đã đăng thành công.');
      if (sortBy !== 'newest') {
        setSortBy('newest');
      } else {
        fetchComments();
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error posting comment:', error);
      alert(error.response?.data?.error || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeDislike = async (commentId: string, action: 'like' | 'dislike') => {
    try {
      const response = await axios.post('/api/comments/like', { commentId, action });
      // Update local state
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return response.data;
        }
        // Check if it's a reply
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => r.id === commentId ? response.data : r)
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error updating like/dislike:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return 'vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;
    if (diffMonths < 12) return `${diffMonths} tháng trước`;
    return `${diffYears} năm trước`;
  };

  const getAvatar = (userName: string, userAvatar?: string | null) => {
    if (userAvatar) {
      return <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />;
    }
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
        {userName.charAt(0).toUpperCase()}
      </div>
    );
  };

  const sortOptions = [
    { value: 'top', label: 'Bình luận hàng đầu' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' }
  ];

  return (
    <div className="px-4 md:px-12 mt-8 mb-12">
      <h2 className="text-white text-xl md:text-2xl font-semibold mb-6">
        {total} Bình luận
      </h2>

      {/* Sort Menu */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowSortMenu(!showSortMenu)}
          className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition"
        >
          <BiSortAlt2 className="text-xl" />
          <span className="font-medium">
            {sortOptions.find(opt => opt.value === sortBy)?.label}
          </span>
        </button>
        {showSortMenu && (
          <div className="absolute top-full left-0 mt-2 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 py-2 z-10 min-w-[200px]">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value as any);
                  setShowSortMenu(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-zinc-700 transition ${
                  sortBy === option.value ? 'text-white font-medium' : 'text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="flex gap-3 mb-8">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {getAvatar(currentUser?.name || 'User', currentUser?.image)}
        </div>
        <form onSubmit={handleSubmitComment} className="flex-1">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận..."
            className="w-full bg-transparent border-b border-zinc-700 focus:border-white text-white px-2 py-2 outline-none transition"
            disabled={submitting}
          />
          {successMessage && (
            <div className="text-green-500 text-sm mt-2">{successMessage}</div>
          )}
          {newComment.trim() && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setNewComment('')}
                className="px-4 py-2 text-white hover:bg-white/10 rounded-full transition"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Bình luận'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : errorMessage ? (
        <div className="text-center py-12">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Chưa có bình luận nào</p>
          <p className="text-gray-500 text-sm mt-2">Hãy là người đầu tiên bình luận!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              movieId={movieId}
              currentUserId={currentUser?.id}
              onLikeDislike={handleLikeDislike}
              onReplyAdded={fetchComments}
              getAvatar={getAvatar}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Comment Item Component
interface CommentItemProps {
  comment: Comment;
  movieId: string;
  currentUserId?: string;
  onLikeDislike: (commentId: string, action: 'like' | 'dislike') => void;
  onReplyAdded: () => void;
  getAvatar: (userName: string, userAvatar?: string | null) => JSX.Element;
  formatDate: (dateString: string) => string;
  isReply?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  movieId,
  currentUserId,
  onLikeDislike,
  onReplyAdded,
  getAvatar,
  formatDate,
  isReply = false
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);

  const isLiked = currentUserId && comment.likedBy?.includes(currentUserId);
  const isDisliked = currentUserId && comment.dislikedBy?.includes(currentUserId);
  const isOwner = currentUserId === comment.userId;

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;

    try {
      setSubmitting(true);
      await axios.post('/api/comments/reply', {
        content: replyText.trim(),
        movieId,
        parentId: comment.id
      });
      setReplyText('');
      setShowReplyForm(false);
      setShowReplies(true);
      onReplyAdded();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim() || submitting) return;

    try {
      setSubmitting(true);
      await axios.patch('/api/comments/edit', {
        commentId: comment.id,
        content: editText.trim()
      });
      setIsEditing(false);
      onReplyAdded(); // Refresh comments
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to edit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    try {
      setSubmitting(true);
      await axios.delete(`/api/comments/delete?commentId=${comment.id}`);
      onReplyAdded(); // Refresh comments
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={isReply ? 'ml-12' : ''}>
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {getAvatar(comment.userName, comment.userAvatar)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">{comment.userName}</span>
              <span className="text-gray-400 text-xs">{formatDate(comment.createdAt)}</span>
              {comment.status === 'pending' && (
                <span className="text-amber-300 text-xs">(Dang cho duyet)</span>
              )}
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-gray-500 text-xs">(đã chỉnh sửa)</span>
              )}
            </div>
            {isOwner && !isEditing && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
                >
                  <MdMoreVert className="text-lg" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 py-1 z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-700 transition text-white flex items-center gap-2"
                    >
                      <MdEdit /> Chỉnh sửa
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleDelete();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-700 transition text-red-500 flex items-center gap-2"
                    >
                      <MdDelete /> Xóa
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-white text-white px-3 py-2 rounded-md outline-none transition resize-none"
                rows={3}
                disabled={submitting}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.content);
                  }}
                  className="px-3 py-1 text-white hover:bg-white/10 rounded-full text-sm transition"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleEdit}
                  disabled={submitting || !editText.trim()}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white leading-relaxed mb-2">{comment.content}</p>
          )}
          
          {/* Like/Dislike/Reply Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLikeDislike(comment.id, 'like')}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition"
            >
              {isLiked ? <AiFillLike className="text-lg" /> : <AiOutlineLike className="text-lg" />}
              {comment.likes > 0 && <span className="text-sm">{comment.likes}</span>}
            </button>
            <button
              onClick={() => onLikeDislike(comment.id, 'dislike')}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition"
            >
              {isDisliked ? <AiFillDislike className="text-lg" /> : <AiOutlineDislike className="text-lg" />}
              {comment.dislikes > 0 && <span className="text-sm">{comment.dislikes}</span>}
            </button>
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-gray-400 hover:text-white text-sm font-medium transition"
              >
                Phản hồi
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết phản hồi..."
                className="flex-1 bg-transparent border-b border-zinc-700 focus:border-white text-white px-2 py-1 outline-none text-sm"
                disabled={submitting}
                autoFocus
              />
              <button
                type="submit"
                disabled={submitting || !replyText.trim()}
                className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? '...' : 'Gửi'}
              </button>
            </form>
          )}

          {/* Show Replies */}
          {!isReply && comment.replyCount && comment.replyCount > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-400 text-sm font-medium mt-3 transition"
            >
              <span>{showReplies ? '▼' : '▶'}</span>
              <span>{comment.replyCount} phản hồi</span>
            </button>
          )}

          {/* Replies List */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  movieId={movieId}
                  currentUserId={currentUserId}
                  onLikeDislike={onLikeDislike}
                  onReplyAdded={onReplyAdded}
                  getAvatar={getAvatar}
                  formatDate={formatDate}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
