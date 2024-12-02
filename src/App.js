import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WarehouseList from './components/WarehouseList';
import OrderForm from './components/OrderForm';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WarehouseList />} />
                <Route path="/order" element={<OrderForm />} />
            </Routes>
        </Router>
    );
}

export default App;