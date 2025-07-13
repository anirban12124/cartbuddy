"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      alert("Payment successful!");
      router.push("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Checkout</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Card Number</label>
              <Input placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <Input placeholder="MM/YY" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVV</label>
                <Input placeholder="123" type="password" maxLength={3} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name on Card</label>
              <Input placeholder="John Doe" />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-cartbuddy-blue hover:bg-cartbuddy-blue-dark text-white"
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay Now"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
