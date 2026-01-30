import { useState, useRef, useEffect } from "react";

// Product types
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: "trend" | "tees" | "book";
  rating: number;
  badge?: string;
  description?: string;
  pages?: number;
  format?: string;
  sizes?: string[];
  colors?: string[];
}

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

// Product data
const trendProducts: Product[] = [
  { id: "t1", name: "Smart Knoblauchpresse", price: 24.99, image: "./panetto-trend-gadget-1-dNjgX18wpl0Y1v1SK0FwQ.png", category: "trend", rating: 4.8, badge: "TikTok Viral" },
  { id: "t2", name: "Turbo Gemüseschneider", price: 34.99, image: "./panetto-trend-gadget-2-SrWdOdqaBncVKNwL7wmId.png", category: "trend", rating: 4.9, badge: "TikTok Viral" },
  { id: "t3", name: "LED Gewürzregal", price: 49.99, image: "./panetto-trend-gadget-3-RCTEmmm2JnCrpBYg8HV5E.png", category: "trend", rating: 4.7, badge: "TikTok Viral" },
  { id: "t4", name: "Elektro-Milchaufschäumer", price: 29.99, image: "./panetto-trend-gadget-4-bqhLaATdbetUJAOTHARuh.png", category: "trend", rating: 4.6, badge: "TikTok Viral" },
  { id: "t5", name: "Mini Vakuumierer", price: 39.99, image: "./panetto-trend-gadget-5-7LcRD-yfpqxBcAOUZKCWx.png", category: "trend", rating: 4.8, badge: "TikTok Viral" },
  { id: "t6", name: "Silikon Küchenhelfer Set", price: 19.99, image: "./panetto-trend-gadget-6-MrDjYhNOtJPA1NKhI7Nqr.png", category: "trend", rating: 4.5, badge: "TikTok Viral" },
];

const teesProducts: Product[] = [
  { id: "s1", name: "Minimalist Wave Tee", price: 29.99, image: "./panetto-tees-design-1-k-vM9G6q6BxELDngu-vvo.png", category: "tees", rating: 4.9, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Weiß", "Grau"] },
  { id: "s2", name: "Urban Streetwear Hoodie", price: 44.99, image: "./panetto-tees-design-2-q9Yvy41Z-1hWQI02Bv9WL.png", category: "tees", rating: 4.8, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Navy", "Olive"] },
  { id: "s3", name: "Abstract Art Print", price: 27.99, image: "./panetto-tees-design-3-WGaRycbaae9KqhnqpmF_V.png", category: "tees", rating: 4.7, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Weiß", "Beige"] },
  { id: "s4", name: "Retro Gradient Shirt", price: 32.99, image: "./panetto-tees-design-4-VQTN1Rx98JVlj5_NYNM0m.png", category: "tees", rating: 4.6, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Weiß"] },
  { id: "s5", name: "Statement Oversized Tee", price: 34.99, image: "./panetto-tees-design-5-eaK8RGhqp4ab1qv5iMFlO.png", category: "tees", rating: 4.8, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Grau", "Weiß"] },
  { id: "s6", name: "Limited Edition Print", price: 39.99, image: "./panetto-tees-design-6-dTG8HXVT0qUHUNFy-OXSp.png", category: "tees", rating: 4.9, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Navy"] },
];

const bookProducts: Product[] = [
  { id: "b1", name: "Mindset Mastery", price: 14.99, image: "./panetto-book-cover-1-4xJZsefvuC4c9EeqFVjtC.png", category: "book", rating: 4.9, description: "Entfalte dein volles Potenzial", pages: 248, format: "PDF / ePub" },
  { id: "b2", name: "Erfolgsgewohnheiten", price: 12.99, image: "./panetto-book-cover-2-wxUqO0sR82JBX3IC9sqxF.png", category: "book", rating: 4.8, description: "Tägliche Routinen für mehr Erfolg", pages: 186, format: "PDF / ePub" },
  { id: "b3", name: "Selbstdisziplin", price: 9.99, image: "./panetto-book-cover-3-Ig3O47Kf5sdCKxIsR9jLp.png", category: "book", rating: 4.7, description: "Willenskraft stärken", pages: 142, format: "PDF / ePub" },
  { id: "b4", name: "Finanziell Frei", price: 19.99, image: "./panetto-book-cover-4-mprWP_pN5yvyHyANMdeS9.png", category: "book", rating: 4.9, description: "Dein Weg zur finanziellen Freiheit", pages: 312, format: "PDF / ePub" },
  { id: "b5", name: "Produktivitäts-Guide", price: 11.99, image: "./panetto-book-cover-5-aqZysJf52i7lZS93gxyiE.png", category: "book", rating: 4.6, description: "Mehr schaffen in weniger Zeit", pages: 168, format: "PDF / ePub" },
  { id: "b6", name: "Morgenroutine", price: 9.99, image: "./panetto-book-cover-6-uHtQXweqoxpe3XoroKOIe.png", category: "book", rating: 4.8, description: "Starte jeden Tag mit Energie", pages: 124, format: "PDF / ePub" },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "text-amber-400" : "text-neutral-600"}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-neutral-400 text-sm ml-1">({rating})</span>
  </div>
);

const TikTokIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default function Index() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"trend" | "tees" | "book">("trend");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [newsletter, setNewsletter] = useState("");

  const trendRef = useRef<HTMLDivElement>(null);
  const teesRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product: Product, size?: string, color?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size && item.selectedColor === color);
      if (existing) {
        return prev.map(item => item.id === product.id && item.selectedSize === size && item.selectedColor === color ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string, size?: string, color?: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size && item.selectedColor === color)));
  };

  const updateQuantity = (id: string, size: string | undefined, color: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  const allProducts = [...trendProducts, ...teesProducts, ...bookProducts];
  const filteredProducts = searchQuery
    ? allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeTab === "trend" ? trendProducts : activeTab === "tees" ? teesProducts : bookProducts;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
                <span className="text-white">El</span>
                <span className="text-amber-400">Panetto</span>
              </h1>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection(trendRef)} className="text-neutral-300 hover:text-amber-400 transition-colors font-medium">PanettoTrend</button>
              <button onClick={() => scrollToSection(teesRef)} className="text-neutral-300 hover:text-amber-400 transition-colors font-medium">PanettoTees</button>
              <button onClick={() => scrollToSection(bookRef)} className="text-neutral-300 hover:text-amber-400 transition-colors font-medium">PanettoBook</button>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-neutral-300 hover:text-amber-400 transition-colors">
                <TikTokIcon /> TikTok Shop
              </a>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden sm:block relative">
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 lg:w-56 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-full text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
                <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Cart */}
              <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-neutral-800 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-black text-xs font-bold rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </button>

              {/* Mobile menu */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-neutral-800 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-neutral-900 border-t border-neutral-800 animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <input
                type="text"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-full text-sm"
              />
              <button onClick={() => scrollToSection(trendRef)} className="block w-full text-left py-2 text-neutral-300 hover:text-amber-400">PanettoTrend</button>
              <button onClick={() => scrollToSection(teesRef)} className="block w-full text-left py-2 text-neutral-300 hover:text-amber-400">PanettoTees</button>
              <button onClick={() => scrollToSection(bookRef)} className="block w-full text-left py-2 text-neutral-300 hover:text-amber-400">PanettoBook</button>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 text-neutral-300 hover:text-amber-400">
                <TikTokIcon /> TikTok Shop
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1), transparent 40%)`
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="inline-block px-4 py-2 mb-6 text-xs font-semibold tracking-widest text-amber-400 uppercase bg-amber-400/10 rounded-full border border-amber-400/20">
              🔥 Trending auf TikTok
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 animate-fade-up animation-delay-100">
            Trendige Produkte für<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">deinen Alltag</span>
          </h2>

          <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-200">
            Entdecke die besten Produkte direkt von TikTok Shop – Gadgets, Fashion & eBooks für deinen Erfolg.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-300">
            <button onClick={() => scrollToSection(trendRef)} className="group px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-lg rounded-full hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40">
              Jetzt shoppen
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="px-8 py-4 border-2 border-neutral-600 text-white font-bold text-lg rounded-full hover:border-amber-400 hover:text-amber-400 transition-all flex items-center justify-center gap-2">
              <TikTokIcon /> Auf TikTok ansehen
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-neutral-900/50 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl">🚀</div>
              <h4 className="font-bold text-white">Schneller Versand</h4>
              <p className="text-sm text-neutral-400">2-4 Werktage</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🔒</div>
              <h4 className="font-bold text-white">Sichere Zahlung</h4>
              <p className="text-sm text-neutral-400">SSL verschlüsselt</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">↩️</div>
              <h4 className="font-bold text-white">14 Tage Rückgabe</h4>
              <p className="text-sm text-neutral-400">Kostenlos</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">⭐</div>
              <h4 className="font-bold text-white">Top Bewertungen</h4>
              <p className="text-sm text-neutral-400">4.9/5 Sterne</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 sticky top-16 lg:top-20 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-2 sm:gap-4">
            {[
              { id: "trend", label: "PanettoTrend", icon: "🔥", ref: trendRef },
              { id: "tees", label: "PanettoTees", icon: "👕", ref: teesRef },
              { id: "book", label: "PanettoBook", icon: "📚", ref: bookRef },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as typeof activeTab); scrollToSection(tab.ref); setSearchQuery(""); }}
                className={`px-4 sm:px-6 py-3 rounded-full font-semibold transition-all ${activeTab === tab.id ? "bg-amber-400 text-black" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && (
        <section className="py-16 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-bold mb-8">Suchergebnisse für "{searchQuery}"</h3>
            {filteredProducts.length === 0 ? (
              <p className="text-neutral-400">Keine Produkte gefunden.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} setSizeChartOpen={setSizeChartOpen} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* PanettoTrend Section */}
      {!searchQuery && (
        <>
          <section ref={trendRef} className="py-20 bg-neutral-950" id="trend">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-400 bg-amber-400/10 rounded-full mb-4">TRENDING</span>
                <h3 className="text-3xl sm:text-4xl font-black mb-4">PanettoTrend</h3>
                <p className="text-neutral-400 max-w-2xl mx-auto">Die beliebtesten TikTok Gadgets – viral, praktisch, unverzichtbar.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendProducts.map(product => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} setSizeChartOpen={setSizeChartOpen} />
                ))}
              </div>
            </div>
          </section>

          {/* PanettoTees Section */}
          <section ref={teesRef} className="py-20 bg-neutral-900" id="tees">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-400 bg-amber-400/10 rounded-full mb-4">FASHION</span>
                <h3 className="text-3xl sm:text-4xl font-black mb-4">PanettoTees</h3>
                <p className="text-neutral-400 max-w-2xl mx-auto">Premium Streetwear mit einzigartigen Designs – limited & exklusiv.</p>
                <button onClick={() => setSizeChartOpen(true)} className="mt-4 text-amber-400 hover:underline text-sm">📏 Größentabelle anzeigen</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teesProducts.map(product => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} setSizeChartOpen={setSizeChartOpen} />
                ))}
              </div>
            </div>
          </section>

          {/* PanettoBook Section */}
          <section ref={bookRef} className="py-20 bg-neutral-950" id="book">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-400 bg-amber-400/10 rounded-full mb-4">DIGITAL</span>
                <h3 className="text-3xl sm:text-4xl font-black mb-4">PanettoBook</h3>
                <p className="text-neutral-400 max-w-2xl mx-auto">Transformiere dein Mindset mit unseren Premium eBooks.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookProducts.map(product => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} setSizeChartOpen={setSizeChartOpen} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black mb-4">Was unsere Kunden sagen</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah M.", text: "Die Qualität ist unfassbar gut! Mein neues Lieblingsshirt. 😍", rating: 5 },
              { name: "Tim K.", text: "Schnelle Lieferung, super verpackt. Der Gemüseschneider ist ein Gamechanger!", rating: 5 },
              { name: "Lisa R.", text: "Das eBook hat mein Mindset komplett verändert. Absolute Empfehlung!", rating: 5 },
            ].map((review, i) => (
              <div key={i} className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
                <StarRating rating={review.rating} />
                <p className="text-neutral-300 mt-4 mb-4">{review.text}</p>
                <p className="text-amber-400 font-semibold">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-neutral-950 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-black mb-4">
                <span className="text-white">El</span><span className="text-amber-400">Panetto</span>
              </h3>
              <p className="text-neutral-400 mb-6 max-w-sm">Deine erste Adresse für trendige TikTok Produkte. Gadgets, Fashion & eBooks – alles für deinen Lifestyle.</p>
              <div className="flex gap-4">
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-neutral-800 rounded-full hover:bg-amber-400 hover:text-black transition-all">
                  <TikTokIcon />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-neutral-800 rounded-full hover:bg-amber-400 hover:text-black transition-all">
                  <InstagramIcon />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-amber-400 transition-colors">Über uns</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-amber-400 transition-colors">Kontakt</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-amber-400 transition-colors">Impressum</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-amber-400 transition-colors">Datenschutz</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold text-white mb-4">Newsletter</h4>
              <p className="text-neutral-400 text-sm mb-4">Exklusive Angebote & neue Produkte direkt in dein Postfach.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Deine E-Mail"
                  value={newsletter}
                  onChange={(e) => setNewsletter(e.target.value)}
                  className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
                <button className="px-4 py-2 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
            © {new Date().getFullYear()} El Panetto. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-neutral-900 shadow-2xl animate-slide-in">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                <h3 className="text-xl font-bold">Warenkorb ({cartCount})</h3>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-neutral-800 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center text-neutral-400 py-12">
                    <p className="text-4xl mb-4">🛒</p>
                    <p>Dein Warenkorb ist leer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 p-4 bg-neutral-800/50 rounded-xl">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          {item.selectedSize && <p className="text-xs text-neutral-400">Größe: {item.selectedSize}</p>}
                          {item.selectedColor && <p className="text-xs text-neutral-400">Farbe: {item.selectedColor}</p>}
                          <p className="text-amber-400 font-bold mt-1">€{item.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)} className="w-7 h-7 bg-neutral-700 rounded hover:bg-neutral-600 text-sm">-</button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)} className="w-7 h-7 bg-neutral-700 rounded hover:bg-neutral-600 text-sm">+</button>
                            <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="ml-auto text-red-400 text-sm hover:underline">Entfernen</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-neutral-800">
                  <div className="flex justify-between mb-4">
                    <span className="text-neutral-400">Zwischensumme</span>
                    <span className="font-bold text-xl">€{cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all">
                    Zur Kasse →
                  </button>
                  <p className="text-center text-xs text-neutral-500 mt-3">Sichere Zahlung mit Stripe</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSizeChartOpen(false)} />
          <div className="relative bg-neutral-900 rounded-2xl p-6 max-w-lg w-full mx-4 animate-scale-in">
            <button onClick={() => setSizeChartOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-neutral-800 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-4">📏 Größentabelle</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="py-2 text-left">Größe</th>
                  <th className="py-2">Brust (cm)</th>
                  <th className="py-2">Länge (cm)</th>
                </tr>
              </thead>
              <tbody className="text-neutral-400">
                <tr className="border-b border-neutral-800"><td className="py-2 font-medium text-white">S</td><td className="py-2 text-center">96-101</td><td className="py-2 text-center">71</td></tr>
                <tr className="border-b border-neutral-800"><td className="py-2 font-medium text-white">M</td><td className="py-2 text-center">101-106</td><td className="py-2 text-center">73</td></tr>
                <tr className="border-b border-neutral-800"><td className="py-2 font-medium text-white">L</td><td className="py-2 text-center">106-111</td><td className="py-2 text-center">76</td></tr>
                <tr className="border-b border-neutral-800"><td className="py-2 font-medium text-white">XL</td><td className="py-2 text-center">111-116</td><td className="py-2 text-center">79</td></tr>
                <tr><td className="py-2 font-medium text-white">XXL</td><td className="py-2 text-center">116-121</td><td className="py-2 text-center">81</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-up { animation: fade-up 0.6s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
      `}</style>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, addToCart, setSizeChartOpen }: { product: Product; addToCart: (p: Product, s?: string, c?: string) => void; setSizeChartOpen: (v: boolean) => void }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[1] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");

  return (
    <div className="group bg-neutral-800/50 rounded-2xl overflow-hidden border border-neutral-700/50 hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-400/10">
      <div className="relative aspect-square overflow-hidden bg-neutral-900">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-5">
        <h4 className="font-bold text-lg mb-2 group-hover:text-amber-400 transition-colors">{product.name}</h4>
        <StarRating rating={product.rating} />
        
        {product.description && (
          <p className="text-neutral-400 text-sm mt-2">{product.description}</p>
        )}
        
        {product.pages && (
          <p className="text-neutral-500 text-xs mt-2">📖 {product.pages} Seiten · {product.format}</p>
        )}

        {product.sizes && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400">Größe:</span>
              <button onClick={() => setSizeChartOpen(true)} className="text-xs text-amber-400 hover:underline">Größentabelle</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${selectedSize === size ? "bg-amber-400 text-black border-amber-400" : "border-neutral-600 hover:border-amber-400"}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors && (
          <div className="mt-3">
            <span className="text-xs text-neutral-400">Farbe:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {product.colors.map(color => (
                <button key={color} onClick={() => setSelectedColor(color)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${selectedColor === color ? "bg-amber-400 text-black border-amber-400" : "border-neutral-600 hover:border-amber-400"}`}>
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-700">
          <span className="text-2xl font-black text-amber-400">€{product.price.toFixed(2)}</span>
          <button
            onClick={() => addToCart(product, selectedSize, selectedColor)}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm rounded-full hover:from-amber-300 hover:to-amber-400 transition-all"
          >
            {product.category === "book" ? "Jetzt herunterladen" : product.category === "trend" ? "Schnell kaufen" : "In den Warenkorb"}
          </button>
        </div>
      </div>
    </div>
  );
}
