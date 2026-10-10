import React, { useEffect, useState } from "react";

export default function DeliveryModal({ isOpen, customer, onClose, onConfirm }) {
    const today = new Date().toISOString().split("T")[0];
    const [finalPrice, setFinalPrice] = useState("");
    const [deliveryDate, setDeliveryDate] = useState(today);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && customer) {
            const fallbackDate = new Date().toISOString().split("T")[0];
            setFinalPrice(customer.cost ?? "");
            setDeliveryDate(
                customer.delivery_date ? String(customer.delivery_date).split("T")[0] : fallbackDate
            );
            setSaving(false);
        }
    }, [isOpen, customer]);

    if (!isOpen || !customer) return null;

    const handleConfirm = async () => {
        if (finalPrice === "" || finalPrice === null || Number.isNaN(Number(finalPrice))) {
            return;
        }
        if (!deliveryDate) {
            return;
        }

        setSaving(true);
        try {
            await onConfirm({
                cost: Number(finalPrice),
                delivery_date: deliveryDate,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-lg font-bold mb-4">Mark as Delivered</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Confirm the final price and delivery date for{" "}
                    <strong>{customer.customer_name}</strong>.
                </p>

                <div className="flex flex-col gap-4 customer-form">
                    <div className="flex flex-col">
                        <label>Final Price (KD)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={finalPrice}
                            onChange={(e) => setFinalPrice(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label>Delivery Date</label>
                        <input
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-4 w-full mt-6">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={saving || finalPrice === "" || !deliveryDate}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Mark Delivered"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="flex-1 border border-gray-400 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
