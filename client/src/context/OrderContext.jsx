import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateOrderNumber } from '../utils/helpers';
import apiClient from '../services/api';

const OrderContext = createContext(null);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

// Initial realistic sample orders for testing Order History & Order Details
const INITIAL_SAMPLE_ORDERS = [
  {
    id: 'ord_101',
    orderNumber: 'NC-20260215-8492',
    date: '2026-02-15T10:30:00Z',
    status: 'Delivered',
    paymentMethod: 'Razorpay UPI (Google Pay)',
    paymentStatus: 'Paid',
    items: [
      {
        id: 'p2',
        name: 'Sony WH-1000XM5 Noise-Cancelling Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        price: 26990,
        quantity: 1,
        variant: { Color: 'Black' },
      },
    ],
    shippingAddress: {
      fullName: 'Arjun Sharma',
      phone: '9876543210',
      street: 'Flat 402, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
    },
    subtotal: 26990,
    shippingFee: 0,
    discount: 0,
    grandTotal: 26990,
    estimatedDelivery: 'Delivered on Feb 18, 2026',
    tracking: [
      { status: 'Order Placed', date: 'Feb 15, 2026, 10:30 AM', completed: true },
      { status: 'Processing & Packed', date: 'Feb 15, 2026, 04:15 PM', completed: true },
      { status: 'Shipped via BlueDart', date: 'Feb 16, 2026, 09:00 AM', completed: true },
      { status: 'Delivered', date: 'Feb 18, 2026, 01:20 PM', completed: true },
    ],
  },
  {
    id: 'ord_102',
    orderNumber: 'NC-20260301-3211',
    date: '2026-03-01T14:22:00Z',
    status: 'Shipped',
    paymentMethod: 'Credit Card (Visa)',
    paymentStatus: 'Paid',
    items: [
      {
        id: 'p7',
        name: 'Pure European Linen Mandarin Collar Shirt',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
        price: 2299,
        quantity: 2,
        variant: { Color: 'Ivory White', Size: 'L' },
      },
    ],
    shippingAddress: {
      fullName: 'Arjun Sharma',
      phone: '9876543210',
      street: 'EcoSpace Tech Park, 4th Floor, Outer Ring Rd',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
    },
    subtotal: 4598,
    shippingFee: 0,
    discount: 500,
    grandTotal: 4098,
    estimatedDelivery: 'Arriving in 2 days',
    tracking: [
      { status: 'Order Placed', date: 'Oct 15, 2026, 02:22 PM', completed: true },
      { status: 'Processing & Packed', date: 'Oct 15, 2026, 06:40 PM', completed: true },
      { status: 'Shipped via Delhivery', date: 'Oct 16, 2026, 11:00 AM', completed: true },
      { status: 'Delivered', date: 'Pending', completed: false },
    ],
  },
];

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('novacart_orders_v1');
      return saved ? JSON.parse(saved) : INITIAL_SAMPLE_ORDERS;
    } catch {
      return INITIAL_SAMPLE_ORDERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('novacart_orders_v1', JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders', e);
    }
  }, [orders]);

  /**
   * Fetch orders from backend if authenticated, supplement with local orders
   */
  const refreshOrdersFromBackend = async () => {
    try {
      const res = await apiClient.get('/orders/my');
      const data = res?.data || res;
      const backendOrders = Array.isArray(data) ? data : (data?.orders || []);
      if (backendOrders.length > 0) {
        // Normalize backend orders
        const normalized = backendOrders.map((o) => ({
          id: o._id || o.id || o.orderNumber,
          orderNumber: o.orderNumber,
          date: o.createdAt || o.date,
          status: o.status,
          paymentMethod: o.paymentMethod || 'Online Payment',
          paymentStatus: o.paymentStatus || 'Paid',
          items: o.items?.map((item) => ({
            id: item.productId || item.product?._id || item.product?.id,
            name: item.name || item.product?.name,
            image: item.image || item.product?.images?.[0],
            price: item.price,
            quantity: item.quantity,
            variant: item.variant,
          })) || [],
          shippingAddress: o.shippingAddress,
          subtotal: o.subtotal,
          shippingFee: o.shippingFee || 0,
          discount: o.discount || 0,
          couponDiscount: o.couponDiscount || 0,
          grandTotal: o.grandTotal || o.total,
          estimatedDelivery: o.estimatedDelivery || 'Estimated in 3-5 days',
          tracking: o.tracking || [
            { status: 'Order Placed', date: new Date(o.createdAt || o.date).toLocaleString('en-IN'), completed: true },
          ],
        }));
        setOrders(normalized);
      }
    } catch (err) {
      // Not authenticated or offline — keep local orders
      console.warn('[OrderContext] Could not fetch backend orders:', err.message);
    }
  };

  /**
   * Create and record a new order — attempt backend first, fall back to local
   */
  const createOrder = async (orderPayload) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 4);

    const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

    // Attempt backend order creation
    try {
      const res = await apiClient.post('/orders', {
        items: orderPayload.items?.map((item) => ({
          productId: item.product?._id || item.product?.id || item.id,
          name: item.product?.name || item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.selectedVariant || item.variant,
          image: item.product?.images?.[0] || item.image,
        })),
        shippingAddress: orderPayload.shippingAddress,
        paymentMethod: orderPayload.paymentMethod || 'Razorpay Online',
        couponCode: orderPayload.couponCode || undefined,
        subtotal: orderPayload.subtotal,
        shippingFee: orderPayload.shippingFee || 0,
        discount: orderPayload.discount || 0,
        grandTotal: orderPayload.grandTotal,
      });

      const backendOrder = res?.data || res;
      const newOrder = {
        id: backendOrder._id || backendOrder.orderNumber || 'ord_' + Date.now(),
        orderNumber: backendOrder.orderNumber,
        date: backendOrder.createdAt || new Date().toISOString(),
        status: backendOrder.status || 'Processing',
        paymentMethod: orderPayload.paymentMethod || 'Razorpay Online',
        paymentStatus: orderPayload.paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid',
        items: orderPayload.items || [],
        shippingAddress: orderPayload.shippingAddress,
        subtotal: orderPayload.subtotal,
        shippingFee: orderPayload.shippingFee || 0,
        discount: orderPayload.discount || 0,
        grandTotal: orderPayload.grandTotal,
        couponCode: orderPayload.couponCode || null,
        estimatedDelivery: `Estimated Delivery: ${formattedDelivery}`,
        tracking: [
          { status: 'Order Placed', date: 'Just now', completed: true },
          { status: 'Confirmed & Processing', date: 'In progress', completed: true },
          { status: 'Dispatched via Courier', date: 'Expected tomorrow', completed: false },
          { status: 'Delivered', date: formattedDelivery, completed: false },
        ],
      };

      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      console.warn('[OrderContext] Backend order creation failed, using local fallback:', err.message);
    }

    // Offline/guest fallback — create local-only order
    const localOrder = {
      id: 'ord_' + Date.now(),
      orderNumber: generateOrderNumber(),
      date: new Date().toISOString(),
      status: 'Processing',
      paymentMethod: orderPayload.paymentMethod || 'Razorpay Online',
      paymentStatus: orderPayload.paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid',
      items: orderPayload.items || [],
      shippingAddress: orderPayload.shippingAddress,
      subtotal: orderPayload.subtotal,
      shippingFee: orderPayload.shippingFee || 0,
      discount: orderPayload.discount || 0,
      grandTotal: orderPayload.grandTotal,
      couponCode: orderPayload.couponCode || null,
      estimatedDelivery: `Estimated Delivery: ${formattedDelivery}`,
      tracking: [
        { status: 'Order Placed', date: 'Just now', completed: true },
        { status: 'Confirmed & Processing', date: 'In progress', completed: true },
        { status: 'Dispatched via Courier', date: 'Expected tomorrow', completed: false },
        { status: 'Delivered', date: formattedDelivery, completed: false },
      ],
    };

    setOrders((prev) => [localOrder, ...prev]);
    return localOrder;
  };

  /**
   * Find order by ID or Order Number
   */
  const getOrderById = (idOrNumber) => {
    return (
      orders.find(
        (o) => o.id === idOrNumber || o.orderNumber === idOrNumber
      ) || null
    );
  };

  const value = {
    orders,
    createOrder,
    getOrderById,
    refreshOrdersFromBackend,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export default OrderContext;
