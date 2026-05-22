// src/mocks/ordersMock.ts
import { Order } from '../types/api.types';

export const mockOrders: Order[] = [
  {
    id: 'o1',
    createdAt: new Date().toISOString(),
    totalAmount: 2599,
    status: 'Delivered',
    items: [
      {
        productId: 'p1',
        title: 'Flipkart SmartWatch 2.0',
        price: 1999,
        quantity: 1,
        image: 'https://via.placeholder.com/150',
      },
      {
        productId: 'p2',
        title: 'Bluetooth Headphones',
        price: 599,
        quantity: 1,
        image: 'https://via.placeholder.com/150',
      },
    ],
  },
  {
    id: 'o2',
    createdAt: new Date().toISOString(),
    totalAmount: 999,
    status: 'Shipped',
    items: [
      {
        productId: 'p3',
        title: 'Portable Power Bank',
        price: 999,
        quantity: 1,
        image: 'https://via.placeholder.com/150',
      },
    ],
  },
];
