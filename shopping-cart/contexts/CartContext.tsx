// TODO: Implement CartContext and CartProvider
// Should include:
// - State for cart items
// - Methods: addToCart, removeFromCart, updateQuantity, clearCart
// - Calculations for total items and subtotal
// - Persistence with AsyncStorage
// - Loading and error states

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define types for cart items and context
interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
});

// Create a custom hook for easy context use
export const useCart = () => {
  return useContext(CartContext);
};

const updateAsyncStorage = async (cartItems: CartItem[]) => {
  try {
    await AsyncStorage.setItem("cartItems", JSON.stringify(cartItems));
  } catch (error) {
    console.error("Error saving cart items to AsyncStorage", error);
  }
};

const loadAsyncStorage = async () => {
  try {
    const cartItems = await AsyncStorage.getItem("cartItems");
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (error) {
    console.error("Error loading cart items from AsyncStorage", error);
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // TODO: Implement provider with state and methods
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadAsyncStorage().then((items) => setCartItems(items));
  }, []);

  const addToCart = (item: CartItem) => {
    console.log({ cartItems, item });
    if (!cartItems.find((i) => i.id === item.id)) {
      setCartItems([...cartItems, item]);
      return;
    }
    const updatedCartItems = cartItems.map((cartItem) => {
      if (cartItem.id === item.id) {
        return { ...cartItem, quantity: cartItem.quantity + item.quantity };
      }
      return cartItem;
    });
    updateAsyncStorage(updatedCartItems);
    setCartItems(updatedCartItems);
  };
  const removeFromCart = (id: string) => {
    const updated = cartItems.flatMap((item) => {
      if (item.id === id) {
        item.quantity -= 1;
        if (item.quantity === 0) {
          return [];
        }
        return item;
      }
      return item;
    });
    updateAsyncStorage(updated);
    setCartItems(updated);
  };

  const updateQuantity = (id: string, quantity: number) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    updateAsyncStorage(updated);
    setCartItems(updated);
  };

  const clearCart = () => {
    updateAsyncStorage([]);
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
