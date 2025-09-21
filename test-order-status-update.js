/**
 * Test script to verify order status update functionality
 * This script dynamically fetches real orders and tests status updates
 */

const API_BASE_URL = 'https://souq-backend-hwy8.onrender.com';

// Dynamic function to fetch user's orders
async function fetchUserOrders() {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.error('❌ No access token found');
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/orders?limit=20`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('✅ Orders fetched successfully:', result.data.orders.length, 'orders found');
            return result.data.orders;
        } else {
            console.error('❌ Failed to fetch orders:', result);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        return null;
    }
}

// Dynamic function to get order details
async function getOrderDetails(orderId) {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.error('❌ No access token found');
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('✅ Order details fetched:', result.data.order);
            return result.data.order;
        } else {
            console.error('❌ Failed to fetch order details:', result);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching order details:', error);
        return null;
    }
}

// Helper function to detect order type based on ID format
function detectOrderType(orderId) {
    // Escrow transaction IDs typically start with 'ESC-' or are MongoDB ObjectIds for escrow
    if (typeof orderId === 'string' && orderId.startsWith('ESC-')) {
        return 'escrow';
    }
    // For now, we'll need to try both endpoints if type is unknown
    return null;
}

// Smart function to get order status with automatic endpoint detection
async function getOrderStatusSmart(orderId) {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.error('❌ No access token found');
        return null;
    }

    // First, try to detect the order type
    let detectedType = detectOrderType(orderId);
    
    if (detectedType === 'escrow') {
        console.log('🔍 Detected escrow transaction, using escrow endpoint');
        return await getOrderStatus(orderId, 'escrow');
    }

    // If we can't detect the type, try escrow first (since that's what we're fixing)
    console.log('🔍 Unknown order type, trying escrow endpoint first...');
    let result = await getOrderStatus(orderId, 'escrow');
    
    if (result) {
        console.log('✅ Found in escrow endpoint');
        return result;
    }

    // If not found in escrow, try standard orders endpoint
    console.log('🔍 Not found in escrow, trying orders endpoint...');
    result = await getOrderStatus(orderId, 'standard');
    
    if (result) {
        console.log('✅ Found in orders endpoint');
        return result;
    }

    console.log('❌ Order not found in any endpoint');
    return null;
}

// Dynamic function to get order status
async function getOrderStatus(orderId, orderType = null) {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.error('❌ No access token found');
        return null;
    }

    try {
        // Use different endpoints based on order type
        let endpoint;
        if (orderType === 'escrow') {
            endpoint = `${API_BASE_URL}/api/user/escrow/${orderId}/status`;
        } else {
            // Default to orders endpoint for standard payments and unknown types
            endpoint = `${API_BASE_URL}/api/user/orders/${orderId}/status`;
        }

        console.log(`🔍 Fetching ${orderType || 'unknown'} order status from:`, endpoint);

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('✅ Order status fetched:', result.data);
            return result.data;
        } else {
            console.error('❌ Failed to fetch order status:', result);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching order status:', error);
        return null;
    }
}

// Function to update order status (similar to the one in PaymentSuccess)
async function updateOrderStatus(orderId, status, notes = '', orderType = null) {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        console.error('❌ No access token found');
        return null;
    }

    try {
        // Use different endpoints based on order type
        let endpoint;
        if (orderType === 'escrow') {
            // For escrow, we might need different status update endpoints
            // For now, keep using orders endpoint for updates, but we could add escrow-specific ones later
            endpoint = `${API_BASE_URL}/api/user/orders/${orderId}/status`;
            console.log('⚠️ Using orders endpoint for escrow status update - consider adding escrow-specific update endpoint');
        } else {
            endpoint = `${API_BASE_URL}/api/user/orders/${orderId}/status`;
        }

        console.log(`🔄 Updating ${orderType || 'unknown'} order status at:`, endpoint);

        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status,
                notes
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Order status updated successfully:', result);
            return result;
        } else {
            console.error('❌ Failed to update order status:', result);
            return null;
        }
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        return null;
    }
}

// Alternative: Use ShippingService if available
// If you want to use the ShippingService in browser console:
// import ShippingService from './src/api/ShippingService.js';
// const result = await ShippingService.updateOrderStatus(orderId, status, notes);

// Dynamic function to find orders by type
async function findOrdersByType(orders, type) {
    return orders.filter(order => order.type === type);
}

// Dynamic function to get valid status transitions
function getValidStatusTransitions(currentStatus) {
    const transitions = {
        'pending_payment': ['paid', 'cancelled'],
        'paid': ['processing', 'shipped', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['in_transit', 'delivered'],
        'in_transit': ['out_for_delivery', 'delivered'],
        'out_for_delivery': ['delivered'],
        'delivered': ['completed', 'returned'],
        'funds_held': ['shipped', 'cancelled'], // Escrow specific
        'payment_processing': ['funds_held', 'cancelled']
    };
    
    return transitions[currentStatus] || [];
}

// Dynamic test function for escrow payment
async function testEscrowOrderUpdate() {
    console.log('🧪 Testing escrow order status update...');

    // Fetch real orders
    const orders = await fetchUserOrders();
    if (!orders || orders.length === 0) {
        console.log('❌ No orders found to test');
        return null;
    }

    // Find escrow orders
    const escrowOrders = await findOrdersByType(orders, 'escrow');
    if (escrowOrders.length === 0) {
        console.log('❌ No escrow orders found to test');
        return null;
    }

    // Use the first escrow order
    const testOrder = escrowOrders[0];
    console.log('📋 Testing with escrow order:', testOrder.orderNumber, 'Current status:', testOrder.status);

    // Get current status and valid transitions
    const currentStatus = testOrder.status;
    const validTransitions = getValidStatusTransitions(currentStatus);
    
    if (validTransitions.length === 0) {
        console.log('⚠️ No valid status transitions available for current status:', currentStatus);
        return null;
    }

    // Use the first valid transition
    const newStatus = validTransitions[0];
    const notes = `Dynamic test: Updating escrow order from ${currentStatus} to ${newStatus}`;

    console.log('🔄 Updating order status from', currentStatus, 'to', newStatus);

    const result = await updateOrderStatus(testOrder._id, newStatus, notes, 'escrow');

    if (result) {
        console.log('✅ Escrow order status update test passed');
        console.log('📊 Updated order details:', result.data?.order);
    } else {
        console.log('❌ Escrow order status update test failed');
    }

    return result;
}

// Dynamic test function for standard payment
async function testStandardOrderUpdate() {
    console.log('🧪 Testing standard order status update...');

    // Fetch real orders
    const orders = await fetchUserOrders();
    if (!orders || orders.length === 0) {
        console.log('❌ No orders found to test');
        return null;
    }

    // Find standard orders
    const standardOrders = await findOrdersByType(orders, 'standard');
    if (standardOrders.length === 0) {
        console.log('❌ No standard orders found to test');
        return null;
    }

    // Use the first standard order
    const testOrder = standardOrders[0];
    console.log('📋 Testing with standard order:', testOrder.orderNumber, 'Current status:', testOrder.status);

    // Get current status and valid transitions
    const currentStatus = testOrder.status;
    const validTransitions = getValidStatusTransitions(currentStatus);
    
    if (validTransitions.length === 0) {
        console.log('⚠️ No valid status transitions available for current status:', currentStatus);
        return null;
    }

    // Use the first valid transition
    const newStatus = validTransitions[0];
    const notes = `Dynamic test: Updating standard order from ${currentStatus} to ${newStatus}`;

    console.log('🔄 Updating order status from', currentStatus, 'to', newStatus);

    const result = await updateOrderStatus(testOrder._id, newStatus, notes, 'standard');

    if (result) {
        console.log('✅ Standard order status update test passed');
        console.log('📊 Updated order details:', result.data?.order);
    } else {
        console.log('❌ Standard order status update test failed');
    }

    return result;
}

// Dynamic function to test specific order by ID
async function testSpecificOrder(orderId) {
    console.log('🧪 Testing specific order:', orderId);

    // Get order details first
    const orderDetails = await getOrderDetails(orderId);
    if (!orderDetails) {
        console.log('❌ Could not fetch order details');
        return null;
    }

    console.log('📋 Order details:', {
        id: orderDetails._id,
        orderNumber: orderDetails.orderNumber,
        type: orderDetails.type,
        status: orderDetails.status,
        amount: orderDetails.orderDetails?.productPrice,
        currency: orderDetails.orderDetails?.currency
    });

    // Get current status and valid transitions
    const currentStatus = orderDetails.status;
    const validTransitions = getValidStatusTransitions(currentStatus);
    
    if (validTransitions.length === 0) {
        console.log('⚠️ No valid status transitions available for current status:', currentStatus);
        return orderDetails;
    }

    console.log('🔄 Available status transitions:', validTransitions);

    // Use the first valid transition
    const newStatus = validTransitions[0];
    const notes = `Dynamic test: Updating ${orderDetails.type} order from ${currentStatus} to ${newStatus}`;

    console.log('🔄 Updating order status from', currentStatus, 'to', newStatus);

    const result = await updateOrderStatus(orderId, newStatus, notes, orderDetails.type);

    if (result) {
        console.log('✅ Order status update test passed');
        console.log('📊 Updated order details:', result.data?.order);
    } else {
        console.log('❌ Order status update test failed');
    }

    return result;
}

// Dynamic function to list all orders with their current status
async function listAllOrders() {
    console.log('📋 Fetching all user orders...');

    const orders = await fetchUserOrders();
    if (!orders || orders.length === 0) {
        console.log('❌ No orders found');
        return [];
    }

    console.log('📊 Found', orders.length, 'orders:');
    console.table(orders.map(order => ({
        ID: order._id,
        OrderNumber: order.orderNumber,
        Type: order.type,
        Status: order.status,
        Amount: order.orderDetails?.productPrice,
        Currency: order.orderDetails?.currency,
        CreatedAt: new Date(order.createdAt).toLocaleDateString()
    })));

    return orders;
}

// Run comprehensive tests
async function runTests() {
    console.log('🚀 Starting dynamic order status update tests...');

    // First, list all available orders
    const orders = await listAllOrders();
    
    if (!orders || orders.length === 0) {
        console.log('❌ No orders available for testing');
        return;
    }

    console.log('');

    // Test escrow payment if available
    const escrowOrders = await findOrdersByType(orders, 'escrow');
    if (escrowOrders.length > 0) {
        console.log('🔄 Testing escrow orders...');
        await testEscrowOrderUpdate();
    } else {
        console.log('⚠️ No escrow orders found for testing');
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test standard payment if available
    const standardOrders = await findOrdersByType(orders, 'standard');
    if (standardOrders.length > 0) {
        console.log('🔄 Testing standard orders...');
        await testStandardOrderUpdate();
    } else {
        console.log('⚠️ No standard orders found for testing');
    }

    console.log('🏁 Dynamic tests completed');
}

// Export functions for use in browser console
window.testOrderStatusUpdate = {
    runTests,
    testEscrowOrderUpdate,
    testStandardOrderUpdate,
    testSpecificOrder,
    updateOrderStatus,
    fetchUserOrders,
    getOrderDetails,
    getOrderStatus,
    getOrderStatusSmart,
    listAllOrders,
    findOrdersByType,
    getValidStatusTransitions,
    detectOrderType
};

console.log('📋 Dynamic order status update test script loaded');
console.log('💡 Available functions:');
console.log('   - window.testOrderStatusUpdate.runTests() - Run comprehensive tests');
console.log('   - window.testOrderStatusUpdate.listAllOrders() - List all user orders');
console.log('   - window.testOrderStatusUpdate.testSpecificOrder(orderId) - Test specific order');
console.log('   - window.testOrderStatusUpdate.getOrderStatus(orderId, type) - Get order status (specify type)');
console.log('   - window.testOrderStatusUpdate.getOrderStatusSmart(orderId) - Get order status (auto-detect endpoint)');
console.log('   - window.testOrderStatusUpdate.testEscrowOrderUpdate() - Test escrow orders');
console.log('   - window.testOrderStatusUpdate.testStandardOrderUpdate() - Test standard orders');
console.log('   - window.testOrderStatusUpdate.detectOrderType(orderId) - Detect if order is escrow or standard');