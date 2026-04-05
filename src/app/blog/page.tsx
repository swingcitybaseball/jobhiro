import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { NavAuth } from "@/components/nav-auth";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Career Advice Blog — JobHiro",
  description:
    "Resume tips, cover letter examples, and interview prep guides for job seekers in 2026.",
};

export default async function BlogIndexPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-gray-900">
            JobHiro
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Blog
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Pricing
            </Link>
            <NavAuth isSignedIn={isSignedIn} />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Career Advice
          </h1>
          <p className="text-gray-500 text-lg">
            Practical guides on resumes, cover letters, and interviews.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-400">No posts yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <article key={post.slug} className="py-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {post.category}
                  </span>
                  <time className="text-xs text-gray-400">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">
                  {post.metaDescription}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
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
