//----------------------------------------------
// screens/CartScreen.js
//----------------------------------------------

// TODO: Implement CartScreen
// Should display cart items, allow quantity updates,
// show subtotal, and have a clear cart button

import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useCart } from "../contexts/CartContext";
import ProductItem from "../components/ProductItem";

const CartScreen = () => {
  const { cartItems, subtotal, clearCart, addToCart, removeFromCart } = useCart();
  console.log({ cartItems, subtotal });

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductItem product={item} removeFromCart={removeFromCart} />}
      />
      <View style={styles.footer}>
        <Text style={styles.subtotal}>Subtotal: ${subtotal.toFixed(2)}</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
          <Text style={styles.clearButtonText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  subtotal: {
    fontSize: 18,
    fontWeight: "500",
  },
  clearButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default CartScreen;
