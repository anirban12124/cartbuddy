import { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
  discount?: number;  // Optional discount percentage
}

interface CartItem extends Product {
  quantity: number;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Organic Bananas",
    price: 2.98,
    image: "/images/banana.jpg", 
    inStock: true,
  },
  {
    id: "2",
    name: "Whole Milk",
    price: 3.48,
    image: "/images/milk.jpg",
    inStock: true,
  },
  {
    id: "3",
    name: "Bread Loaf",
    price: 2.24,
    image: "/images/bread.jpg", 
    inStock: false,
  },
  {
    id: "4",
    name: "Chicken Breast",
    price: 8.99,
    image: "/images/chicken.jpeg", 
    inStock: true,
  },
  {
    id: "5",
    name: "Greek Yogurt",
    price: 5.47,
    image: "/images/yogurt.jpg", 
    inStock: true,
  },
  {
    id: "6",
    name: "Fresh Apples",
    price: 4.28,
    image: "/images/apples.jpg", 
    inStock: true,
  },
  {
    id: "7",
    name: "Pasta Sauce",
    price: 1.98,
    image: "/images/pasta-sauce.jpeg", 
    inStock: false,
  },
  {
    id: "8",
    name: "Cereal",
    price: 4.99,
    image: "/images/cereal.jpg", 
    inStock: true,
  },
];

const dealProducts: Product[] = [
  {
    id: "deal-1",
    name: "Bundle: Bread & Milk",
    price: 4.99,
    image: "/images/bundle-bread-milk.jpg",
    inStock: true,
    discount: 15  // 15% off
  },
  {
    id: "deal-2",
    name: "Family Pack: Chicken",
    price: 15.99,
    image: "/images/chicken.jpeg",
    inStock: true,
    discount: 25  // 25% off
  },
  {
    id: "deal-3",
    name: "Fruit Combo Pack",
    price: 9.99,
    image: "/images/fruit-combo.jpg",
    inStock: true,
    discount: 20  // 20% off
  },
  // Add duplicate deals with same discounts
  {
    id: "deal-1-dup",
    name: "Bundle: Bread & Milk",
    price: 4.99,
    image: "/images/bundle-bread-milk.jpg",
    inStock: true,
    discount: 15
  },
  {
    id: "deal-2-dup",
    name: "Family Pack: Chicken",
    price: 15.99,
    image: "/images/chicken.jpeg",
    inStock: true,
    discount: 25
  },
  {
    id: "deal-3-dup",
    name: "Fruit Combo Pack",
    price: 9.99,
    image: "/images/fruit-combo.jpg",
    inStock: true,
    discount: 20
  }
];

function getSimilarProducts(product: Product): Product[] {
  // Hardcoded alternates for demonstration
  const alternates: { [key: string]: Product[] } = {
    "Bread Loaf": [
      {
        id: "alt-bread-1",
        name: "Whole Wheat Bread",
        price: 2.49,
        image: "/images/wholewheatbread.jpg",
        inStock: true,
      },
      {
        id: "alt-bread-2",
        name: "Sourdough Bread",
        price: 3.19,
        image: "/images/Sourdough.jpg",
        inStock: true,
      },
      {
        id: "alt-bread-3",
        name: "Multigrain Bread",
        price: 3.49,
        image: "/images/multigrain.jpg",
        inStock: true,
      }
    ],
    "Pasta Sauce": [
      {
        id: "alt-sauce-1",
        name: "Tomato Basil Sauce",
        price: 2.29,
        image: "/images/tomatobasil.jpg",
        inStock: true,
      },
      {
        id: "alt-sauce-2",
        name: "Alfredo Sauce",
        price: 2.99,
        image: "/images/alfredo.jpg",
        inStock: true,
      },
      {
        id: "alt-sauce-3",
        name: "Pesto Sauce",
        price: 3.49,
        image: "/images/pesto.jpg",
        inStock: true,
      }
    ],
    // Add more alternates as needed
  };

  // Find similar products from main list (same category, in stock, not the same id)
  let similar = mockProducts.filter(
    (p) =>
      p.inStock &&
      p.id !== product.id &&
      (
        (product.name.toLowerCase().includes("bread") && p.name.toLowerCase().includes("bread")) ||
        (product.name.toLowerCase().includes("milk") && p.name.toLowerCase().includes("milk")) ||
        (product.name.toLowerCase().includes("yogurt") && p.name.toLowerCase().includes("yogurt")) ||
        (product.name.toLowerCase().includes("banana") && p.name.toLowerCase().includes("banana")) ||
        (product.name.toLowerCase().includes("chicken") && p.name.toLowerCase().includes("chicken")) ||
        (product.name.toLowerCase().includes("apple") && p.name.toLowerCase().includes("apple")) ||
        (product.name.toLowerCase().includes("cereal") && p.name.toLowerCase().includes("cereal")) ||
        (product.name.toLowerCase().includes("sauce") && p.name.toLowerCase().includes("sauce"))
      )
  );

  // Add hardcoded alternates if available
  if (alternates[product.name]) {
    similar = [...similar, ...alternates[product.name]];
  }

  return similar;
}

export default function CartBuddy() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [showMap, setShowMap] = useState<{ loading: boolean; show: boolean; product: Product | null }>({ loading: false, show: false, product: null });
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAlternateModal, setShowAlternateModal] = useState<{ show: boolean; product: Product | null }>({ show: false, product: null });
  const dealsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Update the filtered products to exclude alternates
  const filteredProducts = mockProducts
    .filter((product) => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !product.id.startsWith('alt-')
    );
    
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCloseMap = () => {
    setShowMap({ loading: false, show: false, product: null });
  };

  const handleCloseRoute = () => {
    setShowRoute(false);
    setLoadingRoute(false);
  };

  const scrollDeals = (direction: 'left' | 'right') => {
    if (dealsContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = dealsContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      dealsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark text-gray-900 dark:text-white">
      {/* Header - Added sticky positioning */}
      <header className="sticky top-0 z-50 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <h1 className={darkMode ? "text-2xl font-bold text-cartbuddy-blue" : "text-2xl font-bold text-cartbuddy-blue"}>CartBuddy</h1>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cartbuddy-gray-medium h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-cartbuddy-gray-medium focus:border-cartbuddy-blue"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-cartbuddy-blue text-white text-xs">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-4">
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold text-cartbuddy-gray-dark mb-4">Cart</h2>
                  
                  {cartItems.length === 0 ? (
                    <p className="text-cartbuddy-gray-medium text-center py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4 max-h-[60vh] overflow-y-auto">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2 bg-cartbuddy-gray-light rounded"
                          >
                            <div className="w-8 h-8 bg-cartbuddy-gray-medium rounded overflow-hidden flex items-center justify-center">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-cartbuddy-gray-dark truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-cartbuddy-gray-medium">
                                ${item.price.toFixed(2)} each
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                              >
                                -
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-cartbuddy-gray-medium pt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-cartbuddy-gray-dark">
                            Total:
                          </span>
                          <span className="text-xl font-bold text-cartbuddy-blue">
                            ${getTotalPrice().toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          className="w-full bg-cartbuddy-blue hover:bg-cartbuddy-blue-dark text-white"
                          onClick={() => navigate("/checkout")}
                        >
                          Proceed to Checkout
                        </Button>
                        <Button
                          className="w-full bg-cartbuddy-success hover:bg-cartbuddy-blue-dark text-white"
                          onClick={() => {
                            setLoadingRoute(true);
                            setShowRoute(true);
                            setTimeout(() => setLoadingRoute(false), 1200);
                          }}
                        >
                          Show Route
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode((prev) => !prev)}
              className="ml-2"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </div>
      </header>

      {/* Add top padding to content to prevent it from going under sticky header */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 mt-2">
        {/* Deals Section */}
        <section className="relative">
          <h2 className="text-xl font-semibold text-cartbuddy-gray-dark mb-4 flex items-center gap-2">
            <span className="text-cartbuddy-danger">Hot</span> Deals
          </h2>
          <div className="relative w-full">
            <button
              onClick={() => scrollDeals('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-r-lg p-2 hover:bg-white shadow-md"
            >
              <ChevronLeft className="h-6 w-6 text-cartbuddy-gray-dark" />
            </button>
            <div 
              ref={dealsContainerRef}
              className="flex gap-4 overflow-x-auto hide-scrollbar"
              style={{
                scrollBehavior: 'smooth',
                scrollSnapType: 'x mandatory',
                paddingLeft: '40px',
                paddingRight: '40px'
              }}
            >
              {dealProducts.map((product) => (
                <Card
                  key={product.id}
                  className="p-3 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-dark-card border-2 border-cartbuddy-danger shrink-0"
                  style={{ width: '250px' }}
                  onClick={() => setModalProduct(product)}
                >
                  <div className="aspect-square bg-cartbuddy-gray-light rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-cartbuddy-danger text-white text-xs">SALE</Badge>
                  </div>
                  <h3 className="font-medium text-cartbuddy-gray-dark mb-1 text-sm truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs line-through text-cartbuddy-gray-medium">
                        ${(product.price * (1 + product.discount!/100)).toFixed(2)}
                      </span>
                      <span className="text-base font-bold text-cartbuddy-danger">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <Badge variant="default" className="bg-cartbuddy-success text-white text-xs">
                      {product.discount}% OFF
                    </Badge>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="w-full bg-cartbuddy-danger hover:bg-cartbuddy-danger/90 text-white"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </Card>
              ))}
            </div>
            <button
              onClick={() => scrollDeals('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-l-lg p-2 hover:bg-white shadow-md"
            >
              <ChevronRight className="h-6 w-6 text-cartbuddy-gray-dark" />
            </button>
          </div>
        </section>

        {/* Products Section - Now with updated title */}
        <section>
          <h2 className="text-xl font-semibold text-cartbuddy-gray-dark mb-4">
            All Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pr-2">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-dark-card"
                onClick={() => setModalProduct(product)}
              >
                <div className="aspect-square bg-cartbuddy-gray-light rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                <h3 className="font-medium text-cartbuddy-gray-dark mb-2 text-sm">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-cartbuddy-blue">
                    ${product.price.toFixed(2)}
                  </span>
                  <Badge
                    variant={product.inStock ? "default" : "destructive"}
                    className={`text-xs ${
                      product.inStock
                        ? "bg-cartbuddy-success text-white"
                        : "bg-cartbuddy-danger text-white"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal from opening
                      addToCart(product);
                    }}
                    disabled={!product.inStock}
                    className="w-full bg-cartbuddy-blue hover:bg-cartbuddy-blue-dark text-white"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Product Modal */}
      {modalProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
            <button
              className="absolute top-2 right-2 text-cartbuddy-gray-medium"
              onClick={() => setModalProduct(null)}
            >
              ×
            </button>
            <div className="aspect-square mb-4 flex items-center justify-center overflow-hidden">
              <img
                src={modalProduct.image}
                alt={modalProduct.name}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <h2 className="text-lg font-bold mb-2">{modalProduct.name}</h2>
            <p className="mb-2 text-cartbuddy-gray-dark">
              ${modalProduct.price.toFixed(2)}
            </p>
            <Badge
              variant={modalProduct.inStock ? "default" : "destructive"}
              className={`mb-4 text-xs ${
                modalProduct.inStock
                  ? "bg-cartbuddy-success text-white"
                  : "bg-cartbuddy-danger text-white"
              }`}
            >
              {modalProduct.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
            {modalProduct.inStock ? (
              <Button
                className="w-full bg-cartbuddy-blue hover:bg-cartbuddy-blue-dark text-white mb-2"
                onClick={() => {
                  setShowMap({ loading: true, show: false, product: modalProduct });
                  setTimeout(() => setShowMap({ loading: false, show: true, product: modalProduct }), 1200);
                }}
              >
                Show Map
              </Button>
            ) : (
              <Button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 w-full bg-cartbuddy-danger hover:bg-cartbuddy-blue-dark text-white mb-2"
                onClick={() => setShowAlternateModal({ show: true, product: modalProduct })}
              >
                Alternate Options 
              </Button>
            )}
            <Button
              className="w-full bg-cartbuddy-blue hover:bg-cartbuddy-blue-dark text-white mb-2"
              onClick={() => {
                addToCart(modalProduct);
              }}
              disabled={!modalProduct.inStock}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
            <Button
              className="w-full"
              onClick={() => setModalProduct(null)}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Alternate Options Modal */}
      {showAlternateModal.show && showAlternateModal.product && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-cartbuddy-gray-medium"
              onClick={() => setShowAlternateModal({ show: false, product: null })}
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">Alternate Buying Options</h2>
            <div className="space-y-3">
              {getSimilarProducts(showAlternateModal.product)
                .map((altProduct) => (
                  altProduct.id.startsWith("alt-") ? (
                    <Card 
                      key={altProduct.id} 
                      className="p-3 flex items-center gap-3 border-2 border-cartbuddy-blue bg-cartbuddy-gray-light cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setShowAlternateModal({ show: false, product: null });
                        setModalProduct(altProduct);
                      }}
                    >
                      <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center bg-white">
                        <img src={altProduct.image} alt={altProduct.name} className="w-full h-full object-cover rounded" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-cartbuddy-blue truncate">{altProduct.name}</p>
                        <p className="text-xs text-cartbuddy-gray-medium">${altProduct.price.toFixed(2)}</p>
                        <span className="text-xs text-cartbuddy-success">Similar Item</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-cartbuddy-blue hover:bg-cartbuddy-blue-dark text-white"
                        onClick={() => addToCart(altProduct)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </Card>
                  ) : (
                    <Card 
                      key={altProduct.id} 
                      className="p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setShowAlternateModal({ show: false, product: null });
                        setModalProduct(altProduct);
                      }}
                    >
                      <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center bg-cartbuddy-gray-light">
                        <img src={altProduct.image} alt={altProduct.name} className="w-full h-full object-cover rounded" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-cartbuddy-gray-dark truncate">{altProduct.name}</p>
                        <p className="text-xs text-cartbuddy-gray-medium">${altProduct.price.toFixed(2)}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-cartbuddy-blue hover:bg-cartbuddy-blue-dark text-white"
                        onClick={() => addToCart(altProduct)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </Card>
                  )
                ))}
              {getSimilarProducts(showAlternateModal.product).length === 0 && (
                <p className="text-cartbuddy-gray-medium text-center py-4">
                  No alternate options available.
                </p>
              )}
            </div>
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => setShowAlternateModal({ show: false, product: null })}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Route Modal - Moved to highest z-index */}
      {showRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-cartbuddy-gray-medium text-2xl"
              onClick={handleCloseRoute}
            >
              ×
            </button>
            {loadingRoute ? (
              <div className="flex flex-col items-center">
                <img src="/images/loading.gif" alt="Loading..." className="w-12 h-12 mb-4" />
                <span className="text-cartbuddy-gray-dark">Loading route...</span>
              </div>
            ) : (
              <img
                src="/images/combined.png"
                alt="Route Map"
                className="w-full h-auto rounded"
              />
            )}
          </div>
        </div>
      )}

      {/* Show Map Modal */}
      {showMap.show && showMap.product && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-cartbuddy-gray-medium text-2xl"
              onClick={handleCloseMap}
            >
              ×
            </button>
            <img
              src={showMap.product.name === "Chicken Breast" ? "/images/chicken.png" : "/images/combined.png"}
              alt="Product Map"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}

