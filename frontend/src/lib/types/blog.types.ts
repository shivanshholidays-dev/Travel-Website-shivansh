import { BlogCategory } from '../constants/enums';
import { User } from './user.types';

export interface Blog {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    author: User | string;
    category: BlogCategory | string;
    tags: string[];
    isPublished: boolean;
    publishedAt?: string;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

export type CreateBlogPayload = Pick<Blog, 'title' | 'content' | 'excerpt' | 'category' | 'tags'> & Partial<Pick<Blog, 'featuredImage'>>;
export type UpdateBlogPayload = Partial<CreateBlogPayload>;
