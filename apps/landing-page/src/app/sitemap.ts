import type { MetadataRoute } from "next";

/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml for SEO
 *
 * In production, extend this to include:
 * - Dynamic blog posts
 * - Product pages
 * - Other dynamic content
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://diamond.com.br";
  const lastModified = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/lgpd`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // TODO: Add dynamic pages here
  // Example:
  // const blogPosts = await getBlogPosts();
  // const dynamicPages = blogPosts.map((post) => ({
  //   url: `${baseUrl}/blog/${post.slug}`,
  //   lastModified: post.updatedAt,
  //   changeFrequency: "weekly" as const,
  //   priority: 0.7,
  // }));

  return [...staticPages];
}
