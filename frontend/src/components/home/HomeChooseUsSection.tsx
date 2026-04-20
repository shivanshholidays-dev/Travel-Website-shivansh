'use client';

import { useHomeHooks } from '@/src/lib/hooks/useHomeHooks';

export default function HomeChooseUsSection() {
    const { useHomeData } = useHomeHooks();
    const { data: homeRes } = useHomeData();
    const settings = homeRes?.data?.settings;
    const aboutContent = settings?.aboutContent;

    const defaultItems = [
        { title: 'Trusted', description: '40 years of operating; fully bonded and your money 100% protected.', icon: '/assets/img/icon/home-3/chose-1.svg' },
        { title: 'Worldwide', description: '400 Guided Group and Self-Guided adventures in 100 countries.', icon: '/assets/img/icon/home-3/chose-2.svg' },
        { title: 'Sustainable', description: '100% carbon absorption. Caring for the environment and local communities.', icon: '/assets/img/icon/home-3/chose-3.svg' }
    ];

    const items = aboutContent?.whyChooseUs?.length
        ? aboutContent.whyChooseUs.map((item: any, idx: number) => ({
            title: item.title || '',
            description: item.description || '',
            icon: item.icon || `/assets/img/icon/home-3/chose-${(idx % 3) + 1}.svg`
        }))
        : defaultItems;

    return (
        <div className="togo-chose-3-sec pt-80 pb-50">
            <div className="container container-1440">
                <div className="row">
                    <div className="col-lg-3 col-sm-6">
                        <div className="togo-chose-3-heading mb-30 fade-anim">
                            <span className="togo-section-subtitle">Travel Your Way</span>
                            <h4 className="togo-section-title mb-12">
                                {aboutContent?.heroTitle || 'Celebrating 40 Years of Adventure Travel'}
                            </h4>
                        </div>
                    </div>
                    {items.slice(0, 3).map((item: any, idx: number) => (
                        <div className="col-lg-3 col-sm-6" key={idx}>
                            <div className="togo-chose-3-item pl-45 mb-30 fade-anim">
                                <div className="togo-chose-3-item-icon mb-20">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.icon.startsWith('http') || item.icon.startsWith('/') ? item.icon : `/assets/img/icon/home-3/chose-${(idx % 3) + 1}.svg`} alt={item.title} />
                                </div>
                                <div className="togo-chose-3-item-content">
                                    <h4 className="togo-chose-item-title">
                                        {item.title}
                                    </h4>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
