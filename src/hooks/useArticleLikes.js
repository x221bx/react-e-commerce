import { useState, useEffect } from 'react';
import {
  addArticleLike,
  addArticleDislike,
  removeArticleLike,
  removeArticleDislike
} from '../services/articlesService';

// Hook for article likes that uses Firebase
const useArticleLikes = (articleId) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [canInteract, setCanInteract] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get current user ID
  useEffect(() => {
    const getCurrentUserId = () => {
      try {
        const authUser = JSON.parse(localStorage.getItem('authUser') || 'null');
        return authUser?.uid || null;
      } catch {
        return null;
      }
    };

    const userId = getCurrentUserId();
    setCurrentUserId(userId);
    setCanInteract(!!userId);
  }, []);

  // Load like status from user's likedArticles/dislikedArticles arrays
  // This would need to be implemented by checking the user's document
  // For now, we'll use localStorage as a cache but sync with Firebase
  useEffect(() => {
    if (articleId && currentUserId) {
      // Check localStorage cache first
      const likedArticles = JSON.parse(localStorage.getItem(`likedArticles_${currentUserId}`) || '[]');
      const dislikedArticles = JSON.parse(localStorage.getItem(`dislikedArticles_${currentUserId}`) || '[]');

      setIsLiked(likedArticles.includes(articleId));
      setIsDisliked(dislikedArticles.includes(articleId));
    } else {
      setIsLiked(false);
      setIsDisliked(false);
    }
  }, [articleId, currentUserId]);

  const handleLike = async () => {
    if (!articleId || !canInteract || !currentUserId || loading) return;

    setLoading(true);
    try {
      if (isLiked) {
        // Remove like
        await removeArticleLike(currentUserId, articleId);
        setIsLiked(false);
      } else {
        // Add like (this will also remove dislike if exists)
        await addArticleLike(currentUserId, articleId);
        setIsLiked(true);
        setIsDisliked(false);
      }

      // Update localStorage cache
      const likedArticles = JSON.parse(localStorage.getItem(`likedArticles_${currentUserId}`) || '[]');
      const dislikedArticles = JSON.parse(localStorage.getItem(`dislikedArticles_${currentUserId}`) || '[]');

      let newLikedArticles, newDislikedArticles;

      if (isLiked) {
        // Removing like
        newLikedArticles = likedArticles.filter(id => id !== articleId);
        newDislikedArticles = dislikedArticles;
      } else {
        // Adding like
        newLikedArticles = [...likedArticles.filter(id => id !== articleId), articleId];
        newDislikedArticles = dislikedArticles.filter(id => id !== articleId);
      }

      localStorage.setItem(`likedArticles_${currentUserId}`, JSON.stringify(newLikedArticles));
      localStorage.setItem(`dislikedArticles_${currentUserId}`, JSON.stringify(newDislikedArticles));

      console.log(`Article ${articleId} ${isLiked ? 'unliked' : 'liked'} by user ${currentUserId}`);

    } catch (error) {
      console.error('Error handling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!articleId || !canInteract || !currentUserId || loading) return;

    setLoading(true);
    try {
      if (isDisliked) {
        // Remove dislike
        await removeArticleDislike(currentUserId, articleId);
        setIsDisliked(false);
      } else {
        // Add dislike (this will also remove like if exists)
        await addArticleDislike(currentUserId, articleId);
        setIsDisliked(true);
        setIsLiked(false);
      }

      // Update localStorage cache
      const likedArticles = JSON.parse(localStorage.getItem(`likedArticles_${currentUserId}`) || '[]');
      const dislikedArticles = JSON.parse(localStorage.getItem(`dislikedArticles_${currentUserId}`) || '[]');

      let newLikedArticles, newDislikedArticles;

      if (isDisliked) {
        // Removing dislike
        newDislikedArticles = dislikedArticles.filter(id => id !== articleId);
        newLikedArticles = likedArticles;
      } else {
        // Adding dislike
        newDislikedArticles = [...dislikedArticles.filter(id => id !== articleId), articleId];
        newLikedArticles = likedArticles.filter(id => id !== articleId);
      }

      localStorage.setItem(`likedArticles_${currentUserId}`, JSON.stringify(newLikedArticles));
      localStorage.setItem(`dislikedArticles_${currentUserId}`, JSON.stringify(newDislikedArticles));

      console.log(`Article ${articleId} ${isDisliked ? 'undisliked' : 'disliked'} by user ${currentUserId}`);

    } catch (error) {
      console.error('Error handling dislike:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    isDisliked,
    handleLike,
    handleDislike,
    canInteract,
    loading
  };
};

export default useArticleLikes;