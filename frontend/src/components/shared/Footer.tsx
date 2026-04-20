'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '@store/useSettingsStore';
import { useTourHooks } from '@/src/lib/hooks/useTourHooks';
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';

export default function Footer() {
    const [email, setEmail] = useState('');
    const { settings, fetchSettings } = useSettingsStore();

    const { useFilterOptions } = useTourHooks();
    const { data: filterData } = useFilterOptions();
    const states: string[] = (filterData?.states || []).filter((s: string) => s && s.trim() !== '');

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleNewsletter = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        toast.success('Thank you for subscribing!');
        setEmail('');
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const business = settings?.businessDetails;
    const social = settings?.socialMedia;
    const other = settings?.otherSettings;

    return (
        <footer>
            {/* footer area start */}
            <div className="togo-footer-sec pt-60" style={{ backgroundColor: '#000000' }}>
                <div className="container">
                    <div className="togo-footer-main-wrapper black-style pb-10">
                        <div className="row">
                            <div className="col-lg-4 col-sm-6">
                                <div className="togo-footer-widget mb-20 togo-footer-col-1">
                                    <h4 className="togo-footer-widget-title mb-25">About Us</h4>
                                    {other?.footerDescription && (
                                        <p style={{ color: '#a0a0a0', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
                                            {other.footerDescription}
                                        </p>
                                    )}
                                    <div className="togo-footer-widget-info">
                                        {business?.supportEmail && (
                                            <div className="togo-footer-widget-info-item">
                                                <a href={`mailto:${business.supportEmail}`}>
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 22 22" fill="none">
                                                            <path d="M1.83398 10.9998C1.83398 7.54287 1.83398 5.81439 3.17641 4.74045C4.51884 3.6665 6.67944 3.6665 11.0007 3.6665C15.3219 3.6665 17.4825 3.6665 18.8249 4.74045C20.1673 5.81439 20.1673 7.54287 20.1673 10.9998C20.1673 14.4568 20.1673 16.1853 18.8249 17.2592C17.4825 18.3332 15.3219 18.3332 11.0007 18.3332C6.67944 18.3332 4.51884 18.3332 3.17641 17.2592C1.83398 16.1853 1.83398 14.4568 1.83398 10.9998Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M18.9434 4.86768L14.5201 8.98251C12.8365 10.3855 11.9947 11.087 10.9991 11.087C10.0034 11.087 9.16162 10.3855 7.47804 8.98251L3.05469 4.86768" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </span>
                                                    {business.supportEmail}
                                                </a>
                                            </div>
                                        )}
                                        {business?.phoneNumber && (
                                            <div className="togo-footer-widget-info-item">
                                                <a href={`tel:${business.phoneNumber}`}>
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 22 22" fill="none">
                                                            <path d="M14.3 13.3113C12.1046 15.622 6.5045 10.0722 8.70828 7.75274C10.0538 6.33657 8.53383 4.71815 7.69249 3.52856C6.11347 1.29596 2.64707 4.37837 2.75235 6.33915C3.08433 12.5224 9.77308 19.8501 16.2502 19.2109C18.2765 19.011 20.6047 15.3516 18.2805 14.0142C17.1183 13.3454 15.523 12.0241 14.3 13.3113Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </span> {business.phoneNumber}</a>
                                            </div>
                                        )}
                                        {business?.officeAddress && (
                                            <div className="togo-footer-widget-info-item">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a0a0a0', fontSize: '14px' }}>
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                                            <path d="M11.5132 19.0857C11.206 19.3048 10.794 19.3048 10.4868 19.0857C6.06043 15.9292 1.36177 9.43901 6.11114 4.74951C7.40775 3.46924 9.16632 2.75 11 2.75C12.8337 2.75 14.5923 3.46924 15.8889 4.74951C20.6382 9.43901 15.9396 15.9292 11.5132 19.0857Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M10.9993 11.0002C12.0119 11.0002 12.8327 10.1794 12.8327 9.16683C12.8327 8.15431 12.0119 7.3335 10.9993 7.3335C9.98683 7.3335 9.16602 8.15431 9.16602 9.16683C9.16602 10.1794 9.98683 11.0002 10.9993 11.0002Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </span>
                                                    {business.officeAddress}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="togo-footer-widget-info-btn mt-3">
                                        <a className="togo-btn-primary" href="/tours">Explore Tours</a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-2 col-sm-6">
                                <div className="togo-footer-widget mb-40 togo-footer-col-2">
                                    <h4 className="togo-footer-widget-title mb-25">Destinations</h4>
                                    <div className="togo-footer-widget-menu">
                                        <ul>
                                            {states.slice(0, 5).map((state) => (
                                                <li key={state}>
                                                    <Link className="hover-line" href={`/tours/grid?state=${encodeURIComponent(state)}`}>
                                                        {state}
                                                    </Link>
                                                </li>
                                            ))}
                                            {states.length === 0 && (
                                                <>
                                                    <li><Link className="hover-line" href={`/tours/grid?state=Kerala`}>Kerala</Link></li>
                                                    <li><Link className="hover-line" href={`/tours/grid?state=Rajasthan`}>Rajasthan</Link></li>
                                                    <li><Link className="hover-line" href={`/tours/grid?state=Goa`}>Goa</Link></li>
                                                    <li><Link className="hover-line" href={`/tours/grid?state=Himachal%20Pradesh`}>Himachal Pradesh</Link></li>
                                                    <li><Link className="hover-line" href={`/tours/grid?state=Uttarakhand`}>Uttarakhand</Link></li>
                                                </>
                                            )}
                                            <li><Link className="hover-line" href="/tours/grid">All Destinations</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-2 col-sm-6">
                                <div className="togo-footer-widget mb-40 togo-footer-col-3">
                                    <h4 className="togo-footer-widget-title mb-25">Company</h4>
                                    <div className="togo-footer-widget-menu">
                                        <ul>
                                            <li><Link className="hover-line" href="/about">About Us</Link></li>
                                            <li><Link className="hover-line" href="/contact">Contact Us</Link></li>
                                            <li><Link className="hover-line" href="/team">Meet The Team</Link></li>
                                            <li><Link className="hover-line" href="/careers">Careers</Link></li>
                                            <li><Link className="hover-line" href="/blog">Blog</Link></li>
                                            <li><Link className="hover-line" href="/booking-instructions">Booking Instructions</Link></li>
                                            <li><Link className="hover-line" href="/terms-and-conditions">Terms & Conditions</Link></li>
                                            <li><Link className="hover-line" href="/privacy-policy">Privacy Policy</Link></li>
                                            <li><Link className="hover-line" href="/refund-policy">Refund Policy</Link></li>
                                            <li><Link className="hover-line" href="/cancellation-policy">Cancellation Policy</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-sm-6">
                                <div className="togo-footer-widget mb-40 togo-footer-col-4">
                                    <h4 className="togo-footer-widget-title mb-28">Stay in touch</h4>
                                    <div className="togo-footer-widget-input mb-30">
                                        <p>Subscribe to our Newsletter for the <br /> Latest Updates and Special Offers</p>
                                        <form className="p-relative" onSubmit={handleNewsletter}>
                                            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                                    <div className="togo-footer-widget-social-wrap mb-30">
                                        <h4 className="togo-footer-widget-title mb-14">Follow us</h4>
                                        <div className="togo-footer-widget-social-icon">
                                            {social?.facebook && (
                                                <a href={social.facebook} target="_blank" rel="noopener noreferrer">
                                                    <span><Facebook size={18} /></span>
                                                </a>
                                            )}
                                            {social?.instagram && (
                                                <a href={social.instagram} target="_blank" rel="noopener noreferrer">
                                                    <span><Instagram size={18} /></span>
                                                </a>
                                            )}
                                            {social?.linkedin && (
                                                <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
                                                    <span><Linkedin size={18} /></span>
                                                </a>
                                            )}
                                            {social?.whatsapp && (
                                                <a href={`https://wa.me/${social.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                    <span><MessageCircle size={18} /></span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="togo-footer-2-top-border pt-35 pb-30">
                        <div className="row align-items-center">
                            <div className="col-12">
                                <div className="togo-footer-copyright-text text-center">
                                    <p>© {new Date().getFullYear()} All rights reserved - Shivansh Holidays & cab services Pvt Ltd</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            {/* footer area end */}

            <style jsx>{`
                .togo-footer-sec {
                    color: #fff;
                }
                .togo-footer-widget-title {
                    color: #fff;
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 25px;
                }
                .togo-footer-widget-menu ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .togo-footer-widget-menu ul li {
                    margin-bottom: 12px;
                }
                .togo-footer-widget-menu ul li a {
                    color: #a0a0a0;
                    text-decoration: none;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }
                .togo-footer-widget-menu ul li a:hover {
                    color: #fd4621;
                    padding-left: 5px;
                }
                .togo-footer-widget-info-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 5px;
                }
                .togo-footer-widget-info-item a {
                    color: #a0a0a0;
                    text-decoration: none;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .togo-footer-widget-info-item span {
                    color: #fd4621;
                }
                .togo-footer-widget-input p {
                    color: #a0a0a0;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
                .p-relative {
                    position: relative;
                }
                .togo-footer-widget-input input {
                    width: 100%;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.08); /* slightly lighter for contrast */
                    border: 1px solid rgba(255, 255, 255, 0.1); /* added border */
                    border-radius: 30px;
                    padding: 0 60px 0 25px;
                    color: #fff;
                    outline: none;
                    transition: border-color 0.3s ease;
                }
                .togo-footer-widget-input input:focus {
                    border-color: rgba(255, 255, 255, 0.4);
                }
                .togo-footer-widget-input input::placeholder {
                    color: #a0a0a0;
                }
                .togo-footer-widget-input-btn {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    width: 40px;
                    height: 40px;
                    border: none;
                    border-radius: 50%;
                    color: #fff !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .togo-footer-widget-input-btn:hover,
                .togo-footer-widget-input-btn:focus,
                .togo-footer-widget-input-btn:active {
                    background: #fff !important;
                    color: #fd4621 !important;
                }
                .togo-footer-widget-social-icon {
                    display: flex;
                    gap: 10px;
                }
                .togo-footer-widget-social-icon span {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                }
                .togo-footer-widget-social-icon a {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    transition: all 0.3s ease;
                    text-decoration: none;
                }
                .togo-footer-widget-social-icon a:hover,
                .togo-footer-widget-social-icon a:focus,
                .togo-footer-widget-social-icon a:active {
                    background: transparent !important;
                    color: #fd4621 !important;
                    transform: translateY(-3px);
                }
                .togo-footer-widget-social-icon a:hover svg,
                .togo-footer-widget-social-icon a:focus svg,
                .togo-footer-widget-social-icon a:active svg {
                    stroke: #fd4621 !important;
                    fill: #fd4621 !important;
                }
                .togo-footer-copyright-text p {
                    font-size: 13px;
                    color: #a0a0a0;
                    margin: 0;
                }
                .togo-footer-copyright-text p a {
                    color: #fff;
                    text-decoration: none;
                    font-weight: 600;
                }
                .togo-footer-copyright-currence-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 13px;
                    color: #a0a0a0;
                    cursor: pointer;
                    position: relative;
                }
                .togo-footer-copyright-currence-content {
                    position: absolute;
                    bottom: 100%;
                    right: 0;
                    background: #fff;
                    color: #333;
                    padding: 15px;
                    border-radius: 8px;
                    display: none;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                .togo-footer-copyright-currence-btn:hover .togo-footer-copyright-currence-content {
                    display: block;
                }
                .currence-work {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .currence-work li a {
                    text-decoration: none;
                    color: #666;
                    font-size: 13px;
                }
                .togo-btn-primary {
                    background: #fd4621;
                    color: #fff;
                    padding: 12px 25px;
                    border-radius: 30px;
                    text-decoration: none;
                    font-weight: 600;
                    display: inline-block;
                    transition: all 0.3s ease;
                }
                .togo-btn-primary:hover,
                .togo-btn-primary:focus,
                .togo-btn-primary:active {
                    background: #fff !important;
                    color: #fd4621 !important;
                }
            `}</style>
        </footer>
    );
}
