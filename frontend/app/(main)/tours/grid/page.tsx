import TourListing from '@components/tours/TourListing';
import HeroSearchForm from '@components/home/HeroSearchForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
   title: 'Shivansh Holidays | Tour Grid',
   description: 'Browse our wide selection of tours and travel packages.',
};

export default function TourGridPage() {
   return (
      <main>
         <div className="pt-30" />
         <TourListing defaultView="grid" />
      </main>
   );
}
