import "./globals.css";

export const metadata = {
  title: "Lanyard 3D",
  description: "An interactive 3D lanyard and ID card.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
