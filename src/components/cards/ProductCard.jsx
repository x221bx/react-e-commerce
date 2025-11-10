import { useState } from "react";
import { BsCartPlus } from "react-icons/bs";

export default function ProductCard({ image, name, price, onAdd, stock = 0, offer = null }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!onAdd || stock === 0) return;
    setAdding(true);
    await onAdd(); // API call أو Redux dispatch
    setAdding(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden flex flex-col relative">
      
      {/* Animated Badge */}
      {stock === 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10 animate-pulse">
          Out of Stock
        </div>
      )}
      {offer && stock > 0 && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full z-10 animate-bounce">
          {offer}
        </div>
      )}

      {/* صورة المنتج */}
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={name}
          className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* محتوى البطاقة */}
      <div className="p-4 flex flex-col justify-between flex-1">
        {/* اسم المنتج */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
          {name}
        </h3>

        {/* السعر + زر الإضافة */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
            {price} EGP
          </span>

          <button
            onClick={handleAdd}
            disabled={adding || stock === 0}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-white text-sm font-medium transition 
              ${stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600'}
            `}
          >
            <BsCartPlus size={18} />
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
