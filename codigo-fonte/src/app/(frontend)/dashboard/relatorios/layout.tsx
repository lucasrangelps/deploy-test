import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RelatoriosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={dmSans.className}>
      {children}
    </div>
  );
}