import React, { useState } from 'react';
import axios from 'axios';

const OrderForm = () => {
    const [address, setAddress] = useState('');
    const [productId, setProductId] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('/api/orders', { address, productId })
            .then(response => alert(`Order placed successfully! Warehouse: ${response.data.warehouseName}`))
            .catch(error => console.error('Error placing order:', error));
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Place an Order</h2>
            <input
                type="text"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Enter product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
            />
            <button type="submit">Submit Order</button>
        </form>
    );
};

export default OrderForm;