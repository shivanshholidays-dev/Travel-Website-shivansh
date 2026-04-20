'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateUtils } from '@lib/utils/date-utils';

export default function HeroSearchForm({ className = '' }: { className?: string }) {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const [date, setDate] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        if (date) params.set('dateFrom', date);
        router.push(`/tours?${params.toString()}`);
    };

    return (
        <div className={`togo-hero-2-search-wrap fade-anim ${className}`} data-delay=".7">
            <style jsx>{`
                .search-container {
                    background: #fff;
                    border-radius: 100px;
                    padding: 10px 10px 10px 30px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.12);
                    display: flex;
                    align-items: center;
                    width: 100%;
                    max-width: 850px;
                    margin: 0 auto;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .search-container:hover {
                    box-shadow: 0 25px 60px rgba(0,0,0,0.18);
                }
                .input-group {
                    display: flex;
                    flex-direction: column;
                    padding: 5px 20px;
                    flex: 1;
                    position: relative;
                    justify-content: center;
                }
                .input-group:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 25%;
                    height: 50%;
                    width: 1px;
                    background: #eee;
                }
                .label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #000;
                    margin-bottom: 2px;
                    display: block;
                }
                .field-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    height: 24px;
                }
                .field-wrapper svg {
                    color: #FD4621;
                    flex-shrink: 0;
                    opacity: 0.9;
                }
                input {
                    border: none;
                    background: transparent;
                    outline: none;
                    font-size: 15px;
                    color: #333;
                    width: 100%;
                    padding: 0;
                    font-family: inherit;
                }
                input::placeholder {
                    color: #999;
                }
                .search-btn {
                    background: #FD4621;
                    color: #fff;
                    border: none;
                    min-width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                    box-shadow: 0 4px 15px rgba(253, 70, 33, 0.3);
                }
                .search-btn:hover {
                    background: #e63e1c;
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(253, 70, 33, 0.4);
                }
                
                /* Custom Date Input Styling */
                .date-input-container {
                    position: relative;
                    width: 100%;
                    display: flex;
                    align-items: center;
                }
                .date-display {
                    font-size: 15px;
                    color: ${date ? '#333' : '#999'};
                    pointer-events: none;
                }
                input[type="date"] {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .search-container {
                        flex-direction: column;
                        border-radius: 30px;
                        padding: 20px;
                    }
                    .input-group {
                        width: 100%;
                        padding: 15px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .input-group::after {
                        display: none;
                    }
                    .search-btn {
                        width: 100%;
                        border-radius: 100px;
                        margin-top: 20px;
                        height: 50px;
                    }
                    .search-btn span {
                        display: inline !important;
                        margin-left: 10px;
                        font-weight: 600;
                        font-size: 16px;
                    }
                }
            `}</style>

            <div className="row justify-content-center">
                <div className="col-xl-12">
                    <form className="search-container" onSubmit={handleSearch}>
                        {/* Location Group */}
                        <div className="input-group">
                            <span className="label">Location</span>
                            <div className="field-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Where are you going?"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Date Group */}
                        <div className="input-group">
                            <span className="label">Date</span>
                            <div className="field-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <div className="date-input-container">
                                    <div className="date-display">
                                        {date ? DateUtils.formatToIST(date, 'MMM DD, YYYY') : 'Add dates'}
                                    </div>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="search-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <span className="d-none">Search</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
