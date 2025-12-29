import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function TestComponent() {
  const { mode, toggleTheme, setMode } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setMode('dark')}>Set Dark</button>
      <button onClick={() => setMode('light')}>Set Light</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('provides default light mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('toggles between light and dark mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');

    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');

    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('allows setting mode directly', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');

    fireEvent.click(screen.getByText('Set Light'));
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('persists mode to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Dark'));
    expect(localStorageMock.getItem('theme-mode')).toBe('dark');
  });

  it('reads initial mode from localStorage', () => {
    localStorageMock.setItem('theme-mode', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('throws error when useTheme is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );

    consoleSpy.mockRestore();
  });
});
