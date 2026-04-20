'use client';

import Link from 'next/link';

const faqs = [
    {
        id: 'one',
        question: 'How do I book a trip with Shivansh Holidays?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.'
    },
    {
        id: 'two',
        question: 'What if I need to make changes to my booking?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.'
    },
    {
        id: 'three',
        question: 'Does Shivansh Holidays offer support during my trip?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.'
    },
    {
        id: 'four',
        question: 'Are your trips family-friendly?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.'
    },
    {
        id: 'five',
        question: 'Can I customize my travel itinerary?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.'
    }
];

export default function HomeFAQSection() {

    return (
        <div className="togo-faq-sec fix pt-60 pb-0">
            <div className="container container-1440">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="togo-faq-heading text-center mb-40">
                            <span className="togo-section-subtitle fade-anim" data-delay=".3">FAQs</span>
                            <h3 className="togo-section-title mb-15 fade-anim" data-delay=".5">
                                Frequently Asked Questions
                            </h3>
                            <div className="togo-faq-text fade-anim" data-delay=".7">
                                <p>Lorem ipsum dolor sit amet consectetur. Et sagittis sit odio urna. <br /> Varius ornare ut gravida velit vulputate.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row align-items-center">
                    <div className="col-lg-6">
                        <div className="togo-faq-wrapper mb-40 fade-anim" data-delay=".5" data-fade-from="left">
                            <div className="accordions" id="accordionExample">
                                {faqs.map((faq, idx) => {
                                    const isFirst = idx === 0;
                                    return (
                                        <div key={faq.id} className={`accordion-items mb-20 ${isFirst ? 'active' : ''}`}>
                                            <div className="accordion-header">
                                                <button
                                                    className={`accordion-buttons ${isFirst ? '' : 'collapsed'}`}
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#collapse${faq.id}`}
                                                    aria-expanded={isFirst ? "true" : "false"}
                                                    aria-controls={`collapse${faq.id}`}
                                                >
                                                    {faq.question}
                                                    <span className="togo-accordion-icon"></span>
                                                </button>
                                            </div>
                                            <div id={`collapse${faq.id}`} className={`accordion-collapse collapse ${isFirst ? 'show' : ''}`} data-bs-parent="#accordionExample">
                                                <div className="accordion-body">
                                                    <p>{faq.answer}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="togo-faq-card text-center ml-70 fade-anim" data-delay=".7">
                            <div className="togo-faq-card-icon">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/assets/img/banner/home-3/message-icon.svg" alt="Message Icon" />
                            </div>
                            <div className="togo-faq-card-content">
                                <h4 className="togo-faq-card-title">
                                    You have different questions?
                                </h4>
                                <p>
                                    Lorem ipsum dolor sit amet consectetur. Et sagittis sit odio urna. Varius ornare
                                </p>
                                <div className="togo-faq-card-btn">
                                    <Link className="togo-btn-primary" href="/contact">Contact us</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
