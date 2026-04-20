'use client';

import HomeHeroSection from '@/src/components/home/HomeHeroSection';
import HomeChooseUsSection from '@/src/components/home/HomeChooseUsSection';
import PopularToursSection from '@/src/components/home/PopularToursSection';
import HomeExplorerActivities from '@/src/components/home/HomeExplorerActivities';
import HomeTestimonialSection from '@/src/components/home/HomeTestimonialSection';
import HomeCounterSection from '@/src/components/home/HomeCounterSection';
import HomeGuideSection from '@/src/components/home/HomeGuideSection';
import TopDestinationsSection from '@/src/components/home/TopDestinationsSection';
import HomeBlogSection from '@/src/components/home/HomeBlogSection';
import HomeCommunitySection from '@/src/components/home/HomeCommunitySection';
import HomeCustomTourSection from '@/src/components/home/HomeCustomTourSection';
import HomeBannerSection from '@/src/components/home/HomeBannerSection';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    document.body.classList.add('togo-home-3');
    return () => {
      document.body.classList.remove('togo-home-3');
    };
  }, []);

  return (
    <main className="main-page-wrapper">
      {/* Hero Section */}
      <HomeHeroSection />

      {/* Why Choose Us Section */}
      <HomeChooseUsSection />

      {/* Trending Adventure Tours (Popular Tours) */}
      <PopularToursSection />

      {/* Outdoor Activities (Explorer) */}
      <HomeExplorerActivities />

      {/* Testimonials Section */}
      <HomeTestimonialSection />

      {/* Counter Section */}
      <HomeCounterSection />

      {/* Who We Are (Guide) Section */}
      <HomeGuideSection />

      {/* Destinations We Love The Most */}
      <TopDestinationsSection />

      {/* Community / Newsletter Section */}
      <HomeCommunitySection />

      {/* Meet Our Expert Team Section */}
      {/* <HomeTeamSection /> */}

      {/* Custom Tour Request Section (replaces FAQ) */}
      <HomeCustomTourSection />

      {/* Blog Section (Retained) */}
      <HomeBlogSection />

      {/* Bottom Banner Section */}
      <HomeBannerSection />
    </main>
  );
}
