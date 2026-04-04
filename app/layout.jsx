import "./globals.css";

export const metadata = {
  title: "ওরা এগারো জন সমিতি",
  description:
    "ওরা এগারো জন সমিতির অফিশিয়াল ওয়েবসাইট। আমাদের ইভেন্ট, সেবা, সদস্য এবং যোগাযোগ তথ্য এক জায়গায়।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <meta name="theme-color" content="#0d6e4c" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Playfair+Display:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
