import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import ProductItem from "../components/ProductItem";
import { useCart } from "@/contexts/CartContext";
// TODO: Import useCart hook

// Sample products data (in a real app, this would come from an API)
const PRODUCTS = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 149.99,
    image: "https://via.placeholder.com/100",
  },
  {
    id: "2",
    name: "Smartphone",
    price: 699.99,
    image: "https://via.placeholder.com/100",
  },
  {
    id: "3",
    name: "Laptop",
    price: 1299.99,
    image: "https://via.placeholder.com/100",
  },
  {
    id: "4",
    name: "Smartwatch",
    price: 249.99,
    image: "https://via.placeholder.com/100",
  },
  {
    id: "5",
    name: "Wireless Earbuds",
    price: 89.99,
    image: "https://via.placeholder.com/100",
  },
];

const ProductListScreen = ({ navigation }) => {
  // TODO: Use the cart context
  const { addToCart } = useCart();

  // TODO: Implement renderItem function that uses the ProductItem component
  // and connects it with the addToCart method from context

  return (
    <View style={styles.container}>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // TODO: Use ProductItem component with addToCart functionality
          <ProductItem
            product={item}
            onAddToCart={(e: any) => {
              console.log({ item });
              addToCart({ ...item, quantity: 1 });
            }} // Replace with actual implementation
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
});

export default ProductListScreen;
