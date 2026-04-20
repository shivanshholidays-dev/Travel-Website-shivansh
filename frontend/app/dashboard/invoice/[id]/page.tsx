'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBookingById } from '@lib/hooks/useBookingHooks';
import { DateUtils } from '@lib/utils/date-utils';
import { Printer, ArrowLeft, Phone, Mail } from 'lucide-react';
import { BookingStatus } from '@lib/constants/enums';
import { getBookingStatusLabel } from '@lib/utils/enum-mappings';
import { useSettingsStore } from '@store/useSettingsStore';
import { useEffect } from 'react';
import { getImgUrl } from '@lib/utils/image';

export default function DashboardInvoiceDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const { settings, fetchSettings } = useSettingsStore();
    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const { data: response, isLoading, error } = useBookingById(id);
    const booking = (response as any)?.data || response;

    const tour = booking?.tour as any;
    const tourDate = booking?.tourDate as any;
    const user = booking?.user as any;

    const fmtINR = (n: number) =>
        new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);

    if (isLoading) return <div className="pt-50 pl-15 pr-15 text-center py-5 text-muted">Loading invoice…</div>;

    if (error || !booking) return (
        <div className="pt-50 pl-15 pr-15 text-center py-5">
            <p className="text-muted mb-4">Invoice not found.</p>
            <Link href="/dashboard/bookings" className="togo-btn-primary">Back to Booking</Link>
        </div>
    );

    // Guard: invoice only valid for CONFIRMED or COMPLETED bookings
    const canViewInvoice = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.COMPLETED;

    if (!canViewInvoice) return (
        <div className="pt-50 pl-15 pr-15 pb-60">
            <div className="container">
                <div className="col-12">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <Link href="/dashboard/bookings" className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: 14, textDecoration: 'none' }}>
                            <ArrowLeft size={16} /> Back to Bookings
                        </Link>
                    </div>
                    <div className="bg-white p-5 rounded-4 text-center" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                        <h4 className="fw-bold mb-3">Invoice Not Available</h4>
                        <p className="text-muted mb-4">
                            Invoice is only available for confirmed or completed bookings.
                            Your booking is currently <strong>{getBookingStatusLabel(booking.status)}</strong>.
                        </p>
                        <Link href={`/dashboard/bookings/${booking._id}`} className="togo-btn-primary">View Booking Details</Link>
                    </div>
                </div>
            </div>
        </div>
    );

    const companyInfo = {
        name: (settings?.businessDetails as any)?.companyName || 'SHIVANSH HOLIDAYS & CAB SERVICES PVT. LTD.',
        website: (settings?.businessDetails as any)?.websiteUrl || 'WWW.TREKSTORIES.IN',
        cin: (settings?.businessDetails as any)?.cin || 'U63030GJ2023PTC138406',
        tan: (settings?.businessDetails as any)?.tan || 'RKTS20255E',
        gst: (settings?.businessDetails as any)?.gstNumber || '24AAACC1206D1Z0',
        mobile: settings?.businessDetails?.phoneNumber || '+91 9909899221 / 9909899025',
        email: settings?.businessDetails?.supportEmail || 'info@Shivansh Holidays.in',
        officeAddress: settings?.businessDetails?.officeAddress || 'Office No 426, 4th Floor, Star Plaza Phulchhab Chowk, Rajkot, Gujarat, India - 360001',
        logo: settings?.otherSettings?.logoUrl ? getImgUrl(settings.otherSettings.logoUrl) : '/assets/img/logo/the-trek-stories.png'
    };

    const customerInfo = {
        name: user?.name || 'Mr. Amitbhai Sudhirbhai Shukla',
        addressLines: user?.address ? [user.address] : [],
        phone: user?.phone || '+91 9925661884',
        email: user?.email || ''
    };

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60" style={{ backgroundColor: '#f8f9fa' }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

                    @media print {
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                        }
                        #invoice-print {
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 210mm !important;
                            height: 297mm !important;
                            padding: 10mm !important;
                            margin: 0 !important;
                            box-shadow: none !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .d-print-none {
                            display: none !important;
                        }
                        @page { 
                            size: A4;
                            margin: 0; 
                        }
                    }

                    /* Hide dashboard global elements on this page */
                    .togo-dashboard-sidebar, 
                    .togo-dashboard-header {
                        display: none !important;
                    }
                    .togo-dashboard-main-wrap {
                        margin-left: 0 !important;
                        width: 100% !important;
                    }
                    .togo-dashboard-content-area {
                        padding: 0 !important;
                        background-color: #f8f9fa !important;
                    }

                    .font-playfair {
                        font-family: 'Playfair Display', serif;
                    }
                `}
            </style>

            <div className="container-fluid p-0" style={{ paddingBottom: '40px' }}>
                <div className="row g-0">
                    <div className="col-12">
                        <div className="d-flex align-items-center justify-content-between gap-3 p-4 d-print-none">
                            <Link href="/dashboard/bookings" className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: 14, textDecoration: 'none' }}>
                                <ArrowLeft size={16} /> Back to Bookings
                            </Link>
                            <button
                                className="btn px-4 py-2 fw-medium rounded d-flex align-items-center gap-2"
                                onClick={() => window.print()}
                                style={{ fontSize: 14, backgroundColor: '#9B2B42', color: '#fff', border: 'none' }}
                            >
                                <Printer size={18} /> Print / Download PDF
                            </button>
                        </div>

                        {/* Invoice Design Wrapper */}
                        <div id="invoice-print" className="bg-white" style={{
                            boxShadow: '0 4px 25px rgba(0,0,0,0.06)',
                            width: '210mm',
                            height: '297mm',
                            margin: '0 auto',
                            position: 'relative',
                            fontFamily: "'DM Sans', sans-serif",
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#111'
                        }}>
                            <div style={{ padding: '25px 50px 0 50px', flex: 1 }}>
                                {/* Logo and Company Name */}
                                <div className="text-center">
                                    {companyInfo.logo && (
                                        <img src={companyInfo.logo} alt="Company Logo" style={{ height: '50px', marginBottom: '10px', objectFit: 'contain' }} />
                                    )}
                                    <h3 style={{ color: '#9B2B42', fontWeight: 800, fontSize: '22px', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>{companyInfo.name}</h3>

                                    <div style={{ position: 'relative', textAlign: 'center', margin: '20px 0' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '2px solid #9B2B42', zIndex: 1 }}></div>
                                        <span style={{ background: '#fff', padding: '0 15px', position: 'relative', zIndex: 2, color: '#333', fontSize: '10px', letterSpacing: '1.5px', fontWeight: 700 }}>
                                            {companyInfo.website}
                                        </span>
                                    </div>

                                    <h1 className="font-playfair" style={{ fontWeight: 800, fontSize: '32px', letterSpacing: '3px', marginTop: '25px', color: '#111' }}>INVOICE</h1>
                                </div>

                                {/* Details Section */}
                                <div className="d-flex justify-content-between mb-4" style={{ marginTop: '35px' }}>
                                    {/* Left side: To */}
                                    <div style={{ width: '50%' }}>
                                        <h6 className="font-playfair" style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px', color: '#111' }}>To,</h6>
                                        <h6 className="font-playfair" style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px', color: '#111' }}>{customerInfo.name}</h6>
                                        <div style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', maxWidth: '300px' }}>
                                            {customerInfo.addressLines.map((line, idx) => (
                                                <div key={idx}>{line}</div>
                                            ))}
                                        </div>
                                        {customerInfo.phone && <div style={{ fontSize: '14px', color: '#444', marginTop: '4px' }}>Mo. {customerInfo.phone}</div>}
                                        {customerInfo.email && <div style={{ fontSize: '14px', color: '#444', marginTop: '2px' }}>Email: {customerInfo.email}</div>}
                                    </div>

                                    {/* Right side: Info */}
                                    <div style={{ width: '45%', textAlign: 'right', fontSize: '13px', color: '#111', lineHeight: '1.8' }}>
                                        <div style={{ marginBottom: '4px' }}><span style={{ fontWeight: 700 }}>Date :</span> {DateUtils.formatToIST(booking.createdAt, 'DD MMM YYYY')}</div>
                                        <div style={{ fontWeight: 800, fontSize: '15px' }}>
                                            <span>Invoice no : </span>
                                            <span>{booking.invoiceNumber || booking.bookingNumber || id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        {companyInfo.cin && <div style={{ marginTop: '5px' }}><span style={{ fontWeight: 700 }}>CIN :</span> {companyInfo.cin}</div>}
                                        {companyInfo.tan && <div><span style={{ fontWeight: 700 }}>TAN :</span> {companyInfo.tan}</div>}
                                        {companyInfo.gst && <div><span style={{ fontWeight: 700 }}>GST :</span> {companyInfo.gst}</div>}
                                    </div>
                                </div>

                                {/* Table Section */}
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '2.5px solid #000', marginBottom: '20px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2.5px solid #000' }}>
                                            <th style={{ padding: '6px 10px', borderRight: '2.5px solid #000', textAlign: 'left', fontWeight: 800, color: '#000', fontSize: '11px' }}>DESCRIPTION</th>
                                            <th style={{ padding: '6px 10px', borderRight: '2.5px solid #000', textAlign: 'center', width: '15%', fontWeight: 800, color: '#000', fontSize: '11px' }}>PAX.</th>
                                            <th style={{ padding: '6px 10px', borderRight: '2.5px solid #000', textAlign: 'center', width: '20%', fontWeight: 800, color: '#000', fontSize: '11px' }}>PRICE</th>
                                            <th style={{ padding: '6px 10px', textAlign: 'center', width: '22%', fontWeight: 800, color: '#000', fontSize: '11px' }}>TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '12px 10px', borderRight: '2.5px solid #000', verticalAlign: 'top', height: '120px' }}>
                                                <ul style={{ paddingLeft: '15px', margin: 0, color: '#000', lineHeight: '1.5', fontSize: '12px' }}>
                                                    <li style={{ marginBottom: '5px' }}>{tour?.title || 'Tour Package'}</li>
                                                    {tourDate?.startDate && (
                                                        <li style={{ marginBottom: '5px' }}>{DateUtils.formatToIST(tourDate.startDate, 'DD MMM YYYY')} {tourDate?.endDate ? ` to ${DateUtils.formatToIST(tourDate.endDate, 'DD MMM YYYY')}` : ''}</li>
                                                    )}
                                                    {booking.pickupOption?.fromCity && <li>From: {booking.pickupOption.fromCity}</li>}
                                                </ul>
                                            </td>
                                            <td style={{ padding: '12px 10px', borderRight: '2.5px solid #000', textAlign: 'center', verticalAlign: 'middle', fontSize: '12px', color: '#000', fontWeight: 500 }}>
                                                {booking.totalTravelers || booking.travelers?.length || 1} Pax.
                                            </td>
                                            <td style={{ padding: '12px 10px', borderRight: '2.5px solid #000', textAlign: 'center', verticalAlign: 'middle', color: '#000', fontSize: '12px' }}>
                                                {fmtINR(booking.perPersonPrice || 0)}/-
                                            </td>
                                            <td style={{ padding: '12px 10px', textAlign: 'center', verticalAlign: 'middle', fontWeight: 700, fontSize: '13px', color: '#000' }}>
                                                {fmtINR(booking.baseAmount || 0)}/-
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Totals & Status */}
                                <div className="d-flex justify-content-between align-items-start mt-4">
                                    <div style={{ width: '45%' }}>
                                        {booking.paidAmount > 0 && (
                                            <div style={{
                                                border: '2px solid #000',
                                                padding: '12px 20px',
                                                fontWeight: 800,
                                                fontSize: '15px',
                                                color: '#111',
                                                textAlign: 'left',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderRadius: '2px'
                                            }}>
                                                <span className="font-playfair">Payment Received :</span>
                                                <span>{fmtINR(booking.paidAmount || 0)}/-</span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ width: '45%', fontSize: '14px' }}>
                                        {booking.discountAmount > 0 && (
                                            <div className="d-flex justify-content-between mb-2">
                                                <span style={{ fontWeight: 700, color: '#333' }}>Discount :</span>
                                                <span style={{ fontWeight: 800, color: '#111' }}>-{fmtINR(booking.discountAmount || 0)}/-</span>
                                            </div>
                                        )}
                                        {booking.taxAmount > 0 && (
                                            <div className="d-flex justify-content-between mb-2">
                                                <span style={{ fontWeight: 700, color: '#333' }}>GST ({booking.taxRate ?? 5}%) :</span>
                                                <span style={{ fontWeight: 800, color: '#111' }}>{fmtINR(booking.taxAmount || 0)}/-</span>
                                            </div>
                                        )}
                                        {booking.pendingAmount > 0 && (
                                            <div className="d-flex justify-content-between mb-3">
                                                <span style={{ fontWeight: 800, color: '#111' }}>Pending Amount :</span>
                                                <span style={{ fontWeight: 800, color: '#111' }}>{fmtINR(booking.pendingAmount || 0)}/-</span>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between align-items-center mt-2" style={{ background: '#9B2B42', color: '#fff', padding: '12px 20px', fontWeight: 800, fontSize: '18px', borderRadius: '2px' }}>
                                            <span>GRAND TOTAL :</span>
                                            <span>{fmtINR(booking.totalAmount || 0)}/-</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{
                                background: '#9B2B42',
                                color: '#fff',
                                padding: '15px 50px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{ background: '#fff', color: '#9B2B42', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Phone size={14} fill="currentColor" strokeWidth={0} />
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.5px' }}>{companyInfo.mobile}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{ background: '#fff', color: '#9B2B42', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail size={14} strokeWidth={2.5} />
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.5px' }}>{companyInfo.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
