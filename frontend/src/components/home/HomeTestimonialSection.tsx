'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const testimonials = [
    { name: 'Sani Laura', location: 'From Spain', img: '/assets/img/testimonial/home-3/user-1.jpg' },
    { name: 'Sani Laura', location: 'From Spain', img: '/assets/img/testimonial/home-3/user-2.jpg' },
    { name: 'Sani Laura', location: 'From Spain', img: '/assets/img/testimonial/home-3/user-3.jpg' }
];

const HomeTestimonialSection: React.FC = () => {
    return (
        <div
            className="togo-testimonial-3-sec pt-80 bg-pos"
            style={{ backgroundImage: 'url(/assets/img/testimonial/home-3/testi-bg-3.jpg)' }}
        >
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-7 col-lg-8">
                        <div className="togo-testimonial-3-wrapper text-center">
                            <h4 className="togo-section-title mb-50 fade-anim" data-delay=".3">
                                Our Happy Traveller
                            </h4>

                            <div className="swiper togo-testimonial-active">
                                <Swiper
                                    modules={[Navigation]}
                                    navigation={{
                                        nextEl: '.togo-testimonial-next',
                                        prevEl: '.togo-testimonial-prev',
                                    }}
                                    spaceBetween={24}
                                    slidesPerView={1}
                                    loop={true}
                                    className="togo-testimonial-active"
                                >
                                    {testimonials.map((testi, index) => (
                                        <SwiperSlide key={index}>
                                            <div className="togo-testimonial-3-item">
                                                <div className="togo-testimonial-2-item-rating mb-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star}>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="14"
                                                                height="14"
                                                                viewBox="0 0 14 14"
                                                                fill="none"
                                                            >
                                                                <path
                                                                    d="M7.32327 1.08378C7.07807 0.638741 6.42974 0.638741 6.18454 1.08378C6.05096 1.32621 5.92281 1.5719 5.80023 1.82068C5.41424 2.6041 5.08355 3.41822 4.8131 4.25825C4.72059 4.5456 4.4457 4.74517 4.13108 4.75352C3.38864 4.77323 2.64755 4.83432 1.91266 4.93804C1.70278 4.96766 1.49401 5.00063 1.28642 5.0369C0.770247 5.12708 0.576561 5.7156 0.943106 6.07427C1.02672 6.15608 1.11104 6.23721 1.19606 6.31765C1.83183 6.91916 2.50669 7.48188 3.2166 8.0019C3.46144 8.18126 3.5621 8.48895 3.46852 8.7698C3.17533 9.6497 2.94843 10.5586 2.79353 11.4911C2.76246 11.678 2.7343 11.866 2.70907 12.0548C2.64186 12.5579 3.1809 12.9132 3.64877 12.6734C3.81578 12.5878 3.98131 12.4998 4.14532 12.4095C4.89781 11.9953 5.61824 11.5324 6.30207 11.0252C6.56749 10.8283 6.94033 10.8283 7.20574 11.0252C7.88958 11.5324 8.61 11.9953 9.36249 12.4095C9.5265 12.4998 9.69203 12.5878 9.85904 12.6734C10.3269 12.9132 10.866 12.5579 10.7987 12.0548C10.7735 11.866 10.7453 11.678 10.7143 11.4911C10.5594 10.5586 10.3325 9.6497 10.0393 8.7698C9.94572 8.48895 10.0464 8.18126 10.2912 8.0019C11.0011 7.48188 11.676 6.91916 12.3118 6.31765C12.3968 6.23721 12.4811 6.15608 12.5647 6.07427C12.9313 5.7156 12.7376 5.12708 12.2214 5.0369C12.0138 5.00063 11.805 4.96766 11.5951 4.93804C10.8603 4.83432 10.1192 4.77323 9.37673 4.75352C9.06212 4.74517 8.78723 4.5456 8.69471 4.25825C8.42426 3.41822 8.09358 2.6041 7.70758 1.82068C7.585 1.5719 7.45685 1.32621 7.32327 1.08378Z"
                                                                    fill="#FD4621"
                                                                    stroke="#FD4621"
                                                                    strokeWidth="1.5"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </span>
                                                    ))}
                                                </div>
                                                <h4 className="togo-testimonial-3-title">Fantastic in every way</h4>
                                                <div className="togo-testimonial-3-content mb-25">
                                                    <p>
                                                        “ After attempting other tours with other agencies and them falling
                                                        through, I came in to this with doubts, but turns out... this was the
                                                        best vacation I ever went on. All arrangements were made smoothly, the
                                                        travel book “
                                                    </p>
                                                </div>
                                                <div className="togo-testimonial-3-user">
                                                    <div className="togo-testimonial-3-user-content">
                                                        <h4>{testi.name}</h4>
                                                        <span>{testi.location}</span>
                                                    </div>
                                                    <div className="togo-testimonial-3-user-thumb">
                                                        <img src={testi.img} alt={testi.name} />
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeTestimonialSection;
