import "./globals.css";
export const metadata = {
  title: { default: "EventFund", template: "%s | EventFund" },
  description: "Rencana anggaran dan keuangan event.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3"
        >
          Lewati ke isi utama
        </a>
        {children}
      </body>
    </html>
  );
}
