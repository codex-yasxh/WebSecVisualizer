import React from 'react';
import { render, screen } from '@testing-library/react';
import SecurityOverview from '../SecurityOverview';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock recharts
jest.mock('recharts', () => ({
  RadarChart: ({ children }) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}));

describe('SecurityOverview Component', () => {
  const mockScanData = {
    results: {
      ssl: { score: 85 },
      headers: { score: 65 },
      malware: { score: 30 },
      ports: { score: 90 },
      tech: { score: 75 },
      whois: { score: 80 }
    }
  };

  test('renders without crashing with valid data', () => {
    render(<SecurityOverview scanData={mockScanData} />);
    expect(screen.getByText(/Security Overview/i)).toBeInTheDocument();
  });

  test('displays SSL score in overview', () => {
    render(<SecurityOverview scanData={mockScanData} />);
    expect(screen.getByText(/85\s*%/)).toBeInTheDocument();
  });

  test('handles null scanData gracefully', () => {
    render(<SecurityOverview scanData={null} />);
    expect(screen.queryByText(/Security Overview/i)).not.toBeInTheDocument();
  });

  test('handles undefined results gracefully', () => {
    render(<SecurityOverview scanData={{}} />);
    expect(screen.queryByText(/Security Overview/i)).not.toBeInTheDocument();
  });
});
