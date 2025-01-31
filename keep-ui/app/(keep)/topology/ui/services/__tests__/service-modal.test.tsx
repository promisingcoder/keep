import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServiceModal } from '../service-modal';
import { createService, updateService } from '../../../api';
import { showSuccessToast, showErrorToast } from '@/shared/ui';

// Mock the API functions and toast notifications
jest.mock('../../../api');
jest.mock('@/shared/ui');

describe('ServiceModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockApi = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create service form correctly', () => {
    render(
      <ServiceModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create New Service')).toBeInTheDocument();
    expect(screen.getByLabelText('Service Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Display Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Team')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Slack Channel')).toBeInTheDocument();
    expect(screen.getByLabelText('Environment *')).toBeInTheDocument();
  });

  it('renders edit service form correctly', () => {
    const mockService = {
      id: 1,
      service: 'test-service',
      display_name: 'Test Service',
      description: 'Test Description',
      team: 'Test Team',
      email: 'test@example.com',
      slack: '#test-channel',
      environment: 'production',
      is_manual: true,
      is_editable: true,
    };

    render(
      <ServiceModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        service={mockService}
      />
    );

    expect(screen.getByText('Edit Service')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-service')).toBeDisabled();
    expect(screen.getByDisplayValue('Test Service')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Team')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('#test-channel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('production')).toBeInTheDocument();
  });

  it('creates a new service successfully', async () => {
    (createService as jest.Mock).mockResolvedValueOnce({
      id: 1,
      service: 'new-service',
    });

    render(
      <ServiceModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText('Service Name *'), {
      target: { value: 'new-service' },
    });
    fireEvent.change(screen.getByLabelText('Display Name *'), {
      target: { value: 'New Service' },
    });
    fireEvent.click(screen.getByText('Create Service'));

    await waitFor(() => {
      expect(createService).toHaveBeenCalledWith(
        mockApi,
        expect.objectContaining({
          service: 'new-service',
          display_name: 'New Service',
        })
      );
      expect(showSuccessToast).toHaveBeenCalledWith(
        'Service created successfully'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('updates an existing service successfully', async () => {
    const mockService = {
      id: 1,
      service: 'test-service',
      display_name: 'Test Service',
      is_manual: true,
      is_editable: true,
    };

    (updateService as jest.Mock).mockResolvedValueOnce({
      id: 1,
      service: 'test-service',
      display_name: 'Updated Service',
    });

    render(
      <ServiceModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        service={mockService}
      />
    );

    fireEvent.change(screen.getByLabelText('Display Name *'), {
      target: { value: 'Updated Service' },
    });
    fireEvent.click(screen.getByText('Update Service'));

    await waitFor(() => {
      expect(updateService).toHaveBeenCalledWith(
        mockApi,
        1,
        expect.objectContaining({
          display_name: 'Updated Service',
        })
      );
      expect(showSuccessToast).toHaveBeenCalledWith(
        'Service updated successfully'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles errors when creating a service', async () => {
    (createService as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(
      <ServiceModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText('Service Name *'), {
      target: { value: 'new-service' },
    });
    fireEvent.change(screen.getByLabelText('Display Name *'), {
      target: { value: 'New Service' },
    });
    fireEvent.click(screen.getByText('Create Service'));

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith(
        'Failed to create service. Please try again.'
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
}); 