//----------------------------------------------
// components/ProductItem.js (already implemented)
//----------------------------------------------

import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

type Product = {
  image: string;
  name: string;
  price: number;
  quantity: number;
  id: number;
};

type ProductItemProps = {
  product: Product;
  onAddToCart?: () => void;
  removeFromCart?: (id: number) => void;
};

const ProductItem: React.FC<ProductItemProps> = ({
  product,
  onAddToCart = null,
  removeFromCart = null,
}) => {
  console.log(product);
  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
        <Text style={styles.price}>x{product.quantity}</Text>
      </View>
      {removeFromCart && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => removeFromCart(product.id)}
        >
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      )}
      {onAddToCart && (
        <TouchableOpacity style={styles.button} onPress={onAddToCart}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  price: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ProductItem;
