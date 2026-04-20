'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@lib/store/booking.store';
import { paymentsApi } from '@lib/api/payments.api';
import useAuthStore from '@store/useAuthStore';
import { useSettingsStore } from '@/src/store/useSettingsStore';
import { getImgUrl } from '@lib/utils/image';

const DEFAULT_UPI_ID = process.env.NEXT_PUBLIC_ADMIN_UPI_ID || 'tramptravellers@okicici';

export default function BookingPaymentPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { bookingId, bookingNumber, pricing, selection, paymentType, selectedPercentage, partialAmount, reset } = useBookingStore();
    const { settings, fetchSettings } = useSettingsStore();

    const [transactionId, setTransactionId] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [copiedUpi, setCopiedUpi] = useState(false);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hydration guard — run guard ONLY after localStorage state is available
    useEffect(() => {
        setMounted(true);
        fetchSettings();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchSettings]);

    useEffect(() => {
        if (!mounted) return;
        if (!isAuthenticated) { router.replace('/login'); return; }
        if (!bookingId || !pricing) { router.replace('/tours'); return; }
    }, [mounted, bookingId, pricing, isAuthenticated]);

    if (!mounted || !bookingId || !pricing || !selection) return null;

    const UPI_ID = settings?.businessDetails?.upiId || DEFAULT_UPI_ID;
    const qrImageUrl = settings?.paymentDetails?.upiQrImageUrl;
    const liveGstRate = settings?.businessDetails?.gstRate ?? 5;

    // ─── File Handling ───────────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type))
        {
            setError('Only JPG, PNG, or WEBP images are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024)
        {
            setError('File size must be less than 5MB.');
            return;
        }
        setError('');
        setReceiptFile(file);
        const url = URL.createObjectURL(file);
        setReceiptPreview(url);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file)
        {
            const fakeEvent = { target: { files: [file] } } as any;
            handleFileChange(fakeEvent);
        }
    };

    const copyUpi = () => {
        navigator.clipboard.writeText(UPI_ID);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2000);
    };

    // ─── Submit Payment Proof ─────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError('');
        if (!transactionId.trim()) { setError('Please enter the Transaction ID.'); return; }
        if (!receiptFile) { setError('Please upload your payment receipt screenshot.'); return; }

        setSubmitting(true);
        try
        {
            await paymentsApi.submitProof({
                bookingId,
                transactionId: transactionId.trim(),
                paymentMethod: 'UPI',
                receiptImage: receiptFile,
                paymentAmount: amount
            });
            router.push('/booking/confirmation');
        } catch (err: any)
        {
            setError(err?.response?.data?.message || 'Failed to submit payment proof. Please try again.');
        } finally
        {
            setSubmitting(false);
        }
    };

    const amount = paymentType === "PARTIAL" ? partialAmount : pricing.totalAmount;

    return (
        <main style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            {/* ─── Stepper ─────────────────────────────────────────────── */}
            <div style={{ backgroundColor: '#1a1a2e', padding: '20px 0' }}>
                <div className="container container-1440 px-3 px-md-4">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        {[{ step: 1, label: 'Select Tour' }, { step: 2, label: 'Contact Details' }, { step: 3, label: 'Payment' }, { step: 4, label: 'Complete' }].map(({ step, label }, i, arr) => (
                            <div key={step} className="d-flex align-items-center gap-2">
                                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{
                                    width: '32px', height: '32px', fontSize: '14px',
                                    backgroundColor: 3 >= step ? '#FD4621' : 'rgba(255,255,255,0.1)',
                                    color: 3 >= step ? 'white' : 'rgba(255,255,255,0.4)',
                                }}>{step < 3 ? '✓' : step}</div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 3 >= step ? 'white' : 'rgba(255,255,255,0.4)' }}>{label}</span>
                                {i < arr.length - 1 && <div className="mx-2" style={{ height: '1px', width: '32px', backgroundColor: 'rgba(255,255,255,0.2)' }} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container container-1440 px-3 px-md-4 py-5">
                <div className="row g-4 justify-content-center">
                    <div className="col-lg-7">

                        {/* Amount Due Card */}
                        <div className="bg-white rounded-4 shadow-sm overflow-hidden mb-4 border-0">
                            <div className="p-1" style={{ background: 'linear-gradient(90deg, #FD4621 0%, #ff7675 100%)' }}></div>
                            <div className="p-4 p-md-5 text-center">
                                <span className="badge rounded-pill bg-light text-primary fw-bold mb-3 px-3 py-2" style={{ letterSpacing: '0.5px', color: '#FD4621 !important' }}>
                                    {paymentType === 'PARTIAL' ? `PARTIAL PAYMENT (${selectedPercentage}%)` : 'FULL PAYMENT (100%)'}
                                </span>
                                <h1 className="fw-bolder mb-2" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', color: '#1a1a2e', letterSpacing: '-2px' }}>
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)}
                                </h1>
                                <p className="text-muted fw-medium mb-0">Booking Reference: <span className="text-dark fw-bold">#{bookingNumber || '...'}</span></p>
                            </div>
                        </div>

                        {/* UPI Payment Instructions */}
                        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <span style={{ fontSize: '24px' }}>💳</span>
                                Pay via UPI / Google Pay / PhonePe
                            </h5>

                            <div className="p-4 p-md-5 rounded-4 text-center mb-4 position-relative overflow-hidden"
                                style={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(253, 70, 33, 0.3)' }}>
                                <div className="position-absolute" style={{ top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(253, 70, 33, 0.1) 0%, transparent 70%)' }}></div>

                                {qrImageUrl && (
                                    <div className="mb-4 position-relative">
                                        <div className="text-white opacity-75 small mb-3 fw-bold text-uppercase tracking-wider">Scan QR Code to Pay</div>
                                        <div className="d-inline-block bg-white p-3 rounded-4 shadow-lg" style={{ transition: 'transform 0.3s' }}>
                                            <img src={getImgUrl(qrImageUrl)} alt="UPI QR" style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                )}

                                <div className="text-white opacity-75 small mb-2 fw-bold text-uppercase tracking-wider">UPI Address</div>
                                <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                                    <div className="fw-bolder text-white" style={{ fontSize: '1.75rem', letterSpacing: '1px', wordBreak: 'break-all' }}>
                                        {UPI_ID}
                                    </div>
                                </div>

                                <button onClick={copyUpi} className={`btn w-100 py-3 fw-bold rounded-3 transition-all ${copiedUpi ? 'btn-success' : 'btn-primary'}`}
                                    style={{ backgroundColor: copiedUpi ? '#34c759' : '#FD4621', borderColor: 'transparent', fontSize: '15px' }}>
                                    {copiedUpi ? '✓ UPI ID Copied!' : 'Copy UPI Address'}
                                </button>
                            </div>



                            {/* Payment Steps */}
                            <div className="row g-3 mb-2">
                                {[
                                    { num: 1, text: `Open any UPI app`, detail: 'GPay, PayTM, etc.', icon: '📱' },
                                    { num: 2, text: `Pay ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)}`, detail: `to ${UPI_ID}`, icon: '💸' },
                                    { num: 3, text: 'Take a screenshot', detail: 'of successful payment', icon: '📸' },
                                    { num: 4, text: 'Upload below', detail: 'with Transaction ID', icon: '📤' },
                                ].map(({ num, text, detail, icon }) => (
                                    <div key={num} className="col-6 col-md-3">
                                        <div className="p-3 rounded-4 bg-light border-0 h-100 text-center">
                                            <div className="mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                                                style={{ width: '28px', height: '28px', backgroundColor: '#FD4621', fontSize: '12px' }}>
                                                {num}
                                            </div>
                                            <div className="mb-1" style={{ fontSize: '24px' }}>{icon}</div>
                                            <div className="fw-bold text-dark mb-0" style={{ fontSize: '12px' }}>{text}</div>
                                            <div className="text-muted" style={{ fontSize: '10px' }}>{detail}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transaction ID Input */}
                        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
                            <h5 className="fw-bold mb-4">Submit Payment Proof</h5>

                            <div className="mb-4">
                                <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Transaction ID / UTR Number *</label>
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg bg-light border-0 ps-4 py-3"
                                        placeholder="Enter the 12-digit UTR/TXN ID"
                                        value={transactionId}
                                        onChange={e => setTransactionId(e.target.value)}
                                        style={{ borderRadius: '12px', fontSize: '16px' }} />
                                </div>
                                <div className="text-muted small mt-2 d-flex align-items-center gap-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    Check your UPI app's transaction history for this ID.
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="mb-2">
                                <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Payment Receipt Screenshot *</label>
                                <div
                                    className="d-flex flex-column align-items-center justify-content-center rounded-4 text-center p-4 transition-all"
                                    style={{
                                        border: '2px dashed #eee',
                                        cursor: 'pointer',
                                        minHeight: '200px',
                                        backgroundColor: receiptPreview ? '#fff' : '#fafafa',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#FD4621'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={e => e.preventDefault()}>
                                    {receiptPreview ? (
                                        <div className="position-relative w-100 h-100 d-flex flex-column align-items-center">
                                            <div className="position-relative">
                                                <img src={receiptPreview} alt="Receipt" style={{ maxHeight: '250px', maxWidth: '100%', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                                <div className="position-absolute bottom-0 end-0 bg-success text-white p-2 rounded-circle translate-middle-y translate-middle-x shadow-lg">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </div>
                                            </div>
                                            <div className="text-success fw-bold mt-3">Proof Uploaded Successfully</div>
                                            <div className="text-muted small">{receiptFile?.name} ({(receiptFile?.size! / 1024 / 1024).toFixed(2)} MB)</div>
                                        </div>
                                    ) : (
                                        <div className="p-4">
                                            <div className="mb-3 mx-auto d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm" style={{ width: '64px', height: '64px' }}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FD4621" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="17 8 12 3 7 8"></polyline>
                                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                                </svg>
                                            </div>
                                            <div className="fw-bold text-dark fs-5">Upload Payment Screenshot</div>
                                            <div className="text-muted small mt-1">Tap to select or drag and drop here<br />PNG, JPG or WEBP (Max 5MB)</div>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                                    hidden onChange={handleFileChange} />
                                {receiptPreview && (
                                    <div className="text-center mt-3">
                                        <button onClick={(e) => { e.stopPropagation(); setReceiptFile(null); setReceiptPreview(''); }}
                                            className="btn btn-link text-danger text-decoration-none fw-bold small p-0">
                                            Change Screenshot
                                        </button>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="alert alert-danger rounded-4 mt-3 p-4 shadow-sm border-0 d-flex flex-column gap-2" style={{ backgroundColor: '#fff5f5', borderLeft: '4px solid #ff4d4f' }}>
                                    <div className="d-flex align-items-center gap-2 fw-bold text-danger">
                                        <span style={{ fontSize: '20px' }}>⚠️</span>
                                        {error.includes('not found') ? 'Booking Session Expired' : 'Payment Submission Error'}
                                    </div>
                                    <div className="text-muted small">
                                        {error}
                                    </div>
                                    {error.includes('not found') && (
                                        <button
                                            onClick={() => { reset(); router.push('/tours'); }}
                                            className="btn btn-danger btn-sm rounded-pill fw-bold mt-2 align-self-start px-4">
                                            Restart Booking Process
                                        </button>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !transactionId.trim() || !receiptFile || !!(error && error.includes('not found'))}
                                className="btn w-100 fw-bold py-3 text-white rounded-pill mt-4"
                                style={{
                                    backgroundColor: !transactionId.trim() || !receiptFile ? '#dee2e6' : '#FD4621',
                                    fontSize: '16px',
                                }}>
                                {submitting ? (
                                    <><span className="spinner-border spinner-border-sm me-2" />Submitting Proof...</>
                                ) : 'Submit Payment Proof →'}
                            </button>

                            <div className="d-flex align-items-center justify-content-center gap-2 mt-3 text-muted small">
                                <span>🔒</span>
                                <span>Your payment info is securely stored</span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="col-lg-4 d-none d-lg-block">
                        <div className="bg-white rounded-4 shadow-sm p-4 sticky-top" style={{ top: '90px' }}>
                            <h6 className="fw-bold mb-3">Booking Summary</h6>
                            <div className="d-flex flex-column gap-2" style={{ fontSize: '13px' }}>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Tour</span>
                                    <span className="fw-bold text-end" style={{ maxWidth: '55%' }}>{selection.tourTitle}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Guests</span>
                                    <span className="fw-bold">{selection.travelerCount}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Departure</span>
                                    <span className="fw-bold">{selection.selectedPickup?.fromCity}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Subtotal</span>
                                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pricing.subtotal)}</span>
                                </div>
                                {pricing.couponDiscount > 0 && (
                                    <div className="d-flex justify-content-between text-success">
                                        <span>Discount</span>
                                        <span>-{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pricing.couponDiscount)}</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">GST ({liveGstRate}%)</span>
                                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pricing.taxAmount)}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between align-items-center fw-bolder">
                                    <span className="text-dark">Total Due Now</span>
                                    <span style={{ color: '#FD4621', fontSize: '20px' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)}</span>
                                </div>
                            </div>
                            <div className="mt-4 p-3 rounded-3 text-center" style={{ backgroundColor: '#fff8f6' }}>
                                <div className="fw-bold small text-dark mb-1">Pay to this UPI ID</div>
                                <div className="fw-bolder" style={{ color: '#FD4621' }}>{UPI_ID}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-5"></div>
        </main>
    );
}
