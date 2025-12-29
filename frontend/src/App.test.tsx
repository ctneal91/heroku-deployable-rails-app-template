import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders app with navigation', () => {
  render(<App />);
  const appTitle = screen.getByText(/My App/i);
  expect(appTitle).toBeInTheDocument();
});

test('renders login and signup links when not authenticated', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Sign Up/i })).toBeInTheDocument();
});

test('renders dark mode toggle button', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /dark mode/i })).toBeInTheDocument();
});

test('toggles theme when clicking dark mode button', () => {
  render(<App />);
  const toggleButton = screen.getByRole('button', { name: /dark mode/i });
  fireEvent.click(toggleButton);
  expect(screen.getByRole('button', { name: /light mode/i })).toBeInTheDocument();
});
