import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import { AuthProvider } from '../contexts/AuthContext';
import { api } from '../services/api';

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderProfile = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Profile />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when not authenticated', async () => {
    mockedApi.getMe.mockResolvedValue({ data: { user: null } });
    renderProfile();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('renders profile form when authenticated', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: 'http://example.com/avatar.jpg' } }
    });
    renderProfile();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    });
  });

  it('updates profile successfully', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });
    mockedApi.updateProfile.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Updated', avatar_url: null } }
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'newpassword' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
    });
  });

  it('shows error on failed update', async () => {
    mockedApi.getMe.mockResolvedValue({
      data: { user: { id: 1, email: 'test@example.com', name: 'Test User', avatar_url: null } }
    });
    mockedApi.updateProfile.mockResolvedValue({ error: 'Update failed' });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Update failed');
    });
  });
});
