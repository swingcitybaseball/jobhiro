import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { NavAuth } from "@/components/nav-auth";
import { auth } from "@clerk/nextjs/server";

const SITE_URL = "https://jobhiro.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
};

// Pre-render all post slugs at build time
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — JobHiro`,
    description: post.metaDescription,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.publishedAt,
      url: `${SITE_URL}/blog/${post.slug}`,
      images: [
        {
          url: `${SITE_URL}/og-blog.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { userId } = await auth();
  const isSignedIn = !!userId;
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  // Article structured data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Organization",
      name: "JobHiro",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "JobHiro",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      <article className="max-w-2xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/blog" className="hover:text-gray-600">
            Blog
          </Link>
          <span>/</span>
          <span className="text-gray-600">{post.category}</span>
        </div>

        {/* Header */}
        <header className="mb-10">
          <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
            {post.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mt-4 mb-4">
            {post.title}
          </h1>
          <time className="text-sm text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>

        {/* Top CTA */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-10">
          <p className="text-sm font-medium text-blue-900 mb-1">
            Want a resume tailored to a specific job?
          </p>
          <p className="text-sm text-blue-700 mb-3">
            Paste a job posting and your resume. JobHiro generates a tailored
            resume, cover letter, and interview prep in 60 seconds.
          </p>
          <Link
            href={SITE_URL}
            className="inline-block text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try JobHiro free →
          </Link>
        </div>

        {/* Post body */}
        <div
          className="prose prose-gray max-w-none
            [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-3
            [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-6 [&>h3]:mb-2
            [&>p]:text-gray-600 [&>p]:leading-relaxed [&>p]:mb-4
            [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ul>li]:text-gray-600 [&>ul>li]:mb-1
            [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>ol>li]:text-gray-600 [&>ol>li]:mb-1
            [&_strong]:font-semibold [&_strong]:text-gray-800
            [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-700"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Bottom CTA */}
        <div className="mt-12 bg-gray-900 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to put this into practice?
          </h3>
          <p className="text-gray-400 text-sm mb-5">
            JobHiro tailors your resume and cover letter to any job posting —
            match score, keywords, and all.
          </p>
          <Link
            href={SITE_URL}
            className="inline-block text-sm font-semibold bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get your tailored resume →
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <Link
            href="/blog"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
