import React from "react";

export default function Dashboard({
    user,
    orders
}) {

    return (

        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "30px"
            }}
        >

            <h1
                style={{
                    marginBottom: "30px"
                }}
            >
                👤 My Dashboard
            </h1>

            {/* USER CARD */}
            <div
                style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "16px",
                    marginBottom: "30px",
                    boxShadow:
                        "0 4px 12px rgba(0,0,0,0.08)"
                }}
            >

                <h2>
                    Welcome Back 👋
                </h2>

                <p
                    style={{
                        marginTop: "10px",
                        color: "#666"
                    }}
                >
                    Logged in as:
                </p>

                <strong>
                    {user?.email}
                </strong>

            </div>

            {/* ORDERS */}
            <div>

                <h2
                    style={{
                        marginBottom: "20px"
                    }}
                >
                    📦 My Orders
                </h2>

                {orders.length === 0 ? (

                    <div
                        style={{
                            background: "white",
                            padding: "40px",
                            borderRadius: "16px",
                            textAlign: "center",
                            boxShadow:
                                "0 4px 12px rgba(0,0,0,0.08)"
                        }}
                    >

                        <h3>
                            No Orders Yet 😔
                        </h3>

                        <p
                            style={{
                                marginTop: "10px",
                                color: "#666"
                            }}
                        >
                            Your placed orders will appear here.
                        </p>

                    </div>

                ) : (

                    orders.map((order) => (

                        <div
                            key={order.id}

                            style={{
                                background: "white",
                                padding: "25px",
                                borderRadius: "16px",
                                marginBottom: "25px",
                                boxShadow:
                                    "0 4px 12px rgba(0,0,0,0.08)"
                            }}
                        >

                            {/* TOP */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    marginBottom:
                                        "20px",
                                    flexWrap: "wrap",
                                    gap: "10px"
                                }}
                            >

                                <div>

                                    <h3>
                                        Order #
                                        {order.id}
                                    </h3>

                                    <p
                                        style={{
                                            color:
                                                "#666",
                                            marginTop:
                                                "5px"
                                        }}
                                    >
                                        {
                                            order.orderedAt
                                        }
                                    </p>

                                </div>

                                <div
                                    style={{
                                        background:
                                            "#dcfce7",
                                        color:
                                            "#166534",
                                        padding:
                                            "8px 15px",
                                        borderRadius:
                                            "999px",
                                        fontWeight:
                                            "600",
                                        height:
                                            "fit-content"
                                    }}
                                >
                                    {
                                        order.status
                                    }
                                </div>

                            </div>

                            {/* ITEMS */}
                            {order.items.map(item => (

                                <div
                                    key={item.id}

                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "space-between",
                                        padding:
                                            "10px 0",
                                        borderBottom:
                                            "1px solid #eee"
                                    }}
                                >

                                    <div>

                                        <strong>
                                            {
                                                item.name
                                            }
                                        </strong>

                                        <p
                                            style={{
                                                color:
                                                    "#666",
                                                fontSize:
                                                    "14px"
                                            }}
                                        >
                                            Qty:
                                            {
                                                item.qty
                                            }
                                        </p>

                                    </div>

                                    <strong>
                                        ₹
                                        {(
                                            item.price *
                                            item.qty
                                        ).toLocaleString()}
                                    </strong>

                                </div>
                            ))}

                            {/* TOTAL */}
                            <div
                                style={{
                                    marginTop:
                                        "20px",
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    fontSize:
                                        "20px",
                                    fontWeight:
                                        "bold"
                                }}
                            >

                                <span>
                                    Total
                                </span>

                                <span>
                                    ₹
                                    {order.total.toLocaleString()}
                                </span>

                            </div>

                        </div>
                    ))
                )}

            </div>

        </div>
    );
}