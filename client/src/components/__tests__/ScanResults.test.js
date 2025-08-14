// src/components/__tests__/ScanResults.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import ScanResults from '../ScanResults';

// ✅ Helper: ensure any section has a fallback status
const withSafeStatus = (data) => {
  if (!data) return null;
  const safe = {};
  Object.keys(data).forEach((key) => {
    safe[key] = { ...data[key] };
    if (typeof safe[key].status !== 'string') {
      safe[key].status = 'secure'; // fallback to prevent .toLowerCase() crash
    }
  });
  return safe;
};

describe('ScanResults Component', () => {
  it('renders scan results correctly', () => {
    const mockData = {
      firewall: { status: 'secure', details: 'Firewall is enabled' },
      antivirus: { status: 'warning', details: 'Antivirus needs update' },
    };

    render(<ScanResults scanData={mockData} />);

    expect(screen.getByText('Firewall is enabled')).toBeInTheDocument();
    expect(screen.getByText('Antivirus needs update')).toBeInTheDocument();
  });

  it('handles empty scanData object gracefully', () => {
    const emptyData = withSafeStatus({});
    render(<ScanResults scanData={emptyData} />);
    expect(screen.queryByText(/secure/i)).not.toBeInTheDocument();
  });

  it('handles null scanData gracefully', () => {
    const nullData = withSafeStatus(null);
    render(<ScanResults scanData={nullData} />);
    expect(screen.queryByText(/secure/i)).not.toBeInTheDocument();
  });

  it('renders multiple analysis sections', () => {
    const multiData = {
      firewall: { status: 'secure', details: 'Firewall is enabled' },
      antivirus: { status: 'vulnerable', details: 'Antivirus not installed' },
      ssl: { status: 'warning', details: 'SSL certificate expires soon' },
    };

    render(<ScanResults scanData={multiData} />);

    expect(screen.getByText('Firewall is enabled')).toBeInTheDocument();
    expect(screen.getByText('Antivirus not installed')).toBeInTheDocument();
    expect(screen.getByText('SSL certificate expires soon')).toBeInTheDocument();
  });
});
