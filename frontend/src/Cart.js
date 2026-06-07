import React from "react";

import { useNavigate } from "react-router-dom";

export default function Cart({ cart, setCart }) {

    const nav = useNavigate();

    // ✅ Increase Qty
    const increaseQty = (id) => {

        setCart(
            cart.map((item) =>

                item.id === id
                    ? {
                        ...item,
                        qty: (item.qty || 1) + 1
                    }
                    : item
            )
        );
    };

    // ✅ Decrease Qty
    const decreaseQty = (id) => {

        setCart(
            cart
                .map((item) =>

                    item.id === id
                        ? {
                            ...item,
                            qty: (item.qty || 1) - 1
                        }
                        : item
                )
                .filter((item) => item.qty > 0)
        );
    };

    // ✅ Remove Item
    const removeItem = (id) => {

        setCart(
            cart.filter(
                (item) => item.id !== id
            )
        );
    };

    // ✅ Totals
    const totalItems = cart.reduce(
        (sum, item) => sum + (item.qty || 1),
        0
    );

    const totalPrice = cart.reduce(
        (sum, item) =>
            sum + item.price * (item.qty || 1),
        0
    );

    return (

        <div
            style={{
                padding: "30px",
                maxWidth: "1200px",
                margin: "0 auto"
            }}
        >

            <h1
                style={{
                    marginBottom: "30px"
                }}
            >
                🛒 Shopping Cart
            </h1>

            {/* Empty Cart */}
            {cart.length === 0 ? (

                <div
                    style={{
                        textAlign: "center",
                        padding: "80px 20px",
                        background: "#fff",
                        borderRadius: "16px",
                        boxShadow:
                            "0 4px 12px rgba(0,0,0,0.08)"
                    }}
                >

                    <h2>Your cart is empty 😔</h2>

                    <p
                        style={{
                            color: "#666",
                            marginTop: "10px"
                        }}
                    >
                        Add some amazing products to continue shopping.
                    </p>

                    <button
                        onClick={() => nav("/")}

                        style={{
                            marginTop: "20px",
                            background: "#2874f0",
                            color: "white",
                            border: "none",
                            padding: "12px 20px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        Continue Shopping
                    </button>

                </div>

            ) : (

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "2fr 1fr",
                        gap: "30px"
                    }}
                >

                    {/* Cart Items */}
                    <div>

                        {cart.map((item) => (

                            <div
                                key={item.id}

                                style={{
                                    display: "flex",
                                    gap: "20px",
                                    padding: "20px",
                                    marginBottom: "20px",
                                    background: "white",
                                    borderRadius: "16px",
                                    boxShadow:
                                        "0 4px 12px rgba(0,0,0,0.08)"
                                }}
                            >

                                {/* Product Image */}
                                <img
                                    src={item.image}

                                    alt={item.name}

                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                        borderRadius: "12px"
                                    }}

                                    onError={(e) => {

                                        e.target.src =
                                            "https://via.placeholder.com/120";
                                    }}
                                />

                                {/* Product Info */}
                                <div
                                    style={{
                                        flex: 1
                                    }}
                                >

                                    <h3>
                                        {item.name}
                                    </h3>

                                    <p
                                        style={{
                                            color: "#666",
                                            margin:
                                                "8px 0"
                                        }}
                                    >
                                        ₹{item.price}
                                    </p>

                                    {/* Qty Controls */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            gap: "10px",
                                            marginTop:
                                                "10px"
                                        }}
                                    >

                                        <button
                                            onClick={() =>
                                                decreaseQty(
                                                    item.id
                                                )
                                            }

                                            style={{
                                                width:
                                                    "32px",
                                                height:
                                                    "32px",
                                                border:
                                                    "none",
                                                borderRadius:
                                                    "8px",
                                                background:
                                                    "#e5e7eb",
                                                cursor:
                                                    "pointer"
                                            }}
                                        >
                                            −
                                        </button>

                                        <span>
                                            {
                                                item.qty
                                            }
                                        </span>

                                        <button
                                            onClick={() =>
                                                increaseQty(
                                                    item.id
                                                )
                                            }

                                            style={{
                                                width:
                                                    "32px",
                                                height:
                                                    "32px",
                                                border:
                                                    "none",
                                                borderRadius:
                                                    "8px",
                                                background:
                                                    "#2874f0",
                                                color:
                                                    "white",
                                                cursor:
                                                    "pointer"
                                            }}
                                        >
                                            +
                                        </button>

                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() =>
                                            removeItem(
                                                item.id
                                            )
                                        }

                                        style={{
                                            marginTop:
                                                "15px",
                                            background:
                                                "transparent",
                                            color:
                                                "#ef4444",
                                            border:
                                                "none",
                                            cursor:
                                                "pointer",
                                            fontWeight:
                                                "600"
                                        }}
                                    >
                                        Remove Item
                                    </button>

                                </div>

                                {/* Item Total */}
                                <div
                                    style={{
                                        fontWeight:
                                            "bold",
                                        fontSize:
                                            "18px"
                                    }}
                                >
                                    ₹
                                    {(
                                        item.price *
                                        item.qty
                                    ).toLocaleString()}
                                </div>

                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div
                        style={{
                            background: "white",
                            padding: "25px",
                            borderRadius: "16px",
                            height: "fit-content",
                            boxShadow:
                                "0 4px 12px rgba(0,0,0,0.08)"
                        }}
                    >

                        <h2
                            style={{
                                marginBottom: "20px"
                            }}
                        >
                            Order Summary
                        </h2>

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                marginBottom: "12px"
                            }}
                        >
                            <span>
                                Total Items
                            </span>

                            <strong>
                                {totalItems}
                            </strong>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                marginBottom: "12px"
                            }}
                        >
                            <span>Subtotal</span>

                            <strong>
                                ₹
                                {totalPrice.toLocaleString()}
                            </strong>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                marginBottom: "20px"
                            }}
                        >
                            <span>Shipping</span>

                            <strong>
                                FREE
                            </strong>
                        </div>

                        <hr
                            style={{
                                margin:
                                    "20px 0"
                            }}
                        />

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                fontSize: "20px",
                                fontWeight: "bold"
                            }}
                        >
                            <span>Total</span>

                            <span>
                                ₹
                                {totalPrice.toLocaleString()}
                            </span>
                        </div>

                        {/* Checkout Button */}
                        <button
                            onClick={() =>
                                nav("/checkout")
                            }

                            style={{
                                width: "100%",
                                marginTop: "25px",
                                padding: "14px",
                                background: "#2874f0",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}
                        >
                            Proceed to Checkout
                        </button>

                    </div>

                </div>
            )}
        </div>
    );
}