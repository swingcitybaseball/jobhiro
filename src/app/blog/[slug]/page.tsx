import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { SiteNav } from "@/components/site-nav";

const SITE_URL = "https://jobhiro.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
};

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
      images: [{ url: `${SITE_URL}/og-blog.png`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: "JobHiro", url: SITE_URL },
    publisher: { "@type": "Organization", name: "JobHiro", url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#faf9f6", color: "#303330" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav />

      <article className="max-w-2xl mx-auto px-6 pt-36 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-10">
          <Link href="/blog" className="hover:text-on-surface transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-on-surface">{post.category}</span>
        </div>

        {/* Header */}
        <header className="mb-12">
          <span
            className="text-xs font-medium px-3 py-1 bg-primary-container text-on-primary-container"
            style={{ borderRadius: "9999px" }}
          >
            {post.category}
          </span>
          <h1
            className="text-4xl font-bold text-on-surface leading-tight mt-5 mb-4"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            {post.title}
          </h1>
          <time className="text-sm text-on-surface-variant">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>

        {/* Top CTA */}
        <div
          className="p-6 mb-12"
          style={{
            backgroundColor: "#ffac98",
            borderRadius: "1.5rem",
          }}
        >
          <p className="font-bold text-on-surface mb-1" style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}>
            Want a resume tailored to a specific job?
          </p>
          <p className="text-sm text-on-surface-variant mb-4">
            Paste a job posting and your resume. JobHiro generates a tailored resume, cover letter, and interview prep in 60 seconds.
          </p>
          <Link
            href="/#analysis"
            className="inline-block text-sm font-bold text-on-primary px-5 py-2.5 hover:scale-95 transition-transform"
            style={{ borderRadius: "9999px", background: "linear-gradient(135deg, #a43e24, #ffac98)" }}
          >
            Try JobHiro free →
          </Link>
        </div>

        {/* Post body */}
        <div
          className="prose max-w-none
            [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-on-surface [&>h2]:mt-10 [&>h2]:mb-4
            [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-on-surface [&>h3]:mt-8 [&>h3]:mb-3
            [&>p]:text-on-surface-variant [&>p]:leading-relaxed [&>p]:mb-5
            [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-5 [&>ul>li]:text-on-surface-variant [&>ul>li]:mb-1.5
            [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-5 [&>ol>li]:text-on-surface-variant [&>ol>li]:mb-1.5
            [&_strong]:font-semibold [&_strong]:text-on-surface
            [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary-dim"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Bottom CTA */}
        <div
          className="mt-16 p-10 text-center relative overflow-hidden"
          style={{
            borderRadius: "2rem",
            background: "linear-gradient(135deg, #a43e24, #ff8162)",
          }}
        >
          <h3
            className="text-2xl font-bold text-on-primary mb-3"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Ready to put this into practice?
          </h3>
          <p className="text-sm mb-6" style={{ color: "rgba(255,247,246,0.8)" }}>
            JobHiro tailors your resume and cover letter to any job posting — match score, keywords, and all.
          </p>
          <Link
            href="/#analysis"
            className="inline-block text-sm font-bold bg-surface-container-lowest text-primary px-6 py-3 hover:scale-105 transition-transform"
            style={{ borderRadius: "9999px" }}
          >
            Get your tailored resume →
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgba(177,178,175,0.4)" }}>
          <Link href="/blog" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}
