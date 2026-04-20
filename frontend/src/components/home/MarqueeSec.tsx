'use client';

import Marquee from 'react-fast-marquee';

export default function MarqueeSec({ items }: { items: string[] }) {
    return (
        <div className="togo-text-marquee-sec">
            <div className="togo-text-marquee-wrapper">
                <div className="togo-marquee">
                    <Marquee speed={50} gradient={false} className="togo-marquee-inner d-flex">
                        {items.map((item, i) => (
                            <div key={i} className="togo-marquee-item mx-4" style={{ display: 'inline-block' }}>
                                <a href="#">{item}</a>
                            </div>
                        ))}
                    </Marquee>
                </div>
            </div>
        </div>
    );
}
