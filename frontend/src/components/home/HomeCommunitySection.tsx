'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function HomeCommunitySection() {
    const [email, setEmail] = useState('');

    const handleNewsletter = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Simulating API call
        toast.success('Thank you for subscribing!');
        setEmail('');
    };

    return (
        <div className="togo-community-sec pt-190 pb-190 togo-community-3-bg bg-pos" style={{ backgroundImage: 'url(/assets/img/cta/comunity-bg.png)' }}>
            <div className="togo-community-3-bg-shape">
                <div className="shape-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/img/cta/comunity-shape-1.png" alt="Shape" />
                </div>
                <div className="shape-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/img/cta/comunity-shape-2.png" alt="Shape" />
                </div>
            </div>
            <div className="container container-1440">
                <div className="row">
                    <div className="col-xxl-4 col-lg-6 col-md-8 col-sm-10 col-12">
                        <div className="togo-community-heading z-index-1">
                            <h3 className="togo-section-title p-relative fade-anim" data-delay=".3">Don’t miss a thing!</h3>
                            <div className="togo-community-text fade-anim" data-delay=".5">
                                <p>The latest travel offers & inspiration straight to your inbox.</p>
                            </div>
                            <div className="togo-community-input fade-anim" data-delay=".7">
                                <form className="p-relative" onSubmit={handleNewsletter}>
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className="togo-community-input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17" fill="none">
                                            <path d="M17.861 1.95098L13.4377 6.06582C11.7541 7.4688 10.9123 8.1703 9.91667 8.1703C8.92103 8.1703 8.07924 7.46881 6.39565 6.06582L1.9723 1.95098M9.91667 15.4167C5.59546 15.4167 3.43485 15.4167 2.09243 14.3427C0.75 13.2688 0.75 11.5403 0.75 8.08333C0.75 4.62637 0.75 2.89788 2.09243 1.82394C3.43485 0.75 5.59546 0.75 9.91667 0.75C14.2379 0.75 16.3985 0.75 17.7409 1.82394C19.0833 2.89788 19.0833 4.62637 19.0833 8.08333C19.0833 11.5403 19.0833 13.2688 17.7409 14.3427C16.3985 15.4167 14.2379 15.4167 9.91667 15.4167Z" stroke="#333333" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <button type="submit" className="togo-footer-widget-input-btn">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                                <path d="M18.5969 2.77847C18.9846 2.64279 19.3572 3.01541 19.2215 3.40306L13.79 18.9217C13.6433 19.3408 13.0597 19.3646 12.8794 18.9589L9.92881 12.32C9.87952 12.2091 9.79085 12.1205 9.67995 12.0712L3.04112 9.1206C2.63543 8.94029 2.65924 8.35666 3.07827 8.21L18.5969 2.77847Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M12.832 9.1665L10.082 11.9165" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-8"></div>
                </div>
            </div>
        </div>
    );
}
