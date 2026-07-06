import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Home from '../app/page';

// Mock dependencies since components rely on specific Next/React internals or icons
jest.mock('../app/components/Navbar', () => () => <div data-testid="navbar" />);
jest.mock('../app/components/Header', () => () => <div data-testid="header" />);
jest.mock('../app/components/Services', () => () => <div data-testid="services" />);
jest.mock('../app/components/About', () => () => <div data-testid="about" />);
jest.mock('../app/components/Contact', () => () => <div data-testid="contact" />);
jest.mock('../app/components/Footer', () => () => <div data-testid="footer" />);

describe('Home Page', () => {
  it('renders all sections successfully', () => {
    const { getByTestId } = render(<Home />);

    expect(getByTestId('navbar')).toBeInTheDocument();
    expect(getByTestId('header')).toBeInTheDocument();
    expect(getByTestId('services')).toBeInTheDocument();
    expect(getByTestId('about')).toBeInTheDocument();
    expect(getByTestId('contact')).toBeInTheDocument();
    expect(getByTestId('footer')).toBeInTheDocument();
  });
});
