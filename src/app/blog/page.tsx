import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Career Advice Blog — JobHiro",
  description:
    "Resume tips, cover letter examples, and interview prep guides for job seekers in 2026.",
};

export default async function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#faf9f6", color: "#303330" }}>
      <SiteNav />

      <div className="max-w-4xl mx-auto px-6 pt-36 pb-20">
        <div className="mb-16">
          <h1
            className="text-5xl font-bold text-on-surface mb-4"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Career Advice
          </h1>
          <p className="text-lg text-on-surface-variant">
            Practical guides on resumes, cover letters, and interviews.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-on-surface-variant">No posts yet.</p>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-surface-container-lowest p-8"
                style={{ borderRadius: "1.5rem", boxShadow: "0px 2px 8px rgba(48, 51, 48, 0.04)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-xs font-medium px-3 py-1 bg-primary-container text-on-primary-container"
                    style={{ borderRadius: "9999px" }}
                  >
                    {post.category}
                  </span>
                  <time className="text-xs text-on-surface-variant">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <h2
                  className="text-2xl font-bold text-on-surface mb-3 leading-snug"
                  style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
                >
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                  {post.metaDescription}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-primary hover:text-primary-dim transition-colors"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
