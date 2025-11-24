'use client';

interface InquiryButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function InquiryButton({ className, children }: InquiryButtonProps) {
  const handleClick = () => {
    const event = new CustomEvent('openInquiryModal');
    window.dispatchEvent(event);
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}

