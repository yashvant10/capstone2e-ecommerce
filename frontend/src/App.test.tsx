// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Basic mock component test to verify vitest is working
const Button = ({ label }: { label: string }) => <button>{label}</button>;

describe('Basic Setup', () => {
  it('renders a component', () => {
    render(<Button label="Test Button" />);
    expect(screen.getByText('Test Button')).toBeDefined();
  });
});
