import BlogDetailClient from "@/src/components/blog/BlogDetailClient";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params;
    return <BlogDetailClient slug={slug} />;
}
