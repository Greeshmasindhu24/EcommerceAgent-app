import React from "react";

const ProductCard = ({ product, onAddToCart }) => {
  const id = product.id || product._id;
  const description = product.description || "";

  return (
    <div className="product-card card">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title">{product.name}</h3>
        {description && (
          <p style={{ color: "var(--aura-muted)", fontSize: "0.875rem", marginBottom: "12px", flex: 1 }}>
            {description.length > 80 ? `${description.substring(0, 80)}...` : description}
          </p>
        )}
        <div className="product-footer">
          <span className="product-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "8px 16px", fontSize: "0.875rem" }}
            onClick={() => onAddToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
