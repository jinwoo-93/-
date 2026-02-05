import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedPost {
  id: string;
  title: string;
  titleZh?: string;
  priceKRW: number;
  priceCNY?: number;
  images: string[];
  tradeDirection: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  posts: RecentlyViewedPost[];
  addPost: (post: Omit<RecentlyViewedPost, 'viewedAt'>) => void;
  removePost: (postId: string) => void;
  clearAll: () => void;
}

const MAX_RECENT_POSTS = 20;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      posts: [],

      addPost: (post) => {
        const { posts } = get();

        // 이미 있는 상품이면 제거 후 맨 앞에 추가
        const filtered = posts.filter((p) => p.id !== post.id);

        const newPost: RecentlyViewedPost = {
          ...post,
          viewedAt: Date.now(),
        };

        // 최대 개수 제한
        const updatedPosts = [newPost, ...filtered].slice(0, MAX_RECENT_POSTS);

        set({ posts: updatedPosts });
      },

      removePost: (postId) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== postId),
        }));
      },

      clearAll: () => {
        set({ posts: [] });
      },
    }),
    {
      name: 'recently-viewed-posts',
    }
  )
);
