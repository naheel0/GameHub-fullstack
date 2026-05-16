import React from "react";
import {
  FaCreditCard,
  FaPaypal,
  FaApple,
  FaGoogle,
  FaRegCreditCard,
  FaTrash,
} from "react-icons/fa";
import { SiVisa, SiMastercard } from "react-icons/si";

const paymentMethods = [
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: <FaCreditCard className="text-2xl" />,
    description: "Pay securely with your credit or debit card",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: <FaPaypal className="text-2xl text-blue-400" />,
    description: "Fast and secure payment with PayPal",
  },
  {
    id: "apple",
    name: "Apple Pay",
    icon: <FaApple className="text-2xl" />,
    description: "Quick payment with Apple Pay",
  },
  {
    id: "google",
    name: "Google Pay",
    icon: <FaGoogle className="text-2xl text-green-400" />,
    description: "Secure payment with Google Pay",
  },
];

const SavedCardSelector = ({ savedCards, selectedCardId, onSelectSavedCard, onDeleteSavedCard }) => {
  if (!savedCards?.length) return null;
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-300 mb-2">Saved Cards</p>
      <div className="space-y-2">
        {savedCards.map((card) => (
          <div
            key={card.id}
            onClick={() => onSelectSavedCard(card)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all duration-200 ${
              selectedCardId === card.id
                ? "border-red-500 bg-red-500/10"
                : "border-gray-600 hover:border-red-400 bg-gray-800/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <FaCreditCard className={selectedCardId === card.id ? "text-red-400" : "text-gray-400"} />
              <div>
                <p className="text-white text-sm font-medium">
                  •••• •••• •••• {card.cardNumber.slice(-4)}
                </p>
                <p className="text-gray-400 text-xs">{card.cardholderName} · {card.expiryDate}</p>
              </div>
              {card.isDefault && (
                <span className="text-xs text-yellow-400 border border-yellow-500/50 px-1.5 py-0.5 rounded">Default</span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDeleteSavedCard(card.id); }}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-700/50 mt-4 pt-4">
        <p className="text-xs text-gray-500 mb-3">Or enter a new card</p>
      </div>
    </div>
  );
};

const CardPaymentForm = ({
  cardDetails,
  handleCardInputChange,
  saveCard,
  setSaveCard,
  handlePaymentSubmit,
  isProcessing,
  summary,
  selectedAddress,
  savedCards,
  selectedCardId,
  onSelectSavedCard,
  onDeleteSavedCard,
}) => (
  <form onSubmit={handlePaymentSubmit} className="space-y-4">
    <SavedCardSelector
      savedCards={savedCards}
      selectedCardId={selectedCardId}
      onSelectSavedCard={onSelectSavedCard}
      onDeleteSavedCard={onDeleteSavedCard}
    />
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Card Number
      </label>
      <div className="relative">
        <input
          type="text"
          value={cardDetails.number}
          onChange={(e) => handleCardInputChange("number", e.target.value)}
          placeholder="1234 5678 9012 3456"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
        />
        <div className="absolute right-3 top-3 flex space-x-2">
          <SiVisa className="text-blue-400 text-xl" />
          <SiMastercard className="text-red-400 text-xl" />
          <FaRegCreditCard className="text-gray-400 text-xl" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Expiry Date
        </label>
        <input
          type="text"
          value={cardDetails.expiry}
          onChange={(e) => handleCardInputChange("expiry", e.target.value)}
          placeholder="MM/YY"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          CVV
        </label>
        <input
          type="text"
          value={cardDetails.cvv}
          onChange={(e) => handleCardInputChange("cvv", e.target.value)}
          placeholder="123"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Cardholder Name
      </label>
      <input
        type="text"
        value={cardDetails.name}
        onChange={(e) => handleCardInputChange("name", e.target.value)}
        placeholder="John Doe"
        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400"
      />
    </div>

    <div className="flex items-center">
      <input
        type="checkbox"
        id="saveCard"
        checked={saveCard}
        onChange={(e) => setSaveCard(e.target.checked)}
        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-800"
      />
      <label
        htmlFor="saveCard"
        className="ml-2 text-sm text-gray-300"
      >
        Save card for future purchases
      </label>
    </div>

    <button
      type="submit"
      disabled={isProcessing || !selectedAddress}
      className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 px-6 rounded-lg transition duration-300 font-semibold border border-red-600 disabled:border-gray-600 flex items-center justify-center"
    >
      {isProcessing ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Processing Payment...
        </>
      ) : (
        `Pay $${summary?.total || "0.00"}`
      )}
    </button>
  </form>
);

const OtherPaymentButton = ({
  handlePaymentSubmit,
  isProcessing,
  icon,
  label,
  message,
  selectedAddress,
  colorClass,
  redirectText,
}) => (
  <div className="text-center">
    <button
      onClick={handlePaymentSubmit}
      disabled={isProcessing || !selectedAddress}
      className={`w-full bg-linear-to-r ${colorClass} disabled:from-gray-600 disabled:to-gray-700 text-white py-4 px-6 rounded-lg transition duration-300 font-semibold flex items-center justify-center space-x-2 border border-red-600 disabled:border-gray-600`}
    >
      {isProcessing ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          {redirectText}
        </>
      ) : (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </button>
    {message && <p className="text-sm text-gray-400 mt-3">{message}</p>}
  </div>
);

const PaymentFormSection = ({
  selectedMethod,
  setSelectedMethod,
  cardDetails,
  handleCardInputChange,
  saveCard,
  setSaveCard,
  handlePaymentSubmit,
  isProcessing,
  summary,
  selectedAddress,
  savedCards,
  selectedCardId,
  onSelectSavedCard,
  onDeleteSavedCard,
}) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-700/50">
      <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>

      {/* Payment Method Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 transform ${
              selectedMethod === method.id
                ? "border-red-500 bg-red-500/10 scale-105 shadow-lg"
                : "border-gray-600 hover:border-red-400 hover:scale-102"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    selectedMethod === method.id
                      ? "bg-red-500 text-white"
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  {method.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {method.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {method.description}
                  </p>
                </div>
              </div>
              {selectedMethod === method.id && (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Form */}
      <div className="border-t border-gray-700/50 pt-6">
        {selectedMethod === "card" && (
          <CardPaymentForm
            cardDetails={cardDetails}
            handleCardInputChange={handleCardInputChange}
            saveCard={saveCard}
            setSaveCard={setSaveCard}
            handlePaymentSubmit={handlePaymentSubmit}
            isProcessing={isProcessing}
            summary={summary}
            selectedAddress={selectedAddress}
            savedCards={savedCards}
            selectedCardId={selectedCardId}
            onSelectSavedCard={onSelectSavedCard}
            onDeleteSavedCard={onDeleteSavedCard}
          />
        )}

        {selectedMethod === "paypal" && (
          <OtherPaymentButton
            methodId="paypal"
            handlePaymentSubmit={handlePaymentSubmit}
            isProcessing={isProcessing}
            icon={<FaPaypal className="text-xl" />}
            label="Pay with PayPal"
            message="You will be redirected to PayPal to complete your payment"
            selectedAddress={selectedAddress}
            colorClass="from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            redirectText="Redirecting..."
          />
        )}

        {selectedMethod === "apple" && (
          <OtherPaymentButton
            methodId="apple"
            handlePaymentSubmit={handlePaymentSubmit}
            isProcessing={isProcessing}
            icon={<FaApple className="text-xl" />}
            label="Pay with Apple Pay"
            selectedAddress={selectedAddress}
            colorClass="from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800"
            redirectText="Processing..."
          />
        )}

        {selectedMethod === "google" && (
          <OtherPaymentButton
            methodId="google"
            handlePaymentSubmit={handlePaymentSubmit}
            isProcessing={isProcessing}
            icon={<FaGoogle className="text-xl text-green-400" />}
            label="Pay with Google Pay"
            selectedAddress={selectedAddress}
            colorClass="from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800"
            redirectText="Processing..."
          />
        )}
      </div>
    </div>
  );
};

export default PaymentFormSection;