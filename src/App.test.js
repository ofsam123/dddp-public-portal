import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the public portal homepage', () => {
  render(<App />);
  const hero = screen.getByRole('heading', { level: 1, name: /development data for every district in ghana/i });
  const gateways = screen.getByRole('heading', { name: /everything about district development, in one place/i });
  const snapshot = screen.getByRole('heading', { name: /ghana at a glance/i });
  const insights = screen.getByRole('heading', { name: /what does the national data tell us/i });
  const geography = screen.getByRole('heading', { name: /start national, then go local/i });
  const lisa = screen.getByRole('heading', { name: /climate information for local planning/i });
  const reports = screen.getByRole('heading', { name: /publications and tools/i });
  const updates = screen.getByRole('heading', { level: 2, name: /^events$/i });
  const footerCta = screen.getByRole('heading', { name: /put district development data to work/i });
  const follows = (first, second) => Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);

  expect(follows(hero, gateways)).toBe(true);
  expect(follows(gateways, snapshot)).toBe(true);
  expect(follows(snapshot, insights)).toBe(true);
  expect(follows(insights, geography)).toBe(true);
  expect(follows(geography, lisa)).toBe(true);
  expect(follows(lisa, reports)).toBe(true);
  expect(follows(reports, updates)).toBe(true);
  expect(follows(updates, footerCta)).toBe(true);
  expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument();
  expect(screen.queryByRole('navigation', { name: /ghana region index/i })).not.toBeInTheDocument();
});
