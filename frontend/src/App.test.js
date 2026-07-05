import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegistreerPagina from './pages/RegistreerPagina';
import SterrenRating from './components/SterrenRating';

process.env.JWT_SECRET = 'test_secret_jest';

const mockedModels = {
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
  },
  Activity: {
    count: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  Registration: {
    count: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  },
  Feedback: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  },
  Poll: {
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
  },
  PollOption: {
    bulkCreate: jest.fn(),
    findOne: jest.fn()
  },
  PollResponse: {
    create: jest.fn(),
    findOne: jest.fn()
  },
  Comment: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
  },
  sequelize: {}
};

jest.mock('../../backend/models', () => mockedModels);
jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    registreer: jest.fn()
  })
}));
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(() => 'hashed-password'),
  compareSync: jest.fn()
}), { virtual: true });
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token')
}), { virtual: true });
jest.mock('sequelize', () => ({
  Op: { ne: 'ne' },
  fn: jest.fn(),
  col: jest.fn(),
  literal: jest.fn()
}), { virtual: true });

const bcrypt = require('bcryptjs');
const authController = require('../../backend/controllers/authController');
const adminController = require('../../backend/controllers/adminController');

function createMockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Unit tests', () => {
  test('registratiepagina toont alleen naam, email en wachtwoord', () => {
    render(
      <MemoryRouter>
        <RegistreerPagina />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /account aanmaken/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText(/organisator/i)).not.toBeInTheDocument();
  });

  test('SterrenRating toont het juiste aantal actieve sterren', () => {
    render(<SterrenRating rating={3} />);

    expect(screen.getAllByText('★')).toHaveLength(3);
  });

  test('registreer geeft 400 terug bij ontbrekende velden', async () => {
    const req = {
      body: {
        email: 'jan@test.nl',
        password: 'wachtwoord'
      }
    };
    const res = createMockResponse();

    await authController.registreer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      fout: 'Naam, email en wachtwoord zijn verplicht.'
    });
  });

  test('login blokkeert een gebruiker met status PENDING', async () => {
    mockedModels.User.findOne.mockResolvedValue({
      id: 1,
      name: 'Jan',
      email: 'jan@test.nl',
      password: 'hashed-password',
      role: 'USER',
      status: 'PENDING'
    });
    bcrypt.compareSync.mockReturnValue(true);

    const req = {
      body: {
        email: 'jan@test.nl',
        password: 'wachtwoord'
      }
    };
    const res = createMockResponse();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      fout: 'Je account moet eerst worden goedgekeurd door de admin.'
    });
  });

  test('keurGoed zet de gebruiker op ACTIVE', async () => {
    const update = jest.fn().mockResolvedValue({ status: 'ACTIVE' });
    mockedModels.User.findByPk.mockResolvedValue({ update });

    const req = {
      params: { id: '7' }
    };
    const res = createMockResponse();

    await adminController.keurGoed(req, res);

    expect(mockedModels.User.findByPk).toHaveBeenCalledWith('7');
    expect(update).toHaveBeenCalledWith({ status: 'ACTIVE' });
    expect(res.json).toHaveBeenCalledWith({
      bericht: 'Gebruiker goedgekeurd.'
    });
  });

  test('SterrenRating roept onRating aan met de juiste ster', () => {
    const onRating = jest.fn();
    render(<SterrenRating rating={2} onRating={onRating} />);
    const sterren = screen.getAllByText('☆');

    fireEvent.click(sterren[1]);

    expect(onRating).toHaveBeenCalledWith(4);
  });
});
