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
  { id: "t7", name: "Digitale Küchenwaage", price: 34.99, image: "./panetto-trend-gadget-7-KcaO2AonncxREKxaPc3xD.png", category: "trend", rating: 4.7, badge: "TikTok Viral" },
  { id: "t8", name: "Smart Kochthermometer", price: 42.99, image: "./panetto-trend-gadget-8-4cZQtg6j6LB28tw4PKvpj.png", category: "trend", rating: 4.9, badge: "TikTok Viral" },
  { id: "t9", name: "Premium Messerset", price: 69.99, image: "./panetto-trend-gadget-9-zeVL5LNRwiSvZgoJd0Y61.png", category: "trend", rating: 4.8, badge: "TikTok Viral" },
  { id: "t10", name: "Elektrischer Milchaufschäumer Pro", price: 29.99, image: "./panetto-trend-gadget-10-N6RTSRW3oNDRaH4tM6kV4.png", category: "trend", rating: 4.6, badge: "TikTok Viral" },
];

const teesProducts: Product[] = [
  { id: "s1", name: "Minimalist Wave Tee", price: 29.99, image: "./panetto-tees-design-1-k-vM9G6q6BxELDngu-vvo.png", category: "tees", rating: 4.9, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Weiß", "Grau"] },
  { id: "s2", name: "Urban Streetwear Hoodie", price: 44.99, image: "./panetto-tees-design-2-q9Yvy41Z-1hWQI02Bv9WL.png", category: "tees", rating: 4.8, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Navy", "Olive"] },
  { id: "s3", name: "Abstract Art Print", price: 27.99, image: "./panetto-tees-design-3-WGaRycbaae9KqhnqpmF_V.png", category: "tees", rating: 4.7, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Weiß", "Beige"] },
  { id: "s4", name: "Retro Gradient Shirt", price: 32.99, image: "./panetto-tees-design-4-VQTN1Rx98JVlj5_NYNM0m.png", category: "tees", rating: 4.6, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Weiß"] },
  { id: "s5", name: "Statement Oversized Tee", price: 34.99, image: "./panetto-tees-design-5-eaK8RGhqp4ab1qv5iMFlO.png", category: "tees", rating: 4.8, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Grau", "Weiß"] },
  { id: "s6", name: "Limited Edition Print", price: 39.99, image: "./panetto-tees-design-6-dTG8HXVT0qUHUNFy-OXSp.png", category: "tees", rating: 4.9, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Navy"] },
  { id: "s7", name: "Minimalist Polo", price: 39.99, image: "./panetto-tees-design-7-4nGRzvY33GhKacqZEQmyG.png", category: "tees", rating: 4.8, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Weiß", "Schwarz", "Navy"] },
  { id: "s8", name: "Artistic Oversized Tee", price: 34.99, image: "./panetto-tees-design-8-wz3hW8n8zmxklHaU_TCd_.png", category: "tees", rating: 4.7, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Weiß", "Grau", "Beige"] },
  { id: "s9", name: "Graphic Longsleeve", price: 44.99, image: "./panetto-tees-design-9-Y0-QNLiXRG0qSspsIlgnV.png", category: "tees", rating: 4.8, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Weiß"] },
  { id: "s10", name: "Designer Zip Hoodie", price: 54.99, image: "./panetto-tees-design-10-Vekv2stBWypDjExiaedu2.png", category: "tees", rating: 4.9, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Schwarz", "Grau", "Navy"] },
];

const bookProducts: Product[] = [
  { id: "b1", name: "Mindset Mastery", price: 14.99, image: "./panetto-book-cover-1-4xJZsefvuC4c9EeqFVjtC.png", category: "book", rating: 4.9, description: "Entfalte dein volles Potenzial", pages: 248, format: "PDF / ePub" },
  { id: "b2", name: "Erfolgsgewohnheiten", price: 12.99, image: "./panetto-book-cover-2-wxUqO0sR82JBX3IC9sqxF.png", category: "book", rating: 4.8, description: "Tägliche Routinen für mehr Erfolg", pages: 186, format: "PDF / ePub" },
  { id: "b3", name: "Selbstdisziplin", price: 9.99, image: "./panetto-book-cover-3-Ig3O47Kf5sdCKxIsR9jLp.png", category: "book", rating: 4.7, description: "Willenskraft stärken", pages: 142, format: "PDF / ePub" },
  { id: "b4", name: "Finanziell Frei", price: 19.99, image: "./panetto-book-cover-4-mprWP_pN5yvyHyANMdeS9.png", category: "book", rating: 4.9, description: "Dein Weg zur finanziellen Freiheit", pages: 312, format: "PDF / ePub" },
  { id: "b5", name: "Produktivitäts-Guide", price: 11.99, image: "./panetto-book-cover-5-aqZysJf52i7lZS93gxyiE.png", category: "book", rating: 4.6, description: "Mehr schaffen in weniger Zeit", pages: 168, format: "PDF / ePub" },
  { id: "b6", name: "Morgenroutine", price: 9.99, image: "./panetto-book-cover-6-uHtQXweqoxpe3XoroKOIe.png", category: "book", rating: 4.8, description: "Starte jeden Tag mit Energie", pages: 124, format: "PDF / ePub" },
  { id: "b7", name: "Produktivitäts-Journal", price: 14.99, image: "./panetto-book-cover-7-CgSg6Us3W_DnLZQ6F4t2W.png", category: "book", rating: 4.7, description: "Dein täglicher Begleiter für mehr Fokus", pages: 180, format: "PDF / ePub" },
  { id: "b8", name: "Meditations-Guide", price: 12.99, image: "./panetto-book-cover-8-N8suiW4sqUxah4VhEUW9_.png", category: "book", rating: 4.8, description: "Innere Ruhe finden", pages: 120, format: "PDF / ePub" },
  { id: "b9", name: "Business Strategie", price: 19.99, image: "./panetto-book-cover-9-LgNXo7Wf3zd2_wvlta5q1.png", category: "book", rating: 4.9, description: "Erfolgreiche Geschäftsmodelle aufbauen", pages: 250, format: "PDF" },
  { id: "b10", name: "Wellness Planner", price: 16.99, image: "./panetto-book-cover-10-zJ-QpMLXdI-poWD-BNDiD.png", category: "book", rating: 4.7, description: "Dein Weg zu mehr Balance", pages: 200, format: "PDF / ePub" },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "text-[#C9A962]" : "text-stone-300"}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-stone-500 text-sm ml-1">({rating})</span>
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
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl lg:text-3xl font-light tracking-[0.2em] uppercase">
                <span className="text-stone-900">El</span>
                <span className="text-[#C9A962]">Panetto</span>
              </h1>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              <button onClick={() => scrollToSection(trendRef)} className="text-stone-600 hover:text-[#C9A962] transition-colors text-sm tracking-wide uppercase font-medium">PanettoTrend</button>
              <button onClick={() => scrollToSection(teesRef)} className="text-stone-600 hover:text-[#C9A962] transition-colors text-sm tracking-wide uppercase font-medium">PanettoTees</button>
              <button onClick={() => scrollToSection(bookRef)} className="text-stone-600 hover:text-[#C9A962] transition-colors text-sm tracking-wide uppercase font-medium">PanettoBook</button>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-stone-600 hover:text-[#C9A962] transition-colors text-sm tracking-wide uppercase font-medium">
                <TikTokIcon /> Shop
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
                  className="w-40 lg:w-56 px-4 py-2 bg-white border border-stone-200 rounded-none text-sm focus:outline-none focus:border-[#C9A962] transition-colors placeholder:text-stone-400"
                />
                <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Cart */}
              <button onClick={() => setCartOpen(true)} className="relative p-2 hover:text-[#C9A962] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C9A962] text-white text-xs font-medium rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </button>

              {/* Mobile menu */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:text-[#C9A962]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-200 animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <input
                type="text"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-[#C9A962]"
              />
              <button onClick={() => scrollToSection(trendRef)} className="block w-full text-left py-3 text-stone-600 hover:text-[#C9A962] text-sm tracking-wide uppercase border-b border-stone-100">PanettoTrend</button>
              <button onClick={() => scrollToSection(teesRef)} className="block w-full text-left py-3 text-stone-600 hover:text-[#C9A962] text-sm tracking-wide uppercase border-b border-stone-100">PanettoTees</button>
              <button onClick={() => scrollToSection(bookRef)} className="block w-full text-left py-3 text-stone-600 hover:text-[#C9A962] text-sm tracking-wide uppercase border-b border-stone-100">PanettoBook</button>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-3 text-stone-600 hover:text-[#C9A962] text-sm tracking-wide uppercase">
                <TikTokIcon /> TikTok Shop
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Elegant Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] via-[#F5F4F0] to-[#FAF9F6]">
          {/* Subtle geometric pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L100 50L50 100L0 50Z' fill='none' stroke='%23C9A962' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }} />
          {/* Gold accent glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9A962]/5 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="inline-block px-6 py-2 mb-8 text-xs font-medium tracking-[0.3em] text-[#C9A962] uppercase border border-[#C9A962]/30">
              Trending auf TikTok
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight leading-tight mb-8 animate-fade-up animation-delay-100 tracking-tight">
            Trendige Produkte für<br />
            <span className="font-normal text-[#C9A962]">deinen Alltag</span>
          </h2>

          <p className="text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto mb-12 animate-fade-up animation-delay-200 font-light leading-relaxed">
            Entdecke die besten Produkte direkt von TikTok Shop – Gadgets, Fashion & eBooks für deinen Erfolg.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-300">
            <button onClick={() => scrollToSection(trendRef)} className="group px-10 py-4 bg-stone-900 text-white font-medium text-sm tracking-[0.15em] uppercase hover:bg-[#C9A962] transition-all duration-300">
              Jetzt shoppen
              <span className="inline-block ml-3 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="px-10 py-4 border border-stone-300 text-stone-700 font-medium text-sm tracking-[0.15em] uppercase hover:border-[#C9A962] hover:text-[#C9A962] transition-all duration-300 flex items-center justify-center gap-3">
              <TikTokIcon /> Auf TikTok ansehen
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto flex items-center justify-center border border-[#C9A962]/30 text-[#C9A962]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h4 className="font-medium text-stone-900 text-sm tracking-wide uppercase">Schneller Versand</h4>
              <p className="text-sm text-stone-500">2-4 Werktage</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto flex items-center justify-center border border-[#C9A962]/30 text-[#C9A962]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h4 className="font-medium text-stone-900 text-sm tracking-wide uppercase">Sichere Zahlung</h4>
              <p className="text-sm text-stone-500">SSL verschlüsselt</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto flex items-center justify-center border border-[#C9A962]/30 text-[#C9A962]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <h4 className="font-medium text-stone-900 text-sm tracking-wide uppercase">14 Tage Rückgabe</h4>
              <p className="text-sm text-stone-500">Kostenlos</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto flex items-center justify-center border border-[#C9A962]/30 text-[#C9A962]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </div>
              <h4 className="font-medium text-stone-900 text-sm tracking-wide uppercase">Top Bewertungen</h4>
              <p className="text-sm text-stone-500">4.9/5 Sterne</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-6 sticky top-16 lg:top-20 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-2 sm:gap-8">
            {[
              { id: "trend", label: "PanettoTrend", ref: trendRef },
              { id: "tees", label: "PanettoTees", ref: teesRef },
              { id: "book", label: "PanettoBook", ref: bookRef },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as typeof activeTab); scrollToSection(tab.ref); setSearchQuery(""); }}
                className={`px-4 sm:px-8 py-3 text-sm tracking-[0.1em] uppercase font-medium transition-all duration-300 ${activeTab === tab.id ? "text-white bg-stone-900" : "text-stone-600 hover:text-[#C9A962] bg-transparent"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && (
        <section className="py-20 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-light mb-10 tracking-wide">Suchergebnisse für <span className="text-[#C9A962]">"{searchQuery}"</span></h3>
            {filteredProducts.length === 0 ? (
              <p className="text-stone-500">Keine Produkte gefunden.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <section ref={trendRef} className="py-24 bg-[#FAF9F6]" id="trend">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1 text-xs font-medium text-[#C9A962] tracking-[0.3em] uppercase border-b border-[#C9A962]/30 mb-6">Trending</span>
                <h3 className="text-3xl sm:text-4xl font-light mb-5 tracking-wide">PanettoTrend</h3>
                <p className="text-stone-500 max-w-2xl mx-auto font-light">Die beliebtesten TikTok Gadgets – viral, praktisch, unverzichtbar.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {trendProducts.map(product => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} setSizeChartOpen={setSizeChartOpen} />
                ))}
              </div>
            </div>
          </section>

          {/* PanettoTees Section */}
          <section ref={teesRef} className="py-24 bg-white" id="tees">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1 text-xs font-medium text-[#C9A962] tracking-[0.3em] uppercase border-b border-[#C9A962]/30 mb-6">Fashion</span>
                <h3 className="text-3xl sm:text-4xl font-light mb-5 tracking-wide">PanettoTees</h3>
                <p className="text-stone-500 max-w-2xl mx-auto font-light">Premium Streetwear mit einzigartigen Designs – limited & exklusiv.</p>
                <button onClick={() => setSizeChartOpen(true)} className="mt-6 text-[#C9A962] hover:underline text-sm tracking-wide">Größentabelle anzeigen</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {teesProducts.map(product => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} setSizeChartOpen={setSizeChartOpen} />
                ))}
              </div>
            </div>
          </section>

          {/* PanettoBook Section */}
          <section ref={bookRef} className="py-24 bg-[#FAF9F6]" id="book">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1 text-xs font-medium text-[#C9A962] tracking-[0.3em] uppercase border-b border-[#C9A962]/30 mb-6">Digital</span>
                <h3 className="text-3xl sm:text-4xl font-light mb-5 tracking-wide">PanettoBook</h3>
                <p className="text-stone-500 max-w-2xl mx-auto font-light">Transformiere dein Mindset mit unseren Premium eBooks.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {bookProducts.map(product => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} setSizeChartOpen={setSizeChartOpen} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 text-xs font-medium text-[#C9A962] tracking-[0.3em] uppercase border-b border-[#C9A962]/30 mb-6">Testimonials</span>
            <h3 className="text-3xl sm:text-4xl font-light tracking-wide">Was unsere Kunden sagen</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah M.", text: "Die Qualität ist unfassbar gut! Mein neues Lieblingsshirt.", rating: 5 },
              { name: "Tim K.", text: "Schnelle Lieferung, super verpackt. Der Gemüseschneider ist ein Gamechanger!", rating: 5 },
              { name: "Lisa R.", text: "Das eBook hat mein Mindset komplett verändert. Absolute Empfehlung!", rating: 5 },
            ].map((review, i) => (
              <div key={i} className="bg-[#FAF9F6] p-8 border border-stone-100">
                <StarRating rating={review.rating} />
                <p className="text-stone-600 mt-6 mb-6 font-light leading-relaxed italic">"{review.text}"</p>
                <p className="text-[#C9A962] font-medium text-sm tracking-wide uppercase">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-light tracking-[0.2em] uppercase mb-6">
                <span className="text-white">El</span><span className="text-[#C9A962]">Panetto</span>
              </h3>
              <p className="text-stone-400 mb-8 max-w-sm font-light leading-relaxed">Deine erste Adresse für trendige TikTok Produkte. Gadgets, Fashion & eBooks – alles für deinen Lifestyle.</p>
              <div className="flex gap-4">
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-11 h-11 flex items-center justify-center border border-stone-700 text-stone-400 hover:border-[#C9A962] hover:text-[#C9A962] transition-all">
                  <TikTokIcon />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-11 h-11 flex items-center justify-center border border-stone-700 text-stone-400 hover:border-[#C9A962] hover:text-[#C9A962] transition-all">
                  <InstagramIcon />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-medium text-sm tracking-[0.15em] uppercase mb-6">Links</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-stone-400 hover:text-[#C9A962] transition-colors font-light">Über uns</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#C9A962] transition-colors font-light">Kontakt</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#C9A962] transition-colors font-light">Impressum</a></li>
                <li><a href="#" className="text-stone-400 hover:text-[#C9A962] transition-colors font-light">Datenschutz</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-medium text-sm tracking-[0.15em] uppercase mb-6">Newsletter</h4>
              <p className="text-stone-400 text-sm mb-6 font-light">Exklusive Angebote & neue Produkte direkt in dein Postfach.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Deine E-Mail"
                  value={newsletter}
                  onChange={(e) => setNewsletter(e.target.value)}
                  className="flex-1 px-4 py-3 bg-transparent border border-stone-700 text-sm focus:outline-none focus:border-[#C9A962] transition-colors placeholder:text-stone-500"
                />
                <button className="px-5 py-3 bg-[#C9A962] text-stone-900 font-medium hover:bg-[#B8984F] transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-stone-800 text-center text-stone-500 text-sm font-light">
            © {new Date().getFullYear()} El Panetto. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl animate-slide-in">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <h3 className="text-lg font-medium tracking-wide">Warenkorb ({cartCount})</h3>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:text-[#C9A962] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center text-stone-400 py-16">
                    <svg className="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="font-light">Dein Warenkorb ist leer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 p-4 bg-stone-50 border border-stone-100">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          {item.selectedSize && <p className="text-xs text-stone-500">Größe: {item.selectedSize}</p>}
                          {item.selectedColor && <p className="text-xs text-stone-500">Farbe: {item.selectedColor}</p>}
                          <p className="text-[#C9A962] font-medium mt-1">€{item.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)} className="w-7 h-7 border border-stone-200 hover:border-[#C9A962] text-sm transition-colors">-</button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)} className="w-7 h-7 border border-stone-200 hover:border-[#C9A962] text-sm transition-colors">+</button>
                            <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="ml-auto text-stone-400 text-xs hover:text-red-500 transition-colors">Entfernen</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-stone-100">
                  <div className="flex justify-between mb-6">
                    <span className="text-stone-500 font-light">Zwischensumme</span>
                    <span className="font-medium text-xl">€{cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="w-full py-4 bg-stone-900 text-white font-medium text-sm tracking-[0.15em] uppercase hover:bg-[#C9A962] transition-all duration-300">
                    Zur Kasse →
                  </button>
                  <p className="text-center text-xs text-stone-400 mt-4 font-light">Sichere Zahlung mit Stripe</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSizeChartOpen(false)} />
          <div className="relative bg-white p-8 max-w-lg w-full mx-4 animate-scale-in">
            <button onClick={() => setSizeChartOpen(false)} className="absolute top-4 right-4 p-2 hover:text-[#C9A962] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-light mb-6 tracking-wide">Größentabelle</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="py-3 text-left font-medium">Größe</th>
                  <th className="py-3 font-medium">Brust (cm)</th>
                  <th className="py-3 font-medium">Länge (cm)</th>
                </tr>
              </thead>
              <tbody className="text-stone-600">
                <tr className="border-b border-stone-100"><td className="py-3 font-medium text-stone-900">S</td><td className="py-3 text-center">96-101</td><td className="py-3 text-center">71</td></tr>
                <tr className="border-b border-stone-100"><td className="py-3 font-medium text-stone-900">M</td><td className="py-3 text-center">101-106</td><td className="py-3 text-center">73</td></tr>
                <tr className="border-b border-stone-100"><td className="py-3 font-medium text-stone-900">L</td><td className="py-3 text-center">106-111</td><td className="py-3 text-center">76</td></tr>
                <tr className="border-b border-stone-100"><td className="py-3 font-medium text-stone-900">XL</td><td className="py-3 text-center">111-116</td><td className="py-3 text-center">79</td></tr>
                <tr><td className="py-3 font-medium text-stone-900">XXL</td><td className="py-3 text-center">116-121</td><td className="py-3 text-center">81</td></tr>
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
    <div className="group bg-white border border-stone-100 overflow-hidden hover:border-[#C9A962]/50 transition-all duration-500 hover:shadow-xl hover:shadow-stone-200/50">
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        {product.badge && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-[#C9A962] text-white text-xs font-medium tracking-wide uppercase">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-6">
        <h4 className="font-medium text-stone-900 mb-2 group-hover:text-[#C9A962] transition-colors duration-300">{product.name}</h4>
        <StarRating rating={product.rating} />
        
        {product.description && (
          <p className="text-stone-500 text-sm mt-3 font-light">{product.description}</p>
        )}
        
        {product.pages && (
          <p className="text-stone-400 text-xs mt-3 font-light">{product.pages} Seiten · {product.format}</p>
        )}

        {product.sizes && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-stone-500 uppercase tracking-wide">Größe</span>
              <button onClick={() => setSizeChartOpen(true)} className="text-xs text-[#C9A962] hover:underline">Größentabelle</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`px-3 py-1.5 text-xs border transition-all duration-300 ${selectedSize === size ? "bg-stone-900 text-white border-stone-900" : "border-stone-200 hover:border-[#C9A962] text-stone-600"}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors && (
          <div className="mt-4">
            <span className="text-xs text-stone-500 uppercase tracking-wide">Farbe</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.colors.map(color => (
                <button key={color} onClick={() => setSelectedColor(color)} className={`px-3 py-1.5 text-xs border transition-all duration-300 ${selectedColor === color ? "bg-stone-900 text-white border-stone-900" : "border-stone-200 hover:border-[#C9A962] text-stone-600"}`}>
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-stone-100">
          <span className="text-2xl font-light text-[#C9A962]">€{product.price.toFixed(2)}</span>
          <button
            onClick={() => addToCart(product, selectedSize, selectedColor)}
            className="px-5 py-2.5 bg-stone-900 text-white text-xs font-medium tracking-[0.1em] uppercase hover:bg-[#C9A962] transition-all duration-300"
          >
            {product.category === "book" ? "Download" : product.category === "trend" ? "Kaufen" : "In den Korb"}
          </button>
        </div>
      </div>
    </div>
  );
}
