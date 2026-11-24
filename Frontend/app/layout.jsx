import "./globals.css";

export const metadata = {
  title: "Soundwave — music for every moment",
  description: "Discover and share music with Soundwave.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
