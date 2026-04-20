import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    title: string;
    backgroundImage?: string;
}

export default function Breadcrumb({
    items,
    title,
    backgroundImage = '/assets/img/hero/home-8/hero-thumb-2.jpg',
}: BreadcrumbProps) {
    return (
        <div
            className="togo-breadcrumb-area bg-pos"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '120px 0 80px',
                position: 'relative',
            }}
        >
            {/* Dark overlay */}
            <div
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(17,17,17,0.5)',
                    zIndex: 0,
                }}
            />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="togo-breadcrumb-content text-center">
                            <h2
                                style={{
                                    color: '#fff',
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: 40,
                                    fontWeight: 600,
                                    marginBottom: 16,
                                }}
                            >
                                {title}
                            </h2>
                            <nav aria-label="breadcrumb">
                                <ol
                                    className="breadcrumb justify-content-center"
                                    style={{ background: 'none', padding: 0, marginBottom: 0 }}
                                >
                                    {items.map((item, index) => {
                                        const isLast = index === items.length - 1;
                                        return (
                                            <li
                                                key={index}
                                                className={`breadcrumb-item${isLast ? ' active' : ''}`}
                                                style={{ color: isLast ? '#FD4621' : 'rgba(255,255,255,0.7)', fontSize: 14 }}
                                            >
                                                {!isLast && item.href ? (
                                                    <Link href={item.href} style={{ color: 'rgba(255,255,255,0.7)' }}>
                                                        {item.label}
                                                    </Link>
                                                ) : (
                                                    item.label
                                                )}
                                            </li>
                                        );
                                    })}
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .breadcrumb-item + .breadcrumb-item::before {
                    content: "•";
                    color: rgba(255,255,255,0.7);
                    padding: 0 10px;
                }
            `}</style>
        </div>
    );
}
