import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Home, List, PlusCircle, PiggyBank } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Track your finances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-black text-white`}
      >
        {/* Navigation Menu */}
        <div className={`bg-black text-white w-full flex justify-between items-center px-8 pt-4 pb-4 ${montserrat.className}`}>
          {/* Left side: App icon and name */}
          <div className="flex items-center gap-2">
            <PiggyBank size={28} />
            <span className="text-2xl font-bold">Finance Tracker</span>
          </div>
          {/* Right side: Navigation */}
          <div className="flex justify-end">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/" className="text-lg flex flex-row items-center gap-2"><Home size={20} /> Dashboard</NavigationMenuLink> 
                </NavigationMenuItem>
  
                <NavigationMenuItem>
                  <NavigationMenuLink href="/transactions" className="text-lg flex flex-row items-center gap-2"><List size={20} /> Transactions</NavigationMenuLink> 
                </NavigationMenuItem>
  
                <NavigationMenuItem>
                  <NavigationMenuLink href="/add-transaction" className="text-lg flex flex-row items-center gap-2"><PlusCircle size={20} /> Add Transaction</NavigationMenuLink> 
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
