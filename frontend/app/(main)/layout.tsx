import Header from '../../src/components/shared/Header';
import Footer from '../../src/components/shared/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main style={{ paddingTop: '0px' }} id="main-content">{children}</main>
            <Footer />
        </>
    );
}
