// WarehouseList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Container, 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    Paper, 
    CircularProgress, 
    Alert, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    TextField, 
    DialogActions, 
    IconButton, 
    InputAdornment, 
    FormControlLabel, 
    Checkbox 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterInventory, setFilterInventory] = useState(false);
    const [productName, setProductName] = useState('');
    const [productQuantity, setProductQuantity] = useState('');

    useEffect(() => {
        // 使用 axios 获取仓库数据
        axios.get('http://localhost:8081/api/warehouses')
            .then(response => {
                console.log('接口返回：'+ JSON.stringify(response.data));
                setWarehouses(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    // 简化版的智能算法：选择最近的仓库
    const getOptimalWarehouse = (userAddress) => {
        const userCoordinates = { latitude: 39.9042, longitude: 116.4074 }; // 示例用户坐标
        let optimalWarehouse = null;
        let minDistance = Infinity;

        warehouses.forEach(warehouse => {
            const warehouseCoordinates = {
                latitude: warehouse.latitude,
                longitude: warehouse.longitude
            };
            const distance = calculateDistance(userCoordinates, warehouseCoordinates);
            if (distance < minDistance) {
                minDistance = distance;
                optimalWarehouse = warehouse;
            }
        });

        return optimalWarehouse;
    };

    // 计算两个经纬度之间的距离（单位：公里）
    const calculateDistance = (coord1, coord2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // 地球半径，单位：公里
        const dLat = toRad(coord2.latitude - coord1.latitude);
        const dLon = toRad(coord2.longitude - coord1.longitude);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    // 示例用户地址
    const userAddress = "北京市朝阳区";

    // 获取最优仓库
    const optimalWarehouse = getOptimalWarehouse(userAddress);

    // 搜索功能
    const filteredWarehouses = warehouses.filter(warehouse => 
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 打开对话框
    const handleOpenDialog = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setOpenDialog(true);
    };

    // 关闭对话框
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setProductName('');
        setProductQuantity('');
    };

    // 更新库存
    const handleUpdateInventory = () => {
        if (!selectedWarehouse || !productName || productQuantity === '') {
            alert('Please fill in all fields');
            return;
        }
        axios.post(`http://localhost:8081/api/warehouses/${selectedWarehouse.id}/inventory`, null, {
            params: {
                productName: productName,
                quantity: productQuantity
            }
        })
        .then(response => {
            console.log(response.data);
            handleCloseDialog();
            // 刷新仓库数据
            axios.get('http://localhost:8081/api/warehouses')
                .then(response => {
                    setWarehouses(response.data);
                })
                .catch(error => {
                    setError(error);
                });
        })
        .catch(error => {
            console.error(error);
            setError(error);
        });
    };

    return (
        <Container maxWidth="md" style={{ marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Warehouse List
            </Typography>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">Error: {error.message}</Alert>}
            <FormControlLabel 
                control={<Checkbox checked={filterInventory} onChange={(e) => setFilterInventory(e.target.checked)} />} 
                label="Filter by Inventory"
            />
            <TextField
                label="Search"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                style={{ marginBottom: '20px', width: '100%' }}
            />
            <List>
                {filteredWarehouses.map(warehouse => (
                    <Paper key={warehouse.id} style={{ marginBottom: '10px', padding: '10px' }}>
                        <Typography variant="h6">{warehouse.name}</Typography>
                        <Typography>{warehouse.location}</Typography>
                        <Typography>Delivery Time: {warehouse.delivery_time} hours</Typography>
                        <Button variant="contained" color="primary" onClick={() => handleOpenDialog(warehouse)}>
                            Manage Inventory
                        </Button>
                        <List>
                            {filterInventory ? (
                                warehouse.inventories.filter(item => item.quantity > 0).map(item => (
                                    <ListItem key={item.id}>
                                        <ListItemText primary={`${item.product_name} - Quantity: ${item.quantity}`} />
                                    </ListItem>
                                ))
                            ) : (
                                warehouse.inventories.map(item => (
                                    <ListItem key={item.id}>
                                        <ListItemText primary={`${item.product_name} - Quantity: ${item.quantity}`} />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>
                ))}
            </List>
            {optimalWarehouse && (
                <Paper style={{ padding: '10px', marginTop: '20px' }}>
                    <Typography variant="h5">Optimal Warehouse for {userAddress}</Typography>
                    <Typography>{optimalWarehouse.name}</Typography>
                    <Typography>{optimalWarehouse.location}</Typography>
                    <Typography>Delivery Time: {optimalWarehouse.delivery_time} hours</Typography>
                    <List>
                        {optimalWarehouse.inventories.map(item => (
                            <ListItem key={item.id}>
                                <ListItemText primary={`${item.product_name} - Quantity: ${item.quantity}`} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Manage Inventory</DialogTitle>
                <DialogContent>
                    <Typography variant="h6">{selectedWarehouse?.name}</Typography>
                    <List>
                        {selectedWarehouse?.inventories.map(item => (
                            <ListItem key={item.id}>
                                <ListItemText primary={`${item.product_name} - Quantity: ${item.quantity}`} />
                            </ListItem>
                        ))}
                    </List>
                    <TextField
                        label="Product Name"
                        variant="outlined"
                        fullWidth
                        margin="dense"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                    />
                    <TextField
                        label="Quantity"
                        variant="outlined"
                        type="number"
                        fullWidth
                        margin="dense"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateInventory} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default WarehouseList;