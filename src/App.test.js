import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the public portal homepage', () => {
  render(<App />);
  expect(screen.getByRole('heading', {
    name: /understand development across ghana's districts/i,
  })).toBeInTheDocument();
  expect(screen.getByRole('heading', {
    name: /see development activity across ghana/i,
  })).toBeInTheDocument();
  const snapshot = screen.getByRole('heading', { name: /ghana at a glance/i });
  const insights = screen.getByRole('heading', { name: /what does the national data tell us/i });
  const geography = screen.getByRole('heading', { name: /see development activity across ghana/i });
  const lisa = screen.getByRole('heading', { name: /climate information for local planning/i });
  const reports = screen.getByRole('heading', { name: /find current climate resources and reporting tools/i });
  const updates = screen.getByRole('heading', { name: /updates from the field/i });
  const institutions = screen.getByRole('heading', { name: /public information and operational reporting/i });
  const follows = (first, second) => Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);

  expect(follows(snapshot, insights)).toBe(true);
  expect(follows(insights, geography)).toBe(true);
  expect(follows(geography, lisa)).toBe(true);
  expect(follows(lisa, reports)).toBe(true);
  expect(follows(reports, updates)).toBe(true);
  expect(follows(updates, institutions)).toBe(true);
  expect(screen.queryByRole('heading', { name: /what stands out nationally/i })).not.toBeInTheDocument();
  expect(screen.getByText(/in collaboration with/i)).toBeInTheDocument();
  expect(screen.queryByRole('navigation', { name: /ghana region index/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /development partners/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/a public geography model for ghana/i)).not.toBeInTheDocument();
});
