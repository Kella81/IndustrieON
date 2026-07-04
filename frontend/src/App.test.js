import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegistreerPagina from './pages/RegistreerPagina';

jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    registreer: jest.fn()
  })
}));

test('registratiepagina toont geen rolkeuze meer', () => {
  render(
    <MemoryRouter>
      <RegistreerPagina />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: /account aanmaken/i })).toBeInTheDocument();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.queryByText(/organisator/i)).not.toBeInTheDocument();
});
