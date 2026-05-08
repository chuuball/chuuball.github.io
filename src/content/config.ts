import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    header: z.string(),
    date: z.coerce.date(),
    tagline: z.string(),
    subtitle: z.string(),
    image: z.string().optional(),
    song: z.string().optional(),
    affirmations: z.array(z.string()).default([]),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    heading: z.string(),
  }),
});

const site = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    banner: z.string().optional(),
    marquee: z.array(z.string()).default([]),
    socialLinks: z.array(z.object({
      label: z.string(),
      url: z.string(),
    })).default([]),
  }),
});

const sidebar = defineCollection({
  type: 'content',
  schema: z.object({
    avatar: z.string().optional(),
    bio: z.array(z.string()).default([]),
    likes: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).default([]),
  }),
});

export const collections = { posts, pages, site, sidebar };
