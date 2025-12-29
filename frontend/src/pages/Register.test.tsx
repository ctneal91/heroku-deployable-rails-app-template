import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { AuthProvider } from '../contexts/AuthContext';
import { api } from '../services/api';

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
  });

  it('renders registration form', async () => {
    renderRegister();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  it('shows link to login', async () => {
    renderRegister();
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    renderRegister();

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
    });
  });

  it('submits registration form successfully', async () => {
    mockedApi.signup.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test', avatar_url: null } }
    });

    renderRegister();

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockedApi.signup).toHaveBeenCalled();
    });
  });

  it('shows error on failed registration', async () => {
    mockedApi.signup.mockResolvedValue({ error: 'Email taken' });

    renderRegister();

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email taken');
    });
  });
});
