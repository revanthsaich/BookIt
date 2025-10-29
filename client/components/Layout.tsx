import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import Cart from "./Cart";
import GlobalModal from "./ui/GlobalModal";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-full md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-3" aria-label="Home">
              <img
                src="https://pouch.jumpshare.com/preview/6ATGz8BQY0HNMvCLRTw-BpJjig-3LTqIWcoC8ggsLa_TJMIGrIZr9YcfcLt1a39F7XRZvyIrVHxFxlSoRHN_cL3HdFty3xkJHklMIK1J3-o"
                alt="Highway Delite logo"
                className="h-10 w-auto md:h-16 md:w-auto rounded-md object-contain"
              />
            </Link>
            {/* Center: Search bar + Search button + Cart */}
            <div className="flex items-center gap-3 flex-1 md:flex-none md:max-w-lg md:ml-10 justify-end">
              <input
                type="text"
                placeholder="Search experiences"
                className="hidden md:block flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={() => setMobileSearchOpen((s) => !s)}
                aria-label="Open search"
                className="px-3 py-2 bg-yellow-400 text-black font-medium rounded-md hover:bg-yellow-500 transition-colors flex items-center justify-center"
              >
                <Search className="w-4 h-4 block md:hidden" />
                <span className="hidden md:inline">Search</span>
              </button>
              <Cart />
            </div>
          </div>
          {/* Mobile search panel — shown when the icon is toggled */}
          {mobileSearchOpen && (
            <div className="md:hidden bg-white border-t px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search experiences"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  aria-label="Close search"
                  className="px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <GlobalModal />

      <footer className="bg-gray-50 border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">BookIt</h3>
              <p className="text-sm text-muted-foreground">
                Discover and book amazing travel experiences around the world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 BookIt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
