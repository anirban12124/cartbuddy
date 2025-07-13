import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const paymentMethods = [
  { id: "credit", name: "Credit Card", icon: "/images/credit-card.png" },
  { id: "debit", name: "Debit Card", icon: "/images/credit-card - Copy.png" },
  { id: "upi", name: "QR Payment", icon: "/images/upi.png" },
  { id: "netbanking", name: "Net Banking", icon: "/images/netbanking.png" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handlePayment = () => {
    if (!selectedMethod) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Order placed successfully!");
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Select Payment Method
          </h1>

          <div className="grid gap-4 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === method.id
                    ? "border-cartbuddy-blue bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={method.icon}
                  alt={method.name}
                  className="w-10 h-10 object-contain mr-4"
                />
                <span className="font-medium">{method.name}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-cartbuddy-blue hover:bg-cartbuddy-blue-dark text-white"
              disabled={!selectedMethod || loading}
              onClick={handlePayment}
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
