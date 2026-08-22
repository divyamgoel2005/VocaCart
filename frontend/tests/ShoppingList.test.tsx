import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShoppingList } from '../components/ShoppingList';

// Mock Zustand store
jest.mock('../store/useShoppingStore', () => ({
  useShoppingStore: () => ({
    categories: {
      Staples: [
        { id: 1, product_name: 'Aashirvaad Atta', category: 'Staples', quantity: 2, unit: 'kg', is_completed: false }
      ]
    },
    items: [
      { id: 1, product_name: 'Aashirvaad Atta', category: 'Staples', quantity: 2, unit: 'kg', is_completed: false }
    ],
    fetchList: jest.fn(),
    updateItemQuantity: jest.fn(),
    toggleItemComplete: jest.fn(),
    deleteItem: jest.fn(),
    undoAction: jest.fn()
  })
}));

describe('ShoppingList Component', () => {
  it('renders shopping list header and items cleanly', () => {
    render(<ShoppingList />);
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
    expect(screen.getByText('Aashirvaad Atta')).toBeInTheDocument();
    expect(screen.getByText('Undo Last')).toBeInTheDocument();
  });
});
